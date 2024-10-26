<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <div class="filterItem">
              <Button-group>
                <template v-for="(item, index) in enableList">
                  <Button v-if="item.selected" type="primary" @click="enableUser(index, item.status)" :key="index">{{ item.title }}</Button>
                  <Button v-if="!item.selected" @click="enableUser(index, item.status)" :key="`b-${index}`">{{ item.title }}</Button>
                </template>
              </Button-group>
            </div>
            <div class="filterItem">
              <Button-group>
                <template v-for="(item, index) in roleList">
                  <template v-if="index < 5">
                    <Button v-if="item.selected" type="primary" @click="roleControl(index, item.status)" :key="`b-${index}`">
                      {{ item.title }}
                    </Button>
                    <span class="pseudoButton" v-if="!item.selected" @click="roleControl(index, item.status)" :key="`s-${index}`">{{ item.title
                      }}<span class="icon iconfont icon-bianji roleEdit" :class="{ none: !roleControlStatus }" @click="
                          editRole(item.roleId, item.merchantId, item.title)
                        "></span>
                      <span class="icon iconfont icon-shanchu roleDel" :class="{ none: !roleControlStatus }" @click="delRole(item.roleId)"></span>
                    </span>
                  </template>
                </template>
                <template v-if="roleList.length > 5">
                  <Dropdown style="margin-left: 10px">
                    <Button>
                      {{ moreTitle }}
                      <Icon type="arrow-down-b"></Icon>
                    </Button>
                    <Dropdown-menu slot="list">
                      <template v-for="(item, index) in roleList">
                        <Dropdown-item v-if="index >= 5" :key="item.id">
                          <span @click="roleControl(index, item.status, 2)">{{
                            item.title
                          }}</span>
                          <span class="icon iconfont icon-bianji roleEdit" :class="{ none: !roleControlStatus }" @click="
                              editRole(item.roleId, item.merchantId, item.title)
                            "></span>
                          <span class="icon iconfont icon-shanchu roleDel" :class="{ none: !roleControlStatus }" @click="delRole(item.roleId)"></span>
                        </Dropdown-item>
                      </template>
                    </Dropdown-menu>
                  </Dropdown>
                </template>
              </Button-group>
            </div>
            <div class="filterItem manageRole" :class="{ none: roleControlStatus }" @click="manageRole">
              <span class="icon iconfont">&#xe634;</span>
              管理员工角色
            </div>
            <div class="filterItem manageOperate" :class="{ none: !roleControlStatus }">
              <span class="icon iconfont addRole" @click="showRole">&#xe671; 添加</span>
              <span class="icon iconfont returnRole" @click="returnRole">&#xe62f; 返回</span>
            </div>
          </div>
          <div class="platformSearch clear">
            <Row>
              <Col :span="7">
              <Form :model="pageParams" label-position="left" :label-width="70">
                <div class="filterItem">
                  <Form-item label="搜索字符">
                    <Input placeholder="可输入员工姓名、邮箱、手机号" v-model.trim="pageParams.searchValue" style="width: 200px" @on-enter="search"></Input>
                  </Form-item>
                </div>
              </Form>
              </Col>
            </Row>
          </div>

          <div class="filterItem filterConfirm" :class="{ normalTop: moreFilter }">
            <Button type="primary" @click="search" size="small" v-once icon="search">查询</Button>
            <Button @click="reset" size="small" v-once icon="refresh">重置</Button>
          </div>
        </div>
      </div>
    </div>

    <div class="dataSort grayBg">
      <span>排序：</span>
      <Button-group>
        <template v-for="(item, index) in buttonGroupModel">
          <Button v-if="item.selected" type="primary" @click="modifyTheSort(index, item.status)" :key="`btn1-${index}`">
            {{ item.title }}
            <Icon type="arrow-up-c" v-if="item.status && item.selected"></Icon>
            <Icon type="arrow-down-c" v-if="!item.status && item.selected"></Icon>
          </Button>
          <Button v-if="!item.selected" @click="modifyTheSort(index, item.status)" :key="`btn2-${index}`">
            {{ item.title }}
            <Icon type="arrow-up-c" v-if="item.status && item.selected"></Icon>
            <Icon type="arrow-down-c" v-if="!item.status && item.selected"></Icon>
          </Button>
        </template>
      </Button-group>
    </div>
    <!-- <div class="addBinding">
            <Button type="primary" icon="plus-round" @click="showAddNewEmployeeModal">新建仓库</Button>
        </div> -->
    <div class="shopTable">
      <Table highlight-row border :columns="columns7" :data="data6" max-height="550"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" :current="curPage"></Page>
        </div>
      </div>
    </div>
    <Modal title="编辑员工信息" v-model="modal9" :mask-closable="false" v-if="openNewEmployeeStatus" :loading="loading" @on-ok="addNewEmployee" @on-cancel="cancelButton" :styles="{ top: '80px', width: '790px' }">
      <addEmployee v-if="openNewEmployeeStatus" :uid="uid" :isAdmin="isAdmin" @resetLoading="resetLoading" @saveSuccess="saveSuccess" :employeeStatus="employeeStatus" :modalRoleList="roleList" :timestamp="timestamp"></addEmployee>
    </Modal>
    <div v-show="modal10">
      <Modal :title="addNewRoleTitle" v-model="modal10" :mask-closable="false" :loading="addRoleLoading" @on-ok="addOrEditNewRole" @on-cancel="cancelButton" :styles="{ top: '80px', width: '790px' }">
        <addRole :addOrEdit="addOrEdit" :roleId="roleId" @resetLoading="resetLoading" @getRoleList="getRoleList" :merchantId="merchantId" :roleTitle="roleTitle" :timestamp="timestamp"></addRole>
      </Modal>
    </div>
  </div>
