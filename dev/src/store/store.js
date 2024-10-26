import Vuex from 'vuex';
import Vue from 'vue';
import token from './modules/token';
import base from './modules/base';
import cs from './modules/cs';
import common from './modules/common';

Vue.use(Vuex);
let obj = {
  state: {
    ...cs.state,
    ...base.state,
    addNewRoleStatus: false, // 添加员工触发状态
    addEmployeeStatus: false, // 添加员工触发状态
    userInfoList: [],
    bindingResult: false,
    roleData: [], // 菜单权限
    userPlatformRoleData: [], // 当前登录用户下有店铺权限的平台
    erpConfig: null, // 获取ERP公共配置
    platformGroup: null,
    productShow: 'list',
    platformType: 'ebay',
    storeList: [], // 仓库列表
    wareSetWatchFlag: false, // 仓库设置
    wareLocateWatchFlag: false, // 库位
    wareAreaWatchFlag: false, // 库区
    combineStatus: false, // 触发详情可合并更新
    expandRowDetail: [], // ebay站内信点击数据
    platformGroupShow: false, // 设置中心平台店铺  true有平台  false无平台
    shopSiteList: [], // 店铺站点
    menuKey: '',
    authUserInfo: {}, // 认证中心用户信息
    erpRequestHeaders: {}, // erp cookie 头部信息
    dytRequestHeaders: {}, // dyt cookie 头部信息
    category: null,
    categoryData: null,
    tokenEffectiveDate: null,
    // 请求缓存
    pendingList: new Map(),
    commonParameter: [], //  订单详情物流服务
    productCategoryList: null, //  商品分类
    thirdAuthPlatform: [], // 三方平台
    SETTING_CHANNEL: 0, //  0 通用渠道 1 自定义渠道
    customShopData: 123, //  自定义渠道Data
    productFiledSetting: null,
    productFiledSettingSources: null,
    customAttrs: null,
  },
  mutations: {
    ...base.mutations,
    ...cs.mutations,
    // 添加请求到登录列表里
    pushPending (state, data) {
      state.pendingList.set(data.requestKey, data.cancel);
    },
    // 移除等待中的请求
    deletePending (state, data) {
      state.pendingList.delete(data);
    },
    // 单独取消某一个请求（data 为 请求地址）
    cancelPending (state, data) {
      let newKey = '';
      const pendingKeys = state.pendingList.keys();
      for (const key of pendingKeys) {
        newKey = key.substring(key.indexOf('-') + 1, key.length);
        if (newKey == data) {
          state.pendingList.get(key)(`该请求被主动取消：${key}`);
          state.pendingList.delete(key);
        }
      }
    },
    // 取消所有等待中的请求
    cancelAllPending (state, data = '该请求被主动取消') {
      for (let [key, value] of state.pendingList) {
        // 取消
        value(`${data}: ${key}`);
        // 移除
        state.pendingList.delete(key);
      }
    },
    shopSiteList (state, data) {
      state.shopSiteList = data;
    },
    productCategoryList (state, data) {
      state.productCategoryList = data;
    },
    commonParameter (state, data) {
      state.commonParameter = data;
    },
    tokenEffectiveDate (state, data) {
      state.tokenEffectiveDate = data;
    },
    ...cs.mutations,
    category (state, data) { // 分类树数据
      state.category = data;
    },
    categoryData (state, data) { // 分类数据
      state.categoryData = data;
    },
    setMenuKey (state, data) { // 新员工保存状态通信
      state.menuKey = data;
    },
    addEmployeeStatus (state, data) { // 新员工保存状态通信
      state.addEmployeeStatus = data;
    },
    addNewRoleStatus (state, data) { // 新角色保存状态通信
      state.addNewRoleStatus = data;
    },
    userInfoList (state, data) {
      state.userInfoList = data;
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
    bindingResult (state, data) {
      state.bindingResult = data;
    },
    roleData (state, data) {
      state.roleData = data;
    },
    userPlatformRoleData (state, data) {
      state.userPlatformRoleData = data;
    },
    erpConfig (state, data) {
      state.erpConfig = data;
    },
    platformGroup (state, data) {
      state.platformGroup = data;
    },
    productShow (state, data) {
      state.productShow = data;
    },
    platformType (state, data) {
      state.platformType = data;
    },
    storeList (state, data) {
      state.storeList = data;
    },
    wareSetWatchFlag (state, data) { // 仓库设置监听
      state.wareSetWatchFlag = data;
    },
    wareLocateWatchFlag (state, data) { // 仓库设置监听
      state.wareLocateWatchFlag = data;
    },
    wareAreaWatchFlag (state, data) { // 库区设置监听
      state.wareAreaWatchFlag = data;
    },
    combineStatus (state, data) {
      state.combineStatus = data;
    },
    thirdAuthPlatform (state, data) {
      state.thirdAuthPlatform = data;
    },
    expandRowDetail (state, data) {
      state.expandRowDetail = data;
    },
    platformGroupShow (state, data) {
      state.platformGroupShow = data;
    },
    SETTING_CHANNEL (state, data) {
      state.SETTING_CHANNEL = data;
    },
    customShopData (state, data) {
      state.customShopData = data;
    },
    productFiledSetting (state, data) {
      state.productFiledSetting = data;
    },
    productFiledSettingSources (state, data) {
      state.productFiledSettingSources = data;
    },
    customAttrs (state, data) {
      state.customAttrs = data;
    },
  },
  modules: {
    token,
    common
  },
  actions: {
    ...base.actions,
  },
  getters: {
    ...base.getters,
    ...cs.getters,
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
    // 返回等待中的请求
    getPendingList (state) {
      return state.pendingList;
    },
    authUserInfo (state) {
      return state.authUserInfo;
    },
    erpRequestHeaders (state) {
      return state.erpRequestHeaders;
    },
    dytRequestHeaders (state) {
      return state.dytRequestHeaders;
    },
    userPlatformRoleData (state) {
      return state.userPlatformRoleData;
    }
  }
};
export default new Vuex.Store(obj);
