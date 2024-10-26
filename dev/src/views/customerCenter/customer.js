import Vue from 'vue';
import router from './router';// 路由
import store from '@/store/store';
import axios from 'axios';
import '@/utils/publicImportMain';
import '@/style/order/index.less';
import '@/style/customer/index.less';
// 編輯器
import '#@/static/UE/ueditor.config.js';
import '#@/static/UE/ueditor.all.js';
import '#@/static/UE/lang/zh-cn/zh-cn.js';
import '#@/static/UE/ueditor.parse.js';

Vue.prototype.axios = axios;
Vue.config.productionTip = false;
// 创建实例挂载到#app
new Vue({
  router,
  store// 引入store配置
}).$mount('#app');
