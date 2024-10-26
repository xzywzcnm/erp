<template>
  <div
    class="top-container ivu-menu-horizontal"
    :style="showGeneralSearch.show ? 'min-width: 900px' : 'min-width: 500px'"
  >
    <div class="header_box">
      <!--左边区域-->
      <div class="left_box">
        <!--logo图片-->
        <div class="logo_box" v-if="logoTalg">
          <img :src="logoUrl" height="26" alt="LAPA" />
          <em>ERP</em>
        </div>
        <!--展开与收起侧边栏按钮-->
        <Icon
          type="md-menu"
          size="26"
          style="vertical-align: middle"
          @click="toggleClick"
          class="toggleMenu"
        ></Icon>
        <!--头部菜单栏-->
        <div class="header_nav">
          <Menu
            theme="dark"
            mode="horizontal"
            @on-select.native="selectMenuNav"
            active-name="0"
          >
            <sub-menu
              :subMenuDate="headerMenuData"
              :moreData="moreData"
              :showIcon="false"
              :MenuGroup="true"
            ></sub-menu>
          </Menu>
        </div>
      </div>
      <!--右边区域-->
      <div class="right_box">
        <!--order 通用搜索-->
        <Form @submit.native.prevent>
          <div class="global_search_box" v-if="showGeneralSearch.show">
            <Input v-model.trim="generalSearch" @on-enter="openOrderDetail">
              <dyt-select
                :clearable="false"
                v-model.trim="generalPrepend"
                slot="prepend"
                style="width: 120px"
                @on-change="generalChange"
              >
                <Option v-if="showGeneralSearch.order" value="1">订单号</Option>
                <Option v-if="showGeneralSearch.packageInfo" value="2"
                  >出库单号</Option
                >
                <Option v-if="showGeneralSearch.tracking" value="3"
                  >运单号</Option
                >
              </dyt-select>
              <Button
                slot="append"
                type="primary"
                icon="ios-search"
                @click="openOrderDetail"
              ></Button>
            </Input>
          </div>
        </Form>
        <!--右边用户信息-->
        <div class="user_info_box">
          <div class="backAuth-content">
            <span class="backAuth" @click="backAuth">
              <Icon type="ios-undo" />
              返回认证中心
            </span>
          </div>
          <!--语种-->
          <Dropdown
            @on-click="changeLanguage"
            class="style_right"
            v-if="infoTalg"
          >
            <a href="javascript:;" class="layout-flag-button">
              <div class="flag" :class="flagName"></div>
            </a>
            <Dropdown-menu slot="list">
              <Dropdown-item
                v-for="(item, index) in languageList"
                :name="item.name"
                :key="index"
              >
                <span class="flag lang" :class="item.name"></span>
                <span>{{ item.lang }}</span>
              </Dropdown-item>
            </Dropdown-menu>
          </Dropdown>
          <!--时区-->
          <Poptip v-model="timeZone" placement="bottom" :transfer="true">
            <div class="mapSelect" style="white-space: nowrap">
              UTC{{ UTCtimezoom }}
            </div>
            <div slot="content">
              <div class="mb20">
                <span style="width: 60px">时区：</span>
                <dyt-select
                  v-model="timeModal"
                  style="width: 250px"
                  @on-change="changeTimezoom"
                >
                  <Option
                    v-for="(item, index) in timezoomList"
                    :value="item.utcId"
                    :key="index"
                    >{{ item.text }}
                  </Option>
                </dyt-select>
              </div>
              <div class="timevalue">您当前的时间：{{ nowTime }}</div>
              <div class="timevalue">世界标准时间：{{ UTCtime }}</div>
            </div>
          </Poptip>
          <!--登出-->
          <Dropdown @on-click="changeDown" class="style_right">
            <div class="icon_box">
              <span class="icon iconfont icon-yonghu"></span>
              <span class="text">{{ userInfo.userName }}</span>
            </div>
            <Dropdown-menu slot="list">
              <!--用户信息-->
              <Dropdown-item name="info" v-if="!infoTalg">
                <Poptip
                  placement="left"
                  class="poptip_style"
                  trigger="hover"
                  :transfer="true"
                >
                  <div class="text">用户信息</div>
                  <div slot="content">
                    <span class="user_info style_right" style="color: #666">{{
                      "客户编号：" + userInfo.merchantId
                    }}</span>
                  </div>
                </Poptip>
              </Dropdown-item>
              <Dropdown-item name="theme">
                <div class="logout_item">
                  <Icon type="ios-shirt"></Icon>
                  <span class="user_item_text">修改主题</span>
                </div>
              </Dropdown-item>
              <!--语种-->
              <Dropdown-item name="languages" v-if="!infoTalg">
                <Dropdown
                  @on-click="changeLanguage"
                  placement="left"
                  transfer-class-name="languages_dropdown"
                >
                  <div class="text">语种</div>
                  <Dropdown-menu slot="list">
                    <Dropdown-item
                      v-for="(item, index) in languageList"
                      :name="item.name"
                      :key="index"
                    >
                      <span class="flag lang" :class="item.name"></span>
                      <span>{{ item.lang }}</span>
                    </Dropdown-item>
                  </Dropdown-menu>
                </Dropdown>
              </Dropdown-item>
              <!--登出-->
              <Dropdown-item name="signOut">
                <div class="logout_item">
                  <Icon type="md-log-out" class="icon_logout"></Icon>
                  <span class="text">登出</span>
                </div>
              </Dropdown-item>
            </Dropdown-menu>
          </Dropdown>
          <!--客户编号-->
          <span class="user_info style_right" v-if="infoTalg">{{
            "客户编号：" + userInfo.merchantId
          }}</span>
        </div>
      </div>
    </div>
    <common-details ref="commonDetails"></common-details>
    <tb-edit-theme ref="editTheme"></tb-edit-theme>
  </div>
