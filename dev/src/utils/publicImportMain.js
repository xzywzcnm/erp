import Vue from 'vue';
import iview from 'view-design';
import Vuex from 'vuex';
import '@/components/localComponents/';
import SliderModal from 'slider-modal';
import VueLazyload from 'vue-lazyload';
import '@/assets/http';
// import '@/locale/index';// 国际化引入
import locale from '@/locale/method/locale';
import '@/assets/css/alifont';
import '@/assets/css/lapa-fonts/iconfont.css';
import '@/assets/css/lapa-fonts/iconfont.js';
import '@/assets/css/erp-fonts/iconfont.css';
import '@/assets/css/erp-fonts/iconfont.js';
import 'view-design/dist/styles/iview.css';
import '@/style/index.less';
import '@/assets/css/slider-modal';
// import tbComponents from 'tongtool-components';
import regular from '@/utils/regular';
import connectAuth from '@/utils/connectAuth';
import bus from '@/utils/bus';
import common from '@/utils/common.js';
import { getEnvHost } from '@/utils/getAuthHost';
import store from '@/store/store';
import cookieConfig from '@/utils/cookieConfig';

Vue.config.debug = true;// 开启debug模式
// Vue.prototype.$common = { ...common, ...connectAuth };
Vue.prototype.$common = common;
Vue.prototype.$bus = bus;
Vue.prototype.$connectAuth = connectAuth;
Vue.prototype.$envHost = getEnvHost();

// Vue.use(tbComponents);
Vue.use(VueLazyload);
Vue.use(SliderModal);
Vue.use(iview);
Vue.use(Vuex);
Vue.mixin(locale);
Vue.prototype.$regular = regular;

const authToken = (token) => {
  const urlParams = common.getUrlParams({ url: window.location.href });
  if (!common.isEmpty(urlParams.pageName) && !common.isEmpty(urlParams.pagePass)) return;
  const accessCookie = common.getCookie(cookieConfig.DYTtoken);
  if (common.isEmpty(token)) {
    connectAuth.goToLogin();
    return;
  }
  // 关闭重新登录弹窗
  connectAuth.removeModal();
  const newCookie = token.access_token;
  if (accessCookie !== newCookie) {
    store.commit('dytRequestHeaders', { 'Authorization-DYT': newCookie });
    common.setCookie([
      { key: cookieConfig.DYTtoken, value: newCookie },
    ]);
    const awaitList = [
      { dataOrigin: connectAuth.getUserInfo(), key: 'userInfo' }
    ];
    connectAuth.customGetInfo(awaitList).then(info => {
      // 登录账号不一致时刷新页面
      if (!common.isEmpty(info.userInfo) && info.userInfo.loginNameChange) {
        // window.location.replace(window.location.href.split('#/')[0]);
        window.location.reload();
      }
    });
  }
}
// 窗口获得焦点时
const windowFocus = () => {
  connectAuth.enableAutoRefresh();
}
// 窗口失去焦点时
const windowBlur = () => {
  connectAuth.clearRefreshToekn();
}

const erpToken = common.getCookie(cookieConfig.tokenName);
const authCookie = common.getCookie(cookieConfig.DYTtoken);
store.commit('erpRequestHeaders', { 'Authorization': erpToken });
store.commit('dytRequestHeaders', { 'Authorization-DYT': authCookie });
// 监听 token 变化
bus.on('auth-token', authToken);
window.addEventListener('focus', windowFocus);
window.addEventListener('blur', windowBlur);
// 初始化事业部
store.dispatch('getBusinessDept');
