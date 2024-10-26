import Vue from 'vue';
import moreBtn from './moreBtn/';
import tagInput from './tagInput/';
import buttons from './buttons/';
import table from './d-Table/';
import treeSelect from './tree-select/';
import buttonsX from './buttons-x/';
import menuAround from './menu-around/';
import editTheme from './editTheme/';
import dytSelect from './dyt-select/';
import dytFilter from './dyt-filter/';
import dytUpload from './dyt-upload/';
import dytInput from './dyt-input/';
import dytInputNumber from './dyt-inputNumber/';
import dytInputTag from './dyt-inputTag/';
import dytEllipsis from './dyt-ellipsis/';
import common from '@/utils/common.js';
import bus from '@/utils/bus';
import cookieConfig from '@/utils/cookieConfig';
import store from '@/store/store';
import connectAuth from '@/utils/connectAuth';
import dytSortBySelect from './dyt-sortBySelect/';
import dytDropdown from './dyt-dropdown/';
import dytPagination from './dyt-pagination/';
import dytModel from './dyt-model/';
import erpTreeSelect from '@riophae/vue-treeselect'
import dytPreviewImg from './dyt-previewImg/';
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

Vue.prototype.$common = common;
Vue.prototype.$bus = bus;
Vue.prototype.$connectAuth = connectAuth;

const install = function (Vue, opts = {}) {
  if (install.installed) return;
  Vue.component('local-down-button', moreBtn);
  Vue.component('erpTreeSelect', erpTreeSelect)
  Vue.component('local-tag-input', tagInput);
  Vue.component('local-buttons', buttons);
  /* iviewxx */
  Vue.component('dTable', table);
  Vue.component('treeSelect', treeSelect);
  Vue.component('Buttons', buttonsX);
  Vue.component('ButtonsItem', buttonsX.Item);
  Vue.component('ButtonsMenu', buttonsX.Menu);
  Vue.component('MenuAround', menuAround);
  /* ---end */
  Vue.component('tbEditTheme', editTheme);
  Vue.component('dytSelect', dytSelect);
  Vue.component('dytFilter', dytFilter);
  Vue.component('dytUpload', dytUpload);
  Vue.component('dytInput', dytInput);
  Vue.component('dyt-inputNumber', dytInputNumber);
  Vue.component('dyt-inputTag', dytInputTag);
  Vue.component('dyt-input-tag', dytInputTag);
  Vue.component('dyt-ellipsis', dytEllipsis);
  Vue.component('dyt-sortBySelect', dytSortBySelect);
  Vue.component('dyt-dropdown', dytDropdown);
  Vue.component('dyt-pagination', dytPagination);
  Vue.component('dyt-model', dytModel);
  Vue.component('dyt-previewImg', dytPreviewImg);
};
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}
Vue.use(install);

const authToken = (token) => {
  setTimeout(() => {
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
      store.commit('dytRequestHeaders', { 'Authorization-DYT': authCookie });
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
          setTimeout(() => {
            window.location.reload();
          }, 300)
        }
      });
    }
  }, 200)
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