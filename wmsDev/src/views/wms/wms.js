import Vue from 'vue';
import router from './router'; // 路由
import iview from 'view-design';
import Vuex from 'vuex';
import axios from 'axios';
import store from '@/store/store';
import '@/assets/http';
import '@/assets/css/alifont';
import 'view-design/dist/styles/iview.css';
import '@/style/index.less';
import '@/style/wms/index.less';
import '@/assets/css/slider-modal';
import SliderModal from 'slider-modal';
import locale from '@/locale/method/locale';
// import api from '@/api/api';
import '@/components/localComponents/'; // 本地组件
import VueLazyload from 'vue-lazyload';
import { getToken } from '@/utils/cookie';
import { getWarehouseId } from '@/utils/getService';
// import config from '@/config';
// import {
//   getAccessToken,
//   refreshToken,
//   getErpconfig
// } from '@/utils/user';
import regular from '@/utils/regular';
import Print from 'vue-print-nb';
Vue.use(Print)

Vue.prototype.axios = axios;
Vue.prototype.$regular = regular;
Vue.prototype.imagePrefix = './filenode/s';
Vue.config.debug = true; // 开启debug模式
Vue.use(iview);
Vue.use(VueLazyload);
Vue.use(Vuex);
Vue.use(SliderModal);
Vue.mixin(locale);
// 创建实例挂载到#app
// Vue.config.devtools = true;

// 解决表格固定列滚动时表格错位
Vue.directive('table-scroll', {
  bind(el, binding, vNode, oldNode) {
    if (binding.value) {
      el.__vue__.$refs.body.scrollTop = 0;
      el.__vue__.$refs.body.scrollLeft = 0;
    }
  }
})

