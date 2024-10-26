<template>
  <div class="layout">
    <vHeader :menu="headerMenuData"></vHeader>
    <Layout class="layout-container">
      <Sider
        hide-trigger
        :width="240"
        :style="{
          background: '#fff',
          position: 'relative',
          zIndex: '100',
          marginTop: '50px',
        }"
        v-show="!$store.state.fullScreen"
      >
        <vLeft
          :menu="sidebarMenuData"
          :openNames="openNames"
          :activeName="activeName"
        ></vLeft>
      </Sider>
      <Layout :style="{ padding: '0 12px 12px', marginTop: '50px' }">
        <div style="height: 100%; display: flex; flex-direction: column">
          <!-- 面包屑 -->
          <breadcrumb :menu="sidebarMenuData"></breadcrumb>
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </div>
      </Layout>
    </Layout>
    <systemNoticeModal></systemNoticeModal>
    <BackTop></BackTop>
    <authAbnormalWarnModal ref="authAbnormalWarnRef" />
  </div>
</template>
<script>
import vHeader from "./header";
import vLeft from "./left";
import breadcrumb from "./breadcrumb";
import menuCommon from "@/api/menu/common/menuCommon";
import Mixin from "@/components/mixin/common_mixin";
import api from "@/api/api";
import { getService } from "@/utils/getService";
// import { getToken } from '@/utils/cookie';
import systemNoticeModal from "@/components/common/systemNoticeModal";
import authAbnormalWarnModal from '@/components/layout/authAbnormalWarnModal'; // 异常提醒弹窗

