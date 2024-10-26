import Vue from 'vue';
import router from './router';// 路由
import store from '@/store/store';
import axios from 'axios';

import iview from 'view-design';
import Vuex from 'vuex';
import '@/components/localComponents/';
import SliderModal from 'slider-modal';
import VueLazyload from 'vue-lazyload';
// import '@/locale/index';// 国际化引入

import '@/assets/css/alifont';
import 'view-design/dist/styles/iview.css';
import '@/style/index.less';
import '@/assets/css/slider-modal';

Vue.config.debug = true;// 开启debug模式
Vue.use(VueLazyload);
Vue.use(SliderModal);
Vue.use(iview);
Vue.use(Vuex);

Vue.prototype.axios = axios;
Vue.config.productionTip = false;
// 创建实例挂载到#app
new Vue({
  router,
  store// 引入store配置
}).$mount('#app');
