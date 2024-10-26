import axios from 'axios';
import api from '@/api/api';
import common from '@/utils/common.js';
export default {
  state: {
    addWareHouseStatus: false,
    wareSetWatchFlag: false,
    addWareAreaStatus: false,
    wareAreaWatchFlag: false,
    addWareLocateStatus: false,
    wareLocateWatchFlag: false,
    groupWorkShow: 'list', // 入库单管理
    tableShow: 'starts',
    moveOrderShow: 'move', // 库存移动
    adjustOrderShow: 'adjust', // 库存调整
    adjustDetailWatchFlag: false,
    adjustDetailTableShow: 'noCheck', // 未审核表格显示
    freezeOrderShow: 'freeze', // 库存冻结
    scanOrderShow: 'scan', // 库存盘点
    addScanWatchFlag: false, // 新增库存盘点单数据清除
    transferOrderShow: 'transfer', // 库存调拨
    messageTipsDuration: 10,
    warehouseId: null, // 仓库ID
    warehouseList: [], // 所有仓库
    imgUrlPrefix: '',
    userInfo: '',
    otherStockInfo: null, // 库存调拨跳转其他出库单详情参数
    printSkuModal: false,
    activeRow: null,
    positionList: [], // 库位
    userInfoList: [],
    shippingMethodData: [], // 物流方式
    operationLog: [], // 出库单的操作日志
    badgeStatus: false, // true 刷新角标
    pickingFlag: '1', // 库位使用 null 全部  0：作为收货库位 1：作为拣货库位
    pickingType: '', // 其他出库单--出库单类型
    supplierList: [], // 供应商列表
    purchaserList: {}, // 采购员列表
    qualityPersonList: {}, // 质检员列表
    selfPreviewDialog: false, // 自定义图片弹框
    comingSpecialList: [],
    allStoreList: {}, // 所有平台的店铺列表
    allPlatformList: [], // 所有的平台
    reservoirList: [], // 库区组
    logisticsList: [], // 快递公司
    thirdWarehouse: false, // 第三方仓库
  },
  getters: {
    userInfoList: state => {
      let arr = [];
      for (let key in state.userInfoList) {
        arr.push({
          ...state.userInfoList[key]
        });
      }
      return arr;
    },
    // 获取自定义图片弹框
    getSelfPreviewDialog: state => {
      return state.selfPreviewDialog;
    },
    // 是否为第三方仓库
    getIsThird: state => {
      return state.thirdWarehouse;
    }
  },
  mutations: {
    pickingType(state, data) {
      state.pickingType = data;
    },
    pickingFlag(state, data) {
      state.pickingFlag = data;
    },
    shippingMethodData(state, data) {
      state.shippingMethodData = data;
    },
    operationLog(state, data) {
      state.operationLog = data;
    },
    userInfoList(state, data) {
      state.userInfoList = data;
    },
    activeRow(state, data) {
      state.activeRow = data;
    },
    printSkuModal(state, data) {
      // 仓库设置
      state.printSkuModal = data;
    },
    addWareHouseStatus(state, data) {
      // 仓库设置
      state.addWareHouseStatus = data;
    },
    wareSetWatchFlag(state, data) {
      // 仓库设置监听
      state.wareSetWatchFlag = data;
    },
    addWareAreaStatus(state, data) {
      // 库区管理
      state.addWareAreaStatus = data;
    },
    wareAreaWatchFlag(state, data) {
      // 库区管理监听
      state.wareAreaWatchFlag = data;
    },
    addWareLocateStatus(state, data) {
      // 库位管理
      state.addWareLocateStatus = data;
    },
    wareLocateWatchFlag(state, data) {
      // 库位管理监听
      state.wareLocateWatchFlag = data;
    },
    groupWorkShow(state, data) {
      state.groupWorkShow = data;
    },
    tableShow(state, data) {
      state.tableShow = data;
    },
    moveOrderShow(state, data) {
      state.moveOrderShow = data;
    },
    adjustOrderShow(state, data) {
      state.adjustOrderShow = data;
    },
    adjustDetailWatchFlag(state, data) {
      state.adjustDetailWatchFlag = data;
    },
    adjustDetailTableShow(state, data) {
      state.adjustDetailTableShow = data;
    },
    freezeOrderShow(state, data) {
      state.freezeOrderShow = data;
    },
    scanOrderShow(state, data) {
      state.scanOrderShow = data;
    },
    transferOrderShow(state, data) {
      state.transferOrderShow = data;
    },
    addScanWatchFlag(state, data) {
      state.addScanWatchFlag = data;
    },
    warehouseId(state, data) {
      state.warehouseId = data;
    },
    warehouseList(state, data) {
      state.warehouseList = data;
    },
    imgUrlPrefix(state, data) {
      state.imgUrlPrefix = data;
    },
    userInfo(state, data) {
      state.userInfo = data;
    },
    otherStockInfo(state, data) {
      state.otherStockInfo = data;
    },
    positionList(state, data) {
      state.positionList = data;
    },
    badgeStatus(state, data) {
      state.badgeStatus = data;
    },
    // 设置供应商列表
    SET_SUPPLIERLIST(state, data) {
      state.supplierList = data;
    },
    // 设置采购员列表
    SET_PURCHASERLIST(state, data) {
      state.purchaserList = data;
    },
    // 设置质检员列表
    SET_QUALITYPERSONLIST(state, data) {
      state.qualityPersonList = data;
    },
    // 设置图片弹框是否显示
    SET_SELFPREVIEWDIALOG(state, data) {
      state.selfPreviewDialog = data;
    },
    SET_COMINGSPECIAL(state, data) {
      state.comingSpecialList = data;
    },
    // 设置平台店铺列表
    SET_ALLSTORELIST(state, data) {
      state.allStoreList = data;
    },
    // 设置平台列表
    SET_ALLPLATFORMLIST(state, data) {
      state.allPlatformList = data;
    },
    // 设置库区组
    SET_RESERVOIRLIST(state, data) {
      state.reservoirList = data;
    },
    // 设置快递公司
    SET_LOGISTICSLIST(state, data) {
      state.logisticsList = data;
    },
    // 是否第三方仓库
    set_thirdWarehouse (state, data) {
      state.thirdWarehouse = data;
    },
  },
  actions: {
    // 获取供应商列表
    getSupplierList({ state, commit }) {
      return new Promise((resolve, reject) => {
        let list = state.supplierList;
        if (list && list.length) return resolve(list);
        axios.get(api.quality_getSupplierList, { hiddenError: true }).then(({ data }) => {
          if (data.code !== 0) return;
          let supplierList = data.datas || [];
          commit('SET_SUPPLIERLIST', supplierList);
          resolve(supplierList);
        }).catch(err => {
          reject(err);
        })
      });
    },
    // 获取采购员列表
    getPurchaserList({ state, commit }) {
      return new Promise((resolve, reject) => {
        let list = state.purchaserList;
        if (Object.keys(list).length) return resolve(list);
        axios.get(api.get_userInfoCommon).then(({ data }) => {
          if (data.code !== 0) return;
          let purchaserList = data.datas || {};
          commit('SET_PURCHASERLIST', purchaserList);
          resolve(purchaserList);
        }).catch(err => {
          reject(err);
        })
      });
    },
    // 获取仓库列表
    getWarehouseList({ state, commit }) {
      return new Promise((resolve, reject) => {
        let list = state.warehouseList;
        if (list && list.length) return resolve(list);
        let userInfo = state.userInfo;
        let obj = {
          merchantId: userInfo.merchantId,
          userId: userInfo.userId,
          warehouseStatus: '0'
        };
        axios.post(api.queryAllwarehouse, JSON.stringify(obj)).then(({ data }) => {
          if (data.code !== 0) return;
          let warehouseList = data.datas || [];
          commit('warehouseList', warehouseList);
          resolve(warehouseList);
        }).catch(err => {
          reject(err);
        })
      });
    },
    // 获取质检人列表
    getQualityPersonList({ state, commit }) {
      return new Promise((resolve, reject) => {
        let list = state.qualityPersonList;
        if (list && list.length) return resolve(list);
        axios.post(api.get_qualityPersonName).then(({ data }) => {
          if (data.code !== 0) return;
          let qualityPersonList = data.datas || [];
          commit('SET_QUALITYPERSONLIST', qualityPersonList);
          resolve(qualityPersonList);
        }).catch(err => {
          reject(err);
        })
      });
    },
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
    // 获取所有平台
    getAllPlatformList({ state, commit }, params = {}) {
      return new Promise((resolve, reject) => {
        let { fresh } = params;
        let data = state.allPlatformList || [];
        if (!fresh && !common.isEmpty(data)) {
          return resolve(data);
        }
        axios.get(api.queryPlatformId).then(({ data }) => {
          if (data.code !== 0) return reject(data);
          let list = data.datas || [];
          commit('SET_ALLPLATFORMLIST', list);
          resolve(list);
        }).catch(err => {
          reject(err);
        })
      });
    },
    /**
     * 获取对应平台的店铺列表
     * platformIds 平台
     * fresh 是否刷新
     * */
    getAllStoreList({ state, commit }, params = {}) {
      return new Promise((resolve, reject) => {
        let { platformId, fresh } = params;
        if (!platformId) return resolve([]);
        let storeList = state.allStoreList || {};
        if (!fresh && !common.isEmpty(storeList[platformId])) {
          return resolve(storeList[platformId]);
        }
        axios.get(api.queryAccountByPlatformId, { params: { platformId } }).then(({ data }) => {
          if (data.code !== 0) return reject(data);
          storeList[platformId] = data.datas || [];
          commit('SET_ALLSTORELIST', storeList);
          resolve(storeList[platformId]);
        }).catch(err => {
          reject(err);
        })
      });
    },
    /**
   * 获取库区组列表
   * warehouseId 仓库id
   * */
    getReservoirList({ state, commit }, params = {}) {
      return new Promise((resolve, reject) => {
        if (Array.isArray(state.reservoirList) && state.reservoirList.length) {
          return resolve(state.reservoirList);
        }
        let { warehouseId } = params;
        if (!warehouseId) return resolve([]);
        axios.get(api.get_queryEnableBlockGroup + '/' + warehouseId).then(({ data }) => {
          if (data.code !== 0) return reject(data);
          let reservoirList = data.datas || [];
          commit('SET_RESERVOIRLIST', reservoirList);
          resolve(reservoirList);
        }).catch(err => {
          reject(err);
        })
      });
    },
    /**
    * 获取快递公司
    * hiddenError：忽略接口报错
    * */
    getLogisticsList({ state, commit }, params = {}) {
      return new Promise((resolve, reject) => {
        if (Array.isArray(state.logisticsList) && state.logisticsList.length) {
          return resolve(state.logisticsList);
        }
        axios.post(api.get_logistics, {}, { hiddenError: true }).then(({ data }) => {
          if (data.code !== 0) return reject(data);
          let logisticsList = data.datas || [];
          commit('SET_LOGISTICSLIST', logisticsList);
          resolve(logisticsList);
        }).catch(err => {
          reject(err);
        })
      });
    },
  }
};
