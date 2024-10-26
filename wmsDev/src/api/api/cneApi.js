let api = {
  query_cneInventoryList: '/wmsInventoryManage/queryInventoryManage', // CNe仓库库存管理管理-查询库存列表
  exportInventoryManage: '/wmsInventoryManage/exportInventoryManage', // cne仓库库存管理-导出
  syncCneInventory: '/wmsInventoryManage/synchronousInventory', // cne仓库库存管理-同步库存
  get_cneProductList: '/wmsGoodsManage/queryGoodsManage', // cne仓库商品-查询列表
  exportInventoryProduct: '/wmsGoodsManage/exportGoodsManage', // cne仓库商品-导出
  import_wmsCneProductInfo: '/wmsGoodsManage/importGoodsManage', // cne仓库商品-导入关联
  cnecancelRelate: '/wmsGoodsManage/disassociate', // cne仓库商品-取消关联
  syncCneProduct: '/wmsGoodsManage/synchronousGoods', // cne仓库商品-同步商品
  put_cneProductRelated: '/wmsGoodsManage/related', // cne商品管理-谷仓商品关联LAPA SKU
  get_cneOutBoundOrderList: '/wmsCnePackageInfo/queryWmsCnePackageInfo', // cne出库单-查询
  exportInventoryOutBoundOrder: '/wmsCnePackageInfo/exportWmsCneReceipt', // cne出库单-导出
  queryCneSalesPackageDetail: '/wmsCnePackageInfo/queryWmsCneReceiptDetail', // cne出库单-详情明细
  syncCneOutBoundOrder: '/wmsCnePackageInfo/synchronousWmsCneReceipt', // cne出库单-同步状态
  batchUploadCnePackage: '/packageInfo/batchUploadCnePackage' // cne出库单-下单(批量\所有)
};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;