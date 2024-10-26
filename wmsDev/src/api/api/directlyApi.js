let directly = {
  // 供应商库存管理-获取库存列表信息 http://192.168.91.7:882/project/263/interface/api/15864
  directly_queryPage: '/wmsSupplierInventory/queryPage',
  // 供应商库存管理-导出库存列表信息 http://192.168.91.7:882/project/263/interface/api/15865
  directly_export: '/wmsSupplierInventory/export',
  // 供应商库存管理-获取库存详情列表信息 http://192.168.91.7:882/project/263/interface/api/15866
  directly_queryDetailLogPage: '/wmsSupplierInventory/queryDetailLogPage',

  // 全托管直发
  // 列表查询 http://192.168.91.7:882/project/263/interface/api/15869
  trusteeship_list: '/wmsDirectDeliverPicking/list',
  // 查询明细接口 http://192.168.91.7:882/project/263/interface/api/15870
  queryDirectDeliverPickingInfo: '/wmsDirectDeliverPicking/queryDirectDeliverPickingInfo',
  // 创建 http://192.168.91.7:882/project/263/interface/api/15871
  createDirectDeliverPicking: '/wmsDirectDeliverPicking/createDirectDeliverPicking',
  // 更新 http://192.168.91.7:882/project/263/interface/api/15872
  updateDirectDeliverPicking: '/wmsDirectDeliverPicking/updateDirectDeliverPicking',
  // 收货确认 http://192.168.91.7:882/project/263/interface/api/15873
  receiptConfirmation: '/wmsDirectDeliverPicking/receiptConfirmation',
  // 批量提交 http://192.168.91.7:882/project/263/interface/api/15874
  trusteeship_batchCommit: '/wmsDirectDeliverPicking/batchCommit',
  // 导出 http://192.168.91.7:882/project/263/interface/api/15875
  trusteeship_export: '/wmsDirectDeliverPicking/export',
  // 导出选中明细 /wmsDirectDeliverPicking/exportDetail?warehouseId= 请求body:[]  出库单单号集合
  exportDetail: '/wmsDirectDeliverPicking/exportDetail',
  // 查询数量 http://192.168.91.7:882/project/263/interface/api/15880
  queryDirectDeliverPickingNumber: '/wmsDirectDeliverPicking/queryDirectDeliverPickingNumber',
  // 导入 http://192.168.91.7:882/project/263/interface/api/15879
  trusteeship_import: '/wmsDirectDeliverPicking/import',
  // 详情页面的获取文件 ?directDeliverPickingNo=    get请求
  getDispatchOrderFile: '/wmsDirectDeliverPicking/getDispatchOrderFile',
  // 删除 ?directDeliverPickingNo= delete  请求
  deleteDirectDeliverPickingInfo: '/wmsDirectDeliverPicking/deleteDirectDeliverPickingInfo',
  // 获取并更新平台收货数据 http://192.168.91.7:882/project/263/interface/api/15900
  getDeliverPlatformPurchaseInfo: '/wmsDirectDeliverPicking/getPlatformPurchaseInfo',
  // 获取快递详情 ?trackingNumber=KY2024011700001&supplierCode=DJ0001   GET请求
  queryAllDirectDeliverPicking: '/wmsDirectDeliverPicking/queryAllDirectDeliverPicking',
  // 全托管直发出库单导出 http://192.168.91.7:882/project/263/interface/api/15875
  directDeliverPicking_export: '/wmsDirectDeliverPicking/export',
  // 全托管直发出库单导出明细 http://192.168.91.7:882/project/263/interface/api/16091
  directDeliverPicking_exportDetail: '/wmsDirectDeliverPicking/exportDetail',
}
Object.keys(directly).forEach(key => {
  directly[key] = `/wms-service${directly[key]}`;
})
export default directly;
