import Vuex from "vuex";
import pds from "./systemModules/pds";
import Vue from "vue";
import pic from "./systemModules/pic";
Vue.use(Vuex);

export default new Vuex.Store({
  state: Object.assign({}, pds.state,pic.state),
  mutations: Object.assign({}, pds.mutations,pic.mutations),
  actions: Object.assign({}, pds.actions,pic.actions),
  getters: {
    ...pds.getters, ...pic.getters
  }
});
