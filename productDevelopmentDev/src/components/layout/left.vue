<template>
  <div class="leftMenu">
    <div class="leftMenu--main">
      <div class="leftMenuHeader">
        <dyt-select :clearable="false" v-model="sysModal" @on-change="selectSys" transfer transfer-class-name="style_dropdownbox" v-show="sysArr.length > 0" :labelInValue="true">
          <Option v-for="(item, index) in sysArr" :label="item.mainTitle" :value="item.childMenu" :key="index">
            <a :href="item.url" class="system_link">{{ item.mainTitle }} </a>
          </Option>
        </dyt-select>
      </div>
      <div class="menuContainer">
        <div class="menuContainer--main">
          <Menu ref="leftMenu" width="auto" :open-names="openNames" @on-select.native="selectMenuNav" :active-name="activeName">
            <sub-menu :subMenuDate="menuData"></sub-menu>
          </Menu>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import subMenu from './subMenu';
import layoutMixin from '../mixin/layout_mixin';
import menuWishCustomer from './data/menuDate';
// import menuWishSetCenter from './data/menuSetCenter';
import { getService } from '@/utils/getService';
import api from '../../api/api';
import utils from '@/utils/index';

export default {
  mixins: [layoutMixin],
  data: function () {
    return {
      openNames: [], // 展开name 默认全展示
      activeName: '', // 默认第一个
      menuMap: '',
      breadcrumbObj: [],
      theme2: 'light',
      sysModal: 'menuPds',
      sysType: '1',
      roleData: [],
      defaultRole: ['productDev_controlIndex'],
      sysArr: [],
      menuData: null
    };
  },
  created () {
    this.setMenuData();
  },
  methods: {
    // 获取自定义菜单
    getCustomMenu () {
      return new Promise((resolve) => {
        this.axios.get(api.get_menuResource).then((response) => {
          if (response.code === 0) {
            resolve(response.datas);
          }
        });
      });
    },
    // 获取当前用户的菜单权限
    getMenuRole () {
      return this.$axios.get(api.get_menuRole);
    },
    getOrderMenuNum () {
      return this.$axios.get(api.get_orderMenuNum);
    },
    // 获取侧边栏菜单待办的数据
    unReadCount (url, MENUKEY) {
      this.$axios.get(url).then((res) => {
        if (this.menuData.length > 0) {
          const setNum = (data) => {
            data.forEach((val) => {
              if (val.children && val.children.length > 0) {
                setNum(val.children);
              } else {
                if (val.menuKey === MENUKEY && res && res.datas) {
                  val.dataItemNum = res.datas;
                }
              }
            });
          }
          setNum(this.menuData);
        }
      });
    },
    workTypeChange (val) {
      this.sysType = val;
      if (val === '1') {
        window.location.href = 'pds.html#/backlog';
      } else {
        window.location.href = 'generalSettings.html#/management';
      }
    },
    // 设置跳转链接
    setGotoUrl (menu) {
      let roleData = this.roleData || JSON.parse(localStorage.getItem('roleData'));
      let menuData = [];
      if (menu) {
        function handerMenu (menu) {
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
        return ((i.menuKey && roleData.includes(i.menuKey)) || this.isAdmin) && i.menuKey && i.menuKey !== 'Group' && i.menuKey !== 'Group-title';
      });
      if (arr.length > 0) {
        return arr[0].path;
      }
    },
    // 获取3.0子系统的数据
    getLeftMenu () {
      this.axios.get(api.get_menus).then((response) => {
        if (response.code === 0) {
          let data = response.datas || [];
          if (data.length > 0) {
            data.forEach((n) => {
              n.mainTitle = n.cnName;
              if (n.enName === 'order-service') {
                n.childMenu = 'menuOrder';
              } else if (n.enName === 'setting-service') {
                n.childMenu = 'menuSetting';
              } else if (n.enName === 'wms-service') {
                n.childMenu = 'menuWms';
              } else if (n.enName === 'product-service') {
                n.childMenu = 'menuProduct';
              } else if (n.enName === 'cs-service') {
                n.childMenu = 'menuCustomer';
              } else if (n.enName === 'sps-service') {
                n.childMenu = 'menuSps';
              } else if (n.enName === 'pds-service') {
                n.childMenu = 'menuPds';
                n.url = '/pds-service/pds.html#' + this.setGotoUrl(menuWishCustomer.menu);
              } else {
                n.childMenu = '';
              }
            });
            this.sysArr = data;
          }
        }
      });
    },
    // 选中子系统
    selectSys (obj) {
      let domain = window.location.origin;
      let http = /(http):\/\/([\w.]+\/?)\S*/;
      for (let i = 0; i < this.sysArr.length; i++) {
        let item = this.sysArr[i];
        let talg = new RegExp(http);
        if (talg.test(item.url)) {
          this.sysModal = getService();
          window.open(item.url, '_blank');
          return false;
        } else {
          if (obj.value && item.childMenu === obj.value) {
            window.location.href = domain + item.url;
            return false;
          }
        }
      }
    },
    // 缓存当前选中的菜单
    selectMenuNav (name) {
      localStorage.setItem('activeName', name);
    },
    // 给侧边栏菜单设置id并返回有权限的菜单
    setMenuImpowerOrId (menuData) {
      if (!menuData) return [];
      const setId = (data, id) => {
        let newData = [];
        let name = '';
        data.filter(i => !i.menuHide).forEach((item, index) => {
          item.id = this.$common.isEmpty(id) ? index.toString() : `${id}-${index}`;
          if (!this.activeName && !item.children) {
            this.activeName = item.id;
          }
          if (this.$route.path === item.path) {
            this.activeName = item.id;
          } else {
            name = localStorage.getItem('activeName');
            if (!this.$common.isEmpty(name)) {
              this.activeName = name;
            }
          }
          localStorage.setItem('activeName', this.activeName);
          this.openNames.push(item.id);
          if (item.children && item.children.filter(k => !k.menuHide).length > 0) {
            item.children = setId(item.children, item.id);
          } else {
            item.children = null;
          }
          if (!this.$common.isEmpty(item.children)) {
            newData.push(item);
          } else if (!this.$common.isEmpty(item.menuKey) && this.roleData.includes(item.menuKey)) {
            newData.push(item);
          }
        });
        return newData;
      }
      const menuList = setId(menuData);
      return menuList;
    },
    // 获取侧边栏菜单的数据
    setMenuData () {
      // const inGroup = this.$store.state.inGroup;
      // const url = ''; // 获取所在系统菜单
      // this.sysType = '1';
      let menuData = menuWishCustomer.menu || [];
      this.getCustomMenu().then((data) => {
        let addCustomData = null;
        let customMenu = [];
        data.forEach((i) => {
          const toInGroup = i.platformType.includes('_') ? i.platformType.replace(/.*_/, '') : i.platformType;
          // 遍历菜单对象插入自定义菜单 注意 后续需要把项目里的 InGroup productDev 改成 pds
          if (toInGroup === 'pds') {
            customMenu.push({
              'name': i.menuDesc,
              'path': i.path,
              'menuKey': i.menuKey
            });
          }
        });
        if (customMenu.length > 0) {
          addCustomData = [
            {
              'name': '自定义菜单',
              'icon': 'icon-iconfontunie047',
              children: customMenu
            }
          ];
        }
        if (!this.$common.isEmpty(addCustomData)) {
          menuData.push(...addCustomData);
        }
        Promise.all([this.getMenuRole(), utils.getErpconfig()]).then((data) => {
          const roleData = (data && data[0] && data[0].datas) ? [...data[0].datas, ...this.defaultRole] : this.defaultRole;
          this.roleData = this.$common.copy(roleData);
          localStorage.setItem('roleData', JSON.stringify(roleData));
          this.$store.commit('menuList', roleData);
          // 菜单赋值
          this.menuData = this.setMenuImpowerOrId(this.$common.copy(menuData));
        }).then(() => {
          this.$nextTick(() => {
            if (this.$store.state.ierpStatus === '1') {
              this.getLeftMenu();
            }
            this.$nextTick(() => {
              this.$refs.leftMenu.updateOpened();
              this.$refs.leftMenu.updateActiveName();
            });
          });
        })
      });
    }
  },
  components: {
    subMenu
  }
};
</script>