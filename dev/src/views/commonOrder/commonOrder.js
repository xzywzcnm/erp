import Vue from 'vue';
import router from './router';// 路由
import store from '@/store/store';
import axios from 'axios';
import '@/style/order/index.less';
import '@/utils/publicImportMain';
import { getQueryString } from '@/utils/index';

Vue.prototype.axios = axios;
Vue.config.productionTip = false;
const platform = getQueryString('platform');
axios.defaults.headers['PlatformId'] = platform;
// 创建实例挂载到#app
new Vue({
  router,
  store// 引入store配置
}).$mount('#app');
