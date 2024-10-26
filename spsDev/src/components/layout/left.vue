<style lang="less">
.ivu-menu-vertical .sps-left-menu .ivu-menu-submenu-title-icon {
  float: right;
  position: absolute;
  right: 5px;
  top: 18px !important;
}

.ivu-menu-vertical .ivu-menu-item {
  padding: 6px 24px 6px 43px;
}

.ivu-menu-vertical .ivu-menu-submenu-title {
  font-size: 14px;
  padding: 8px 24px !important;
}

.ivu-menu-item-selected .route-link {
  color: #2b85e4;
}

.route-link {
  color: #495060;
  display: inline-block;
  width: 100%;
  position: relative;
}

.route-link:hover {
  text-decoration: underline;
}

.style_dropdownbox {
  max-height: 280px;

  .ivu-select-item {
    padding: 0;
  }

  .system_link {
    display: inline-block;
    padding: 7px 16px;
    width: 100%;
    color: #515a6e;

    &:hover {
      color: #2b85e4;
      text-decoration: underline;
    }
  }
}
</style>
<template>
  <div class="leftMenu">
    <div class="leftMenu--main">
      <div class="leftMenuHeader">
        <dyt-select :clearable="false" v-model="sysModal" @on-change="selectSys" transfer :labelInValue="true"
          transfer-class-name="style_dropdownbox">
          <Option v-for="item in sysArr" :label="item.mainTitle" :value="item.childMenu" :key="item.mainTitle">
            <a :href="item.url" class="system_link">{{ item.mainTitle }} </a>
          </Option>
        </dyt-select>
      </div>
      <div class="menuContainer">
        <div class="menuContainer--main">
          <Menu ref="leftMenu" :open-names="openNames" @on-select.native="selectMenuNav" :active-name="activeName">
            <sub-menu :subMenuDate="menuData" class="sps-left-menu"></sub-menu>
          </Menu>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import api from "@/api/api";
import subMenu from "./subMenu";
import menuSps from "@/api/spsMenu";
import Mixin from "@/components/mixin/common_mixin";
import { getService } from "@/utils/getService";
import layoutMixin from "@/components/mixin/layout_mixin";

