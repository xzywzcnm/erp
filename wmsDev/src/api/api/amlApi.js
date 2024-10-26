let api = {
  // 商品-分页查询 http://192.168.91.7:882/project/263/interface/api/15951
  amlQuery: '/wmsAosProductInfo/query',
  // 商品-关联sku http://192.168.91.7:882/project/263/interface/api/15952
  amlRelatedSku: '/wmsAosProductInfo/relatedSku',
  // 商品-导入关联SKu http://192.168.91.7:882/project/263/interface/api/15953
  amlSkuRelatedImport: '/wmsAosProductInfo/skuRelatedImport',
  // 商品-同步商品 http://192.168.91.7:882/project/263/interface/api/15954
  amlSync: '/wmsAosProductInfo/sync',
  // 商品-取消关联 http://192.168.91.7:882/project/263/interface/api/15955
  amlCancelRelate: '/wmsAosProductInfo/cancelRelate',
  // 商品-导出 http://192.168.91.7:882/project/263/interface/api/15956
  amlExport: '/wmsAosProductInfo/export',

  // 库存-分页查询 http://192.168.91.7:882/project/263/interface/api/15957
  amlInventoryQuery: '/wmsAosInventory/query',
  // 库存-同步库存 http://192.168.91.7:882/project/263/interface/api/15958
  amlInventorySync: '/wmsAosInventory/sync',
  // 库存-导出 http://192.168.91.7:882/project/263/interface/api/15959
  amlInventoryExport: '/wmsAosInventory/export',

  // 出库单-分页查询
  amlOutboundQuery: '/packageInfo/aos/query',
  // 出库单-批量向物流商下单
  amlOutboundPackage: '/packageInfo/aos/batchUploadAosPackage',
  // 出库单-同步包裹状态
  amlOutboundPackageStatus: '/packageInfo/aos/syncAosPackageStatus',
  // 出库单-导出
  amlOutboundExport: '/packageInfo/aos/export'

};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
