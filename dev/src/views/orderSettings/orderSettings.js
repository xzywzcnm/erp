import Vue from 'vue';
import router from './router';// 路由
import store from '@/store/store';
import axios from 'axios';
import '@/style/orderSettings/index.less';
import '@/utils/publicImportMain';

Vue.prototype.axios = axios;
Vue.config.productionTip = false;
// 创建实例挂载到#app
new Vue({
  router,
  store// 引入store配置
}).$mount('#app');