export default {
  mixins: [layoutMixin, Mixin],
  data: function () {
    return {
      menuMap: "",
      sysArr: [],
      openNames: [], // 展开name 默认全展示
      activeName: "", // 默认第一个
      sysModal: "menuSps",
      roleData: [],
      menuData: null,
    };
  },
  created() {
    this.initMenu();
  },
  // 监听路由 path 变化时更新 menu
  watch: {
    $route() {
      this.initMenu();
    },
  },
  methods: {
    // 选中子系统
    selectSys(obj) {
      let domain = window.location.origin;
      let http = /(http):\/\/([\w.]+\/?)\S*/;
      for (let i = 0; i < this.sysArr.length; i++) {
        let item = this.sysArr[i];
        let talg = new RegExp(http);
        if (talg.test(item.url)) {
          this.sysModal = getService();
          window.open(item.url, "_blank");
          return false;
        } else {
          if (obj.value && item.childMenu === obj.value) {
            window.location.href = domain + item.url;
            // localStorage.setItem('sysSelect', obj.value);
            return false;
          }
        }
      }
    },
    // 设置跳转链接
    setGotoUrl(menu) {
      let v = this;
      let menuData = [];
      if (menu) {
        function handerMenu(menu) {
          menu.forEach((item) => {
            if (item.children && item.children.length > 0) {
              handerMenu(item.children);
            } else {
              menuData.push(item);
            }
          });
        }
        handerMenu(menu);
      }

      let roleData = v.roleData || JSON.parse(localStorage.getItem("roleData"));
      let arr = menuData.filter((i) => {
        if (
          ((i.menuKey && roleData.includes(i.menuKey)) || v.isAdmin) &&
          i.menuKey &&
          i.menuKey !== "Group" &&
          i.menuKey !== "Group-title"
        ) {
          return i;
        }
      });
      if (arr.length > 0) {
        return arr[0].path;
      }
    },
    // 获取当前选中的子系统的数据
    getLeftMenu() {
      let v = this;
      v.axios.get(api.get_menus).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas || [];
          data.forEach((n, i) => {
            n.mainTitle = n.cnName;
            if (n.enName === "order-service") {
              n.childMenu = "menuOrder";
            } else if (n.enName === "setting-service") {
              n.childMenu = "menuSetting";
            } else if (n.enName === "wms-service") {
              n.childMenu = "menuWms";
            } else if (n.enName === "product-service") {
              n.childMenu = "menuProduct";
            } else if (n.enName === "cs-service") {
              n.childMenu = "menuCustomer";
            } else if (n.enName === "sps-service") {
              n.childMenu = "menuSps";
              n.url =
                "/sps-service/supplierPurchase.html#" +
                v.setGotoUrl(menuSps.menu);
            } else if (n.enName === "pds-service") {
              n.childMenu = "menuPds";
            } else {
              n.childMenu = "";
            }
          });
          v.sysArr = data;
          let pos = [];
          if (
            this.$store.state.inGroup === "generalSettings" ||
            this.$store.state.inGroup === "logistics" ||
            this.$store.state.inGroup === "orderSettings" ||
            this.$store.state.inGroup === "customSettings"
          ) {
            v.sysArr.forEach((n, i) => {
              pos.push(n.enName);
            });
            v.menu.menu.forEach((m, t) => {
              if (pos.indexOf("wms-service") !== -1 && m.id === "logistics1") {
                m.display = true;
              }
              if (
                pos.indexOf("order-service") !== -1 &&
                m.id === "orderSettings1"
              ) {
                m.display = true;
              }
              if (
                pos.indexOf("cs-service") !== -1 &&
                m.id === "customSettings1"
              ) {
                m.display = true;
              }
            });
          }
        }
      });
    },
    // 获取自定义菜单
    getCustomMenu() {
      return new Promise((resolve) => {
        this.axios.get(api.get_menuResource).then((response) => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    // 缓存当前选中的菜单
    selectMenuNav(name) {
      localStorage.setItem("activeName", name);
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
            let name = localStorage.getItem("activeName");
            if (name) {
              v.activeName = name;
            }
          }
          localStorage.setItem("activeName", v.activeName);
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
    // 获取当前用户的菜单权限
    getMenuRole () {
      return new Promise((resolve) => {
        let roleData = this.$store.state.roleData;
        if (!this.$common.isEmpty(roleData)) {
          resolve(roleData);
        } else {
          this.axios.get(api.get_menuRole).then((res) => {
            if (res && res.data && res.data.code === 0) {
              roleData = res.data.datas;
              this.$store.commit('roleData', roleData);
              resolve(roleData);
            }
          }).catch((err) => {
            console.error(err);
            resolve([]);
          })
        }
      })
    },
    // 菜单权限处理
    menuRoleHand (data = [], roleList) {
      const childHand = (child) => {
        let newChild = [];
        child.forEach((item) => {
          if (!this.$common.isEmpty(item.children)) {
            item.children = childHand(item.children);
          } else {
            if (this.$common.isEmpty(item.menuKey) || (!this.$common.isEmpty(item.menuKey) && roleList.includes(item.menuKey))) {
              newChild.push(item);
            }
          }
        });
        return newChild;
      }
      let newMenuChild = [];
      let newData = [];
      data.forEach((item, index) => {
        if (!this.$common.isEmpty(item.children)) {
          newMenuChild = childHand(item.children);
          if (!this.$common.isEmpty(newMenuChild)) {
            item.children = newMenuChild;
            newData.push(item);
          }
        } else if (this.$common.isEmpty(item.menuKey) || (!this.$common.isEmpty(item.menuKey) && roleList.includes(item.menuKey))) {
          newData.push(item);
        }
      });
      return newData;
    },
    // 获取侧边栏菜单的数据
    initMenu () {
      this.$Spin.show();
      let menuData = [...menuSps.menu];
      this.getCustomMenu().then(data => {
        let addCustomData = null;
        let customMenu = [];
        data.forEach((i) => {
          let toInGroup = i.platformType.includes("_")
            ? i.platformType.replace(/.*_/, "")
            : i.platformType;

          // 遍历菜单对象插入自定义菜单
          if (toInGroup === "supplierPurchase") {
            customMenu.push({
              name: i.menuDesc,
              path: i.path,
              menuKey: i.menuKey,
            });
          }
        });
        if (customMenu.length > 0) {
          addCustomData = [
            {
              name: "自定义菜单",
              icon: "icon-iconfontunie047",
              children: customMenu,
            },
          ];
        }
        if (addCustomData) {
          menuData.push(...addCustomData);
        }
        let newMenuData = this.setMenuId(menuData);
        Promise.all([this.getMenuRole()]).then(res => {
          var roleData = res[0] || [];
          if (roleData === null) {
            roleData = ['sps_supplierManagement'];
          }
          this.roleData = roleData;
          localStorage.setItem('roleData', JSON.stringify(roleData));
        }).then(() => {
          this.menuData = this.menuRoleHand(newMenuData, this.roleData);
          this.getLeftMenu();
          this.$nextTick(() => {
            this.$refs.leftMenu.updateOpened();
            this.$refs.leftMenu.updateActiveName();
          });
          this.$Spin.hide();
        }).catch(() => {
          this.$Spin.hide();
        });
      }).catch(() => {
        this.$Spin.hide();
      });
    },
  },
  components: {
    subMenu: subMenu,
  },
};
</script>
<style lang="less">
.ivu-menu-item-selected .route-link {
  color: #2b85e4;
}

.route-link {
  color: #495060;
  display: inline-block;
  width: 100%;
  position: relative;
}

.route-link:hover {
  text-decoration: underline;
}

.style_dropdownbox {
  max-height: 280px;

  .ivu-select-item {
    padding: 0;
  }

  .system_link {
    display: inline-block;
    padding: 7px 16px;
    width: 100%;
    color: #515a6e;

    &:hover {
      color: #2b85e4;
      text-decoration: underline;
    }
  }
}
</style>
<style lang="less" scoped>
:deep(.ivu-menu-vertical) {
  .ivu-menu-item {
    padding: 6px 24px 6px 43px;
  }

  .ivu-menu-submenu-title {
    font-size: 14px;
    padding: 8px 24px !important;
  }

  .ivu-menu-submenu-title-icon {
    float: right;
    position: absolute;
    // right: 0px !important;
    top: 18px !important;
  }
}
</style>
