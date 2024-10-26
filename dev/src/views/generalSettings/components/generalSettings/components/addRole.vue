<template >
  <div class="role-container">
    <div class="enterRoleName">
      <Form
        ref="parmas"
        :model="parmas"
        label-position="right"
        :rules="ruleCustom"
        :label-width="66"
      >
        <Form-item
          label="角色名称"
          prop="roleName"
        >
          <Input
            v-model.trim="parmas.roleName"
            style="width: 200px"
            placeholder="请输入角色名称"
          ></Input>
          <Button
            v-if="menuCurNum !== 7"
            @click="addCustomMenu"
            class="ml15"
          >新增自定义菜单</Button>
        </Form-item>

      </Form>
    </div>
    <div class="roleContainer">
      <div class="modalItemContent clear">
        <div class="modalItem modalModule fl">
          <div class="modalItemHeader">
            <div class="modal-header-title">模块</div>
          </div>
          <div class="modalItemcontent">
            <ul>
              <li
                v-for="(item, index) in moduleList"
                :key="index"
                :class="{menuCur : index === menuCurNum}"
              >
                <a @click="choseMenu(index,item)">{{ item.mainTitle }}</a>
                <Checkbox
                  v-model="moduleStatus[index]"
                  :indeterminate="moduleIndeterminate[index]"
                  @click.native="handleCheckAll(index, moduleStatus[index], item.childMenu, item.platform, item)"
                ></Checkbox>
              </li>
            </ul>
          </div>
        </div>
        <div class="modalName">
          <template v-if="platform">
            <Tabs
              type="card"
              @on-click="changeTabVal('menuOrder', $event)"
              v-model="tabValue"
              class="modal-tabs-heand"
            >
              <TabPane
                v-for="item in enablePlatform"
                :name="item.platformId"
                :key="item.platformId"
                :label="tabPlatformMenuLabel(item)"
              ></TabPane>
            </Tabs>
          </template>
          <template v-if="menuCurNum === 1">
            <Tabs
              type="card"
              @on-click="changeTabVal('menuSetting', $event)"
              v-model="tab1Value"
              class="modal-tabs-heand"
            >
              <TabPane
                v-for="item in settingTab"
                :name="item.value"
                :key="item.value"
                :label="item.label"
              ></TabPane>
            </Tabs>
          </template>
          <template v-if="menuCurNum === 2">
            <Tabs
              type="card"
              @on-click="changeTabVal('menuWms', $event)"
              v-model="warehouseTabVal"
              class="modal-tabs-heand"
            >
              <TabPane
                v-for="item in warehouseTablist"
                :name="item.value"
                :key="item.value"
                :label="item.label"
              ></TabPane>
            </Tabs>
          </template>
          <div v-if="selectMenu" style="padding-right: 10px;">
            <Collapse v-model="value1">
              <Panel
                v-for="(item, index) in selectMenu"
                :key="index"
                :name="(item.menuKey + 1).toString()"
              >
                {{ item.mainTitle }}
                <Button
                  v-if="item.customMenu"
                  @click.stop.native="editCustomMenu(item)"
                  size="small"
                  class="ml20"
                >编辑 </Button>
                <div
                  style="float: right; padding-right: 10px; line-height: 38px;"
                  class="custom-checkbox"
                  :class="{
                    'checkbox-indeterminate': checkBoxParams[menuCurNum][item.menuKey].indeterminate,
                    'checkbox-checked': checkBoxParams[menuCurNum][item.menuKey].status
                  }"
                  @click.stop="pageCheckHandle(menuCurNum, item.menuKey ,true)"
                >
                  <span class="custom-check-frame" />全选
                </div>
                <div slot="content" class="modalNameItem">
                  <CheckboxGroup
                    v-model="roleParams[item.menuKey].selectRoles"
                    :style="{minHeight:item.customMenu ? '35px' : ''}"
                    @on-change="checkAllGroupChange(menuCurNum, item.menuKey)"
                  >
                    <Button
                      v-if="item.customMenu"
                      class="add-auth"
                      size="small"
                      @click="openAuthModal(item,'addAuth')"
                    >新增权限 </Button>
                    <template v-for="(roleItem, roleIndex) in selectRoleList[item.menuKey]">
                      <div
                        class="bigSquare"
                        :key="roleIndex"
                        v-if="roleItem.childrens && roleItem.childrens.length > 0"
                      >
                      <!-- && roleParams[item.menuKey].selectRoles.indexOf(roleItem.operId) >= 0 -->
                        <div
                          v-for="(subItem, subIndex) in roleItem.childrens"
                          :key="subIndex"
                          class="roleItem roleItemTwo"
                        >
                          <Checkbox
                            :label="subItem.operId"
                            :title="subItem.operName"
                          >
                            <span :v="subItem.operId">{{ subItem.operName }}</span>
                          </Checkbox>
                        </div>
                      </div>
                      <div
                        v-else
                        :key="roleItem.operId"
                        class="roleItem roleItemTwo"
                      >
                        <Checkbox
                          :label="roleItem.operId"
                          v-if="!roleItem.parentOperId"
                          :title="roleItem.operName"
                        >
                          <span :v="roleItem.operId">{{ roleItem.operName }}</span>
                          <Icon
                            v-if="item.customMenu"
                            @click.native.stop="openAuthModal(item,'editAuth',roleItem)"
                            size="small"
                            style="position: absolute;right: 5px;top: 5px"
                            type="md-create"
                          />
                        </Checkbox>
                      </div>
                    </template>
                  </CheckboxGroup>
                </div>
              </Panel>
            </Collapse>
          </div>
        </div>
      </div>
    </div>
    <Modal
      v-model="modal1"
      :title="customMenuType === 'addCustomMenu' ? '新增自定义菜单' : '编辑自定义菜单'"
    >
      <Form
        :model="customForm"
        ref="customForm"
        :rules="customFormRules"
      >
        <FormItem
          label="自定义菜单名称"
          prop="menuDesc"
        >
          <Input
            v-model="customForm.menuDesc"
            :maxlength="50"
          ></Input>
        </FormItem>
        <FormItem
          label="菜单编号"
          prop="menuKey"
        >
          <Input v-model="customForm.menuKey"></Input>
        </FormItem>
        <FormItem
          label="URL"
          prop="path"
        >
          <Input v-model="customForm.path"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button
          @click="submitCustomMenu"
          :loading="customLoading"
        >确定 </Button>
        <Button @click="modal1 = false">取消</Button>
      </div>
    </Modal>
    <Modal
      v-model="modal2"
      :title="customAuthType === 'addAuth' ? '新增权限' : '新增权限'"
    >
      <Form
        :model="authForm"
        ref="authForm"
        :rules="authFormRules"
      >
        <FormItem
          label="自定义权限名称"
          prop="operDesc"
        >
          <Input
            v-model="authForm.operDesc"
            :maxlength="50"
          ></Input>
        </FormItem>
        <FormItem
          label="菜单编号"
          prop="authKey"
        >
          <Input
            v-model="authForm.authKey"
            :maxlength="50"
          ></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button
          @click="submitAuth"
          :loading="customLoading"
        >确定 </Button>
        <Button @click="modal2 = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<style scoped>
