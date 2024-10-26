import Vue from "vue";
import moreBtn from "./moreBtn/";
import message from "./message/message/";
import { buttons } from "./buttons";
import inputNumber from "./input-number/";
import count from "./count/";
import tagInput from "./tagInput/";
import editTheme from './editTheme/';
import dytSelect from './dyt-select/';
import dytFilter from './dyt-filter/';
import dytUpload from './dyt-upload/';
import dytViewUpload from './dyt-view-upload/';
import dytInput from './dyt-input/';
import dytInputNumber from './dyt-inputNumber/';
import dytInputTag from './dyt-inputTag/';
import dytEllipsis from './dyt-ellipsis/';
import common from '@/utils/common.js';
import bus from '@/utils/authBus';
import { getEnvHost } from '@/utils/getAuthHost';
import connectAuth from '@/utils/connectAuth';
import cookieConfig from '@/utils/cookieConfig';
import store from '@/store/store';
import erpTreeSelect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

Vue.prototype.$common = common;
Vue.prototype.$bus = bus;
Vue.prototype.$connectAuth = connectAuth;
Vue.prototype.$msg = message;
Vue.prototype.$envHost = getEnvHost();

const install = function (Vue) {
  if (install.installed) return;
  Vue.component('erpTreeSelect', erpTreeSelect);
  Vue.component("local-down-button", moreBtn);
  Vue.component("local-buttons", buttons);
  Vue.component("local-input-number", inputNumber);
  Vue.component("local-count", count);
  Vue.component("local-tag-input", tagInput);
  Vue.component('tbEditTheme', editTheme);
  Vue.component('dytSelect', dytSelect);
  Vue.component('dytFilter', dytFilter);
  Vue.component('dytUpload', dytUpload);
  Vue.component('dytViewUpload', dytViewUpload);
  Vue.component('dytInput', dytInput);
  Vue.component('dyt-inputNumber', dytInputNumber);
  Vue.component('dyt-inputTag', dytInputTag);
  Vue.component('dyt-input-tag', dytInputTag);
  Vue.component('dyt-ellipsis', dytEllipsis);
};
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}
Vue.use(install);

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