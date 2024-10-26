let api = {
  // 万邑通
  get_winitProductList: '/wmsWinitProductInfo/query', // 万邑通第三方仓商品管理-查询商品列表
  put_winitProductRelated: '/wmsWinitProductInfo/related', // 万邑通第三方仓商品管理-万邑通商品关联LAPA SKU
  put_winitProductSync: '/wmsWinitProductInfo/sync', // 万邑通第三方仓商品管理-同步商品
  query_winitInventoryList: '/wmsWinitInventory/query', // 万邑通第三方仓商品管理-查询库存列表
  put_winitInventorySync: '/wmsWinitInventory/sync', // 万邑通第三方仓商品管理-同步库存
  set_winitQuery: '/packageInfo/winitQuery', // 万邑通出库单检索
  get_winitSalesPickingDetail: 'wmsPicking/querySalesPickingDetail', // 出库单详情
  batchUploadWinitPackage: '/packageInfo/batchUploadWinitPackage', // 包裹-万邑通所有结果集申请运单号 批量也是这个
  set_winituploadWinitPackage: '/packageInfo/uploadWinitPackage', // 包裹-万邑通批量申请运单号
  set_uploadWinitPackageOne: '/packageInfo/uploadWinitPackage/', // 包裹-万邑通申请运单号
  queryWinitSalesPackageDetail: '/wmsPicking/queryWinitSalesPackageDetail', // 查看万邑通明细
  import_wmsWinitProductInfo: '/wmsWinitProductInfo/skuRelatedImport', // 万邑通sku关联导入
  export_wmsWinitProduct: '/wmsWinitProductInfo/export', // 商品 导出
  export_wmsWinitInventory: '/wmsWinitInventory/export', // 万邑通库存 导出
  put_WinitPackageStatus: '/packageInfo/getWinitPackageStatus/', // 同步发货状态
  put_WinitPackageStatusAll: '/packageInfo/batchWinitPackageStatus' // 批量同步发货状态
};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
