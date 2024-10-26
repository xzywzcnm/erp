import Vuex from 'vuex';
import Vue from 'vue';
import common from '@/utils/common';
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

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    setMenuKey: '',
    language: 'zh-CH',
    menuJson: '',
    spanLeft: 4,
    fullScreen: false,
    token: null,
    ticket: '',
    openNames: ['1'],
    roleList: [],
    isAdmin: false,
    clickStatus: false,
    timezoom: getDefaultTimezoom(), // 时区存储
    active: '2-21', // 左侧菜单当前所在页
    inGroup: 'index', // 当前所在业务、
    inGroupId: '', // 当前所在业务的ID
    thisPage: '', // 当前所在页面
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
    timezoomChange: '', // 时区改变的监听
    category: null,
    richTextContent: '', // 富文本编辑内容
    userName: '',
    userId: '',
    isShowStrategyModal: false,
    printData: [],
    addEmployeeStatus: '',
    addNewRoleStatus: '',
    ADDOREDITSTATUS: '',
    pageShow: '',
    menuStatus: false,
    ierpDomain: '',
    purchaseMode: '', // 采购模式： 1常规模式， 2：快捷模式
    imgUrl: '', // 图片前缀
    allUser: [], // 所有用户
    userInfo: {}, // 用户信息
    roleData: [], // 菜单权限
    businessDeptList: [], // 事业部数据
    // 请求缓存
    pendingList: new Map(),
    authUserInfo: {}, // 认证中心用户信息
    erpRequestHeaders: {}, // erp cookie 头部信息
    dytRequestHeaders: {}, // dyt cookie 头部信息
    isEsc: true,//是否可以esc
    comingSpecialList: [],
  },
  mutations: {
    // 添加请求到登录列表里
    pushPending(state, data) {
      state.pendingList.set(data.requestKey, data.cancel);
    },
    // 移除等待中的请求
    deletePending(state, data) {
      state.pendingList.delete(data);
    },
    // 取消所有等待中的请求
    cancelAllPending(state, data = '该请求被主动取消') {
      for (let [key, value] of state.pendingList) {
        // 取消
        value(`${data}: ${key}`);
        // 移除
        state.pendingList.delete(key);
      }
    },
    setMenuKey(state, data) {
      state.setMenuKey = data;
    },
    userInfo(state, data) {
      state.userInfo = data;
    },
    allUser(state, data) {
      state.allUser = data;
    },
    isAdmin(state, data) {
      state.isAdmin = data;
    },
    ierpDomain(state, data) {
      state.ierpDomain = data;
    },
    roleList(state, data) {
      state.roleList = data;
    },
    imgUrl: function (state, data) { // 左侧菜单数据
      state.imgUrl = data;
    },
    menuJson: function (state, data) { // 左侧菜单数据
      state.menuJson = data;
    },
    spanLeft: function (state, data) { // 左侧距离数据
      state.spanLeft = data;
    },
    breadMenu: function (state, data) { // 面包屑数据
      state.breadMenu = data;
    },
    token: function (state, data) { // token数据
      state.token = data;
    },
    ticket: function (state, data) { // ticket数据
      state.ticket = data;
    },
    inGroup: function (state, data) { // 当前所在业务
      state.inGroup = data;
    },
    thisPage: function (state, data) { // 当前所在页面
      state.thisPage = data;
    },
    inGroupId: function (state, data) {
      state.inGroupId = data;
    },
    active: function (state, data) {
      state.active = data;
    },
    fullScreen: function (state, data) { // 新权限保存状态通信
      state.fullScreen = data;
    },
    timezoomChange: function (state, data) {
      state.timezoomChange = data;
    },
    clickStatus: function (state, data) {
      state.clickStatus = data;
    },
    openNames: function (state, data) {
      state.openNames = data;
    },
    category: function (state, data) {
      state.category = data;
    },
    richTextContent: function (state, data) {
      state.richTextContent = data;
    },
    userName: function (state, data) {
      state.userName = data;
    },
    userId: function (state, data) {
      state.userId = data;
    },
    isShowStrategyModal: function (state, data) {
      state.isShowStrategyModal = data;
    },
    printData: function (state, data) {
      state.printData = data;
    },
    addEmployeeStatus: function (state, data) {
      state.addEmployeeStatus = data;
    },
    addNewRoleStatus: function (state, data) {
      state.addNewRoleStatus = data;
    },
    ADDOREDITSTATUS: function (state, data) {
      state.ADDOREDITSTATUS = data;
    },
    pageShow: function (state, data) {
      state.pageShow = data;
    },
    menuStatus: function (state, data) {
      state.menuStatus = data;
    },
    purchaseMode: function (state, data) {
      state.purchaseMode = data;
    },
    roleData(state, data) {
      state.roleData = data;
    },
    authUserInfo(state, data) {
      state.authUserInfo = data;
    },
    businessDeptList(state, data) {
      state.businessDeptList = data;
    },
    erpRequestHeaders(state, data) {
      state.erpRequestHeaders = data;
    },
    dytRequestHeaders(state, data) {
      state.dytRequestHeaders = data;
    },
    isEsc(state, data) {
      state.isEsc = data;
    },
    SET_COMINGSPECIAL(state, data) {
      state.comingSpecialList = data;
    },
  },
  getters: {
    // 返回等待中的请求
    getPendingList(state) {
      return state.pendingList;
    },
    // 登录用户信息
    authUserInfo(state) {
      return state.authUserInfo
    },
    // 所有事业部信息
    businessDeptList(state) {
      return state.businessDeptList || []
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
      return (state.businessDeptList || []).filter(item => {
        return businessIds.includes(item.id);
      });
    },
    // erp cookie 头部信息
    erpRequestHeaders(state) {
      return state.erpRequestHeaders
    },
    // dyt cookie 头部信息
    dytRequestHeaders(state) {
      return state.dytRequestHeaders
    },
    isEsc(state) {
      return state.isEsc
    }
  },
  actions: {
    // 获取来货特项
    getComingSpecialList({ state, commit }) {
      return new Promise((resolve, reject) => {
        let list = state.comingSpecialList;
        if (Object.keys(list).length) return resolve(list);
        axios.post(api.queryComingSpecial).then(({ data }) => {
          if (data.code !== 0) return;
          let comingSpecialList = data.datas || {};
          commit('SET_COMINGSPECIAL', comingSpecialList);
          resolve(comingSpecialList);
        }).catch(err => {
          reject(err);
        })
      });
    },
  }
});
