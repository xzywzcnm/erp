// 封装token
import {
  setToken,
  getToken
} from '@/utils/cookie';
import config from '@/config';

export default {
  state: {
    token: getToken(),
    refreshTime: config.token_time
  },
  mutations: {
    setToken (state, token) {
      state.token = token;
      setToken(token);
    }
  },
  actions: {
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        commit('setToken', '');
        resolve();
      });
    },
    setRefreshTime ({ commit }, time) {
      commit('refreshTime', time);
    }
  }
};