</template>
<script>
import Mixin from "@/components/mixin/common_mixin";
import layoutMixin from "@/components/mixin/layout_mixin";
import * as timezoom from "@/utils/timezooms";
// import { getToken, removeToken } from '@/utils/cookie';
import api from "@/api/api";
import commonDetails from "@/components/common/order/commonDetails";
// import { deleteTicket } from '@/utils/index';
import { getService } from "@/utils/getService";
import subMenu from "./subMenu";

export default {
  mixins: [layoutMixin, Mixin],
  components: {
    commonDetails,
    subMenu,
  },
  data() {
    return {
      logoTalg: true,
      infoTalg: true,
      menuTalg: JSON.parse(localStorage.getItem("menuTalg")) || true,
      windowWidth: document.body.clientWidth,
      generalSearch: "", // 通用搜索
      generalPrepend: "", //
      // 当前登录账号开启并且有店铺的平台
      permissionPlat: [],
      // logoUrl: process.env.BASE_URL + 'static/images/logo.png',
      logoUrl: require("@/assets/images/logo.png"),
      flagName: "zh-CN",
      timeZone: false,
      timeModal: "",
      timezoomList: timezoom.timeList,
      nowTime: "",
      universalTime: this.getUniversalTime(new Date().getTime(), "fulltime"),
      UTCtime: "",
      platformGroup: [],
      menuSelect: getService(),
      languageList: [
        {
          lang: "简体中文",
          name: "zh-CN",
        },
        // {
        //   lang: 'English',
        //   name: 'en-US'
        // }
      ],
      menuData: null,
      headerMenuData: [],
      moreData: [],
      setMenu: [
        {
          platformType: "generalSettings",
          name: "通用",
        },
        {
          platformType: "logistics",
          name: "仓储管理",
        },
        {
          platformType: "orderSettings",
          name: "订单管理",
        },
        {
          platformType: "customSettings",
          name: "客服管理",
        },
        {
          platformType: "pdsSettings",
          name: "新品开发管理",
        },
        {
          platformType: "productSettings",
          name: "商品管理",
        },
        {
          platformType: "spsSettings",
          name: "供应商管理",
        },
        {
          platformType: "productCenter",
          name: "商品管理中心",
        },
        {
          platformType: "customer",
          name: "客服管理中心",
        },
        {
          platformType: "financeSettings",
          name: "财务计费设置",
        },
      ],
    };
  },
  props: {
    menu: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  computed: {
    userPlatRoleData () {
      if (this.$common.isEmpty(this.$store.getters['userPlatformRoleData'])) return [];
      const isHasDefine = this.$store.getters['userPlatformRoleData'].find(f => f.type == 2);
      const universal = this.$store.getters['userPlatformRoleData'].filter(f => {
        return f.type == 1;
      }).map(m => m.platformId);
      return [...(this.$common.isEmpty(isHasDefine) ? ['allplatform'] : ['definePlatform', 'allplatform']), ...universal];
    },
    // 时区时间
    UTCtimezoom() {
      return this.getDefaultTimezoom();
    },
    // 控制同步搜索框的展示与隐藏
    showGeneralSearch () {
      const roleVal = {
        // orderCommon_fullTextSearch: '0', // 全文检索
        orderCommon_orderInfoSearch: "1", // 订单号
        orderCommon_packageInfoSearch: "2", // 出库单号
        orderCommon_trackingNumberSearch: "3", //  运单号
      };
      const isInclude = Object.keys(roleVal).filter((role) => {
        return this.$store.state.roleData.includes(role);
      });
      if (isInclude.length <= 0) {
        return {
          show: false,
          order: false,
          packageInfo: false,
          tracking: false,
          val: "",
        };
      }
      return {
        show: window.location.href.includes("order-service") && this.$store.state.inGroup !== "generalSettings",
        order: this.$store.state.roleData.includes("orderCommon_orderInfoSearch"),
        packageInfo: this.$store.state.roleData.includes("orderCommon_packageInfoSearch"),
        tracking: this.$store.state.roleData.includes("orderCommon_trackingNumberSearch"),
        val: roleVal[isInclude[0]],
      };
    },
  },
  watch: {
    "showGeneralSearch.val": {
      deep: true,
      immediate: true,
      handler(val) {
        this.generalPrepend = val;
      },
    },
    windowWidth: {
      handler(val) {
        let v = this;
        if (!v.timer) {
          v.windowWidth = val;
          v.timer = true;
          let inGroup = this.$store.state.inGroup;
          setTimeout(function () {
            /* 订单系统中小于1530时，隐藏LAPAlogo图片 */
            if (
              inGroup !== "generalSettings" &&
              inGroup !== "productCenter" &&
              inGroup !== "customer"
            ) {
              if (v.windowWidth <= 1530) {
                v.logoTalg = false;
              } else {
                v.logoTalg = true;
              }
            } else {
              if (v.windowWidth <= 1300) {
                v.logoTalg = false;
              } else {
                v.logoTalg = true;
              }
            }
            let data = JSON.parse(localStorage.getItem("headerMenuData"));
            /* 小于1100时，隐藏左边头部的多余菜单栏 */
            if (
              v.menuSelect === "menuSetting" ||
              v.menuSelect === "menuOrder"
            ) {
              if (v.windowWidth <= 1100) {
                v.menuTalg = false;
                if (data) {
                  v.handerMeun(data, true);
                }
              } else {
                v.menuTalg = true;
                if (data) {
                  v.handerMeun(data, false);
                }
              }
            }
            /* 小于1300时把右边的信息放入下拉框中 */
            if (v.windowWidth <= 1300) {
              v.infoTalg = false;
            } else {
              v.infoTalg = true;
            }
            localStorage.setItem("menuTalg", JSON.stringify(v.menuTalg));
            v.timer = false;
          }, 400);
        }
      },
      deep: true,
      immediate: true,
    },
    // 监听菜单数据的变化
    menu(n, o) {
      if (n && n !== o) {
        let menu = [];
        menu = this.menu;
        localStorage.setItem("headerMenuData", JSON.stringify(menu));
        let value = this.windowWidth <= 1100;
        this.handerMeun(menu, value);
      }
    },
  },
  created() {
    let v = this;
    v.getLanguage();
    v.getLocalTime();
    v.getUTC();
    v.getDefaultTimezoom();
  },
  methods: {
    // 获取系统默认语言
    getLanguage() {
      let v = this;
      let lang = localStorage.getItem("lang");
      if (lang !== undefined) {
        v.flagName = lang;
      } else {
        v.flagName = "zh-CN";
        v.changeLanguage("zh-CN");
      }
    },
    // 头部搜索框下拉选项方法
    generalChange() {
      // this.generalSearch = "";
    },
    // 头部搜索框的回车键
    openOrderDetail() {
      if (!this.generalSearch) {
        this.$Message.info("搜索值为空");
        return;
      }
      const typeHand = {
        1: () => {
          const composition = this.generalSearch.split("-");
          return composition.length <= 1;
        },
        2: () => {
          return (
            this.generalSearch.substr(0, 3).toLocaleLowerCase() !== "pcl" ||
            this.generalSearch.substr(3).length !== 10
          );
        },
        3: () => {
          return false;
        },
      };
      if (typeHand[this.generalPrepend]()) {
        this.$Message.error("输入信息有误，请重新输入搜索");
        return;
      }
      this.$refs.commonDetails.onOpen({
        type: Number(this.generalPrepend), //  1 订单号 2 出库单号 3 运单号,
        value: this.generalSearch,
      }, {
        global: true
      });
    },
    // 头部获取您当前的时间
    getLocalTime() {
      let v = this;
      setInterval(() => {
        v.nowTime = this.$common.getDateTime();
      }, 1000);
    },
    // 头部获取世界标准时间
    getUTC() {
      let v = this;
      setInterval(() => {
        v.UTCtime = this.$common.getUniversalTime();
      }, 1000);
    },
    // 头部切换选择时区
    changeTimezoom() {
      let v = this;
      let timeData;
      if (v.timeModal >= 0) {
        timeData = "+" + v.timeModal;
      } else {
        timeData = v.timeModal;
      }
      localStorage.setItem("timezoom", timeData);
      v.$store.commit("timezoomChange", timeData);
      v.getNowTime();
      v.setTime().then(() => {
        window.location.reload();
      });
    },
    // 设置时区时间的方法
    setTime() {
      let v = this;
      return new Promise((resolve) => {
        v.axios
          .put(api.set_updateTimeZone, {
            timeZoneId: v.timeModal,
          })
          .then((res) => {
            if (res.data.code === 0) {
              resolve();
            }
          });
      });
    },
    // 展开与收起侧边栏菜单的操作按钮
    toggleClick() {
      this.$store.commit("fullScreen", !this.$store.state.fullScreen);
      this.logoTalg = !this.logoTalg;
      const showSliderMune = "hidden-slider-mune";
      const body = window.document.querySelector("body");
      let bodyClass = body.className.split(" ");
      if (this.logoTalg && !bodyClass.includes(showSliderMune)) {
        bodyClass.push(showSliderMune);
      } else if (bodyClass.includes(showSliderMune)) {
        bodyClass.splice(bodyClass.indexOf(showSliderMune), 1);
      }
      body.className = `${bodyClass.join(" ")}`;
    },
    // 切换中英文的方法
    changeLanguage(lang) {
      let v = this;
      localStorage.setItem("lang", lang);
      v.flagName = lang;
      window.location.reload();
    },
    // 退出登录的方法
    changeDown(value) {
      let v = this;
      if (value === "signOut") {
        // v.axios.get(api.logout + getToken()).then(response => {
        //   if (response.data.code === 0) {
        //     removeToken();
        //     let url = deleteTicket(window.location.href);
        //     window.location.href = response.data.others.logOutUrl + encodeURIComponent(url);
        //   }
        // })
        this.$connectAuth.outLogin();
      } else if (value === "theme") {
        v.$refs.editTheme.open();
      }
    },
    // 当前系统为订单处理系统时，查看开启的平台
    getPlatformInfo() {
      return new Promise((resolve) => {
        if (this.menuSelect === "menuOrder") {
          if (!this.$common.isEmpty(this.platformGroup)) return resolve(this.platformGroup);
          this.getPlatformGroup(1).then((result) => {
            if (result) {
              let platformGroup = JSON.parse(JSON.stringify(this.$store.state.platformGroup)) || JSON.parse(localStorage.getItem("platformGroup"));
              if (platformGroup) {
                this.platformGroup = [];
                platformGroup.forEach((n, i) => {
                  if (n.type === 2) {
                    n.platformId = "definePlatform";
                  }
                  this.platformGroup.push(n.platformId);
                  this.platformGroup.push('allplatform');
                });
                if (this.platformGroup.length > 0) {
                  this.platformGroup = [...new Set(this.platformGroup)];
                  resolve(this.platformGroup);
                }
              }
            }
          });
        }
      });
    },
    // 处理头部在不同系统平台下的菜单数据
    handerMeun(menu, value) {
      let v = this;
      let menuData = [];
      v.moreData = [];
      // if (localStorage.getItem('headerActiveName')) {
      //   this.activeName = localStorage.getItem('headerActiveName');
      // } else {
      //   this.activeName = 'ebay';
      // }
      if (menu.length > 0) {
        if (v.menuSelect === "menuOrder") {
          // 获取已经开启的平台菜单
          v.getPlatformInfo().then((data) => {
            let menuArr = JSON.parse(localStorage.getItem("headerMenuData"));
            this.permissionPlat = (data || []).filter(plat => {
              return this.userPlatRoleData.includes(plat)
            });
            // 当前登录账号开启并且有店铺的平台
            if (this.permissionPlat.length > 0) {
              menuArr.map((item) => {
                if (this.permissionPlat.includes(item.platformType)) {
                  menuData.push(item);
                }
              });
              v.handerData(menuData, value);
            }
          });
        } else {
          menuData = menu;
          v.handerData(menuData, value);
        }
      }
    },
    // 处理数据
    handerData(neunList, value) {
      let v = this;
      let inGroup = v.$store.state.inGroup;
      let platformJson = {};
      v.headerMenuData = [];
      (v.$store.state.platformGroup || []).forEach((item) => {
        platformJson[item.platformId] = item;
      });
      let menuData = (neunList || []).map(m => {
        if (this.$common.isEmpty(platformJson[m.platformType])) {
          return {
            ...m,
            platformName: this.menuSelect == "menuOrder" ? m.platformType : m.name
          };
        }
        return { ...m, platformName: platformJson[m.platformType].name };
      });
      // 平台分组
      let new_arr = v.handerGrouping(menuData, (item) => {
        return [item.platformType];
      }, ['platformType', 'platformName']);
      new_arr.forEach((ele, index) => {
        ele.id = ele.platformType;
        if (v.menuSelect !== "menuOrder") {
          v.setMenu.forEach((talg) => {
            if (talg.platformType === ele.platformType) {
              ele.platformType = talg.name;
            }
          });
        }
      });
      const allPlatType = new_arr.map(m => m.platformType);
      let moreMenu = [];
      if (v.menuSelect === 'menuOrder') {
        // 处理小屏幕的时候，菜单的展示
        if (value) {
          new_arr.forEach((item) => {
            if (item.platformType === inGroup) {
              v.headerMenuData.push(item);
            } else {
              moreMenu.push(item);
            }
          });
        } else {
          let platformTypeArr = ['allplatform', 'ebay', 'aliexpress', 'amazon'];
          const showMenunTotal = platformTypeArr.length;
          platformTypeArr = allPlatType.filter(pt => platformTypeArr.includes(pt));
          if (showMenunTotal > platformTypeArr.length) {
            const otherPt = allPlatType.filter(pt => !platformTypeArr.includes(pt));
            platformTypeArr = [...platformTypeArr, ...otherPt.slice(0, showMenunTotal - platformTypeArr.length)];
          }
          if (!platformTypeArr.includes(inGroup)) {
            platformTypeArr.splice(showMenunTotal - 1, 1, inGroup);
          }
          new_arr.forEach(item => {
            // 展示处理的菜单
            if (platformTypeArr.includes(item.platformType)) {
              v.headerMenuData.push(item);
            } else {
              // 放到更多平台下拉的菜单
              moreMenu.push(item);
            }
          });
        }
        if (moreMenu.length > 0) {
          // 更多平台的菜单
          v.moreData = [{ name: "更多平台", id: "AroundGroup", children: moreMenu }];
        }
      } else if (['menuSetting'].includes(v.menuSelect)) {
        if (value) {
          v.headerMenuData = new_arr.slice(0, 1);
          moreMenu = new_arr.slice(1);
        } else {
          // 默认平台
          v.headerMenuData = new_arr.slice(0, 4);
          moreMenu = new_arr.slice(4);
        }
        if (moreMenu.length > 0) {
          v.moreData = [{ name: "更多", id: "AroundGroup", children: moreMenu }];
        }
        // 如果是从供应商后台管理系统跳转过来的，设置只展示，通用、仓储管理菜单
        if (v.$store.state.erpConfig.merchant.isSupplier) {
          v.headerMenuData = v.headerMenuData.filter((item) => {
            return item.id === "generalSettings" || item.id === "logistics";
          });
          v.moreData = [];
        }
      }
    },
    // 缓存当前选中的菜单标识
    selectMenuNav(name) {
      // localStorage.setItem('activeName', name);
      window.location.reload();
    },
    backAuth() {
      this.$connectAuth.backOauth();
    },
  },
  mounted() {
    // 监听浏览器窗口的大小
    let v = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        v.windowWidth = window.screenWidth;
      })();
    };
  },
};
</script>
<style>
</style>
<style lang="less" scoped>
:deep(.headSty) {
  min-width: 700px;
}
.backAuth-content {
  color: #fff;
  margin-right: 10px;

  .backAuth {
    display: inline-block;
    padding: 5px 10px;
    line-height: initial;
    border-radius: 14px;
    cursor: pointer;

    &:hover {
      background: rgba(216, 216, 216, 0.22);
    }
  }
}
</style>
