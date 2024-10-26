const modelApi = {
  // 库存余量模块
  get_inventoryListData: '/wmsInventory/list', // 获取库存余量的表格数据
  inventoryListSearchData: '/wmsInventory/list', // 库存余量查询功能
  get_inventoryLogListData: '/wmsInventoryLog/list', // 获取库存事务明细列表信息
  inventoryLogListSearchData: '/wmsInventoryLog/list', // 库存事务明细页面查询功能
  wmsInventExport: '/wmsInventoryLog/export', // 库存管理-导出库存事务明细列表信息
  querySortListSearchData: '/wmsInventory/querySortList', // 调整出货顺序页面查询功能
  adjustInventorySort: '/wmsInventory/modifySort', // 调整出货顺序
  modifySafetyNumber: '/wmsInventory/modifysafetyNumber', // 修改安全库存
  selectReceiptWareHouseName: '/wms/receipt/warehouse/list', // 库存余量仓库下拉列表
  get_onWayDetail: '/wmsReceipt/onWayDetail', // 在途明细
  inventory_exportReplace: '/wmsInventory/exportReplace', // 库存余量-替换sku导出
  // 库存移动模块
  get_moveListData: '/wmsInventoryMove/list', // 获取库存移动的表格数据
  moveListSearchData: '/wmsInventoryMove/list', // 库存移动页面查询
  auditMoveOrder: '/wmsInventoryMove/audit', // 审核库存移动单
  createMoveOrder: '/wmsInventoryMove/create', // 创建库存移动单
  performMoveOrder: '/wmsInventoryMove/perform', // 执行库存移动单
  saveMoveOrder: '/wmsInventoryMove/save', // 修改保存库存移动明细单
  get_moveDetailData: '/wmsInventoryMove/detail', // 获取库存移动明细列表信息
  get_productListData: '/wms/inventory/move/product', // 获取产品列表信息
  get_goodsList: '/wmsReceipt/goodsList', // 获取产品列表信息
  get_inventoryWareLocationData: '/wmsInventoryMove/queryListParamInventory', // 获取库存移动的库位列表信息
  get_wareBlockName: '/wmsInventoryMove/blockList', // 获取库存移动的库区名字
  getAvailableNumber: '/wmsInventory/queryAvailableNumber', // 创建库存移动单-根据库位ID和SKU查询可用库存数量
  selectMoveWareHouseName: '/wms/inventory/move/allwh', // 库存移动仓库下拉列表
  // 库存调整模块
  get_adjustListData: '/wmsInventoryAdjust/query', // 获取库存调整的表格数据
  adjustListSearchData: '/wmsInventoryAdjust/query', // 库存调整页面查询
  createAdjustOrder: '/wmsInventoryAdjust/create', // 创建调整单
  modifyAdjustOrder: '/wmsInventoryAdjust/modify', // 修改调整单
  checkAdjustOrder: '/wmsInventoryAdjust/modifyExamine', // 审核调整单
  carryAdjustOrder: '/wmsInventoryAdjust/modifyImplement', // 执行调整单
  get_adjustDetailData: '/wmsInventoryAdjust/queryDetail', // 获取调整单详细信息
  selectAdjustWareHouseName: '/wms/inventory/adjust/list', // 库存调整仓库下拉列表
  post_queryCreaterId: '/wmsInventoryAdjust/queryCreaterId', // 库存调整仓库下拉列表
  // 库存冻结模块
  get_frozenListData: '/wmsInventoryFrozen/list', // 获取已有库存冻结表格数据
  frozenListSearchData: '/wmsInventoryFrozen/list', // 库存冻结页面查询
  get_frozenDetailData: '/wmsInventoryFrozen/detail', // 获取库存冻结详细信息
  createFrozenOrder: '/wmsInventoryFrozen/create', // 创建库存冻结单
  modifyFrozenOrder: '/wmsInventoryFrozen/modify', // 修改冻结单
  checkedFrozenOrder: '/wmsInventoryFrozen/approve', // 审核冻结单
  carryFrozenOrder: '/wmsInventoryFrozen/modifyImplement', // 执行冻结单
  cancelFrozenOrder: '/wmsInventoryFrozen/cancelFrozen', // 解除冻结
  selectFrozenWareHouseName: 'wmsInventoryFrozen/list', // 获取库存冻结仓库下拉列表
  batchCancelFrozen: '/wmsInventoryFrozen/batchCancelFrozen', // 批量解除冻结
  queryAllDetail: '/wmsInventoryFrozen/queryAllDetail', // 批量解冻查询
  newBatchCancelFrozen: '/wmsInventoryFrozen/newBatchCancelFrozen', // 解冻或者批量解冻
  // 库存盘点模块
  // get_scanListData: '/wmsInventoryCheck/list', // 获取库存盘点表格数据
  scanListSearchData: '/wmsInventoryCheck/list', // 库存盘点页面查询
  createScanOrder: '/wmsInventoryCheck/create', // 创建盘点单
  get_scanDetailData: '/wmsInventoryCheck/detail', // 查询盘点明细信息
  startScan: '/wmsInventoryCheck/modify', // 开始盘点
  carryScan: '/wmsInventoryCheck/complete', // 完成盘点
  createFbaInboundShipmentPlan: '/wmsInventoryAllot/createFbaInboundShipmentPlan', // 库存管理-创建fba货件计划
  selectLinkName: '/wmsInventoryCheck/queryLinkageName', // 仓库，库区，库位联动
  selectScanWareHouseName: '/wms/inventory/check/allwh', // 库存盘点仓库下拉列表
  saveScanDtl: '/wmsInventoryCheck/save', // 保存盘点明细信息
  exportInventoryCheck: '/wmsInventoryCheck/exportInventoryCheck', // 导出盘点数据
  // 到货异常处理模块
  // 到货异常处理-新增到货异常处理 http://192.168.91.7:882/project/263/interface/api/15747
  addOrUpdateProcess: '/processAbnormalArrival/addOrUpdateProcess',
  // 到货异常处理-新增备注 http://192.168.91.7:882/project/263/interface/api/15748
  addOperate: '/processAbnormalArrival/addOperate',
  // 到货异常处理-查询列表 http://192.168.91.7:882/project/263/interface/api/15749
  abnormalList: '/processAbnormalArrival/list',
  // 到货异常处理-查询详情 http://192.168.91.7:882/project/263/interface/api/15750
  abnormalDetail: '/processAbnormalArrival/detail',
  // 到货异常处理-导出 http://192.168.91.7:882/project/263/interface/api/15751
  abnormalExport: '/processAbnormalArrival/export',
  // 到货异常处理-操作日志 http://192.168.91.7:882/project/263/interface/api/15768
  abnormalRemarkDetail: '/processAbnormalArrival/remarkDetail',
  // 到货异常处理-退回 http://192.168.91.7:882/project/263/interface/api/15772
  abnormalReturn: '/processAbnormalArrival/return',
  // 到货异常处理-删除 http://192.168.91.7:882/project/263/interface/api/15783
  abnormalDelete: '/processAbnormalArrival/delete',
  // 到货异常处理-转交 http://192.168.91.7:882/project/263/interface/api/15845
  changePurchase: '/processAbnormalArrival/changePurchase',
  // 查询采购员事业部 http://192.168.91.7:882/project/263/interface/api/15938
  getUserBusinessDeptName: '/processAbnormalArrival/getUserBusinessDeptName',
  // 到货异常处理-批量提交 http://192.168.91.7:882/project/263/interface/api/16024
  processSubmitBatch: '/processAbnormalArrival/submitBatch',

  // 通过sku查询商品信息
  queryProductInfoBySkuList: '/goodsStockApply/queryProductInfoBySkuList',

  // 库存调拨模块
  transferSearchData: '/wmsInventoryAllot/list', // 库存调拨页面数据查询
  createTransferOrder: '/wmsInventoryAllot/create', // 创建库存调拨单
  modifyTransferOrder: '/wmsInventoryAllot/modify', // 修改保存库存调拨单
  checkTransferOrder: '/wmsInventoryAllot/modifyAllotState', // 审核库存调拨单
  get_transferDetailData: '/wmsInventoryAllot/detail', // 获取库存调拨单详细数据
  selectAllotWareHouseName: '/wmsWarehouse/queryAllwarehouse', // 库存调拨仓库下拉列表
  get_queryListParamExtend: '/wms/inventory/allot/queryListParamExtend', // 获取物流商,邮寄方式,国家下拉列表
  get_logisticsDealerList: '/wmsInventoryAllot/logisticsDealerList', // 获取物流商下拉列表
  get_logisticsMailList: '/wmsInventoryAllot/logisticsMailList', // 获取邮寄方式下拉列表
  get_allotProduct: '/wmsInventoryAllot/product', // 获取库存调拨产品信息列表
  create_allotPicking: '/wmsInventoryAllot/createPicking', // 库存管理-本地仓调拨单创建出库单
  get_allotlocalData: '/wmsInventoryAllot/localQuery', // 库存调拨-本地仓关联出库单列表
  get_allotDetail: '/wmsInventoryAllot/queryByThirdDetailAllot', // 库存管理-查询调拨单详细数据
  create_amazonDeclare: '/wmsInventoryAllot/createAmazonDeclare', // 库存管理-创建amazon申报
  get_otherAllotData: '/wmsInventoryAllot/otherQuery' // 调拨管理-第三方仓出库单列表
}

let exportApi = {};
const prefix = '/wms-service';
const handApi = (apiObj, preKey) => {
  Object.keys(apiObj).forEach(key => {
    if (Object.prototype.toString.call(apiObj[key]).slice(8, -1) === 'Object') {
      handApi(apiObj[key], preKey);
    } else if (typeof apiObj[key] == 'string') {
      exportApi[key] = `${preKey || ''}${apiObj[key]}`;
    }
  })
}
handApi(modelApi, prefix);

export default exportApi;
