let api = {
  wmsOutstoreProductInfoQuery: '/wmsOutstoreProductInfo/query', // 商品列表
  fourRelated: '/wmsOutstoreProductInfo/related', // 关联SKU
  wmsOutstoreProductInfoSync: '/wmsOutstoreProductInfo/sync', // 同步
  wmsOutstoreProductInfoSkuRelatedImport: '/wmsOutstoreProductInfo/skuRelatedImport', // 导入SKU关联
  wmsOutstoreProductInfoExport: '/wmsOutstoreProductInfo/export', // 导出

  wmsOutstoreInventoryQuery: '/wmsOutstoreInventory/query', // 库存列表
  wmsOutstoreInventorySync: '/wmsOutstoreInventory/sync', // 同步
  wmsOutstoreInventoryExport: '/wmsOutstoreInventory/export', // 导出

  packageInfoOutstoreQuery: '/packageInfo/outstoreQuery', // 出库单检索
  packageInfoGetOutstorePackageStatus: '/packageInfo/getOutstorePackageStatus/', // 获取包裹状态
  packageInfoBatchOutstorePackageStatus: '/packageInfo/batchOutstorePackageStatus', // 批量获取包裹状态
  packageInfoBatchUploadOutstorePackage: '/packageInfo/batchUploadOutstorePackage', // 批量上传包裹
  packageInfoUploadOutstorePackage: '/packageInfo/uploadOutstorePackage/', // 上传包裹
};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
