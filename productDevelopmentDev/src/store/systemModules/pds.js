// import Vue from "vue";
import axios from "axios";
import api from "@/api/api";

export default {
  state: {
    perfectEdit: false, // 已询价商品 编辑流程
    menuList: "",
    roleList: {}, // 页面权限
    richTextContent: "", // 富文本编辑内容
    createId: "", // productId
    demandIsOpen: false, // 公共弹窗显示状态发生变化时触发
    flowInstance: [], // 流程对象
    curNodeId: null, // 流程id    assignStatus 0 待提交需求 1 待审核需求 2 待分配询价 3 待完成询价 4 待审核询价 5 待生成sku 6 待完善产品资料（处理图片、处理描述、取样）999
    curNodeControl: null, //  999 查看 null
    productCurNodeId: null, // 取样流程id
    pictureCurNodeId: null, // 图片流程id
    descriptionCurNodeId: null, // 描述流程id
    addSupplierType: "",
    demandBoxIndex: 0,
    editTalg: false,
    downIndex: [
      {
        index: 0,
        href: ""
      }
    ],
    imgList: [], // 图片列表
    isCheckedSendErp: 0,
    is1688: false, // 是否显示1688下单
    orderState: false, // 是否显示1688订单状态
    product1688Url: "", // 1688产品链接
    purchaseId: "", // 样品采购ID
    userInfo: null,
    sendSaleStatus: null, // 是否推送
    sendToListing: null, // 是否推送listing
    purchaseUserList: [], // 采购人
    developerUserList: [], // 开发员
    /* -new */
    addNewRoleStatus: false, // 添加员工触发状态
    addEmployeeStatus: false, // 添加员工触发状态
    platformGroup: null,
    currencyList: [], // 币种
    inquiryList: [], // 供应商列表
    isEditInquiry: true, // 是否处于编辑状态
    isListInquiry: false, // 不可编辑
    quotationId: "",
    saleStatus: 0, // 状态 0未试卖  1试卖  2销售
    listData: {},
    platAuth: {
      ali: false,
      amazon: false,
      wish: false
    },
    hiddenTable: false,
    erpConfig: null,
    ierpStatus: null,
    msgDetailBoxStatus: "",
    currencyExchangeInfo: {}, // 汇率信息
    warehouseAndEnableShipMethod: {},
    baseInfo: {},
    ADDOREDITSTATUS: "",
    spanLeft: 4,
    fullScreen: false,
    clickStatus: false,
    timezoomChange: "", // 时区改变的监听
    breadMenu: {
      firstMenu: "",
      subMenu: [
        {
          link: "",
          name: "",
          index: ""
        }
      ]
    },
    active: "",
    inGroup: "", // 当前所在业务、
    inGroupId: "",
    thisPage: "", // 当前所在页面
    userInfoList: [],
    labelList: [], // 特性标签
    // 请求缓存
    pendingList: new Map(),
    erpAllInfo: {},//erp系统全部信息
    erpRequestHeaders: {}, // erp cookie 头部信息
    dytRequestHeaders: {}, // dyt cookie 头部信息
    authUserInfo: {}, // 认证中心用户信息
  },
  mutations: {
    roleList (state, data) {
      state.roleList = data;
    },
    setMenuKey (state, data) { // 新员工保存状态通信
      state.menuKey = data;
    },
    labelList(state, data) {
      state.labelList = data;
    },
    ierpStatus(state, data) {
      state.ierpStatus = data;
    },
    erpConfig(state, data) {
      state.erpConfig = data;
    },
    userInfoList(state, data) {
      state.userInfoList = data;
    },
    perfectEdit: function (state, data) {
      state.perfectEdit = data;
    },
    imgList: function (state, data) {
      state.imgList = data;
    },
    menuList: function (state, data) {
      state.menuList = data;
    },
    sendSaleStatus: function (state, data) {
      state.sendSaleStatus = data;
    },
    purchaseUserList: function (state, data) {
      state.purchaseUserList = data;
    },
    developerUserList: function (state, data) {
      state.developerUserList = data;
    },
    sendToListing: function (state, data) {
      state.sendToListing = data;
    },
    userInfo: function (state, data) {
      // 用户信息
      state.userInfo = data;
    },
    isCheckedSendErp: function (state, data) {
      // 用户信息
      state.isCheckedSendErp = data;
    },
    ADDOREDITSTATUS: function (state, data) {
      // 用户信息
      state.ADDOREDITSTATUS = data;
    },
    spanLeft: function (state, data) {
      // 左侧距离数据
      state.spanLeft = data;
    },
    inGroup: function (state, data) {
      // 左侧距离数据
      state.inGroup = data;
    },
    thisPage: function (state, data) {
      // 左侧距离数据
      state.thisPage = data;
    },
    timezoomChange: function (state, data) {
      // 左侧距离数据
      state.timezoomChange = data;
    },
    fullScreen: function (state, data) {
      // 左侧距离数据
      state.fullScreen = data;
    },
    clickStatus: function (state, data) {
      // 左侧距离数据
      state.clickStatus = data;
    },
    active: function (state, data) {
      // 左侧距离数据
      state.active = data;
    },
    breadMenu: function (state, data) {
      // 左侧距离数据
      state.breadMenu = data;
    },
    inGroupId: function (state, data) {
      // 左侧距离数据
      state.inGroupId = data;
    },
    msgDetailBoxStatus: function (state, data) {
      // 左侧距离数据
      state.msgDetailBoxStatus = data;
    },
    richTextContent(state, data) {
      state.richTextContent = data;
    },
    set1688State(state, data) {
      state.is1688 = data;
    },
    product1688Url(state, data) {
      state.product1688Url = data;
    },
    orderState(state, data) {
      state.orderState = data;
    },
    purchaseId(state, data) {
      state.purchaseId = data;
    },
    createId(state, data) {
      state.createId = data;
    },
    demandIsOpen(state, data) {
      state.demandIsOpen = data;
    },
    flowInstance(state, data) {
      state.flowInstance = data;
    },
    curNodeId(state, data) {
      state.curNodeId = data;
    },
    hiddenTable(state, data) {
      state.hiddenTable = data;
    },
    curNodeControl(state, data) {
      state.curNodeControl = data;
    },
    productCurNodeId(state, data) {
      state.productCurNodeId = data;
    },
    pictureCurNodeId(state, data) {
      state.pictureCurNodeId = data;
    },
    descriptionCurNodeId(state, data) {
      state.descriptionCurNodeId = data;
    },
    addSupplierType(state, data) {
      state.addSupplierType = data;
    },
    demandBoxIndex(state, data) {
      state.demandBoxIndex = data;
    },
    editTalg(state, data) {
      state.editTalg = data;
    },
    downIndex(state, data) {
      state.downIndex = data;
    },
    addNewRoleStatus(state, data) {
      // 新角色保存状态通信
      state.addNewRoleStatus = data;
    },
    addEmployeeStatus(state, data) {
      // 新角色保存状态通信
      state.addEmployeeStatus = data;
    },
    platformGroup(state, data) {
      state.platformGroup = data;
    },
    currencyList(state, data) {
      state.currencyList = data;
    },
    inquiryList(state, data) {
      state.inquiryList = data;
    },
    isEditInquiry(state, data) {
      state.isEditInquiry = data;
    },
    isListInquiry(state, data) {
      state.isListInquiry = data;
    },
    quotationId(state, data) {
      state.quotationId = data;
    },
    listData(state, data) {
      state.listData = data;
    },
    platAuth: function (state, data) {
      state.platAuth = data;
    },
    currencyExchangeInfo: function (state, data) {
      state.currencyExchangeInfo = data;
    },
    warehouseAndEnableShipMethod: function (state, data) {
      state.warehouseAndEnableShipMethod = data;
    },
    baseInfo: function (state, data) {
      state.baseInfo = data;
    },
    saleStatus: function (state, data) {
      state.saleStatus = data;
    },
    SET_ERPALLINFO(state, data) {
      state.erpAllInfo = data;
    },
    erpRequestHeaders (state, data) {
      state.erpRequestHeaders = data;
    },
    dytRequestHeaders (state, data) {
      state.dytRequestHeaders = data;
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
    },
    authUserInfo(state, data) {
      state.authUserInfo = data;
    },
  },
  actions: {
    async getUserName({ commit }, params) {
      try {
        const userInfoRs = await axios.post(api.userInfo + params);
        if (userInfoRs && userInfoRs.code === 0) {
          sessionStorage.setItem("userInfoName", userInfoRs.datas.userName);
          commit("userInfo", userInfoRs.datas);
          commit("userInfoName", userInfoRs.datas);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async currencyExchangeInfo({ commit }) {
      try {
        var exchangeData = await axios.post(api.getCurrencyExchangeInfo);
        if (exchangeData && exchangeData.code === 0) {
          commit("currencyExchangeInfo", exchangeData.datas);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async sendProductInfoToErp(params) {
      try {
        var exchangeData = await axios.post(api.sendProductInfoToErp, params);
      } catch (err) {
        return Promise.reject(err);
      }
      return exchangeData
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
    // 页面权限
    ruleKey (state) {
      return state.roleList
    }
  }
};
