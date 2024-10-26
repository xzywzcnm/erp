import Vuex from 'vuex';
import Vue from 'vue';
import token from './modules/token';
import wms from './modules/wms';
import base from './modules/base';

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    ...base.state, ...wms.state
  },
  getters: {
    ...base.getters, ...wms.getters
  },
  mutations: {
    ...base.mutations, ...wms.mutations
  },
  actions: {
    ...wms.actions,
    ...base.actions
  },
  modules: {
    token
  }
});
