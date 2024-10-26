import Vue from 'vue';
import iview from 'view-design';
import Vuex from 'vuex';
import Axios from './request';
import 'view-design/dist/styles/iview.css?v=1.0.0';
import '@/assets/css/common.less';
import './bus';

Vue.prototype.$axios = Axios;
Vue.use(iview);
Vue.use(Vuex);

