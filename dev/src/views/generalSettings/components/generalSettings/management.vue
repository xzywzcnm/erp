<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <div class="filterItem">
              <Button-group>
                <template v-for="(item, index) in roleList" v-if="index < 5">
                  <Button
                    v-if="item.selected"
                    type="primary"
                    @click="roleControl(index, item.status)"
                    :key="index"
                  >
                    {{ item.title }}
                  </Button>
                  <span
                    class="pseudoButton"
                    v-if="!item.selected"
                    @click="roleControl(index, item.status)"
                    :key="index"
                    >{{ item.title }}
                    <span
                      v-if="getPermission('role_get')"
                      class="icon iconfont icon-bianji roleEdit"
                      :class="{ none: !roleControlStatus }"
                      title="编辑角色权限"
                      @click="editRole(item.roleId, item.merchantId, item.title)"
                    />
                    <span
                      v-if="getPermission('role_delete')"
                      class="icon iconfont iconicon-close roleDel"
                      :class="{ none: !roleControlStatus }"
                      title="移除角色权限"
                      @click="delRole(item.roleId)"
                    />
                  </span>
                </template>
                <template v-if="roleList.length > 5">
                  <Dropdown style="margin-left: 10px">
                    <Button
                      :type="moreTitle !== '更多角色' ? 'primary' : 'default'"
                    >
                      {{ moreTitle }}
                      <Icon type="md-arrow-dropdown" />
                    </Button>
                    <Dropdown-menu slot="list">
                      <Dropdown-item
                        v-for="(item, index) in roleList"
                        v-if="index >= 5"
                        :key="item.id"
                      >
                        <span
                          @click="roleControl(index, item.status, 2)"
                          :class="{ mrListStatus: !roleControlStatus }"
                          >{{ item.title }}</span
                        >
                        <span
                          v-if="getPermission('role_get')"
                          class="icon iconfont icon-bianji roleEdit"
                          :class="{ none: !roleControlStatus }"
                          title="编辑角色权限"
                          @click="editRole(item.roleId, item.merchantId, item.title)"
                        />
                        <span
                          v-if="getPermission('role_delete')"
                          class="icon iconfont iconicon-close roleDel"
                          :class="{ none: !roleControlStatus }"
                          title="移除角色权限"
                          @click="delRole(item.roleId)"
                        />
                      </Dropdown-item>
                    </Dropdown-menu>
                  </Dropdown>
                </template>
              </Button-group>
            </div>
            <div
              class="filterItem manageRole"
              :class="{ none: roleControlStatus }"
              @click="manageRole"
            >
              <span class="icon iconfont">&#xe634;</span> 管理员工角色
            </div>
            <div
              class="filterItem manageOperate"
              :class="{ none: !roleControlStatus }"
            >
              <span
                v-if="getPermission('role_insert')"
                class="icon iconfont addRole"
                @click="showRole"
                >&#xe671; 添加</span
              >
              <span class="icon iconfont returnRole" @click="returnRole"
                >&#xe62f; 返回</span
              >
            </div>
          </div>
          <div class="platformSearch clear">
            <Form
              :model="pageParams"
              label-position="right"
              :label-width="70"
              @submit.native.prevent
            >
              <dyt-filter :filter-row="1">
                <Form-item
                  label="状态"
                  class="form-filter-item"
                  :label-width="40"
                >
                  <dyt-select
                    ref="productGoodsTagsSelect"
                    v-model="pageParams.status"
                  >
                    <Option
                      v-for="(name, index) in enableList"
                      :key="index"
                      :value="name.status"
                      >{{ name.title }}</Option
                    >
                  </dyt-select>
                </Form-item>
                <Form-item label="搜索字符">
                  <dyt-input
                    placeholder="可输入员工姓名、邮箱、手机号"
                    v-model.trim="pageParams.searchValue"
                    style="width: 200px"
                    @on-enter="search"
                  />
                </Form-item>
                <div slot="operation">
                  <Button
                    v-if="getPermission('userInfo_query')"
                    type="primary"
                    @click="search"
                    :disabled="SearchDisabled"
                    icon="md-search"
                    >查询</Button
                  >
                  <Button
                    style="marginleft: 10px"
                    @click="reset"
                    v-once
                    icon="md-refresh"
                    >重置</Button
                  >
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="addBinding" style="display: flex">
      <div style="flex: 100">
        <!-- <Button
          v-if="getPermission('userInfo_insert')"
          type="primary"
          icon="md-add"
          @click="showAddNewEmployeeModal"
        >添加新员工</Button> -->
      </div>
      <div
        class="dataSort grayBg"
        style="
          display: inline-block;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
        "
      >
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button
              v-if="item.selected"
              :disabled="SearchDisabled"
              type="primary"
              @click="modifyTheSort(index, item.status)"
              :key="index"
            >
              {{ item.title }}
              <Icon
                type="md-arrow-round-up"
                v-if="item.status && item.selected"
              ></Icon>
              <Icon
                type="md-arrow-round-down"
                v-if="!item.status && item.selected"
              ></Icon>
            </Button>
            <Button
              v-if="!item.selected"
              :disabled="SearchDisabled"
              @click="modifyTheSort(index, item.status)"
              :key="index"
            >
              {{ item.title }}
              <Icon
                type="md-arrow-round-up"
                v-if="item.status && item.selected"
              ></Icon>
              <Icon
                type="md-arrow-round-down"
                v-if="!item.status && item.selected"
              ></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="shopTable">
      <Table
        highlight-row
        border
        :loading="tableLoading"
        :columns="columns"
        :data="orderData"
        :height="tableHeight"
      />
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="total"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"
            :current="curPage"
          ></Page>
        </div>
      </div>
    </div>
    <Modal
      class-name="add-employee-modal"
      :title="addNewEmployeeTitle"
      v-model="modal9"
      :mask-closable="false"
      :loading="loading"
      @on-ok="addNewEmployee"
      @on-cancel="cancelButton"
      :width="90"
    >
      <addEmployee
        v-if="openNewEmployeeStatus"
        :uid="uid"
        :employeeAdmin="employeeAdmin"
        :permissionsKeys="permissionsKeys"
        @resetLoading="resetLoading"
        :warehouseList="warehouseList"
        @saveSuccess="saveSuccess"
        :employeeStatus="employeeStatus"
        :modalRoleList="roleList"
        :anchorTalg="modal9"
        :timestamp2="timestamp2"
      ></addEmployee>
    </Modal>
    <Modal
      :title="addNewRoleTitle"
      v-model="modal10"
      :mask-closable="false"
      :loading="loadingRoleStatus"
      :styles="{ top: '60px', width: '990px' }"
      class-name="add-role-modal"
    >
      <Spin fix v-if="addRoleLoading" style="z-index: 99999;"></Spin>
      <addRole
        :roleId="roleId"
        @resetLoading="resetLoading"
        @resetBtnLoading="loadingRoleTalg = false"
        @modalLoading="addRoleLoadHand"
        :merchantId="merchantId"
        :roleTitle="roleTitle"
        :timestamp="timestamp"
      ></addRole>
      <div slot="footer">
        <Button @click="cancelButton">取消</Button>
        <Button
          @click="addNewRole"
          type="primary"
          :loading="loadingRoleTalg || addRoleLoading"
          v-if="getPermission('role_insert') || getPermission('role_update')"
          >确定</Button
        >
      </div>
    </Modal>
    <!-- 删除 -->
    <Modal v-model="delModal" title="删除" v-if="delModalStatus" @on-ok="delOK">
      <div style="margin: 20px; font-size: 14px">
        <p>确认删除?</p>
      </div>
    </Modal>
  </div>
