let api = {
  // EF海外仓
  get_wmsEfProductInfo_query: '/wmsEfProductInfo/query', // EF海外仓--商品管理--查询商品列表
  efRelated: '/wmsEfProductInfo/related', // 关联SKU
  put_wmsEfProductInfo_sync: '/wmsEfProductInfo/sync', // EF海外仓--商品管理-同步商品
  post_wmsEfProductInfo_skuRelatedImport: '/wmsEfProductInfo/skuRelatedImport', // Excel导入SKU关联
  post_wmsEfProductInfo_export: '/wmsEfProductInfo/export', // 商品 导出

  post_wmsEfInventory_query: '/wmsEfInventory/query', // EF海外仓--商品管理-查询库存列表
  put_wmsEfInventory_sync: '/wmsEfInventory/sync', // 同步库存
  post_wmsEfInventory_export: '/wmsEfInventory/export', // 库存 导出

  post_packageInfo_efStoreQuery: '/packageInfo/efStoreQuery', // 出库单检索
  put_packageInfo_getEfStorePackageStatus: '/packageInfo/getEfStorePackageStatus/', // 同步发货状态
  put_packageInfo_batchEfStorePackageStatus: '/packageInfo/batchEfStorePackageStatus', // 批量同步发货状态
  put_packageInfo_batchUploadEfStorePackage: '/packageInfo/batchUploadEfStorePackage', // 所有结果集申请运单号
  put_packageInfo_uploadEfStorePackage: '/packageInfo/uploadEfStorePackage/', // 点击操作单个下单
  post_wmsPicking_queryEfSalesPackageDetail: '/wmsPicking/queryEfSalesPackageDetail', // 查看出库单详情

  // 仓库单检索
  ef_wmsEfOutboundOrder_query: '/wmsEfOutboundOrder/query', // 仓库单检索列表查询
  ef_queryOutboundOrderDetail: '/wmsEfOutboundOrder/queryOutboundOrderDetail', // 详情-仓库单详情
  ef_queryPackageDetail: '/wmsEfOutboundOrder/queryPackageDetail', // 详情-EF仓仓库单关联出库单详情查询
  ef_export: '/wmsEfOutboundOrder/export', // 仓库单列表导出
  ef_sync: '/wmsEfOutboundOrder/sync' // 仓库单同步

};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
