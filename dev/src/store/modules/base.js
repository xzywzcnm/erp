// 封装base store
import axios from 'axios';
import api from '@/api/api';
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
export default {
  state: {
    roleList: '', // 页面权限
    menuJson: '',
    testArr: [1, 2, 3, 4],
    spanLeft: 4, // 左侧距离数据
    fullScreen: false, // 是否关闭左侧菜单
    ticket: '',
    openNames: ['1'], // 菜单 open-names
    clickStatus: false, // 左侧菜单高亮状态控制
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
    active: '', // 左侧菜单当前所在页
    inGroup: 'index', // 当前所在业务、
    fullInGroup: null, // 只在全局搜索时使用的所在页面
    inGroupId: '', // 当前所在业务的ID
    thisPage: '', // 当前所在页面
    isAdmin: false,
    businessDept: [], // 所有事业部列表
    menuQuery: null
  },
  mutations: {
    roleList (state, data) {
      state.roleList = data;
    },
    menuJson (state, data) { // 左侧菜单数据
      state.menuJson = data;
    },
    testArr (state, data) { // 左侧距离数据
      state.spanLeft = data;
    },
    spanLeft (state, data) { // 左侧距离数据
      state.spanLeft = data;
    },
    ticket (state, data) { // ticket数据
      state.ticket = data;
    },
    fullScreen (state, data) { // 新权限保存状态通信
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
    inGroup (state, data) { // 当前所在业务
      state.inGroup = data;
    },
    fullInGroup (state, data) { // 当前所在业务
      state.fullInGroup = data;
    },
    inGroupId (state, data) {
      state.inGroupId = data;
    },
    thisPage (state, data) { // 当前所在页面
      state.thisPage = data;
    },
    breadMenu (state, data) { // 面包屑数据
      state.breadMenu = data;
    },
    isAdmin (state, data) {
      state.isAdmin = data;
    },
    menuQuery (state, data) {
      state.menuQuery = data;
    },
    SET_BUSINESSDEPT (state, data) {
      state.businessDept = data;
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
    // 所有事业部
    getBusinessDeptList (state) {
      if (!state.businessDept) return [];
      return state.businessDept;
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
