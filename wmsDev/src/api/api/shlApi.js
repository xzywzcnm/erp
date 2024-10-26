let api = {
  post_wmsShlProductInfo_query: '/wmsShlProductInfo/query', // 商品列表
  put_wmsShlProductInfo_related: '/wmsShlProductInfo/related', // 关联SKU
  post_wmsShlProductInfo_skuRelatedImport: '/wmsShlProductInfo/skuRelatedImport', // 导入SKU关联
  post_wmsShlProductInfo_export: '/wmsShlProductInfo/export', // 导出
  // 同步SHL商品信息 http://192.168.91.7:882/project/263/interface/api/14709
  post_syncShlProduct: '/wmsShlProductInfo/syncShlProduct',
  // 关联商品 http://192.168.91.7:882/project/263/interface/api/14721
  put_newRelated: '/wmsShlProductInfo/newRelated',
  // 取消关联 http://192.168.91.7:882/project/263/interface/api/14725
  delete_newCancelRelated: '/wmsShlProductInfo/newCancelRelated',
  // 导出商品信息 http://192.168.91.7:882/project/263/interface/api/14769
  post_newExport: '/wmsShlProductInfo/newExport',
  // 导入关联 http://192.168.91.7:882/project/263/interface/api/14733
  post_newImport: '/wmsShlProductInfo/newImport',
  // 查询SHL仓库列表 http://192.168.91.7:882/project/263/interface/api/14713
  post_newQuery: '/wmsShlProductInfo/newQuery',
  // 同步SHL商品库存信息 http://192.168.91.7:882/project/263/interface/api/14753
  post_syncShlInventory: '/wmsShlInventory/syncShlInventory',
  // 查询SHL商品库存信息列表 http://192.168.91.7:882/project/263/interface/api/14757
  psot_query: '/wmsShlInventory/query',
  // 导出SHL商品库存信息 http://192.168.91.7:882/project/263/interface/api/14761
  post_export: '/wmsShlInventory/export',

  post_packageInfo_shlStoreQuery: '/packageInfo/shlStoreQuery', // 出库单检索
  put_packageInfo_getShlStorePackageStatus: '/packageInfo/getShlStorePackageStatus/', // 获取包裹状态
  put_packageInfo_batchShlStorePackageStatus: '/packageInfo/batchShlStorePackageStatus', // 批量获取包裹状态
  put_packageInfo_batchUploadShlStorePackage: '/packageInfo/batchUploadShlStorePackage', // 批量上传包裹
  put_packageInfo_uploadShlStorePackage: '/packageInfo/uploadShlStorePackage/', // 上传包裹
  post_wmsPicking_queryShlSalesPackageDetail: '/wmsPicking/queryShlSalesPackageDetail' // 出库单详情接口

};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
