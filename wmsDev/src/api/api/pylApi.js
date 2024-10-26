let api = {
  pylStoreQuery: '/packageInfo/pylStoreQuery', // 出库单检索
  getPylStorePackageStatus: '/packageInfo/getPylStorePackageStatus/', // 获取包裹状态
  batchPylStorePackageStatus: '/packageInfo/batchPylStorePackageStatus', // 批量获取包裹状态
  batchUploadPylStorePackage: '/packageInfo/batchUploadPylStorePackage', // 批量上传包裹
  uploadPylStorePackage: '/packageInfo/uploadPylStorePackage/', // 上传包裹
  queryPylSalesPackageDetail: '/wmsPicking/queryPylSalesPackageDetail' // 查询出库单明细
};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
