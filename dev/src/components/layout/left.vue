<template>
  <div class="leftMenu">
    <div class="leftMenu--main">
      <div class="leftMenuHeader">
        <dyt-select
          :clearable="false"
          v-model="sysModal"
          @on-change="selectSys"
          transfer
          transfer-class-name="style_dropdownbox"
          :labelInValue="true"
        >
          <Option
            v-for="item in sysArr"
            :label="item.mainTitle"
            :value="item.childMenu"
            :key="item.mainTitle"
          >
            <a :href="item.url" class="system_link">{{ item.mainTitle }} </a>
          </Option>
        </dyt-select>
      </div>
      <div class="menuContainer">
        <div class="menuContainer--main">
          <Menu
            ref="leftMenu"
            class="menuContainer--left-menu"
            :open-names="openNames"
            @on-select="selectMenuNav"
            :active-name="activeName"
          >
            <sub-menu :subMenuDate="menu"></sub-menu>
          </Menu>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import "@/assets/http";
import Mixin from "@/components/mixin/common_mixin";
import { getService } from "@/utils/getService";
import subMenu from "./subMenu";

export default {
  mixins: [Mixin],
  data() {
    return {
      breadcrumbObj: [],
      sysArr: [],
      sysModal: getService(),
      warehouseId: sessionStorage.getItem("warehouseId"),
      menuSelect: getService(),
    };
  },
  computed: {
    active() {
      return this.$store.state.active;
    },
  },
  props: {
    menu: {
      type: Array,
      default: () => {
        return [];
      },
    },
    openNames: {
      type: Array,
      default: () => {
        return [];
      },
    },
    activeName: {
      type: String,
      default: "",
    },
  },
  watch: {
    menu: {
      handler(data) {
        this.$nextTick(() => {
          this.$refs.leftMenu.updateOpened();
          this.$refs.leftMenu.updateActiveName();
          this.$nextTick(() => {
            const allMenuDom = Array.from(document.querySelectorAll('.white-space-nowrap.lis_wrap.ivu-menu-item .nav-text'));
            if (this.$common.isEmpty(allMenuDom)) return;
            const productDom = allMenuDom.find(dom => dom.innerText == '商品管理');
            if (this.$common.isEmpty(productDom) || productDom.className.includes('newly-increased')) return;
            productDom.className = 'nav-text newly-increased';
            const parentDom = productDom.parentNode;
            let span = document.createElement('span');
            span.className = 'product-sku-await-number';
            span.style.display = 'none';
            parentDom.appendChild(span);
            this.$nextTick(() => {
              this.getSkuAwaitNumber();
            })
          })
        });
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.getLeftMenu();
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
      let arr = menuData.filter((i) => {
        if (
          ((i.menuKey && v.$store.state.roleData.includes(i.menuKey)) ||
            v.isAdmin) &&
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
      let data = v.$store.state.menuQuery;
      if (v.menu && data) {
        (data || []).forEach((n, i) => {
          n.mainTitle = n.cnName;
          if (n.enName === "order-service") {
            n.childMenu = "menuOrder";
            // n.url = '/order-service/' + v.setGotoUrl(v.menu);
          } else if (n.enName === "setting-service") {
            n.childMenu = "menuSetting";
            // n.url = '/setting-service/' + v.setGotoUrl(v.menu);
          } else if (n.enName === "wms-service") {
            n.childMenu = "menuWms";
          } else if (n.enName === "product-service") {
            n.childMenu = "menuProduct";
            // n.url = '/product-service/' + v.setGotoUrl(v.menu);
          } else if (n.enName === "cs-service") {
            n.childMenu = "menuCustomer";
            // n.url = '/cs-service/' + v.setGotoUrl(v.menu);
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
    },
    // 缓存当前选中的菜单
    selectMenuNav(name) {
      // localStorage.setItem('activeName', name);
    },
  },
  components: {
    subMenu,
  },
};
</script>
<style lang="less">
.ivu-menu-item-selected .route-link {
  color: #2b85e4;
}

.ivu-menu-vertical .ivu-menu-item {
  padding: 6px 24px 6px 24px;
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
  .ivu-select-item{
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
.product-sku-await-number{
  padding: 1px 4px;
  margin-left: 5px;
  background: #f20;
  border-radius: 100%;
  color: #fff;
  font-size: 12px;
}
</style>
<style lang="less" scoped>
.menuContainer{
  :deep(.nav-text) {
    &.newly-increased{
      width: auto;
    }
  }
}
</style>