new Vue({
  router,
  data() {
    return {
      isSelectWarehouse: false,
      isSelectWarehouseModal: false,
      userName: null,
      warehoseList: [],
      selectWarehouseId: '',
      warehouseOverseaType: '',
      isYms: 0
    };
  },
  watch: {
    $route() {
      if (!this.isSelectWarehouseModal) this.isShowWarehouse();
    },
    // 是否有仓库权限
    getHasWarehose(val) {
      if (val) return;
      this.warehouseSelectModal();
    }
  },
  computed: {
    getHasWarehose() {
      let warehouseId = getWarehouseId();
      // 当前用户是否有该仓库权限
      const hasWarehose = (this.$store.state.warehouseList || []).find(search => {
        return search.warehouseId === warehouseId;
      });
      return !this.$common.isEmpty(hasWarehose);
    }
  },
  methods: {
    isShowWarehouse() {
      let warehouseId = getWarehouseId();
      const token = getToken();
      // let countTime = config.curTime;
      // let url = window.location.href;
      this.warehoseList = this.$store.state.warehouseList;
      // 当前用户是否有该仓库权限
      const hasWarehose = this.getNowWarehouse();
      if (!this.$common.isEmpty(token)) {
        if (this.$common.isEmpty(warehouseId) || this.$common.isEmpty(hasWarehose)) {
          this.selectStore();
        } else {
          store.commit('warehouseId', warehouseId);
          // localStorage.setItem('warehouseId', warehouseId);
        }
      }
    },
    // 验证是否选中仓库，如果没有选中则默认选中第一个，并且弹弹窗
    selectStore() {
      // 默认选择仓库
      let userInfo = store.state.userInfo;
      this.userName = userInfo.userName;
      this.warehoseList = this.$store.state.warehouseList;
      if (this.$common.isEmpty(this.warehoseList)) {
        this.$Modal.error({
          title: '温馨提示',
          content: `<span style="font-size: 20px; color: #f60;">您无任何仓库权限，无法进入</span>`,
          okText: window.history.length > 1 ? '返回上一页' : '关闭页面',
          onOk: () => {
            if (window.history.length > 1) {
              window.history.go(-1);
            } else {
              window.close();
            }
          }
        })
        return;
      }
      const hasWarehose = this.getNowWarehouse();
      const newWarehose = this.$common.isEmpty(hasWarehose) ? this.warehoseList[0] : hasWarehose;
      let urlParams = this.$common.getUrlParams();
      this.selectWarehouseId = newWarehose.warehouseId;
      this.warehouseOverseaType = newWarehose.warehouseOverseaType;
      this.isYms = newWarehose.isYms || 0;
      this.$store.commit('warehouseId', this.selectWarehouseId);
      if (this.$common.isEmpty(hasWarehose) || this.$common.isEmpty(urlParams.warehouseId)) {
        const location = document.location;
        let baseUrl = '';
        if (location.href.indexOf('?') > -1) {
          baseUrl = location.href.substring(0, location.href.indexOf('?') + 1);
        } else {
          baseUrl = location.href;
        }
        urlParams.warehouseId = this.selectWarehouseId;
        location.href = `${baseUrl}?${this.$common.getParams(urlParams)}`;
      }
      this.warehouseSelectModal();
    },
    // 弹出选择仓库窗口
    warehouseSelectModal() {
      this.isSelectWarehouse = true;
      this.$nextTick(() => {
        this.isSelectWarehouseModal = true;
      });
    },
    // 如果未选中仓库时，不可关闭弹窗
    cancelSelectModal(visible) {
      if (visible) return;
      // 当前用户是否有该仓库权限
      const hasWarehose = this.getNowWarehouse();
      if (!this.$common.isEmpty(hasWarehose)) return;
      this.warehouseSelectModal();
    },
    // 获取最新选择的仓库
    getNowWarehouse() {
      let warehouseId = getWarehouseId();
      // 当前用户是否有该仓库权限
      const hasWarehose = (this.$store.state.warehouseList || []).find(search => {
        return search.warehouseId === warehouseId;
      });
      return hasWarehose;
    },
    // 切换仓库时
    selectWarehouse() {
      store.commit('warehouseId', this.selectWarehouseId);
      localStorage.setItem('warehouseId', this.selectWarehouseId);
      var warehouseList = this.warehoseList;
      let wareItem = {};
      warehouseList.forEach(val => {
        if (val.warehouseId === this.selectWarehouseId) {
          this.$set(val, 'check', true);
          wareItem = val;
          let index = warehouseList
            .map(val => val.warehouseId)
            .indexOf(this.selectWarehouseId);
          warehouseList.splice(index, 1);
          warehouseList.unshift(val);
        } else {
          this.$set(val, 'check', false);
        }
      });

      let warehouseOverseaTypeList = [
        { warehouseOverseaType: 'AMAZON_FBA', href: '#/amazonOnlineProduct' },
        { warehouseOverseaType: 'winitoutstore', href: '#/winitProduct' },
        { warehouseOverseaType: 'gcoutstore', href: '#/gcWarehousingOrder' },
        { warehouseOverseaType: 'fourpxoutstore', href: '#/fourPxProduct' },
        { warehouseOverseaType: 'pylOware', href: '#/pylOutboundOrder' },
        { warehouseOverseaType: 'thirdCarrier', href: '#/thirdOutboundOrder' },
        { warehouseOverseaType: 'cne', href: '#/cneProduct' },
        { warehouseOverseaType: 'rinid', href: '#/rinidProduct' },
        { warehouseOverseaType: 'nf', href: '#/nfProduct' },
        { warehouseOverseaType: 'amloutstore', href: '#/amlProduct' },
        { warehouseOverseaType: 'shloutstore', href: '#/shlProduct' },
        { warehouseOverseaType: 'ocoutstore', href: '#/efProduct' }
      ];
      // const urlParams = getUrlParams();
      // console.log(wareItem, wareItem.warehouseOverseaType);
      if (wareItem.warehouseOverseaType) {
        warehouseOverseaTypeList.map(item => {
          if (item.warehouseOverseaType === wareItem.warehouseOverseaType) {
            window.location.href = `${item.href}?warehouseId=${this.selectWarehouseId}`;
          }
        });
      } else {
        // 云仓
        if (wareItem.isYms === 1) {
          window.location.href = `#/cloudProduct?warehouseId=${this.selectWarehouseId}`;
        } else {
          window.location.href = `#/index?warehouseId=${this.selectWarehouseId}`;
        }
      }
      // 处理切换仓库刷新角标的问题
      this.$store.commit('badgeStatus', true);
      window.location.reload();
    }
  },
  store // 引入store配置
}).$mount('#app');
