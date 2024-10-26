let api = {
  // 商品- 查询列表 http://192.168.91.7:882/project/263/interface/api/15830
  rinid_queryOrderList: '/wmsRinidProductInfo/queryOrderList',
  // 商品- 导出 http://192.168.91.7:882/project/263/interface/api/15832
  rinid_export: '/wmsRinidProductInfo/export',
  // 商品- 重新关联 http://192.168.91.7:882/project/263/interface/api/15836
  rinid_related: '/wmsRinidProductInfo/related',
  // 商品- 导入关联 http://192.168.91.7:882/project/263/interface/api/15834
  rinid_skuRelatedImport: '/wmsRinidProductInfo/skuRelatedImport',
  // 商品- 取消关联 http://192.168.91.7:882/project/263/interface/api/15833
  rinid_disassociate: '/wmsRinidProductInfo/disassociate',
  // 商品- 同步商品 http://192.168.91.7:882/project/263/interface/api/15835
  rinid_synchronousGoods: '/wmsRinidProductInfo/synchronousGoods',

  // 出库单- 查询列表
  rinid_wmsRinidPackageInfo: '/wmsRinidPackageInfo/queryWmsRinidPackageInfo',
  // 出库单- 查询详情
  rinid_wmsRinidReceiptDetail: '/wmsRinidPackageInfo/queryWmsRinidReceiptDetail',
  // 出库单- 同步
  rinid_synchronousWmsRinidReceipt: '/wmsRinidPackageInfo/synchronousWmsRinidReceipt',
  // 出库单- 导出
  rinid_exportWmsRinidReceipt: '/wmsRinidPackageInfo/exportWmsRinidReceipt',
  // 出库单- 下单
  rinid_batchUploadRinidPackage: '/packageInfo/batchUploadRinidPackage',

  // 库存管理- 查询 http://192.168.91.7:882/project/263/interface/api/15840
  rinid_inventoryQuery: '/wmsRinidInventory/query',
  // 库存管理- 同步 http://192.168.91.7:882/project/263/interface/api/15841
  rinid_synchronousInventory: '/wmsRinidInventory/synchronousInventory',
  // 库存管理- 导出 http://192.168.91.7:882/project/263/interface/api/15842
  rinid_exportInventoryManage: '/wmsRinidInventory/exportInventoryManage'
};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;