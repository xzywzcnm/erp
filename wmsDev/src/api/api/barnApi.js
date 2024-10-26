let api = {
  // 谷仓
  get_barnProductList: '/wmsGcProductInfo/query', // 谷仓第三方仓商品管理-查询商品列表
  put_barnProductRelated: '/wmsGcProductInfo/related', // 谷仓第三方仓商品管理-谷仓商品关联LAPA SKU
  put_barnProductSync: '/wmsGcProductInfo/sync', // 谷仓第三方仓商品管理-同步商品
  query_barnInventoryList: '/wmsGcInventory/query', // 谷仓第三方仓商品管理-查询库存列表
  put_barnInventorySync: '/wmsGcInventory/sync', // 谷仓第三方仓商品管理-同步库存
  set_barnQuery: '/packageInfo/gcQuery', // 谷仓出库单检索
  put_GcPackageStatus: '/packageInfo/getGcPackageStatus/', // 同步发货状态
  put_GcPackageStatusAll: '/packageInfo/batchGetGcPackageStatus', // 批量同步发货状态
  batchUploadBarnPackage: '/packageInfo/batchUploadGcPackage', // 包裹-谷仓下单/批量下单
  set_uploadBarnPackageOne: '/packageInfo/uploadGcPackage/', // 点击操作单个下单
  export_wmsBarnProduct: '/wmsGcProductInfo/export', // 商品 导出
  export_wmsBarnInventory: '/wmsGcInventory/export', // 库存 导出
  // get_winitSalesPickingDetail: 'wmsPicking/querySalesPickingDetail', // 出库单详情
  // set_winituploadWinitPackage: '/packageInfo/uploadWinitPackage', // 包裹-谷仓批量申请运单号
  // queryWinitSalesPackageDetail: '/wmsPicking/queryWinitSalesPackageDetail', // 查看谷仓明细
  import_wmsBarnProductInfo: '/wmsGcProductInfo/skuRelatedImport', // 谷仓sku关联导入

  // 海外入库下单
  queryWarehousingDetail: '/gcReceipt/queryWarehousingDetail', // 点击出库单编号查询出库单详情
  queryIncomingOrderList: '/gcReceipt/queryIncomingOrderList', // 查询等待入库下单列表
  getValInfo: '/gcReceipt/getVatInfo', // 获取进口商编码
  queryOrderInProgress: '/gcReceipt/queryOrderInProgress', // 查询下单失败列表
  updateInvalidateOrder: '/gcReceipt/updateInvalidateOrder', // 等待入库作废
  updateProgressInvalidateOrder: '/gcReceipt/updateProgressInvalidateOrder', // 下单作废
  exportIncomingOrderList: '/gcReceipt/exportIncomingOrderList', // 入库单列表导出
  exportInProgressOrderList: '/gcReceipt/exportInProgressOrderList', // 下单列表导出
  placeOrder: '/gcReceipt/placeOrder', // 海外入库下单-入库下单
  getGcWarehouseInfo: '/gcReceipt/getGcWarehouseInfo', // 获取仓库
  batchPlaceOrder: '/gcReceipt/batchPlaceOrder', // 下单失败中的批量下单和下单
  queryOrderInProgressByPlaceAndOrder: '/gcReceipt/queryOrderInProgressByPlaceAndOrder', // 点击查询下单中列表

  // 海外入库单管理
  queryWarehouseManageList: '/gcReceiptManagement/queryWarehouseManageList', // 查询入库单管理信息
  exportWarehouseManageList: '/gcReceiptManagement/exportWarehouseManageList', // 入库单管理信息列表数据导出
  updateTrackingNumber: '/gcReceiptManagement/updateTrackingNumber', // 海外仓入库单管理----修改追踪号
  getBoxLabel: '/gcReceiptManagement/getBoxLabel', // 海外仓入库单管理-获取外箱标签
  updateFeeInfo: '/gcReceiptManagement/updateFeeInfo', // 海外仓入库单管理-修改费用
  queryWarehouseManageDetails: '/gcReceiptManagement/queryWarehouseManageDetails', // 根据海外入库单号查询入库单明细
  gcPickingManagementUpdate: '/gcPickingManagement/update', // 出库单详情更新
  syncWarehouseOrder: '/gcReceipt/syncGcReceiptInfo', // 同步海外入库单

  // 库存管理
  queryDetail: '/wmsGcInventory/queryDetail', // 库存管理--入库查询
  updateDetail: '/wmsGcInventory/updateDetail', // 库存管理--更新调整数量

  // 海外仓出库单
  queryOverseasManageList: '/gcPickingManagement/queryOverseasManageList', // 获取获取海外出库单管理列表信息
  queryOverseasManageListDetails: '/gcPickingManagement/queryOverseasManageListDetails', // 查询出库单明细
  exportOverseasManageList: '/gcPickingManagement/exportOverseasManageList', // 导出海外出库单管理列表信息
  autoGetReceipt: '/gcPickingManagement/autoGetReceipt', // 海外出库管理-同步出库单
  autoMatchReceipt: '/gcPickingManagement/autoMatchReceipt', // 海外出库管理-自动匹配入库单
};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;
