let api = {
  // 云仓
  get_cloudProductList: '/wmsOutstoreProductInfo/query', // 云仓商品管理-查询商品列表
  put_cloudProductRelated: '/wmsOutstoreProductInfo/related', // 云仓商品关联LAPA SKU
  put_cloudProductSync: '/wmsOutstoreProductInfo/sync', // 同步商品
  import_wmsCloudProductInfo: '/wmsOutstoreProductInfo/skuRelatedImport', // 云仓sku关联导入
  export_wmsOutstoreProductInfoExport: '/wmsOutstoreProductInfo/export', // 导出
  ymscancelRelate: '/wmsOutstoreProductInfo/cancelRelate', // 云仓批量取消关联
  ymsCancelRelateShowCount: '/wmsOutstoreProductInfo/cancelRelateShowCount', // 云仓获取关联sku数量

  query_cloudInventoryList: '/wmsOutstoreInventory/query', // 查询库存列表
  put_cloudInventorySync: '/wmsOutstoreInventory/sync', // 同步库存
  export_wmsOutstoreInventoryExport: '/wmsOutstoreInventory/export', // 导出

  cloudInfoOutstoreQuery: '/packageInfo/outstoreQuery', // 出库单检索
  put_CloudPackageStatus: '/packageInfo/getOutstorePackageStatus/', // 同步发货状态
  put_CloudPackageStatusAll: '/packageInfo/batchOutstorePackageStatus', // 批量同步发货状态
};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