</template>

<script>
import api from "../../../api/api";
import addEmployee from "./addEmployee";
import addRole from "./addRole";
import Mixin from "../../../components/mixin/commonMixin";

export default {
  mixins: [Mixin],
  components: {
    addEmployee: addEmployee,
    addRole: addRole,
  },
  data () {
    var self = this;
    return {
      modal10Status: false,
      addRoleLoading: false,
      addOrEdit: "",
      buttonGroupModel: [
        {
          type: "userName",
          selected: true,
          status: true, // true up false down
          title: "按姓名",
        },
        {
          type: "email",
          selected: false,
          status: true, // true up false down
          title: "按邮箱",
        },
      ],
      timestamp: null,
      editStatus: false,
      addNewEmployeeTitle: "编辑员工信息",
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
        pageSize: 10,
        status: null,
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
      enableList: [
        {
          selected: true,
          status: "",
          title: "全部",
        },
        {
          selected: false,
          status: 1,
          title: "启用",
        },
        {
          selected: false,
          status: 0,
          title: "停用",
        },
      ],
      roleList: [],
      roleListStatus: false,
      columns7: [
        {
          title: "邮箱",
          key: "email",
        },
        {
          title: "姓名",
          key: "userName",
          width: 150,
        },
        {
          title: "电话",
          key: "mobile",
        },
        {
          title: "最后登录时间",
          width: 160,
          key: "lastLoginDate",
        },
        {
          title: "状态",
          key: "status",
          render (h, params) {
            return params.row.status === "1" || params.row.listingStatus === "1"
              ? h(
                "span",
                {
                  class: "openStatus",
                },
                "启用"
              )
              : h(
                "span",
                {
                  class: "stopStatus",
                },
                "停用"
              );
          },
        },
        {
          title: "操作",
          key: "action",
          width: 180,
          render: (h, params) => {
            if (params.row != undefined) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                    },
                    style: {
                      marginRight: "5px",
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
                    },
                    on: {
                      click: () => {
                        self.isAdmin = params.row.isAdmin;
                        self.edit(params.row.userId);
                      },
                    },
                  },
                  "编辑"
                ),
                params.row.originalStatus == "0" && params.row.isAdmin != 1
                  ? h(
                    "Button",
                    {
                      props: {
                        size: "small",
                      },
                      style: {
                        marginRight: "5px",
                      },
                      on: {
                        click: () => {
                          self.enableStatus(params.row.userId);
                          // this.show(params.index)
                        },
                      },
                    },
                    "启用"
                  )
                  : params.row.originalStatus != "0" && params.row.isAdmin != 1
                    ? h(
                      "Button",
                      {
                        props: {
                          size: "small",
                        },
                        on: {
                          click: () => {
                            self.disableStatus(params.row.userId);
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
      data6: [],
      saleAccountIdPos: null,
      loadingRole: true,
      isAdmin: null,
      num: 0,
    };
  },
  computed: {
    addNewRoleStatus: function () {
      return this.$store.state.addNewRoleStatus;
    },
  },
  watch: {
    /*	loadingRoleStatus:function(n,o){
     console.log(n)
     if(!n){
     console.log(n)
     this.loadingRole = false;
     }
     }, */
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.getUserList(v.pageParams);
        v.pageParamsStatus = false;
      }
    },
    roleListStatus (n) {
      var v = this;
      if (n) {
        v.getRoleList();
      }
    },
    addNewRoleStatus (n) {
      var v = this;
      if (!n) {
        v.returnRole();
      }
    },
    editStatus (n) {
      if (n) {
        this.addNewRoleTitle = "编辑角色";
        this.addNewEmployeeTitle = "编辑仓库";
      } else {
        this.addNewRoleTitle = "添加新角色";
        this.addNewEmployeeTitle = "新建仓库";
      }
    },
  },
  created () {
    var v = this;
    v.getRoleList(); // 获取角色列表
    v.getUserList(v.pageParams); // 获取用户列表
  },
  methods: {
    changePage (page) {
      // 分页切换
      let v = this;
      v.loading = true;
      v.pageParams.pageNum = page;
      v.pageParamsStatus = true;
      v.curPage = page;
    },
    changePageSize (pageSize) {
      this.pageParams.pageSize = pageSize;
      this.pageParamsStatus = true;
    },
    addOrEditNewRole () {
      this.$store.commit("ADDOREDITSTATUS", this.num++);
    },
    getRoleList: function () {
      var v = this;
      v.$axios
        .post(api.get_roleList)
        .then(function (response) {
          if (response.code == 0) {
            var data = response.datas;
            var pos = [];
            pos[0] = {
              selected: true,
              roleId: "",
              merchantId: "",
              title: "全部",
            };
            data.forEach(function (n, i) {
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
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    addNewEmployee () {
      // 保存新员工
      var v = this;
      v.$store.commit("addEmployeeStatus", true);
    },
    cancelButton () {
      var v = this;
      v.$store.commit("addEmployeeStatus", false);
      v.$store.commit("addNewRoleStatus", false);
      v.roleId = null;
      v.merchantId = null;
      v.roleTitle = "";
      v.editStatus = false;
    },
    addNewRole () {
      var v = this;
      v.$store.commit("addNewRoleStatus", true);
    },
    enableStatus (params) {
      // 启用停用
      var v = this;
      v.$axios
        .put(api.enable_user + "?userId=" + params)
        .then(function (response) {
          if (response.code == 0) {
            v.$Message.success("修改成功");
            v.pageParamsStatus = true;
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    disableStatus (params) {
      var v = this;
      v.$axios
        .put(api.disable_user + "?userId=" + params)
        .then(function (response) {
          if (response.code == 0) {
            v.$Message.success("修改成功");
            v.pageParamsStatus = true;
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    enableUser (index) {
      var v = this;
      if (index == 0) {
        delete v.pageParams.status;
      } else if (index == 1) {
        v.pageParams.status = "1";
      } else {
        v.pageParams.status = "0";
      }
      v.enableList.forEach(function (n, i) {
        if (i == index) {
          n.selected = true;
          //	console.log(n)
        } else {
          n.selected = false;
        }
      });
    },
    roleControl (index, status, type) {
      console.log(index);
      var v = this;
      if (index == 0) {
        v.pageParams.roleId = null;
      }
      if (!v.roleControlStatus) {
        v.roleList.forEach(function (n, i) {
          if (i == index) {
            if (type == "2") {
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
      /* v.pageParamsStatus = true;
       v.curPage = 1;
       v.pageParams.pageNum = 1; */
    },
    search () {
      var v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    manageRole () {
      var v = this;
      v.roleControl(0);
      v.roleControlStatus = true;
    },
    returnRole () {
      var v = this;
      v.roleId = null;
      console.log(v.roleId);
      v.roleControlStatus = false;
      v.roleListStatus = true;
    },
    // addRole() {
    //   // 添加角色
    //   var v = this;
    // },
    reset () {
      var v = this;
      v.pageParams.searchValue = "";
      v.pageParamsStatus = true;
      v.enableUser(0, true);
      v.roleControl(0, true);
    },
    saveSuccess () {
      var v = this;
      v.pageParamsStatus = true;
    },
    editRole (id, merchantId, title) {
      // 编辑角色
      this.addOrEdit = "edit";
      let v = this;
      v.roleId = id;
      v.roleTitle = title;
      console.log(v.roleTitle);
      v.merchantId = merchantId;
      v.editStatus = true;
      v.modal10Status = true;
      v.$nextTick(function () {
        v.modal10 = true;
      });
    },
    delRole (id) {
      // 删除角色
      var v = this;
      v.$axios
        .delete(api.del_role + id)
        .then(function (response) {
          if (response.code == 0) {
            v.$Message.success("删除成功");
            v.roleListStatus = true;
          }
        })
        .catch(function () { });
    },
    getUserList (obj) {
      // 获取员工列表
      var v = this;
      v.$axios
        .post(api.user_list, JSON.stringify(obj))
        .then(function (response) {
          if (response.code == 0) {
            v.$nextTick(function () {
              v.total = Number(response.datas.total);
              v.totalPage = Number(response.datas.totalPage);
            });
            var data = response.datas.list,
              pos = [];
            if (data != null) {
              data.forEach(function (n) {
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
                  status:
                    n.status /* n.status == 0 ? "<span class='stopStatus'>"+'停用'+"</span>" : "<span class='openStatus'>"+'启用'+"</span>", */,
                  originalStatus: n.status,
                  isAdmin: n.isAdmin,
                });
              });
            }
            v.data6 = pos;
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    showAddNewEmployeeModal () {
      var v = this;
      v.uid = null;
      v.isAdmin = null;
      var date = new Date().getTime();
      v.openNewEmployeeStatus = true;
      v.$nextTick(function () {
        v.modal9 = true;
        v.timestamp = date;
      });
    },
    showRole () {
      this.addOrEdit = "add";
      let v = this;
      v.editStatus = false;
      v.roleId = null;
      v.roleTitle = "";
      v.modal10Status = true;
      v.$nextTick(function () {
        console.log(v.roleId);
        v.modal10 = true;
      });
    },
    show (uid, isAdmin) {
      let v = this;
      console.log(uid);
      // v.employeeStatus = 'show';
      v.$axios
        .post(api.check_user + uid)
        .then(function (response) {
          if (response.code == 0) {
            let data = response.datas,
              pos = [];
            //						var a = new Promise((resolve, reject) => {
            //
            //							v.$axios.post(api.get_saleAccountById + "?saleAccountIds=" + data.saleAccountIdList)
            //							.then(function(response){
            //
            //								if(response.code == 0){
            //									var data = response.datas;
            //									setTimeout(resolve, 100, data);
            //
            //								}
            //							})
            //						}),
            var b = new Promise((resolve) => {
              let roleNameArr = [];
              if (data.roleIdList != null) {
                console.log(data.roleIdList);
                v.roleList.forEach(function (n) {
                  if (data.roleIdList.indexOf(n.roleId) >= 0) {
                    console.log(n);
                    roleNameArr.push(n.title);
                  }
                });
              }
              setTimeout(resolve, 100, roleNameArr);
            });
            Promise.all([b]).then((r1) => {
              console.log("r1:", r1);
              console.log(r1[0]);
              if (r1[0].length > 0) {
                r1[0].forEach(function (n) {
                  if (pos.indexOf(n.platformId) < 0) {
                    pos.push(n.platformId);
                  }
                });
              }
              // var posList = v.setRoleList(pos, r1[0]);
              v.$Modal.info({
                title: "基本资料",
                content: `
			                    		<h3>新增收货地址</h3>
			                    		<div style="padding-top:6px">
			                    			邮箱：${data.email}<br>
			                    			姓名：${data.userName}<br>
			                    			电话：${data.mobile == null ? "" : data.mobile}
			                    		</div>
			                    		<br>
										${roleJurisdiction()}

			                    		`,
              });
              function roleJurisdiction () {
                if (isAdmin == "1") {
                  return "";
                } else {
                  return `<h3>角色</h3>
			                    		<div style="padding-top:6px">${r1[0].toString()}</div>
			                    		<br>
                              `;
                }
              }
            });
          }
        })
        .catch(() => { });
    },
    setRoleList (pos, data) {
      var str = "";
      for (let i = 0; i < pos.length; i++) {
        str += `<div style="padding-top:5px">${pos[i]}：</div>`;
        for (let t = 0; t < data.length; t++) {
          if (data[t].platformId == pos[i]) {
            str += `<div>
									${data[t].account}
								</div>
							`;
          }
        }
      }
      return str;
    },
    edit (uid) {
      let v = this;
      v.uid = uid;
      v.editStatus = true;
      v.openNewEmployeeStatus = true;
      var date = new Date().getTime();
      v.timestamp = date;
      v.$nextTick(function () {
        v.modal9 = true;
      });
      // v.employeeStatus = 'edit';
    },
    resetLoading () {
      let v = this;
      v.loadingRoleStatus = false;
      v.loading = false;
      v.$nextTick(function () {
        v.loadingRoleStatus = true;
        v.loading = true;
        v.cancelButton();
      });
    },
  },
  mounted () {
    document.body.addEventListener("click", (e) => {
      if (e.target.className == "ivu-modal-wrap") {
        this.$Modal.remove();
      }
    });
  },
};
</script>
