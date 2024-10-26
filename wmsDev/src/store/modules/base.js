import axios from 'axios';
import api from '@/api/api';
import common from '@/utils/common';
const getDefaultTimezoom = () => { // 获取默认时区
  let timezoom = localStorage.getItem('timezoom');
  if (!isNaN(Number(timezoom)) && timezoom != null) {
    return Number(timezoom);
  }
  const nowDate = new Date();
  const dateISO = nowDate.toISOString().split(/[^0-9]/);
  const dateLocale = nowDate.toLocaleString().split(/[^0-9]/);
  timezoom = Number(dateLocale[3]) - Number(dateISO[3])
  localStorage.setItem('timezoom', timezoom);
  return timezoom;
}

// 封装base store
export default {
  state: {
    roleList: '',
    menuJson: '',
    testArr: [1, 2, 3, 4],
    spanLeft: 4,
    fullScreen: false,
    ticket: '',
    openNames: ['1'],
    clickStatus: false,
    timezoom: getDefaultTimezoom(), // 时区存储
    timezoomChange: '', // 时区改变的监听
    breadMenu: {
      firstMenu: '',
      subMenu: [
        {
          link: '',
          name: '',
          index: ''
        }
      ]
    },
    // 请求缓存
    pendingList: new Map(),
    erpRequestHeaders: {}, // erp cookie 头部信息
    dytRequestHeaders: {}, // dyt cookie 头部信息
    authUserInfo: {}, // 认证中心用户信息
    active: '', // 左侧菜单当前所在页
    inGroup: 'index', // 当前所在业务、
    inGroupId: '', // 当前所在业务的ID
    thisPage: '', // 当前所在页面
    isAdmin: false,
    activeDate: null, // 菜单点击更新
    erpConfig: null, // 获取ERP公共配置
    businessDept: [], // 所有事业部列表
    roleData: [], // 菜单权限
    activeName: ''// 菜单激活
  },
  mutations: {
    roleList (state, data) {
      state.roleList = data;
    },
    menuJson (state, data) {
      // 左侧菜单数据
      state.menuJson = data;
    },
    testArr (state, data) {
      // 左侧距离数据
      state.spanLeft = data;
    },
    spanLeft (state, data) {
      // 左侧距离数据
      state.spanLeft = data;
    },
    ticket (state, data) {
      // ticket数据
      state.ticket = data;
    },
    fullScreen (state, data) {
      // 新权限保存状态通信
      state.fullScreen = data;
    },
    openNames (state, data) {
      state.openNames = data;
    },
    clickStatus (state, data) {
      state.clickStatus = data;
    },
    timezoomChange (state, data) {
      state.timezoomChange = data;
    },
    active (state, data) {
      state.active = data;
    },
    inGroup (state, data) {
      // 当前所在业务
      console.log('data:', data);
      state.inGroup = data;
    },
    inGroupId (state, data) {
      state.inGroupId = data;
    },
    thisPage (state, data) {
      // 当前所在页面
      state.thisPage = data;
    },
    breadMenu (state, data) {
      // 面包屑数据
      state.breadMenu = data;
    },
    isAdmin (state, data) {
      state.isAdmin = data;
    },
    erpConfig (state, data) {
      state.erpConfig = data;
    },
    activeDate (state, data) {
      state.activeDate = data;
    },
    roleData (state, data) {
      state.roleData = data;
    },
    authUserInfo (state, data) {
      state.authUserInfo = data;
    },
    erpRequestHeaders (state, data) {
      state.erpRequestHeaders = data;
    },
    dytRequestHeaders (state, data) {
      state.dytRequestHeaders = data;
    },
    activeName (state, data) {
      state.activeName = data;
    },
    SET_BUSINESSDEPT (state, data) {
      state.businessDept = data;
    },
    // 添加请求到登录列表里
    pushPending (state, data) {
      state.pendingList.set(data.requestKey, data.cancel);
    },
    // 移除等待中的请求
    deletePending (state, data) {
      state.pendingList.delete(data);
    },
    // 取消所有等待中的请求
    cancelAllPending (state, data = '该请求被主动取消') {
      for (let [key, value] of state.pendingList) {
      // 取消
        value(`${data}: ${key}`);
        // 移除
        state.pendingList.delete(key);
      }
    }
  },
  actions: {
    // this.$store.dispatch('getBusinessDept').then(res => {})
    // 获取事业部
    getBusinessDept ({ state, commit }) {
      return new Promise((resolve, reject) => {
        if (state.businessDept && state.businessDept.length > 0) return resolve(state.businessDept);
        axios.get(api.get_businessDept, { hiddenError: true }).then((res) => {
          if (res && res.data && res.data.status === 200) {
            let businessDept = res.data.data || [];
            commit('SET_BUSINESSDEPT', businessDept);
            resolve(businessDept);
          }
        }).catch(err => {
          reject(err);
        })
      })
    }
  },
  getters: {
    // 返回等待中的请求
    getPendingList (state) {
      return state.pendingList;
    },
    authUserInfo (state) {
      return state.authUserInfo
    },
    erpRequestHeaders (state) {
      return state.erpRequestHeaders
    },
    dytRequestHeaders (state) {
      return state.dytRequestHeaders
    },
    // 所有事业部
    getBusinessDeptList (state) {
      if (!state.businessDept) return [];
      return state.businessDept;
    },
    // 当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds(state) {
      if (common.isEmpty(state.authUserInfo) || common.isEmpty(state.authUserInfo.securityUser)) return [];
      let businessIds = (state.authUserInfo.securityUser.businessDeptIds || '').split(',');
      let nowId = null;
      return businessIds.map(id => {
        nowId = Number(id);
        return common.isEmpty(nowId) ? id : nowId;
      });
    },
    // 当前登录账号可查看的事业部信息
    allowBusinessDept(state) {
      if (common.isEmpty(state.authUserInfo) || common.isEmpty(state.authUserInfo.securityUser)) return [];
      let businessIds = (state.authUserInfo.securityUser.businessDeptIds || '').split(',');
      let nowId = null;
      businessIds = businessIds.map(id => {
        nowId = Number(id);
        return common.isEmpty(nowId) ? id : nowId;
      });
      return (state.businessDept || []).filter(item => {
        return businessIds.includes(item.id);
      });
    },
    // 启用的事业部
    getEnableBusinessDept (state) {
      if (!state.businessDept || state.businessDept.length == 0) return [];
      return state.businessDept.filter(f => [1, '1'].includes(f.enable));
    },
    // 未启用的事业部
    getNotEnableBusinessDept (state) {
      if (!state.businessDept || state.businessDept.length == 0) return [];
      return state.businessDept.filter(f => [0, '0'].includes(f.enable));
    }
  }
};
