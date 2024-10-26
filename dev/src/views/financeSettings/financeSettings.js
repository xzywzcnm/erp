import Vue from 'vue';
import router from './router';// 路由
import store from '@/store/store';
import axios from 'axios';
import '@/style/logistics/index.less';//这个有必要的话就改，先用其它文件的
import '@/utils/publicImportMain';

Vue.prototype.axios = axios;
Vue.config.productionTip = false;
// 创建实例挂载到#app
new Vue({
  router,
  store// 引入store配置
}).$mount('#app');
