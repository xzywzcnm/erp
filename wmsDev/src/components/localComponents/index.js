import Vue from 'vue';
import moreBtn from './moreBtn/';
import message from './message/message/';
import buttons from './buttons/';
import inputNumber from './input-number/';
import tagInput from './tagInput/';
import imgZoom from './img-zoom/';
import filterColumns from './filterColumns/';
import table from './d-Table/';
import treeSelect from './tree-select/';
import buttonsX from './buttons-x/';
import menuAround from './menu-around/';
import editTheme from './editTheme/';
import uDate from '@/utils/date';
import browser from '@/utils/browser';
import dytSelect from './dyt-select/';
import dytFilter from './dyt-filter/';
import dytUpload from './dyt-upload/';
import dytInput from './dyt-input/';
import dytShippingSelect from './dyt-shippingSelect/';
import dytInputNumber from './dyt-inputNumber/';
import dytLoadingText from './dyt-loadingText/';
import dytInputTag from './dyt-inputTag/';
import dytEllipsis from './dyt-ellipsis/';
import dytSortBySelect from './dyt-sortBySelect/';
import dytModel from './dyt-model/';
import dytPreviewImg from './dyt-previewImg/';
import common from '@/utils/common.js';
import bus from '@/utils/bus';
import erpTreeSelect from '@riophae/vue-treeselect';
import dytPagination from './dyt-pagination/';
import dytDropdown from './dyt-dropdown/';
// erpTreeSelect styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import cookieConfig from '@/utils/cookieConfig';
import connectAuth from '@/utils/connectAuth';
import store from '@/store/store';
import dytStoreSelect from './dyt-store-select';

Vue.prototype.$common = common;
Vue.prototype.imageBase = `${location.origin}/wms-service/filenode/s`;
Vue.prototype.$bus = bus;
Vue.prototype.$connectAuth = connectAuth;
Vue.prototype.$uDate = uDate;
Vue.prototype.$browser = browser;

const install = function (Vue, opts = {}) {
  if (install.installed) return;
  Vue.component('local-down-button', moreBtn);
  Vue.component('erpTreeSelect', erpTreeSelect);
  Vue.component('local-buttons', buttons);
  Vue.component('local-input-number', inputNumber);
  Vue.component('local-tag-input', tagInput);
  Vue.component('local-img-zoom', imgZoom);
  Vue.component('local-filter-columns', filterColumns);
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
  Vue.component('dyt-loadingText', dytLoadingText);
  Vue.component('dyt-inputTag', dytInputTag);
  Vue.component('dyt-input-tag', dytInputTag);
  Vue.component('dyt-ellipsis', dytEllipsis);
  Vue.component('dyt-sortBySelect', dytSortBySelect);
  Vue.component('dyt-model', dytModel);
  Vue.component('dyt-previewImg', dytPreviewImg);
  Vue.component('dyt-pagination', dytPagination);
  Vue.component('dyt-dropdown', dytDropdown);
  Vue.component('dyt-shippingSelect', dytShippingSelect);
  Vue.component('dytStoreSelect', dytStoreSelect);
};
Vue.prototype.$msg = message;
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}
Vue.use(install);

const paramsJson = common.getUrlParams();
const getItemId = localStorage.getItem('warehouseId');
const idEmpty = (common.isEmpty(getItemId) || [null, 'null'].includes(getItemId));

if (common.isEmpty(paramsJson['warehouseId'])) {
  if (!idEmpty) {
    const pageHerf = window.location.href;
    window.location.href = pageHerf.includes('?') ? `${pageHerf}&warehouseId=${getItemId}` : `${pageHerf}?warehouseId=${getItemId}`;
    // window.location.reload();
  }
} else if (!common.isEmpty(paramsJson['warehouseId']) && idEmpty) {
  localStorage.setItem('warehouseId', paramsJson['warehouseId']);
}

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