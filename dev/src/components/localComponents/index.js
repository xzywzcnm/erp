import Vue from 'vue';
import moreBtn from './moreBtn/';
import tagInput from './tagInput/';
import buttons from './buttons/';
import table from './d-Table/';
import treeSelect from './tree-select/';
import buttonsX from './buttons-x/';
import menuAround from './menu-around/';
import dytSelect from './dyt-select/';
import dytFilter from './dyt-filter/';
import dytUpload from './dyt-upload/';
import dytInput from './dyt-input/';
import dytViewUpload from './dyt-view-upload/';
import dytInputNumber from './dyt-inputNumber/';
import dytInputTag from './dyt-inputTag/';
import dytEllipsis from './dyt-ellipsis/';
import dytTextarea from './dyt-textarea/';
import orderLabelTag from './order-labelTag/';
import dytPage from './dyt-page/';
import dytSortBySelect from './dyt-sortBySelect/';
import dytPreviewImg from './dyt-previewImg/';
import dytMulSearch from './dyt-mulSearch/';
import dytStoreSelect from './dyt-store-select';

import editTheme from './editTheme/';// import the component
import erpTreeSelect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const install = function (Vue, opts = {}) {
  if (install.installed) return;
  Vue.component('erpTreeSelect', erpTreeSelect);
  Vue.component('local-down-button', moreBtn);
  Vue.component('local-tag-input', tagInput);
  Vue.component('local-buttons', buttons);
  /* iviewxx */
  Vue.component('dTable', table);
  Vue.component('treeSelect', treeSelect);
  Vue.component('Buttons', buttonsX);
  Vue.component('ButtonsItem', buttonsX.Item);
  Vue.component('ButtonsMenu', buttonsX.Menu);
  Vue.component('MenuAround', menuAround);
  Vue.component('dytStoreSelect', dytStoreSelect);
  /* ---end */
  Vue.component('tbEditTheme', editTheme);
  Vue.component('dytSelect', dytSelect);
  Vue.component('dytFilter', dytFilter);
  Vue.component('dytUpload', dytUpload);
  Vue.component('dytInput', dytInput);
  Vue.component('dytViewUpload', dytViewUpload);
  Vue.component('dyt-inputNumber', dytInputNumber);
  Vue.component('dyt-inputTag', dytInputTag);
  Vue.component('dyt-input-tag', dytInputTag);
  Vue.component('dyt-ellipsis', dytEllipsis);
  Vue.component('dyt-textarea', dytTextarea);
  Vue.component('order-label-tag', orderLabelTag);
  Vue.component('dyt-page', dytPage);
  Vue.component('dyt-sortBySelect', dytSortBySelect);
  Vue.component('dyt-previewImg', dytPreviewImg);
  Vue.component('dyt-mulSearch', dytMulSearch);
};
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}
Vue.use(install);
