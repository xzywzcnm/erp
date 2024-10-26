import Vue from 'vue';
import iview from 'view-design';
import Vuex from 'vuex';
import axios from 'axios';
import store from '@/store/store';
import '@/assets/http';
import 'view-design/dist/styles/iview.css';
// import '@/locale/index'; // 国际化引入
import locale from '@/locale/method/locale';
import sortingInfo from '@/views/sortingInfo/components/sortingInfo/sortingInfo';
import { getToken } from '@/utils/cookie';
import config from '@/config';
import common from '@/utils/common';
import { getLastPageName } from '@/utils';
import {
  getAccessToken,
  getTicketTokenHand,
  refreshToken
} from '@/utils/user';

Vue.prototype.axios = axios;
Vue.prototype.$common = common;
Vue.config.debug = true; // 开启debug模式
Vue.use(iview);
Vue.use(Vuex);
Vue.mixin(locale);
store.commit('inGroup', 'sortingInfo');
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;
// 创建实例挂载到#app
const token = getToken();
let url = window.location.href;
if (token) {
  refreshToken(countTime);
  getTicketTokenHand().then(() => {
    setVue();
  })
} else {
  getAccessToken(url).then(result => {
    if (result) {
      setTimeout(function () {
        refreshToken(countTime);
      }, countTime);
      setVue();
    }
  });
}
function setVue () {
  new Vue({
    render: h => h(sortingInfo),
    store // 引入store配置
  }).$mount('#app');
}
