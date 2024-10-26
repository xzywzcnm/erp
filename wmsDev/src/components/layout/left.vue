<template>
  <div class="leftMenu">
    <div class="leftMenu--main">
      <div class="leftMenuHeader">
        <Select
          v-model="sysModal"
          @on-change="selectSys"
          transfer
          :labelInValue="true"
          transfer-class-name="style_dropdownbox"
        >
          <Option
            v-for="item in sysArr"
            :label="item.mainTitle"
            :value="item.childMenu"
            :key="item.mainTitle"
          >
            <a
              v-if="
                item.url.includes('/wms-service/') ||
                item.url.includes('/wms.html')
              "
              :href="`${item.url}${
                item.url.includes('?')
                  ? `&warehouseId=${pageWarehouseId}`
                  : `?warehouseId=${pageWarehouseId}`
              }`"
              class="system_link"
              >{{ item.mainTitle }}</a
            >
            <a v-else :href="item.url" class="system_link">{{
              item.mainTitle
            }}</a>
          </Option>
        </Select>
      </div>
      <div class="menuContainer">
        <div class="menuContainer--main">
          <Menu
            ref="leftMenu"
            :open-names="openNames"
            @on-select.native="selectMenuNav"
            :active-name="activeName"
          >
            <sub-menu :subMenuDate="menuData"></sub-menu>
          </Menu>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Mixin from "@/components/mixin/common_mixin";
import subMenu from "./subMenu";
import menuAmazonFba from "@/api/menu/menuAmazonFba";
import menuWinit from "@/api/menu/menuWinit";
import menuBarn from "@/api/menu/menuBarn";
import menuShl from "@/api/menu/menuShl";
import menu4px from "@/api/menu/menu4px";
import third from "@/api/menu/thirdOutboundOrder";
import menuCne from "@/api/menu/menuCne";
import menuDirectly from "@/api/menu/menuDirectly"; // 直发仓
import menuRinid from "@/api/menu/menuRinid";
import menuNovFire from "@/api/menu/menuNovFire";
import menuAmloutstore from "@/api/menu/menuAmloutstore";
import menuPyl from "@/api/menu/menuPyl";
import menuYuncang from "@/api/menu/menuYuncang";
import menuWarehouse from "@/api/menu/menuWarehouse";
import {
  getService,
  getWarehouseId,
  getWareHouseItem,
} from "@/utils/getService";
import warehouseOversea from "@/api/menu/warehouseOversea";
import menuEf from "@/api/menu/menuEf";
import api from "@/api/api";

const wareHouseItem = getWareHouseItem();
// 设置不需要入仓管理菜单，请在此填入 warehouseOverseaType 的值即可
const notWarehouseManage = [
  'gcoutstore'
];

export default {
  mixins: [Mixin],
  components: {
    subMenu: subMenu,
  },
  data() {
    return {
      menuData: null,
      openNames: [], // 展开name 默认全展示
      pathList: [],
      activeName: this.$store.state.activeName, // 默认第一个
      sysArr: [],
      roleData: [],
      sysModal: "menuWms",
      warehouseOverseaType: wareHouseItem ? wareHouseItem.warehouseOverseaType : "",
      warehouseType: wareHouseItem ? wareHouseItem.warehouseType : "", // 仓库类型
      refreshLeft: sessionStorage.getItem("refreshLeft"),
    };
  },
  created() {
    let v = this;
    const warehouseId = getWarehouseId();
    if (warehouseId) {
      this.$store.state.warehouseList.forEach((val) => {
        if (val.warehouseId === warehouseId) {
          v.warehouseOverseaType = val.warehouseOverseaType;
          v.isYms = val.isYms;
        }
      });
    }
    v.setMenuData();
  },
  methods: {
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
    // 获取图片前缀和用户信息
    getImgPrefix() {
      this.axios.post(api.get_imgPrefix).then((res) => {
        if (res.data.code === 0) {
          if (res.data.datas) {
            this.$store.commit(
              "imgUrlPrefix",
              res.data.datas.filenodeViewTargetUrl
            );
            localStorage.setItem(
              "imgUrlPrefix",
              res.data.datas.filenodeViewTargetUrl
            );
            this.$store.commit("userInfo", res.data.datas.userInfo);
            localStorage.setItem("userInfo", res.data.datas.userInfo);
          }
        }
      });
    },
    // 获取当前用户的菜单权限
    getMenuRole() {
      return this.axios
        .get(api.carrierService + api.get_menuRole)
        .then((res) => {
          if (res.data.code === 0) {
            this.roleData = res.data.datas;
            localStorage.setItem("roleData", JSON.stringify(this.roleData));
          }
        });
    },
    unReadCount(url, MENUKEY) {
      this.axios.get(url).then((res) => {
        if (this.menuData.length > 0) {
          function setNum(data) {
            data.forEach((val) => {
              if (val.children && val.children.length > 0) {
                setNum(val.children);
              } else {
                if (val.menuKey === MENUKEY) {
                  val.dataItemNum = res.data.datas;
                }
              }
            });
          }
          setNum(this.menuData);
        }
      });
    },
    getBadges() {
      let v = this;
      let id = v.getWarehouseId();
      v.axios.get(api.get_deliveryMenuNum + "?warehouseId=" + id).then((response) => {
        if (response.data.code === 0) {
          let number_data = response.data.datas;
          function setNum(data) {
            data.forEach((n) => {
              if (n.children && n.children.length > 0) {
                setNum(n.children);
              } else {
                if (n.menuKey === "wms_print") {
                  n.dataItemNum = number_data.allowPrint;
                } else if (n.menuKey === "wms_exwarehouse") {
                  n.dataItemNum = number_data.outWarehouse;
                } else if (n.menuKey === "wms_cancelPackage") {
                  n.dataItemNum = number_data.totalRecycle;
                } else if (n.menuKey === "wms_issuedLogisticsProvider") {
                  n.dataItemNum =
                      number_data.waitingUploadAndtrackingNumberUncatch;
                }
              }
            });
          }
          setNum(v.menuData);
        }
      });
      v.unReadCount(api.otherUnread + "?warehouseId=" + id, "wms_otherStockOut");
      v.unReadCount(api.waitAssignUnread + "?warehouseId=" + id, "wms_waitForDistribution");
      v.unReadCount(api.createListUnread + "?warehouseId=" + id, "wms_generateOrderList");
    },
    // 设置跳转链接
    setGotoUrl(menu, getData) {
      const roleData = this.roleData || JSON.parse(localStorage.getItem("roleData"));
      let menuData = [];
      let routePath = '';
      if (menu) {
        const handerMenu = (menu) => {
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
      const arr = menuData.filter((i) => {
        if (((i.menuKey && roleData.includes(i.menuKey)) || this.isAdmin) &&
          i.menuKey &&
          i.menuKey !== "Group" &&
          i.menuKey !== "Group-title"
        ) {
          return i;
        }
      });
      if (!this.$common.isEmpty(arr) && !this.$common.isEmpty(arr[0].path)) {
        routePath = arr[0].path;
      }

      const pathList = getData.pathData;
      const pathData = pathList.map(m => m.path);
      const pItem = getData.permissionItem;
      const perPathData = pItem.map(m => m.path);
      const urlParams = this.$common.getUrlParams();
      urlParams.warehouseId = getWarehouseId();
      const paramsData = this.$common.getParams(urlParams);

      // 有权限的菜单存在时
      if (!this.$common.isEmpty(perPathData)) {
        if (perPathData.includes(routePath)) {
          return `${routePath}?${paramsData}`;
        }
        if (perPathData.includes(this.$route.path)) {
          return `${this.$route.path}?${paramsData}`;
        }
        this.activeName = pItem[0].id;
        localStorage.setItem("activeName", this.activeName);

        this.$router.push({
          path: perPathData[0],
          query: urlParams,
        })
        return `${perPathData[0]}?${paramsData}`;
      }
      // 本地运行时的无权限菜单
      if (process.env.NODE_ENV != "development" && !this.$common.isEmpty(pathData)) {
        if (pathData.includes(routePath)) {
          return `${routePath}?${paramsData}`;
        }
        if (pathData.includes(this.$route.path)) {
          return `${this.$route.path}?${paramsData}`;
        }
        this.activeName = pathList[0].id;
        localStorage.setItem("activeName", this.activeName);
        this.$router.push({
          path: pathData[0],
          query: urlParams,
        })
        return `${pathData[0]}?${paramsData}`;
      }
      // 跳转到无权限页面
      if (['/noPersermission'].includes(this.$route.path)) {
        return `${this.$route.path}?${paramsData}`;
      }
      this.$router.push({
        path: '/noPersermission',
        query: urlParams,
      });
      return `/noPersermission?${paramsData}`;
    },
    // 获取当前选中的子系统的数据
    getLeftMenu(getData) {
      let v = this;
      v.axios.get(api.get_menus).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            n.mainTitle = n.cnName;
            if (n.enName === "order-service") {
              n.childMenu = "menuOrder";
            } else if (n.enName === "setting-service") {
              n.childMenu = "menuSetting";
            } else if (n.enName === "wms-service") {
              n.childMenu = "menuWms";
              n.url = "/wms-service/wms.html#" + v.setGotoUrl(menuWarehouse.menu, getData);
            } else if (n.enName === "product-service") {
              n.childMenu = "menuProduct";
            } else if (n.enName === "cs-service") {
              n.childMenu = "menuCustomer";
            } else if (n.enName === "sps-service") {
              n.childMenu = "menuSps";
            } else if (n.enName === "pds-service") {
              n.childMenu = "menuPds";
            } else if (n.enName === "yms-supplier-service") {
              n.childMenu = "menuSupplier";
            } else {
              n.childMenu = "";
            }
          });
          v.sysArr = data;
        }
      });
    },
    // 给侧边栏菜单设置id
    setMenuId(menuData) {
      if (!menuData) {
        return {
          menuData: [],
          pathData: [],
          permissionItem: [],
          permissionPath: [],
        };
      }
      let pathData = [];
      let permissionPath = [];
      let permissionItem = [];
      let getChildren = [];
      const setId = (data, id) => {
        let newData = [];
        let name = "";
        data
          .filter((i) => !i.menuHide)
          .forEach((item, index) => {
            item.id = this.$common.isEmpty(id)
              ? index.toString()
              : `${id}-${index}`;
            if (!this.activeName && !item.children) {
              this.activeName = item.id;
            }
            if (this.$route.path === item.path) {
              this.activeName = item.id;
            } else {
              name = localStorage.getItem("activeName");
              if (!this.$common.isEmpty(name)) {
                this.activeName = name;
              }
            }
            localStorage.setItem("activeName", this.activeName);
            this.openNames.push(item.id);
            if (
              item.children &&
              item.children.filter((k) => !k.menuHide).length > 0
            ) {
              getChildren = setId(item.children, item.id);
              item.children = this.$common.isEmpty(getChildren)
                ? null
                : getChildren;
            } else {
              item.children = null;
              !this.$common.isEmpty(item.path) && pathData.push(item);
            }
            if (!this.$common.isEmpty(item.children)) {
              newData.push(item);
            } else if (!this.$common.isEmpty(item.path)) {
              if (
                (!this.$common.isEmpty(item.menuKey) &&
                  this.roleData.includes(item.menuKey)) ||
                this.$common.isEmpty(item.menuKey)
              ) {
                newData.push(item);
                permissionItem.push(item);
                permissionPath.push(item.path);
              }
            }
          });
        return newData;
      };
      const getHandData = setId(menuData);
      this.pathList = pathData;
      return {
        menuData: getHandData,
        pathData: pathData,
        permissionItem: permissionItem,
        permissionPath: permissionPath,
      };
    },
    // 获取侧边栏菜单的数据
    setMenuData() {
      let v = this;
      const type = {
        AMAZON_FBA: menuAmazonFba.menu,
        winitoutstore: menuWinit.menu,
        gcoutstore: menuBarn.menu,
        shloutstore: menuShl.menu,
        fourpxoutstore: menu4px.menu,
        thirdCarrier: third.menu,
        cne: menuCne.menu,
        rinid: menuRinid.menu,
        nf: menuNovFire.menu,
        amloutstore: menuAmloutstore.menu,
        ocoutstore: menuEf.menu, // EF海外仓
        pylOware: menuPyl.menu,
      }
      let menuData = [];
      if (this.isYms === 1) {
        // 云仓
        menuData = this.$common.copy(menuYuncang.menu);
      } else if (this.$common.isEmpty(this.warehouseOverseaType) && [5, '5'].includes(this.warehouseType)) {
        // 直发仓
        menuData = this.$common.copy(menuDirectly.menu);
      } else if (!this.$common.isEmpty(type[this.warehouseOverseaType])) {
        // 第三方仓
        menuData = this.$common.copy(type[this.warehouseOverseaType]);
      } else if (this.$common.isEmpty(this.warehouseOverseaType)) {
        // 自营仓
        menuData = this.$common.copy(menuWarehouse.menu);
      }
      v.getCustomMenu().then((data) => {
        let addCustomData = null;
        let customMenu = [];
        data.forEach((i) => {
          // 遍历菜单对象插入自定义菜单
          let toInGroup = i.platformType.includes("_")
            ? i.platformType.replace(/.*_/, "")
            : i.platformType;
          if (toInGroup === "wms") {
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
        this.$common.promiseAll([this.getMenuRole, this.warehouseManage]).then((data) => {
          // 过滤入仓管理
          const res = data[1];
          if (res && !notWarehouseManage.includes(this.warehouseOverseaType)) {
            let flag = true;
            menuData.forEach((k, i) => {
              if (k.name === "入仓管理" && "children" in k) flag = false;
            });
            flag && menuData.push(...warehouseOversea.warehouseArrival);
          }

          const getData = v.setMenuId(menuData);
          this.menuData = getData.menuData;
          v.getImgPrefix();
          v.getBadges();
          v.getLeftMenu(getData);
          v.$nextTick(() => {
            v.$refs.leftMenu.updateOpened();
            v.$refs.leftMenu.updateActiveName();
          });
        });
      });
    },
    // 缓存当前选中的菜单
    selectMenuNav(name) {
      localStorage.setItem("activeName", name);
      this.$store.commit("activeName", this.activeName);
    },
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
            window.location.href = `${domain}${item.url}`;
            // localStorage.setItem('sysSelect', obj.value);
            return false;
          }
        }
      }
    },
    // 过滤不是第三方仓不存在入仓管理
    warehouseManage() {
      return new Promise((resolve, reject) => {
        let { warehouseList = [], warehouseId } = this.$store.state || {};
        if (!(warehouseId && warehouseList.length)) {
          resolve(false);
          return;
        }
        let temp = null;
        warehouseList.forEach((k) => {
          !temp && k.warehouseId === warehouseId && (temp = k);
        });
        // 第三方仓
        if (temp && [1, '1'].includes(temp.warehouseType)) {
          resolve(true);
        }
        resolve(false);
      });
    },
  },
  watch: {
    warehouseOverseaType(n, o) {
      this.setMenuData();
    },
    refreshLeft(n, o) {
      let v = this;
      if (n) {
        v.getBadges();
        sessionStorage.setItem("refreshLeft", false);
      }
    },
  },
  computed: {
    pageWarehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
  },
  // 监听路由变化，让侧边栏菜单选中当前路由对应的菜单
  $route: {
    handler(value) {
      let v = this;
      let path = value.path;
      if (v.menuData.length > 0) {
        function setNum(data) {
          data.forEach((val) => {
            if (val.children && val.children.length > 0) {
              setNum(val.children);
            } else {
              if (val.path === path) {
                v.activeName = val.id;
                localStorage.setItem("activeName", v.activeName);
              }
            }
          });
        }
        setNum(v.menuData);
      }
    },
  },
};
</script>
<style lang="less">
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