</template>
<style scoped>
.mrListStatus {
  display: block;
}
</style>
<style>
.filterItem .ivu-dropdown .ivu-select-dropdown {
  max-height: 500px;
  overflow-y: auto;
}
</style>
<script>
import api from "@/api/api";
import addEmployee from "./components/addEmployee";
import addRole from "./components/addRole";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin],
  components: {
    addEmployee,
    addRole,
  },
  data() {
    var self = this;
    return {
      tableHeight: 500,
      loadingRoleTalg: false,
      modal10Status: false,
      addRoleLoading: false,
      permissionsKeys: [],
      buttonGroupModel: [
        {
          type: "userName",
          selected: true,
          status: true, // true up false down
          title: "按姓名", // 按姓名
        },
        {
          type: "email",
          selected: false,
          status: true, // true up false down
          title: "按邮箱", // '按邮箱'
        },
      ],
      employeeAdmin: "0",
      timestamp: null,
      timestamp2: null,
      editStatus: false,
      addNewEmployeeTitle: this.editStatus ? "编辑员工" : "添加新员工",
      addNewRoleTitle: this.editStatus ? "编辑角色" : "添加新角色",
      openNewEmployeeStatus: false,
      addEmployeeStatus: false,
      roleControlStatus: false,
      modal9: false, // 添加新员工
      modal10: false, // 添加新角色
      loadingStatus: true,
      loadingRoleStatus: true,
      loading: true,
      roleId: null,
      roleTitle: "",
      merchantId: null,
      uid: null,
      employeeStatus: null,
      pageParams: {
        // 参数
        pageNum: 1,
        pageSize: 20,
        status: "-1",
        roleId: null,
        orderBy: "userName",
        upDown: "up",
        searchValue: null, // 搜索内容
      },
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      moreTitle: "更多角色",
      moreFilter: false, // 高级筛选
      moreFilterIcon: "md-arrow-dropdown",
      enableList: [
        {
          selected: true,
          status: "-1",
          title: "全部",
        },
        {
          selected: false,
          status: "1",
          title: "启用",
        },
        {
          selected: false,
          status: "0",
          title: "停用",
        },
      ],
      roleList: [],
      roleListStatus: false,
      columns: [
        {
          title: "邮箱",
          key: "email",
          align: "center",
        },
        {
          title: "姓名",
          key: "userName",
          align: "center",
        },
        // {
        //   title: "电话",
        //   key: "mobile",
        //   align: "center",
        // },
        {
          title: "最后登录时间",
          align: "center",
          key: "lastLoginDate",
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          render: (h, params) => {
            return params.row.status === "0"
              ? h(
                "span",
                {
                  class: "stopStatus",
                },
                "停用"
              )
              : h(
                "span",
                {
                  class: "openStatus",
                },
                "启用"
              );
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 180,
          fixed: "right",
          render: (h, params) => {
            if (params.row !== undefined) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                      display: (() => {
                        return self.getPermission("userInfo_query")
                          ? "inline-block"
                          : "none";
                      })(),
                    },
                    on: {
                      click: () => {
                        self.show(params.row.userId, params.row.isAdmin);
                      },
                    },
                  },
                  "查看"
                ),
                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
                      display: (() => {
                        return self.getPermission("userInfo_update")
                          ? "inline-block"
                          : "none";
                      })(),
                    },
                    on: {
                      click: () => {
                        self.employeeAdmin = params.row.isAdmin;
                        self.edit(params.row.userId);
                      },
                    },
                  },
                  "编辑"
                ),
                params.row.originalStatus === "0" && params.row.isAdmin !== 1
                  ? h(
                    "Button",
                    {
                      props: {
                        size: "small",
                      },
                      style: {
                        marginRight: "5px",
                        display: (() => {
                          return self.getPermission("userInfo_enable")
                              ? "inline-block"
                              : "none";
                        })(),
                      },
                      on: {
                        click: () => {
                          self.enableStatus(params.row.userId, params.row);
                        },
                      },
                    },
                    "启用"
                  )
                  : params.row.originalStatus !== "0" && params.row.isAdmin !== 1
                  ? h(
                    "Button",
                    {
                      props: {
                        size: "small",
                      },
                      style: {
                        display: (() => {
                          return self.getPermission("userInfo_disable")
                              ? "inline-block"
                              : "none";
                        })(),
                      },
                      on: {
                        click: () => {
                          self.disableStatus(params.row.userId, params.row);
                        },
                      },
                    },
                    "停用"
                  )
                  : "",
              ]);
            }
          },
        },
      ],
      orderData: [],
      saleAccountIdPos: null,
      loadingRole: true,
      delModal: false, // 删除确认
      delModalStatus: false,
      delRoleId: null,
      warehouseList: [],
    };
  },
  computed: {
    addNewRoleStatus() {
      return this.$store.state.addNewRoleStatus;
    },
  },
  watch: {
    pageParamsStatus(n, o) {
      if (n) {
        this.getUserList(this.pageParams);
        this.pageParamsStatus = false;
      }
    },
    roleListStatus(n) {
      let v = this;
      if (n) {
        v.getRoleList();
      }
    },
    addNewRoleStatus(n) {
      let v = this;
      if (!n) {
        v.returnRole();
      }
    },
    editStatus(n) {
      if (n) {
        this.addNewRoleTitle = "编辑角色";
        this.addNewEmployeeTitle = "编辑员工";
      } else {
        this.addNewRoleTitle = "添加新角色";
        this.addNewEmployeeTitle = "添加新员工";
      }
    },
  },
  created() {
    let v = this;
    this.tableHeight = this.getTableHeight(340);
    v.getPermissionCallback("generalSettings_management").then(() => {
      v.getRoleList(); // 获取角色列表
      v.getWarehouse(); // 获取仓库列表
      v.getqueryUserAdditionPermissions(); // 查询仓库下面的权限
      v.getUserList(v.pageParams); // 获取用户列表
    });
  },
  methods: {
    getqueryUserAdditionPermissions() {
      /**
       * 查询权限
       * */
      let v = this;
      return new Promise((resolve) => {
        v.axios.get(api.queryUserAdditionPermissions).then((response) => {
          if (response.data.code === 0) {
            v.permissionsKeys = response.data.datas;
            resolve();
          }
        });
      });
    },
    // 编辑权限弹窗加载状态
    addRoleLoadHand (state) {
      this.addRoleLoading = state;
    },
    getWarehouse() {
      let v = this;
      v.axios.get(api.wmsService + api.query_warehouse).then((res) => {
        if (res.data.code === 0) {
          v.warehouseList = res.data.datas;
        }
      });
    },
    getRoleList() {
      let v = this;
      v.axios.post(api.get_roleList).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          pos[0] = {
            selected: true,
            roleId: "",
            merchantId: "",
            title: "全部",
          };
          data.forEach((n, i) => {
            i = i + 1;
            pos[i] = {
              selected: false,
              roleId: n.roleId,
              merchantId: n.merchantId,
              title: n.roleName,
            };
          });
          v.roleList = pos;
          v.roleListStatus = false; // 重置状态
        }
      });
    },
    addNewEmployee() {
      // 保存新员工
      let v = this;
      if (
        v.getPermission("userInfo_insert") ||
        v.getPermission("userInfo_update")
      ) {
        v.$store.commit("addEmployeeStatus", true);
      }
    },
    cancelButton() {
      let v = this;
      v.$store.commit("addEmployeeStatus", false);
      v.$store.commit("addNewRoleStatus", false);
      v.roleId = null;
      v.merchantId = null;
      v.roleTitle = "";
      v.editStatus = false;
      v.modal10 = false;
      v.loadingRoleTalg = false;
    },
    // 保存权限
    addNewRole () {
      if (this.loadingRoleTalg || this.addRoleLoading) return;
      if (this.getPermission("role_insert") || this.getPermission("role_update")) {
        this.$store.commit("addNewRoleStatus", true);
        this.loadingRoleTalg = true;
      }
    },
    // 启用
    enableStatus(params, row) {
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认启用：<span style="color: #f20;">${row.email || ''}</span>`,
        onOk: () => {
          this.axios.put(api.set_userEnabled + "?userId=" + params).then((response) => {
            if (response.data.code === 0) {
              this.$Message.success("启用成功");
              this.pageParamsStatus = true;
            }
          });
        }
      });
    },
    // 停用
    disableStatus(params, row) {
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认停用：<span style="color: #f20;">${row.email || ''}</span>`,
        onOk: () => {
          this.axios.put(api.set_userDisabled + "?userId=" + params).then((response) => {
            if (response.data.code === 0) {
              this.$Message.success("停用成功");
              this.pageParamsStatus = true;
            }
          });
        }
      });
    },
    roleControl(index, status, type) {
      let v = this;
      if (index === 0) {
        v.pageParams.roleId = null;
      }
      if (!v.roleControlStatus) {
        v.roleList.forEach((n, i) => {
          if (i === index) {
            if (type === 2) {
              v.moreTitle = n.title;
            } else {
              v.moreTitle = "更多角色";
            }
            n.selected = true;
            v.pageParams.roleId = n.roleId;
          } else {
            n.selected = false;
          }
        });
      }
    },
    search() {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    manageRole() {
      let v = this;
      v.roleControl(0);
      v.roleControlStatus = true;
    },
    returnRole() {
      let v = this;
      v.roleId = null;
      v.roleControlStatus = false;
      v.roleListStatus = true;
    },
    reset() {
      let v = this;
      v.pageParams.searchValue = "";
      v.pageParams.status = "-1";
      v.roleControl(0, true);
    },
    saveSuccess() {
      let v = this;
      v.pageParamsStatus = true;
    },
    editRole(id, merchantId, title) {
      // 编辑角色
      let v = this;
      let date = new Date().getTime();
      v.roleId = id;
      v.roleTitle = title;
      v.merchantId = merchantId;
      v.editStatus = true;
      v.modal10Status = true;
      v.$nextTick(function () {
        v.modal10 = true;
        v.loadingRoleTalg = false;
        v.timestamp = date;
      });
    },
    delRole(id) {
      // 删除角色
      let v = this;
      v.delRoleId = id;
      v.delModal = true;
      v.delModalStatus = true;
    },
    getUserList(obj) {
      // 获取员工列表
      let v = this;
      if (v.getPermission("userInfo_query")) {
        v.loadingTrue();
        let pageParams = this.$common.copy(obj);
        if (pageParams.status === "-1") {
          pageParams.status = null;
        }
        v.axios
          .post(api.get_uesrList, JSON.stringify(pageParams))
          .then((response) => {
            if (response.data.code === 0) {
              v.$nextTick(function () {
                v.loadingFalse();
                v.total = Number(response.data.datas.total);
                v.totalPage = Number(response.data.datas.totalPage);
              });
              let data = response.data.datas.list;
              let pos = [];
              if (data !== null) {
                data.forEach((n, i) => {
                  pos.push({
                    userId: n.userId,
                    email: n.email,
                    userName: n.userName,
                    mobile: n.mobile,
                    merchantId: n.merchantId,
                    lastLoginDate: v.getDataToLocalTime(
                      n.lastLoginTime,
                      "fulltime"
                    ),
                    status: n.status,
                    originalStatus: n.status,
                    isAdmin: n.isAdmin,
                  });
                });
              }
              v.orderData = pos;
            }
          })
          .catch(() => {
            v.loadingFalse();
          });
      }
    },
    showAddNewEmployeeModal() {
      let v = this;
      let date = new Date().getTime();
      v.uid = null;
      v.employeeAdmin = "0";
      v.openNewEmployeeStatus = true;
      v.$nextTick(function () {
        v.modal9 = true;
        v.timestamp2 = date;
      });
    },
    showRole() {
      let v = this;
      let date = new Date().getTime();
      v.editStatus = false;
      v.roleId = null;
      v.roleTitle = "";
      v.modal10Status = true;
      v.$nextTick(function () {
        v.modal10 = true;
        v.loadingRoleTalg = false;
        v.timestamp = date;
      });
    },
    show(uid, isAdmin) {
      let v = this;
      v.axios.post(api.get_userDetail + uid).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          let a = new Promise((resolve, reject) => {
            let saleAccountIdList = data.userAccounts
              ? data.userAccounts.map((i) => i.saleAccountId)
              : [];
            v.axios
              .post(api.get_saleAccountByIdNew, saleAccountIdList)
              .then((response) => {
                if (response.data.code === 0) {
                  setTimeout(resolve, 100, response.data.datas);
                }
              });
          });
          let b = new Promise((resolve, reject) => {
            let roleNameArr = [];
            if (data.roleIdList !== null) {
              v.roleList.forEach((n, i) => {
                if (data.roleIdList.indexOf(n.roleId) >= 0) {
                  roleNameArr.push(n.title);
                }
              });
            }
            setTimeout(resolve, 100, roleNameArr);
          });

          let c = new Promise((resolve, reject) => {
            let warehouseName = [];
            if (data.warehousePermissions !== null) {
              v.warehouseList.forEach((n, i) => {
                data.warehousePermissions.map((item) => {
                  if (item.warehouseId === n.warehouseId) {
                    warehouseName.push(n.warehouseName);
                  }
                });
              });
            }
            resolve(warehouseName);
          });
          Promise.all([a, b, c]).then((r1) => {
            if (r1[0].length > 0) {
              r1[0].forEach((n, i) => {
                if (pos.indexOf(n.platformId) < 0) {
                  pos.push(n.platformId);
                }
              });
            }
            v.$Modal.info({
              title: "查看员工信息",
              content: `
                    <h3>基本资料</h3>
                    <div style='padding-top:6px'>
                      ${v.$common.isEmpty(data.email) ? '' : `邮箱：${data.email}`}
                      ${v.$common.isEmpty(data.userName) ? '' : `<br>姓名：${data.userName}`}
                      ${v.$common.isEmpty(data.mobile) ? '' : `<br>电话：${data.mobile}`}
                    </div>
                    <br>
                    ${v.roleJurisdiction(isAdmin, v.setRoleList(pos, r1[0]), r1)}
                  `,
            });
          });
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error("系统繁忙，请重新尝试");
        }
      });
    },
    roleJurisdiction (isAdmin, posList, r1) {
      if (isAdmin === "1") {
        return "";
      } else {
        return `<h3>角色</h3>
              <div style='padding-top:6px'>${r1[1].toString()}</div>
              <br>
              <h3>店铺权限</h3>
                ${posList}
              <br>
              <h3>仓库</h3>
                ${r1[2].join(" ")}
              <br>`;
      }
    },
    setRoleList(pos, data) {
      let str = "";
      for (let i = 0; i < pos.length; i++) {
        str += `<div style='padding-top:5px'>${pos[i]}：</div>`;
        for (let t = 0; t < data.length; t++) {
          if (data[t].platformId === pos[i]) {
            str += `<div>
                ${data[t].account ? data[t].account : data[t].accountCode}
              </div>
            `;
          }
        }
      }
      return str;
    },
    edit(uid) {
      let v = this;
      v.uid = uid;
      v.editStatus = true;
      v.openNewEmployeeStatus = true;
      v.timestamp2 = new Date().getTime();
      v.$nextTick(function () {
        v.modal9 = true;
      });
    },
    resetLoading() {
      let v = this;
      v.loadingRoleStatus = false;
      v.loading = false;
      v.loadingRoleTalg = false;
      v.$nextTick(function () {
        v.loadingRoleStatus = true;
        v.loading = true;
        v.cancelButton();
      });
    },
    delOK() {
      // 删除确认
      let v = this;
      v.axios.delete(api.del_role + v.delRoleId).then((response) => {
        if (response.data.code === 0) {
          v.$Message.success("删除成功");
          v.roleListStatus = true;
        } else if (response.data.code === 101102) {
          v.$Message.error("角色在使用中");
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error("删除失败,请重新尝试");
        }
      });
    },
  },
  mounted() {
    document.body.addEventListener("click", (e) => {
      if (e.target.className === "ivu-modal-wrap") {
        this.$Modal.remove();
      }
    });
  },
};
</script>
<style lang="less">
.add-employee-modal {
  .ivu-modal {
    top: 80px;
    width: 90%;
    max-width: 1450px;
  }
  .ivu-modal-body {
    max-height: calc(100vh - 213px);
    padding-bottom: 0;
  }
  .ivu-modal-footer {
    border-top: 1px solid #e8eaec;
  }
}
.add-role-modal{
  .ivu-modal-body {
    max-height: calc(100vh - 220px);
  }
}
</style>
