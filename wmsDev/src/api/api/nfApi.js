let api = {
  // 商品-分页查询 http://192.168.91.7:882/project/263/interface/api/15177
  nfQuery: '/wmsNfProductInfo/query',
  // 商品-关联sku http://192.168.91.7:882/project/263/interface/api/15181
  nfRelatedSku: '/wmsNfProductInfo/relatedSku',
  // 商品-导入关联SKu http://192.168.91.7:882/project/263/interface/api/15201
  nfSkuRelatedImport: '/wmsNfProductInfo/skuRelatedImport',
  // 商品-同步商品 http://192.168.91.7:882/project/263/interface/api/15205
  nfSync: '/wmsNfProductInfo/sync',
  // 商品-取消关联 http://192.168.91.7:882/project/263/interface/api/15209
  nfCancelRelate: '/wmsNfProductInfo/cancelRelate',
  // 商品-导出 http://192.168.91.7:882/project/263/interface/api/15217
  nfExport: '/wmsNfProductInfo/export',

  // 库存-分页查询 http://192.168.91.7:882/project/263/interface/api/15229
  nfInventoryQuery: '/wmsNfInventory/query',
  // 库存-同步库存 http://192.168.91.7:882/project/263/interface/api/15233
  nfInventorySync: '/wmsNfInventory/sync',
  // 库存-导出 http://192.168.91.7:882/project/263/interface/api/15241
  nfInventoryExport: '/wmsNfInventory/export',

  // 出库单-分页查询 http://192.168.91.7:882/project/263/interface/api/15245
  nfOutboundQuery: '/packageInfo/nf/query',
  // 出库单-批量向物流商下单 http://192.168.91.7:882/project/263/interface/api/15249
  nfOutboundPackage: '/packageInfo/nf/batchUploadNfPackage',
  // 出库单-同步包裹状态 http://192.168.91.7:882/project/263/interface/api/15257
  nfOutboundPackageStatus: '/packageInfo/nf/syncNfPackageStatus',
  // 出库单-导出 http://192.168.91.7:882/project/263/interface/api/15261
  nfOutboundExport: '/packageInfo/nf/export'

};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
