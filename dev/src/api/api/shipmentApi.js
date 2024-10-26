export default { // 出货模块
  get_pendingData: '/wms-service/packageInfo/queryForWaitingUpload', // 下发物流商待申请列表
  get_unsuccessfulData: '/wms-service/packageInfo/queryForTrackingNumberUncatch', // 下发物流商未获取列表
  get_storeList: '/wms-service/wms/api/warehouse/query/warehouseList' // 仓库列表
};