.bigSquare {
  background-color: #e2e2e2;
  border-radius: 10px;
}

.add-auth {
  float: left;
  margin-top: 10px;
}
</style>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import {
  menuapi,
  menuOrder,
  menuSetting,
  menuDelivery,
  menuProduct,
  menuWms,
  menuCustomer,
  menuSps,
  menuPds,
  menuPda,
  menuFinance,
} from "@/api/menu";
// checkBoxParams
// selectMenu
// roleParams

// menuapi.sysMenu  => （menuObj,selectRoleObj,checkBoxParams，selectMenu）
// selectRoleObj => selectRoleList

const getWareTablist = Object.values(menuWms).map(item => {
  return {
    label: item.label,
    value: item.value
  }
});

export default {
  mixins: [Mixin],
  data() {
    let v = this;
    return {
      customMenuType: "addCustomMenu",
      customAuthType: "addAuth",
      activeMenuData: null,
      customLoading: false,
      operDataObj: {},
      operItemObj: {},
      tabPaneTitle: {
        definePlatform: '自定义渠道',
        orderCommon: '通用',
        allplatform: '全平台'
      },
      choseInGroup: ["menuOrder", "ebay"],
      warehouseTabVal: 'default',
      warehouseTablist: getWareTablist,
      authFormRules: {
        operDesc: [
          {
            required: true,
            message: "自定义权限菜单名称不能为空",
            trigger: "blur",
          },
        ],
        authKey: [
          {
            required: true,
            validator: v.validateMenuKey(),
            trigger: "blur",
          },
        ],
      },
      customFormRules: {
        menuKey: [
          {
            required: true,
            validator: v.validateMenuKey(),
            trigger: "blur",
          },
        ],
        menuDesc: [
          {
            required: true,
            message: "自定义权限名称不能为空",
            trigger: "blur",
          },
        ],
        path: [
          {
            required: true,
            message: "请输入正确的地址",
            type: "url",
            trigger: "blur",
          },
        ],
      },
      customForm: {
        menuKey: "",
        menuDesc: "",
        path: "",
      },
      authForm: {
        operDesc: "",
        authKey: "",
      },
      modal1: false,
      modal2: false,

      value1: [],
      tabValue: "ebay",
      tab1Value: "generalSettings",
      parmas: {
        roleName: "",
        operIdList: [],
      },
      ruleCustom: {
        roleName: [
          {
            validator: this.validateUserName(),
            trigger: "blur",
          },
        ],
      },
      moduleList: [],
      menuCurNum: 0,
      menuSys: "menuOrder",
      moduleStatus: [], // 模块选中状态
      moduleIndeterminate: [], // 模块状态样式数组
      platform: true,
      enablePlatform: [],
      settingTab: [
        {
          label: "通用", // 通用
          value: "generalSettings",
        },
        {
          label: "订单管理", // 订单管理
          value: "orderSettings",
        },
        {
          label: "仓储管理", // 仓储管理
          value: "logistics",
        },
        {
          label: "客服管理", // 客服管理
          value: "customSettings",
        },
        {
          label: "新品开发管理", // 新品开发管理
          value: "pdsSettings",
        },
        {
          label: "商品管理", // 商品管理
          value: "productSettings",
        },
        {
          label: "供应商管理", // 供应商管理
          value: "spsSettings",
        },
        {
          label: "财务计费管理", // 供管理
          value: "financeSettings",
        },
      ],
      roleList: [],
      menuObj: {},
      readyStatus: false,
      operList: [], // 权限
      selectMenu: [], // 所选系统性的菜单组合
      selectRoleObj: {},
      selectRoleList: {},
      checkBoxParams: [],
      roleParams: {},
      menuAll: {},
      editCustomMenuObj: {}, // 编辑自定义菜单对象
    };
  },
  props: {
    roleId: {
      type: String,
      default: null,
    },
    merchantId: String,
    roleTitle: {
      type: String,
      default: "",
    },
    timestamp: Number,
  },
  computed: {
    addNewRoleStatus() {
      return this.$store.state.addNewRoleStatus;
    }
  },
  watch: {
    timestamp: {
      handler(n, o) {
        if (n !== o && o !== undefined) {
          this.initParams().then((result) => {
            if (result) {
              this.getList();
              if (this.enablePlatform.length === 0) {
                this.getPlatformGroup().then((response) => {
                  let arr = [];
                  if (this.$store.state.platformGroup) {
                    arr = (this.$store.state.platformGroup || []).filter(
                      (i) => i.type === 1
                    );
                  }
                  this.enablePlatform = [
                    {
                      platformId: "allplatform",
                    },
                    {
                      platformId: "orderCommon",
                    },
                    {
                      platformId: "definePlatform",
                    },
                    ...arr,
                  ];
                });
              }
            }
          });
        }
      },
      immediate: true,
    },
    sysName: {
      handler(n, o) {
        if (n !== o) {
          this.getMenuGroup();
        }
      },
    },
    tabValue: {
      handler(n, o) {
        n !== o && this.tabValueChange(n);
      },
    },
    tab1Value: {
      handler(n, o) {
        n !== o && this.tabValueChange(n);
      },
    },
    warehouseTabVal: {
      handler(n, o) {
        n !== o && this.tabValueChange(n);
      },
    },
    menuCurNum: {
      deep: true,
      handler(n, o) {
        if (n !== o) {
          // 重置展开项
          this.value1 = [];
          this.readyStatus = false;
          this.selectMenu = [];
          if (this.moduleList[n].platform || this.moduleList[n].children) {
            let key = "";
            if (this.moduleList[n].platform) {
              this.platform = true;
              key = this.tabValue ? this.tabValue : "ebay";
            } else {
              this.platform = false;
              key = this.tab1Value ? this.tab1Value : "generalSettings";
            }
            this.menuSys = this.moduleList[n]["childMenu"];
            this.selectMenu = this.menuObj[this.menuSys] ? this.menuObj[this.menuSys][key] || [] : [];
            this.selectRoleList = this.selectRoleObj[this.menuSys] ? this.selectRoleObj[this.menuSys][key] || [] : [];
          } else {
            this.platform = false;
            this.menuSys = this.moduleList[n]["childMenu"];
            if (['menuWms'].includes(this.menuSys) && this.menuObj[this.menuSys]) {
              this.selectMenu = this.menuObj[this.menuSys][this.warehouseTabVal] ? this.menuObj[this.menuSys][this.warehouseTabVal] || [] : [];
              this.selectRoleList = this.selectRoleObj[this.menuSys] ? this.selectRoleObj[this.menuSys][this.warehouseTabVal] || [] : [];
            } else {
              this.selectMenu = this.menuObj[this.menuSys];
              this.selectRoleList = this.selectRoleObj[this.menuSys];
            }
          }
          this.$nextTick(() => {
            this.readyStatus = true;
          });
        }
      },
    },
    addNewRoleStatus(n, o) {
      if (n) this.addNewRole();
    },
  },
  created() {
    let v = this;
    v.moduleList = menuapi.sysMenu;
  },
  methods: {
    tabValueChange (str) {
      this.readyStatus = false;
      this.value1 = [];
      this.selectMenu = [];

      this.$nextTick(() => {
        if (this.menuObj[this.menuSys]) {
          this.selectMenu = this.menuObj[this.menuSys][str];
        }
        if (this.selectRoleObj[this.menuSys]) {
          this.selectRoleList = this.selectRoleObj[this.menuSys][str];
        }
        this.readyStatus = true;
      });
    },
    // 校验菜单编号
    validateMenuKey() {
      let validateMenuKey = (rule, value, callback) => {
        let re = this.$regular.onlyLettersMessage;
        let result = re.test(value);
        if (!result) {
          callback(new Error("只允许输入字母、数字、下划线，长度在3-30位"));
        } else {
          callback();
        }
      };
      return validateMenuKey;
    },
    editCustomMenu(obj) {
      this.customMenuType = "editCustomMenu";
      for (let key in this.customForm) {
        this.customForm[key] = obj[key];
      }
      let talg = obj.menuKey.match(/_(\S*)/)[1];
      this.customForm.menuKey = talg;
      this.modal1 = true;
      this.editCustomMenuObj = obj;
    },
    updateMenu() {
      this.initParams().then((result) => {
        this.getList();
      });
    },
    fixCustomMenuData() {
      let v = this;
      let menuKey =
        v.typeOf(v.choseInGroup) === "array"
          ? v.choseInGroup[1]
          : v.choseInGroup;
      if (v.customMenuType === "addCustomMenu") {
        let choseGroup =
          v.typeOf(v.choseInGroup) === "array"
            ? v.choseInGroup.join("_")
            : v.choseInGroup;
        v.customForm.originalMenuKey = v.customForm.menuKey;
        return {
          ...v.customForm,
          menuDesc: v.customForm.menuDesc,
          path: v.customForm.path,
          menuKey: menuKey + "_" + v.customForm.menuKey,
          deleteFlag: 0, // 写死 不给删除
          menuName: v.customForm.menuDesc,
          platformType: choseGroup, // 有_ 表示是两级菜单
          subsystemCode: choseGroup + "_custom", // 自定义菜单父id
        };
      } else if (v.customMenuType === "editCustomMenu") {
        v.customForm.menuKey = menuKey + "_" + v.customForm.menuKey;
        return Object.assign({}, v.editCustomMenuObj, v.customForm);
      }
    },
    submitCustomMenu() {
      // 添加自定义菜单
      let v = this;
      v.$refs.customForm.validate((valid) => {
        if (valid) {
          // 这里传入的参数会用于菜单入库
          let params = v.fixCustomMenuData(); // 参数整理
          if (v.customLoading) return;
          v.customLoading = true;
          let axiosType = v.customMenuType === "addCustomMenu" ? "post" : "put";
          v.axios[axiosType](api.add_menuResource, params).then((response) => {
            v.customLoading = false;
            if (response.data.code === 0) {
              v.$Message.success("操作成功");
              v.menuObj = {};
              v.selectRoleObj = {};
              v.getList();
              v.modal1 = false;
            } else {
              (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error("操作失败，请重新尝试");
            }
          });
        }
      });
    },
    submitAuth() {
      /**
       * 保存新增权限
       * */
      let v = this;
      v.$refs.authForm.validate((valid) => {
        if (valid) {
          /***
           * 注意  platformType
           * */
          v.operationCustomAuth(
            v.customAuthType === "addAuth" ? "add" : "edit",
            {
              deleteFlag: 0,
              operId:
                v.customAuthType === "addAuth"
                  ? undefined
                  : v.activeMenuData.operId,
              operDesc: v.authForm.operDesc,
              operName: v.authForm.operDesc,
              menuId: v.activeMenuData.menuId,
              resource: v.authForm.authKey,
              platformType: v.activeMenuData.platformType,
              subsystemCode: v.activeMenuData.subsystemCode,
            }
          ).then((data) => {
            v.modal2 = false;
            v.menuObj = {};
            v.selectRoleObj = {};
            v.getList();
          });
        }
      });
    },
    openAuthModal(item, type, roleItem) {
      let v = this;
      v.modal2 = true;
      v.customAuthType = type;
      v.$refs.authForm.resetFields();
      if (type === "editAuth") {
        this.authForm.authKey = roleItem.resource;
        this.authForm.operDesc = roleItem.operName;
        roleItem.menuId = item.menuId;
        v.activeMenuData = roleItem;
      } else {
        v.activeMenuData = item;
      }
    },
    addCustomMenu() {
      let v = this;
      v.customMenuType = "addCustomMenu";
      v.$refs.customForm.resetFields();
      v.modal1 = true;
    },
    // 菜单分类修改
    changeTabVal(type, val) {
      this.choseInGroup = [type, val];
    },
    // 选中菜单
    choseMenu(index, item) {
      if (item.childMenu === "menuOrder") {
        // 订单
        this.choseInGroup = ["menuOrder", this.tabValue];
        // this.tabValueChange(this.tabValue)
      } else if (item.childMenu === "generalSettings") {
        // 设置中心
        this.choseInGroup = ["menuSetting", this.tab1Value];
        // this.tabValueChange(this.tab1Value)
      } else {
        this.choseInGroup = item.prefix.slice(0, -1);
      }
      this.menuCurNum = index;
      // this.tab1Value = 'generalSettings';
    },
    initParams() {
      let v = this;
      return new Promise((resolve) => {
        v.menuCurNum = 0;
        v.$refs["parmas"].resetFields();
        v.roleList = [];
        v.menuObj = {};
        v.readyStatus = false;
        v.operList = [];
        v.operItemObj = {};
        v.selectMenu = [];
        v.selectRoleObj = {};
        v.selectRoleList = {};
        v.checkBoxParams = [];
        v.roleParams = {};
        v.tabValue = "ebay";
        v.tab1Value = "generalSettings";
        v.choseInGroup = ["menuOrder", "ebay"];
        if (v.roleId === null) {
          v.parmas.roleName = "";
        } else {
          v.parmas.roleName = v.roleTitle;
        }
        resolve(true);
      });
    },
    resetMenu() {
      this.menuAll = {
        menuOrder: JSON.parse(JSON.stringify(menuOrder)),
        menuSetting: JSON.parse(JSON.stringify(menuSetting)),
        menuCustomer: JSON.parse(JSON.stringify(menuCustomer)),
        menuDelivery: JSON.parse(JSON.stringify(menuDelivery)),
        menuProduct: JSON.parse(JSON.stringify(menuProduct)),
        menuWms: JSON.parse(JSON.stringify(menuWms)),
        menuSps: JSON.parse(JSON.stringify(menuSps)),
        menuPds: JSON.parse(JSON.stringify(menuPds)),
        menuPda: JSON.parse(JSON.stringify(menuPda)),
        menuFinance: JSON.parse(JSON.stringify(menuFinance)),
      };
    },
    getList() {
      // 获取权限列表
      this.operList = [];
      this.operItemObj = {};
      // this.$Spin.show();
      this.$emit('modalLoading', true);
      this.axios.get(api.get_roleAuthList + this.roleId).then((response) => {
        if (response && response.data && response.data.code === 0) {
          this.operList = response.data.datas;
          (response.data.datas || []).forEach(item => {
            if (this.$common.isUndefined(this.operItemObj[item.menuId])) {
              this.$set(this.operItemObj, item.menuId, [item]);
            } else {
              this.operItemObj[item.menuId].push(item);
            }
          });
          this.injectionCustomMenu().then(() => {
            this.makeData();
          }).catch(() => {
            this.$emit('modalLoading', false);
          });
        }
      }).catch(() => {
        this.$emit('modalLoading', false);
      });
    },
    // 初始化左侧选中状态
    makeData() {
      this.moduleList.forEach((n, i) => {
        let obj = Object.create(null);
        this.moduleStatus.splice(i, 1, false); // 初始化模块状态
        this.moduleIndeterminate.splice(i, 1, false);
        this.checkBoxParams.splice(i, 1, obj);
        this.setMenu(n, i); // 组合 checkBoxParams 里的数据
      });
      this.$emit('modalLoading', false);
    },
    setMenu(module, index) {
      // 组合数据
      let v = this;
      let keyObj = Object.create(null); //
      if (!v.menuObj.hasOwnProperty(module.childMenu) && (module.platform || module.children)) {
        // 有平台的菜单数据和权限组合
        v.menuObj[module.childMenu] = Object.create(null);
        v.selectRoleObj[module.childMenu] = Object.create(null);
        let arr = [];
        let arrKey = "";
        if (module.childSettingName === "setting") {
          arr = module.children;
          arrKey = "childMenu";
        } else {
          arr = v.enablePlatform;
          arrKey = "platformId";
        }
        arr.forEach((n, i) => {
          let menu;
          let platformId = n[arrKey];
          let tabValue = "";
          if (arrKey === "childMenu") {
            menu = v.getOper("generalSettings", platformId);
            tabValue = v.tab1Value;
          } else {
            menu = v.getOper(module.type[0], platformId);
            tabValue = v.tabValue;
          }
          v.menuObj[module.childMenu][platformId] = v.getThisPlatformList(
            menu,
            platformId + "_"
          ); // 菜单
          v.selectRoleObj[module.childMenu][platformId] = {};
          if (module.childMenu === v.menuSys) {
            v.selectMenu = v.menuObj[v.menuSys][tabValue]; // 菜单
          }
          if (menu) {
            menu.forEach((m, t) => {
              if (m.menuKey && m.menuKey !== "Group") {
                let key = m.menuKey;
                v.checkBoxParams[index][key] = Object.create(null);
                keyObj[key] = {};
                keyObj[key].selectRoles = new Array(0);
                keyObj[key].num = 0;
                v.checkBoxParams[index][key].status = false;
                v.checkBoxParams[index][key].platformId = platformId;
                v.checkBoxParams[index][key].roles = [];
                v.checkBoxParams[index][key].indeterminate = false;
                v.checkBoxParams[index][key].data = v.getThisRoleList(key, platformId);
                let mj = v.deepCopy(v.roleParams);
                v.roleParams = Object.assign(mj, keyObj);
                v.selectRoleObj[module.childMenu][platformId][key] = v.getThisRoleList(key, platformId); // 权限
                if (module.childMenu === v.menuSys) {
                  v.$nextTick(function () {
                    v.selectRoleList = v.selectRoleObj[v.menuSys][tabValue]; // 权限组合
                  });
                }
              }
            });
            if (index === v.moduleList.length - 1) {
              v.setRoles();
            }
          }
        });
      } else {
        if (['wms'].includes(module.type[0])) {
          v.selectRoleObj[module.childMenu] = {};
          v.$set(v.menuObj, module.childMenu, {});
          let newMenu = [];
          this.warehouseTablist.forEach(item => {
            v.selectRoleObj[module.childMenu][item.value] = {};
            newMenu = [];
            if (this.$common.isEmpty(this.menuAll[module.childMenu][item.value]) || this.$common.isEmpty(this.menuAll[module.childMenu][item.value].menu)) {
              v.$set(v.menuObj[module.childMenu], item.value, []);
            } else {
              newMenu = this.menuAll[module.childMenu][item.value].menu;
              v.$set(v.menuObj[module.childMenu], item.value, v.getMenuList(newMenu));
            }
            newMenu.forEach((n, i) => {
              if (n.menuKey && n.menuKey !== "Group") {
                let key = n.menuKey;
                v.checkBoxParams[index][key] = Object.create(null);
                keyObj[key] = {};
                keyObj[key].selectRoles = new Array(0);
                keyObj[key].num = 0;
                v.checkBoxParams[index][key].status = false;
                v.checkBoxParams[index][key].roles = [];
                v.checkBoxParams[index][key].indeterminate = false;
                v.checkBoxParams[index][key].data = v.getThisRoleList(n.menuKey);
                let mj = v.deepCopy(v.roleParams);
                v.roleParams = Object.assign(mj, keyObj);
                v.selectRoleObj[module.childMenu][item.value][n.menuKey] = v.getThisRoleList(n.menuKey);
                // 权限
                if (module.childMenu === v.menuSys) {
                  v.$nextTick(() => {
                    v.selectRoleList = v.selectRoleObj[v.menuSys][this.warehouseTabVal]; // 权限组合
                  });
                }
              }
            })
          });
        } else {
          // 没有平台的菜单数据和权限数据组合
          let menu = v.getOper(module.type[0]);
          v.menuObj[module.childMenu] = v.getMenuList(menu); // 菜单
          v.selectRoleObj[module.childMenu] = {};
          if (module.childMenu === v.menuSys) {
            v.selectMenu = v.menuObj[v.menuSys]; // 菜单
          }
          (menu || []).forEach((n, i) => {
            if (n.menuKey && n.menuKey !== "Group") {
              let key = n.menuKey;
              v.checkBoxParams[index][key] = Object.create(null);
              keyObj[key] = {};
              keyObj[key].selectRoles = new Array(0);
              keyObj[key].num = 0;
              v.checkBoxParams[index][key].status = false;
              v.checkBoxParams[index][key].roles = [];
              v.checkBoxParams[index][key].indeterminate = false;
              v.checkBoxParams[index][key].data = v.getThisRoleList(n.menuKey, n.platformId);
              let mj = v.deepCopy(v.roleParams);
              v.roleParams = Object.assign(mj, keyObj);
              v.selectRoleObj[module.childMenu][n.menuKey] = v.getThisRoleList(n.menuKey, n.platformId);
              // 权限
              if (module.childMenu === v.menuSys) {
                v.$nextTick(function () {
                  v.selectRoleList = v.selectRoleObj[v.menuSys]; // 权限组合
                });
              }
            }
          });
          if (index === v.moduleList.length - 1) {
            v.setRoles();
          }
        }
      }
    },
    getMenuList(menu) {
      let arr = [];
      if (menu) {
        menu.forEach((n, i) => {
          if (n.menuKey && !n.type) {
            arr.push(n);
          }
        });
      }
      return arr;
    },
    // 订单模块对应平台选中情况
    getPlatformItemChoose (platformId) {
      if (this.$common.isEmpty(platformId) || this.$common.isEmpty(this.checkBoxParams[this.menuCurNum])) return {};
      let obj = {};
      let newPlatformId = this.$common.isArray(platformId) ? platformId : [platformId];
      Object.keys(this.checkBoxParams[this.menuCurNum]).forEach(menuKey => {
        if (newPlatformId.includes(this.checkBoxParams[this.menuCurNum][menuKey].platformId)) {
          if (this.$common.isUndefined(obj[this.checkBoxParams[this.menuCurNum][menuKey].platformId])) {
            obj[this.checkBoxParams[this.menuCurNum][menuKey].platformId] = [];
          }
          if (this.checkBoxParams[this.menuCurNum][menuKey].indeterminate) {
            obj[this.checkBoxParams[this.menuCurNum][menuKey].platformId].push('indeterminate');
          } else if (!this.checkBoxParams[this.menuCurNum][menuKey].indeterminate) {
            if (!this.$common.isEmpty(this.checkBoxParams[this.menuCurNum][menuKey].data)) {
              if (this.checkBoxParams[this.menuCurNum][menuKey].status) {
                obj[this.checkBoxParams[this.menuCurNum][menuKey].platformId].push('checked');
              } else {
                obj[this.checkBoxParams[this.menuCurNum][menuKey].platformId].push('notCheck');
              }
            }
          }
        }
      });
      let resObj = {};
      // 数组去重
      Object.keys(obj).forEach(key => {
        resObj[key] = { indeterminate: false, checked: false };
        obj[key] = this.$common.arrRemoveRepeat(obj[key]);
        if (obj[key].length > 1) {
          resObj[key].indeterminate = true;
          resObj[key].checked = true;
        } else {
          if (obj[key][0] != 'notCheck') {
            resObj[key].indeterminate = obj[key][0] == 'indeterminate';
            resObj[key].checked = true;
          }
        }
      });
      return this.$common.isString(platformId) ? resObj[platformId] : resObj;
    },
    // 权限对应模块名称
    tabPlatformMenuLabel (res) {
      const checkInfo = this.getPlatformItemChoose(res.platformId) || { checked: false, indeterminate: false };
      return (h) => {
        const labelName = this.tabPaneTitle[res.platformId] ? this.tabPaneTitle[res.platformId] : res.name;
        let demoClass = 'custom-checkbox';
        if (checkInfo.indeterminate) {
          demoClass = `${demoClass} checkbox-indeterminate`;
        }
        if (checkInfo.checked) {
          demoClass = `${demoClass} checkbox-checked`;
        }
        return h('div', {
          style: {
            display: 'flex'
          }
        },
        [
          h('span', {}, labelName),
          h('div', {
            style: {
              margin: '0 0 0 5px',
            },
            class: demoClass,
            on: {
              click: () => {
                this.platformCheckHandle(res.platformId, (!checkInfo.checked || checkInfo.indeterminate));
              }
            }
          },
          [
            h('span', {
              class: 'custom-check-frame',
            })
          ])
        ]);
      }
    },
    // 平台勾选处理
    platformCheckHandle (platformId, isCheck) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.checkBoxParams[this.menuCurNum])) return;
        let checked = false;
        let indeterminate = false;
        Object.keys(this.checkBoxParams[this.menuCurNum]).forEach(menuKey => {
          if (this.checkBoxParams[this.menuCurNum][menuKey].platformId == platformId) {
            checked = this.checkBoxParams[this.menuCurNum][menuKey].status;
            indeterminate = this.checkBoxParams[this.menuCurNum][menuKey].indeterminate;
            if (isCheck) {
              if (!checked || indeterminate) {
                this.pageCheckHandle(this.menuCurNum, menuKey, true);
              }
            } else {
              this.pageCheckHandle(this.menuCurNum, menuKey, true);
            }
          }
        });
      });
    },
    getThisPlatformList(menu, prefix) {
      // 获取平台页面
      let split = prefix;
      let arr = [];
      if (menu) {
        menu.forEach((n, i) => {
          if (n.menuKey && n.menuKey.indexOf(split) >= 0) {
            arr.push(n);
          }
        });
      }
      return arr;
    },
    setRoles() {
      let v = this;
      v.checkBoxParams.forEach((m, t) => {
        v.operList.forEach((n, i) => {
          let menuItem = m[n.menuId];
          let item = v.roleParams[n.menuId];
          if (n.childrens && n.childrens.length > 0) {
            if (this.$common.isUndefined(this.operDataObj[n.operId])) {
              this.$set(this.operDataObj, n.operId, []);
            }
            n.childrens.forEach((child) => {
              if (!this.operDataObj[n.operId].includes(child.operId)) {
                this.operDataObj[n.operId].push(child.operId);
              }
            });
          }
          if (menuItem) {
            if (n.childrens && n.childrens.length > 0) {
              let childCheck = false;
              n.childrens.forEach((g, l) => {
                menuItem.roles.push(g.operId);
                childCheck = true;
              });
              if (childCheck) {
                menuItem.roles.push(n.operId);
              }
            } else {
              menuItem.roles.push(n.operId);
            }
            if (n.checked) {
              if (n.childrens && n.childrens.length > 0) {
                let childCheck = false;
                n.childrens.forEach((g, l) => {
                  if (g.checked) {
                    item.selectRoles.push(g.operId);
                    item.num += 1;
                    childCheck = true;
                  }
                });
                if (childCheck) {
                  item.selectRoles.push(n.operId);
                }
              } else {
                item.selectRoles.push(n.operId);
              }
              menuItem.roles = [...new Set(menuItem.roles)];
              item.selectRoles = [...new Set(item.selectRoles)];
              item.num += 1;
              let len = v.getLength(menuItem.data); // 包含子集
              if (item.selectRoles.length === len) {
                menuItem.status = true;
                menuItem.indeterminate = false;
              } else {
                if (item.selectRoles.length >= 1) {
                  menuItem.status = false;
                  menuItem.indeterminate = true;
                }
              }
            } else {
              if (item.selectRoles.length > 0) {
                menuItem.status = false;
                menuItem.indeterminate = true;
              }
            }
          }
        });
      });
      v.getModuleStatus();
      v.$nextTick(function () {
        v.readyStatus = true;
      });
    },
    getLength(data) {
      let len = data.length;
      data.forEach((i) => {
        if (i.childrens && i.childrens.length > 0) {
          len += i.childrens.length;
        }
      });
      return len;
    },
    getModuleStatus() {
      // 左侧模块状态匹配
      this.checkBoxParams.forEach((n, i) => {
        let statusList = [];
        let indeterminate = [];
        Object.keys(n).forEach((m, t) => {
          if (n[m].data.length > 0) {
            statusList.push(n[m].status);
            indeterminate.push(n[m].indeterminate);
          }
        });
        statusList = this.$common.arrRemoveRepeat(statusList);
        indeterminate = this.$common.arrRemoveRepeat(indeterminate);
        // 初始化模塊狀態
        if (indeterminate.length > 1 || statusList.length > 1) {
          this.moduleStatus.splice(i, 1, true);
          this.moduleIndeterminate.splice(i, 1, true);
        } else {
          this.moduleStatus.splice(i, 1, statusList[0]);
          this.moduleIndeterminate.splice(i, 1, indeterminate[0]);
        }
      });
    },
    // 页面下的权限
    getThisRoleList (menuKey, platformId) {
      // let arr = [];
      // this.operList.forEach((n, i) => {
      //   if (n.menuId === menuKey) {
      //     arr.push(n);
      //   }
      // });
      return this.operItemObj[menuKey] || [];
    },
    getCustomMenu() {
      // 获取自定义菜单
      this.resetMenu();
      return new Promise((resolve) => {
        this.axios.get(api.get_menuResource).then((response) => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    injectionCustomMenu(type, data, menuModule) {
      // 注入自定义菜单； choseInGroup
      /**
       * @params type 0 1
       * data 自定义菜单数据
       * menuModule 菜单大模块的名称
       * */
      let v = this;
      if (type === 0) {
        if (this.typeOf(menuModule) === "array") {
          if (this.menuAll[menuModule[0]]) {
            this.menuAll[menuModule[0]][menuModule[1]].push(data);
          }
        } else {
          if (this.menuAll[menuModule]) {
            this.menuAll[menuModule].menu.push(data);
          }
        }
      } else {
        return new Promise((resolve) => {
          this.getCustomMenu().then((response) => {
            if (response) {
              let menuModule = null; // 插入到哪个菜单
              response.forEach((van) => {
                if (van.platformType.includes("_")) {
                  menuModule = van.platformType.split("_");
                } else {
                  let data = v.moduleList.filter((item) => {
                    if (this.$common.isJson(item.prefix)) {
                      return Object.values(item.prefix).includes(
                        `${van.platformType}_`
                      );
                    }
                    return item.prefix === `${van.platformType}_`;
                  });
                  menuModule = data ? data[0].childMenu : null;
                }
                if (menuModule) {
                  v.injectionCustomMenu(
                    0,
                    {
                      ...van,
                      mainTitle: van.menuDesc,
                      menuKey: van.menuKey,
                      link: van.path,
                      customMenu: true,
                    },
                    menuModule
                  );
                }
              });
              resolve();
            }
          });
        });
      }
    },
    getOper(type, platformId) {
      // 根据菜单匹配权限
      // menuOrder  menuAliexpress
      switch (type) {
        case "order":
          if (!platformId) {
            return this.menuAll.menuOrder.menu;
          } else if (platformId === "ebay") {
            return this.menuAll.menuOrder.ebay;
          } else if (platformId === "wish") {
            return this.menuAll.menuOrder.wish;
          } else if (platformId === "aliexpress") {
            return this.menuAll.menuOrder.aliexpress;
          } else if (platformId === "amazon") {
            return this.menuAll.menuOrder.amazon;
          } else if (platformId === "definePlatform") {
            return this.menuAll.menuOrder.definePlatform;
          } else {
            return this.menuAll.menuOrder[platformId];
          }
        case "generalSettings":
          if (platformId === "generalSettings") {
            return this.menuAll.menuSetting.generalSettings;
          } else if (platformId === "logistics") {
            return this.menuAll.menuSetting.logistics;
          } else if (platformId === "customSettings") {
            return this.menuAll.menuSetting.customSettings;
          } else if (platformId === "orderSettings") {
            return this.menuAll.menuSetting.orderSettings;
          } else if (platformId === "pdsSettings") {
            return this.menuAll.menuSetting.pdsSettings;
          } else if (platformId === "productSettings") {
            return this.menuAll.menuSetting.productSettings;
          } else if (platformId === "spsSettings") {
            return this.menuAll.menuSetting.spsSettings;
          } else if (platformId === "financeSettings") {
            return this.menuAll.menuSetting.financeSettings;
          }
          break;
        case "customer":
          return this.menuAll.menuCustomer.menu;
        case "delivery":
          return this.menuAll.menuDelivery.menu;
        case "productCenter":
          return this.menuAll.menuProduct.menu;
        case "wms":
          if (this.$common.isEmpty(this.warehouseTabVal) || this.$common.isEmpty(this.menuAll.menuWms[this.warehouseTabVal])) {
            return this.menuAll.menuWms['default'].menu;
          }
          return this.menuAll.menuWms[this.warehouseTabVal].menu;
        case "sps":
          return this.menuAll.menuSps.menu;
        case "pds":
          return this.menuAll.menuPds.menu;
        case "pda":
          return this.menuAll.menuPda.menu;
        case "finance":
          return this.menuAll.menuFinance.menu;
      }
    },
    validateUserName() {
      // 角色校验，非空判断
      const validateUserName = function (rule, value, callback) {
        if (value === "") {
          callback(new Error("请输入角色名称"));
        } else {
          callback();
        }
      };
      return validateUserName;
    },
    // 页面权限选中值改变时
    checkAllGroupChange(menuCurNum, menuKey) {
      this.parentChooseHand(this.roleParams[menuKey].selectRoles || [], menuKey, this.selectRoleList[menuKey] || []);
      this.$nextTick(() => {
        let cur = this.roleParams[menuKey].selectRoles;
        let checkBoxParamsItem = this.checkBoxParams[menuCurNum][menuKey];
        if (cur.length === 0) {
          checkBoxParamsItem.indeterminate = false;
          checkBoxParamsItem.status = false;
        } else if (cur.length > 0 && cur.length < checkBoxParamsItem.roles.length) {
          checkBoxParamsItem.indeterminate = true;
          checkBoxParamsItem.status = false;
        } else if (cur.length === checkBoxParamsItem.roles.length) {
          checkBoxParamsItem.indeterminate = false;
          checkBoxParamsItem.status = true;
        }
        this.getModuleStatus();
      })
    },
    // 页面权限勾选处理
    pageCheckHandle (menuCurNum, menuKey, isAll) {
      let status = isAll ? this.checkBoxParams[menuCurNum][menuKey].status : this.moduleStatus[menuCurNum];
      if (!status) {
        this.checkBoxParams[menuCurNum][menuKey].status = true;
        let roles = this.$common.arrRemoveRepeat(this.$common.copy(this.checkBoxParams[menuCurNum][menuKey].roles));
        this.roleParams[menuKey].selectRoles = [];
        this.$nextTick(() => {
          this.roleParams[menuKey].selectRoles = roles;
          this.checkAllGroupChange(menuCurNum, menuKey);
        });
      } else {
        this.checkBoxParams[menuCurNum][menuKey].status = false;
        this.roleParams[menuKey].selectRoles = [];
        this.$nextTick(() => {
          this.checkAllGroupChange(menuCurNum, menuKey);
        });
      }
    },
    // 模块勾选处理
    moduleCheckHandle (menuCurNum, menuKey, bool) {
      let status = bool;
      if (!status) {
        this.checkBoxParams[menuCurNum][menuKey].status = true;
        let roles = [...new Set(this.checkBoxParams[menuCurNum][menuKey].roles)];
        this.roleParams[menuKey].selectRoles = [];
        this.$nextTick(() => {
          this.roleParams[menuKey].selectRoles = roles;
          this.checkAllGroupChange(menuCurNum, menuKey);
        });
      } else {
        this.checkBoxParams[menuCurNum][menuKey].status = false;
        this.$nextTick(() => {
          this.roleParams[menuKey].selectRoles = [];
          this.checkAllGroupChange(menuCurNum, menuKey);
        });
      }
    },
    handleCheckAll(index, status, sys, platform, item) {
      let menu;
      this.menuCurNum = index;
      if (platform) {
        this.enablePlatform.forEach((n, i) => {
          menu = this.menuObj[sys][n.platformId];
          menu.forEach((m, t) => {
            this.pageCheckHandle(index, m.menuKey);
          });
        });
      } else if (item.childSettingName === "setting") {
        this.settingTab.forEach((n, i) => {
          menu = this.menuObj[sys][n.value];
          menu.forEach((m, t) => {
            this.pageCheckHandle(index, m.menuKey);
          });
        });
      } else {
        if (this.$common.isArray(this.menuObj[sys])) {
          this.menuObj[sys].forEach((m, t) => {
            this.moduleCheckHandle(this.menuCurNum, m.menuKey, status);
          });
        } else if (this.$common.isJson(this.menuObj[sys])) {
          Object.values(this.menuObj[sys]).forEach(item => {
            item.forEach((m, t) => {
              this.moduleCheckHandle(this.menuCurNum, m.menuKey, status);
            });
          })
        }
      }
    },
    // 处理隐藏的父级选中关系
    parentChooseHand (selectRoles = [], menuKey, roleList = []) {
      let parentVal = [];
      let allParent = [];
      let parentObj = {};
      let newVal = [];
      roleList.forEach(item => {
        if (!this.$common.isEmpty(this.operDataObj[item.operId])) {
          parentObj[item.operId] = this.operDataObj[item.operId];
        }
      });
      Object.keys(parentObj).forEach(key => {
        allParent.push(key);
        if (!this.$common.isEmpty(parentObj[key].find(id => selectRoles.includes(id))) && !parentVal.includes(key)) {
          parentVal.push(key);
        }
      });
      newVal = this.$common.arrRemoveRepeat([...(selectRoles.filter(id => !allParent.includes(id))), ...parentVal]);
      this.roleParams[menuKey].selectRoles = newVal;
    },
    handleSubmit(name) {
      let v = this;
      return new Promise((resolve) => {
        let result = true;
        v.$refs[name].validate(function (valid) {
          if (valid) {
            result = true;
          } else {
            result = false;
          }
          resolve(result);
        });
      });
    },
    integrateRoleId() {
      let v = this;
      return new Promise((resolve) => {
        v.parmas.operIdList = [];
        let arr = [];
        let keys = Object.keys(v.roleParams);
        let lastPage = keys[keys.length - 1];
        for (let item in v.roleParams) {
          let subItem = v.roleParams[item].selectRoles;
          if (subItem && subItem.length > 0) {
            subItem.forEach((n, i) => {
              arr.push(n);
            });
          }
          if (item === lastPage) {
            v.parmas.operIdList = arr;
            resolve(true);
          }
        }
      });
    },
    addNewRole() {
      // 保存新角色
      let v = this;
      if (!v.parmas.roleName) {
        v.$Message.info("请输入角色名称");
        v.$emit("resetBtnLoading");
        v.$store.commit("addNewRoleStatus", false);
        return;
      }
      Promise.all([v.handleSubmit("parmas"), v.integrateRoleId()]).then(
        (result) => {
          if (result[0] && result[1]) {
            v.save();
          } else {
            v.$emit("resetLoading");
          }
        }
      );
    },
    addAuth() {
      let v = this;
      v.axios.post(api.set_operResource).then((response) => {
        if (response.data.code === 0) {
          v.$Message.success("操作成功");
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error("操作失败，请重新尝试");
        }
      });
    },
    operationCustomAuth(type, params) {
      /**
       * 新增、更新自定义权限
       * type add 添加 update 更新
       * params 提交参数
       * */
      let v = this;
      return new Promise((resolve) => {
        let urlType = type === "add" ? "post" : "put";
        v.axios[urlType](api.set_operResource, params).then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("操作成功");
            resolve(response.data.datas);
          } else {
            (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error("操作失败，请重新尝试");
          }
        });
      });
    },
    save() {
      let v = this;
      let url = api.add_role;
      if (v.roleId !== null) {
        url = api.edit_role;
        v.parmas.roleId = v.roleId;
        v.parmas.merchantId = v.merchantId;
        v.axios
          .put(url, JSON.stringify(v.parmas))
          .then((response) => {
            if (response.data.code === 0) {
              v.$Message.success("保存成功");
              v.$parent.loadingRoleStatus = false;
              v.$parent.$parent.modal10 = false;
              v.$store.commit("addNewRoleStatus", false);
              v.$parent.roleListStatus = true;
            } else {
              v.$emit("resetLoading");
              v.$store.commit("addNewRoleStatus", false);
              v.$parent.$parent.modal10 = false;
            }
          })
          .catch(() => {
            v.$Message.error("保存失败，请重新尝试");
            v.$store.commit("addNewRoleStatus", false);
            v.$emit("resetLoading");
          });
      } else {
        delete v.parmas.merchantId;
        delete v.parmas.roleId;
        v.axios
          .post(url, JSON.stringify(v.parmas))
          .then((response) => {
            if (response.data.code === 0) {
              v.$Message.success("新增成功");
              v.$parent.$parent.modal10 = false;
              v.$parent.roleListStatus = true;
            } else {
              (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error("保存失败，请重新尝试");
              v.$emit("resetLoading");
            }
            v.$emit("resetLoading");
            v.$store.commit("addNewRoleStatus", false);
          })
          .catch(() => {
            v.$Message.error("保存失败，请重新尝试");
            v.$store.commit("addNewRoleStatus", false);
            v.$emit("resetLoading");
          });
      }
    },
  },
};
</script>
<style lang="less" scoped>
.enterRoleName{
  .ivu-form-item{
    margin-bottom: 15px;
  }
}
.modalItemHeader{
  .modal-header-title {
    padding: 0 10px;
    line-height: 32px;
    font-weight: bold;
  }
}
.modal-tabs-heand{
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
  :deep(.ivu-tabs-bar){
    margin-bottom: 10px;
  }
}
.checkbox-indeter-style{
  .custom-check-frame{
    content: '';
    border-color: #2d8cf0;
    background-color: #2d8cf0;
    &:before{
      position: absolute;
      content: '';
      width: 10px;
      height: 0;
      left: 2px;
      top: 7px;
      border-bottom: 2px solid #fff;
      border-right: 2px solid #fff;
      transform: scale(1);
    }
  }
}
.role-container{
  :deep(.roleContainer){
    .custom-checkbox {
      position: relative;
      display: table;
      line-height: normal;
      cursor: pointer;
      user-select: none;
      .custom-check-frame{
        position: relative;
        display: inline-block;
        margin-right: 5px;
        width: 16px;
        height: 16px;
        border: 1px solid #dcdee2;
        border-radius: 2px;
        background-color: #fff;
        font-size: 0;
        vertical-align: middle;
        transition: border-color .2s ease-in-out,background-color .2s ease-in-out,box-shadow .2s ease-in-out;
      }
      &.checkbox-checked{
        .custom-check-frame{
          border-color: #2d8cf0;
          background-color: #2d8cf0;
          &:before{
            position: absolute;
            content: '';
            width: 5px;
            height: 10px;
            top: 1px;
            left: 5px;
            border-bottom: 2px solid #fff;
            border-right: 2px solid #fff;
            transform: rotate(45deg) scale(1);
          }
        }
        &.checkbox-indeterminate{
          .checkbox-indeter-style;
        }
      }
      &.checkbox-indeterminate{
        .checkbox-indeter-style;
      }
      &.checkbox-disabled{
        cursor: not-allowed;
        .custom-check-frame{
          border-color: #dcdee2;
          background-color: #f3f3f3;
          &:before{
            border-bottom: 2px solid #ccc;
            border-right: 2px solid #ccc;
          }
        }
        &.checkbox-indeterminate {
          .custom-check-frame{
            &:before{
              border-bottom: 2px solid #ccc;
              border-right: 2px solid #ccc;
            }
          }
        }
        &.checkbox-checked{
          .custom-check-frame{
            &:before{
              border-bottom: 2px solid #ccc;
              border-right: 2px solid #ccc;
            }
          }
        }
      }
    }
  }
}
</style>