export default {
  mixins: [Mixin],
  components: {
    vHeader,
    vLeft,
    breadcrumb,
    systemNoticeModal,
    authAbnormalWarnModal
  },
  data() {
    return {
      menu: [],
      headerMenuData: [], // 头部的菜单
      sidebarMenuData: [], // 侧边栏菜单
      menuSelect: getService(),
      openNames: [],
      activeName: "",
    };
  },
  created() {
    this.updateMenu();
  },
  mounted() {
    setTimeout(() => {
      if (this.$refs.authAbnormalWarnRef && this.$refs.authAbnormalWarnRef.getWarnDetails) {
        this.$refs.authAbnormalWarnRef && this.$refs.authAbnormalWarnRef.initData();
      }
    }, 200);
  },
  methods: {
    // 获取当前所在的系统的菜单数据
    updateMenu() {
      let v = this;
      let menuData = null;
      switch (v.menuSelect) {
        // 订单处理系统
        case "menuOrder":
          menuData = JSON.parse(JSON.stringify(menuCommon.menuOrder));
          break;
        // 商品管理系统
        case "menuProduct":
          menuData = JSON.parse(JSON.stringify(menuCommon.menuProduct));
          break;
        // 客服管理系统
        case "menuCustomer":
          menuData = JSON.parse(JSON.stringify(menuCommon.menuCustomer));
          break;
        // 设置中心
        case "menuSetting":
          menuData = JSON.parse(JSON.stringify(menuCommon.menuSetting));
          break;
        // 默认获取订单系统的菜单
        default:
          menuData = JSON.parse(JSON.stringify(menuCommon.menuOrder));
          break;
      }
      v.setMenuData(menuData);
    },
    // 获取自定义菜单
    getCustomMenu() {
      let v = this;
      return new Promise((resolve) => {
        let prefix = v.isSettingSpecial().slice(0, -1);
        if (window.location.href.includes("generalSettings.html")) {
          prefix = "";
        }
        this.axios.get(prefix + api.get_menuResource).then((response) => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    // 判断当前用户的权限，展示对应权限菜单
    makeMenuVisibility(roleData, menuData) {
      let v = this;
      let sps_upc_restrictMerchantIds =
        this.$store.state.erpConfig.sps_upc_restrictMerchantIds;
      let merchantId = this.$store.state.erpConfig.merchant.merchantId;
      let data = JSON.parse(JSON.stringify(menuData));
      if (roleData) {
        if (!this.isAdmin) {
          // 订单处理系统、设置中心--过滤掉没有权限的菜单
          if (v.menuSelect === "menuOrder" || v.menuSelect === "menuSetting") {
            for (let key in data) {
              for (let i = data[key].length - 1; i >= 0; i--) {
                if (data[key][i].children) {
                  let arr = [];
                  data[key][i].children.filter((ele) => {
                    if (roleData.indexOf(ele.menuKey) > -1) {
                      arr.push(ele);
                    }
                  });
                  data[key][i].children = arr;
                  if (data[key][i].children.length <= 0) {
                    data[key].splice(i, 1);
                  } else {
                    // 只有是登宇的用户才展示UPC生成规则的菜单
                    if (data[key][i].platformType === "pdsSettings") {
                      data[key][i].children.map((item, index) => {
                        if (sps_upc_restrictMerchantIds) {
                          if (
                            sps_upc_restrictMerchantIds.indexOf(merchantId) <=
                            -1
                          ) {
                            if (
                              item.menuKey === "pdsSettings_upcGenerationRules"
                            ) {
                              data[key][i].children.splice(index, 1);
                            }
                          }
                        }
                      });
                    }
                  }
                } else {
                  if (roleData.indexOf(data[key][i].menuKey) <= -1) {
                    data[key].splice(i, 1);
                  }
                }
              }
            }
          } else {
            // 客服管理系统、商品管理系统--过滤掉没有权限的菜单
            for (let i = data.length - 1; i >= 0; i--) {
              if (data[i].children) {
                let arr = [];
                data[i].children.filter((ele) => {
                  if (roleData.indexOf(ele.menuKey) > -1) {
                    arr.push(ele);
                  }
                });
                data[i].children = arr;
                if (data[i].children.length <= 0) {
                  data.splice(i, 1);
                }
              } else {
                if (roleData.indexOf(data[i].menuKey) <= -1) {
                  data.splice(i, 1);
                }
              }
            }
          }
        }
        v.menu = data;
      } else {
        // 如果访问没有权限页面
        v.$router.push("/noPersermission");
      }
    },
    // 获取侧边栏菜单的标识的数据
    getMenuNum(data) {
      let v = this;
      return new Promise((resolve) => {
        v.getOrderMenuNum().then((response) => {
          if (response.data.code === 0) {
            let numData = response.data.datas;
            const inGroup = this.$store.state.inGroup;
            let menuData = [];
            if (data) {
              function handerMenu(menu) {
                menu.forEach((item) => {
                  if (item.children && item.children.length > 0) {
                    handerMenu(item.children);
                  } else {
                    menuData.push(item);
                  }
                });
              }

              handerMenu(data);
              if (menuData.length > 0) {
                menuData.forEach((n, i) => {
                  if (n.menuKey === inGroup + "_messageToBeProcessed") {
                    n.dataItemNum = numData.pendingNotes;
                  } else if (n.menuKey === inGroup + "_combineOrder") {
                    n.dataItemNum = numData.canMergeGroup;
                  } else if (n.menuKey === inGroup + "_interceptOrder") {
                    n.dataItemNum = numData.suspendOrder;
                  } else if (n.menuKey === inGroup + "_matchTheLogistics") {
                    n.dataItemNum = numData.waitSetShippingMethod;
                  } else if (n.menuKey === inGroup + "_markShipments") {
                    n.dataItemNum = numData.notShippingAndTrackingUpdated;
                  } else if (n.menuKey === inGroup + "_stockoutOrder") {
                    n.dataItemNum = numData.stockoutOrder;
                  } else if (n.menuKey === inGroup + "_riskOrder") {
                    n.dataItemNum = numData.riskControll;
                  } else if (n.menuKey === inGroup + "_waitingForReceivingConfirmation") {
                    n.dataItemNum = numData.waitReceipt;
                  } else if (n.menuKey === inGroup + "_unmatchProduct") {
                    n.dataItemNum = numData.unmatchedGoods;
                  }
                });
                resolve(true);
              }
            }
          }
        });
      });
    },
    // 获取自定义渠道的菜单的标识数据
    getOrderMenuNum() {
      let page = this.$store.state.inGroup;
      let platformId = [];
      // 自定义渠道的需要单独处理
      if (page === "definePlatform") {
        let data = JSON.parse(localStorage.getItem("platformGroup"));
        if (data.length > 0) {
          data.map((item, index) => {
            if (item.type === 2) {
              platformId.push(item.platformId);
            }
          });
        }
      } else {
        platformId = [page];
      }
      if (platformId == 'allplatform') {
        return new Promise((resolve) => {
          resolve({
            data: {
              datas: {},
              code: 0,
              message: '',
              others: {},
              success: true,
            }
          });
        })
      }
      return this.axios.get(api.get_orderMenuNum + "?platformId=" + platformId);
    },
    // 给侧边栏菜单设置id
    setMenuId(menuData) {
      if (!menuData) return [];
      let v = this;

      function setId(data, id) {
        data = data.filter((i) => !i.menuHide);
        data.forEach((i, j) => {
          if (id) {
            i.id = id + "-" + j;
          } else {
            i.id = j + "";
          }
          if (!v.activeName && !i.children) {
            v.activeName = i.id;
          }
          if (v.$route.path === i.path) {
            v.activeName = i.id;
          } else {
            // let name = localStorage.getItem('activeName');
            // if (name) {
            //   v.activeName = name;
            // }
          }
          // localStorage.setItem('activeName', v.activeName);
          v.openNames.push(i.id);
          if (i.children && i.children.filter((k) => !k.menuHide).length > 0) {
            i.children = setId(i.children, i.id);
          } else {
            i.children = null;
          }
        });
        return data;
      }

      return setId(menuData);
    },
    // 获取侧边栏菜单的数据
    setMenuData(menu) {
      let v = this;
      v.makeMenuVisibility(v.$store.state.roleData, menu);

      if (v.menu) {
        let menuData = v.menu;
        // let menuData = data;
        let inGroup = v.$store.state.inGroup;
        if (menuData) {
          v.getCustomMenu().then((data) => {
            let addsidebarData = null;
            let sidebarMenu = [];
            let sidebarData = [];
            let headerMenu = [];
            let headerData = [];
            let objMenu = null;
            if (data.length > 0) {
              // 遍历菜单对象插入自定义菜单
              data.forEach((i) => {
                let toInGroup = i.platformType.includes("_")
                  ? i.platformType.replace(/.*_/, "")
                  : i.platformType;
                // 当前系统为订单处理系统、设置中心时
                if (v.menuSelect === "menuOrder" || v.menuSelect === "menuSetting") {
                  // 给头部菜单插入自定义菜单
                  objMenu = JSON.parse(JSON.stringify(menuData));
                  for (let key in objMenu) {
                    if (key === toInGroup) {
                      headerMenu.push({
                        platformType: toInGroup,
                        name: i.menuDesc,
                        path: i.path,
                        menuKey: i.menuKey,
                      });
                    }
                  }
                  // 获取订单系统对应平台侧边栏菜单（当自定义菜单与当前所的系统平台一致时，插入自定义菜单）
                  for (let key in menuData) {
                    sidebarData = menuData[inGroup];
                    if (key === toInGroup && key === inGroup) {
                      sidebarMenu.push({
                        name: i.menuDesc,
                        path: i.path,
                        type: "custom_menu",
                        menuKey: i.menuKey,
                      });
                    }
                  }
                } else {
                  // 商品管理系统、客服系统
                  // 给头部菜单插入自定义菜单
                  objMenu = JSON.parse(JSON.stringify(menuData));
                  if (inGroup === toInGroup) {
                    headerMenu.push({
                      platformType: toInGroup,
                      name: i.menuDesc,
                      path: i.path,
                      menuKey: i.menuKey,
                    });
                  }
                  // 侧边栏菜单
                  sidebarData = menuData;
                  if (toInGroup === inGroup) {
                    sidebarMenu.push({
                      name: i.menuDesc,
                      path: i.path,
                      type: "custom_menu",
                      menuKey: i.menuKey,
                    });
                  }
                }
              });
              if (sidebarMenu.length === 0) {
                objMenu = JSON.parse(JSON.stringify(menuData));
                // 当前系统为订单处理系统时
                if (v.menuSelect === "menuOrder" || v.menuSelect === "menuSetting") {
                  for (let key in objMenu) {
                    headerData.push(...objMenu[key]);
                  }
                  for (let key in menuData) {
                    // 获取订单系统对应平台
                    if (key === inGroup) {
                      sidebarData = menuData[key];
                    }
                  }
                } else {
                  headerData = objMenu;
                  sidebarData = menuData;
                }
              } else {
                if (sidebarMenu.length > 0) {
                  addsidebarData = [
                    {
                      name: "自定义菜单",
                      icon: "icon-iconfontunie047",
                      type: "custom_menu",
                      children: sidebarMenu,
                    },
                  ];
                }
                if (headerMenu.length > 0) {
                  let new_arr = v.handerGrouping(
                    headerMenu,
                    function (item) {
                      return [item.platformType];
                    },
                    "platformType"
                  );
                  new_arr.map((item) => {
                    item.menu = {
                      name: "自定义菜单",
                      icon: "icon-iconfontunie047",
                      type: "custom_menu",
                      platformType: item.platformType,
                      children: item.data,
                    };
                  });
                  if (v.menuSelect === "menuOrder" || v.menuSelect === "menuSetting") {
                    for (let key in objMenu) {
                      new_arr.map((ele) => {
                        if (objMenu[key]) {
                          if (ele.platformType === key) {
                            objMenu[key].push(ele.menu);
                          }
                        }
                      });
                      headerData.push(...objMenu[key]);
                    }
                  } else {
                    new_arr.map((ele) => {
                      objMenu.push(ele.menu);
                    });
                    headerData = objMenu;
                  }
                }
              }
              if (addsidebarData) {
                sidebarData.push(...addsidebarData);
              }
            } else {
              objMenu = JSON.parse(JSON.stringify(menuData));
              // 当前系统为订单处理系统时
              if (
                v.menuSelect === "menuOrder" ||
                v.menuSelect === "menuSetting"
              ) {
                for (let key in objMenu) {
                  headerData.push(...objMenu[key]);
                }
                for (let key in menuData) {
                  // 获取订单系统对应平台
                  // if (key === inGroup) {
                  if (key === inGroup) {
                    sidebarData = menuData[key];
                  }
                }
              } else {
                headerData = objMenu;
                sidebarData = menuData;
              }
            }
            v.headerMenuData = v.setMenuId(headerData);
            v.sidebarMenuData = v.setMenuId(sidebarData);
            // 切换到订单系统时，获取侧边栏菜单的标识的数据
            if (v.menuSelect === "menuOrder" && v.sidebarMenuData) {
              v.getMenuNum(v.sidebarMenuData);
            }
            v.handlerSign(v.sidebarMenuData);
          });
        }
      }
    },
    // 处理选中当前菜单的标识
    handlerSign(data) {
      if (data) {
        let menuData = [];

        function handerMenu(menu) {
          menu.forEach((item) => {
            if (item.children && item.children.length > 0) {
              handerMenu(item.children);
            } else {
              menuData.push(item);
            }
          });
        }

        handerMenu(data);
        let inGroup = this.$store.state.inGroup;
        if (menuData.length > 0) {
          let path = "/" + this.$route.path.split("/")[1];
          menuData.map((item) => {
            if (this.menuSelect === "menuOrder") {
              if (
                item.path &&
                item.path.includes(path) &&
                item.platformType === inGroup
              ) {
                this.activeName = item.id;
                // localStorage.setItem('activeName', item.id);
              }
            } else {
              if (item.path && item.path.includes(path)) {
                this.activeName = item.id;
                // localStorage.setItem('activeName', item.id);
              }
            }
          });
        }
      }
    },
  },
  watch: {
    $route(n, o) {
      if (this.sidebarMenuData) {
        this.handlerSign(this.sidebarMenuData);
      }
      this.getPermissionCallback(this.$store.state.menuKey);
      // 路由改变时，把当前链接存储到认证中心
      // if (!window.location.href.includes('noPersermission')) {
      //   this.$connectAuth.saveTarget();
      // }
    },
  },
};
</script>
