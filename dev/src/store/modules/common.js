import axios from 'axios';
import api from '@/api/api';
import store from '@/store/store';
// 封装base store
export default {
  state: {
    platformGroupList: [], // 平台列表
    allStoreList: []// 所有仓库列表
  },
  mutations: {
    // 平台列表
    SET_PLATFORMGROUP (state, data) {
      state.platformGroupList = data;
    },
    // 仓库列表
    SET_ALLSTORELIST (state, data) {
      state.allStoreList = data;
    }
  },
  actions: {
    // 获取平台列表
    getplatformGroup ({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.platformGroupList.length) {
          resolve(state.platformGroupList);
          return;
        }
        axios.get(api.get_queryByStatus + '?status=1').then(res => {
          if (res && res.data.code === 0) {
            let list = res.data.datas || [];
            commit('SET_PLATFORMGROUP', list);
            resolve(list);
          } else {
            resolve([]);
          }
        // eslint-disable-next-line handle-callback-err
        }).catch(err => {
          resolve([]);
        })
      })
    },
    // 获取所有的仓库列表
    getAllstore ({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.allStoreList && state.allStoreList.length) {
          resolve(state.allStoreList);
          return;
        }
        let prefix = '/order-service/erpCommon';
        const erpCommon = store.state.erpConfig;
        let obj = {
          userId: erpCommon.userInfo.userId,
          merchantId: erpCommon.userInfo.merchantId,
          warehouseStatus: 0// 仓库状态(0正常1禁用null全部)
        };
        axios.post(prefix + api.get_storeList, obj).then(response => {
          if (response.data && response.data.code === 0) {
            let list = response.data.datas || [];
            commit('SET_ALLSTORELIST', list);
            resolve(list);
          } else {
            resolve([]);
          }
        // eslint-disable-next-line handle-callback-err
        }).catch(err => {
          resolve([]);
        })
      });
    }
  }
};
