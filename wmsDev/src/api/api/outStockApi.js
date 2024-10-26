import packageApi from "./packageApi";

let outStockApi = {
  /** ****** 出库模块 **********/
  get_logisterList: "/wmsPicking/logisticsDealerList", // 获取物流商下拉
  get_sendType: "/wmsPicking/logisticsMailList", // 获取邮寄方式下拉
  get_stockOutWareList: "/wms/picking/warehouseList", // 出库模块仓库下拉
  get_outStockList: "/wmsPicking/queryOtherPicking",
  queryTemuAccounts: "/erpCommon/setting-service/saleAccount/api/subsystem/queryTemuAccounts", // 获取 temu 店铺
  getTemuPickingFileTemplate: "/wmsPicking/getTemuPickingFileTemplate", // 下载 temu 备货出库单模板
  get_sellStockList: "/wmsPicking/querySalesPicking",
  get_queryByPackageIds: "/packageGoods/queryByPackageIds", // 根据出库单流水号列表查询货品信息
  querySalesPickingExcept: "/wmsPicking/querySalesPickingExcept", // 异常处理库区库位信息
  removeExceptSalesPicking: "/wmsPicking/removeExceptSalesPicking", // 移除异常
  uploadWytPackage: "/wmsPicking/uploadWytPackage/", // 上传物流信息(/wmsPicking/uploadWytPackage/{pickingNo}) post 方式
  checkUploadPackage: "/wmsPicking/checkUploadPackage/", // 装袋确认(/wmsPicking/checkUploadPackage/{logisticsProvidersNo}) post 方式
  getAll_productBrand: "/erpCommon/product-service/productBrand/queryAll", // 查询所有品牌
  get_EnabledSaleAccounts: "/erpCommon/setting-service/saleAccount/api/getEnabledSaleAccounts", // 查询可用平台店铺
  get_salesPickingCarriers: "/wmsPicking/querySalesPickingCarriers", // 查询所有邮寄方式
  get_queryCarriersForPickingGoodsList: "/wmsPickingGoods/queryCarriersForPickingGoodsList", // 查询邮寄方式拣货单
  get_stockOutDtl: "/wmsPicking/queryPickingDetail", // 销售出库单详情(其他出库)
  get_sellStockOutDtl: "/wmsPicking/querySalesPickingDetail", // 销售出库单详情(销售出库)
  create_stockOutList: "/wmsPicking/createPicking", // 创建出库单
  add_Note: "/wmsPicking/createLog", // 新增备注
  assign_stockSingle: "/wmsPicking/modifyDistributionSingle", // 分配库存(其他出库单个)
  assign_sellStockSingle: "/wmsPicking/modifySalesDistributionSingle", // 分配库存(销售出库单个)
  assign_all: "/wmsPicking/modifyDistributionAll", // 分配库存（其他出库所有）
  assign_sellAll: "/wmsPicking/modifySalesDistributionAll", // 分配库存（销售出库所有）
  cancel_stock: "/wmsPicking/modifyDistributionCancelSingle", // 其他出库单个取消分配
  cancel_sellStock: "/wmsPicking/modifySalesDistributionCancelSingle", // 销售出库单个取消分配
  cancel_stockAll: "/wmsPicking/modifyDistributionCancelAll", // 其他出库所有取消分配
  cancel_sellStockAll: "/wmsPicking/modifySalesDistributionCancelAll", // 销售出库所有取消分配
  refresh_assignList: "/wms/picking/queryPickingBatch", // 刷新分配列表
  refresh_msgNote: "/wmsPicking/queryPickingLog", // 新增留言成功刷新留言
  get_wareList: "/wmsPicking/queryBlocakListParam", // 仓库区级联下拉框数据
  get_wareLocationList: "/wmsPicking/queryLocationListParam", // 库位查询
  get_outStockProduct: "/wmsPicking/product",
  get_sellStockTableInfo: "/wmsPicking/querySaleInfomation", // 生成拣货单前表格查询(销售出库)
  get_otherStockTableInfo: "/wmsPicking/queryOtherInfomation", // 生成拣货单前表格查询(其他出库)
  create_outStockPickList: "/wms/picking/createPickingGoods", // 出库模块创建拣货单
  importUrl: "/wmsPicking/importPicking", // 导入的路径
  exportUrl: "/wmsPicking/exportPicking", // 导出
  get_pendingData: "/packageInfo/queryForWaitingUpload", // 下发物流商待申请列表
  set_issuedLogisticsProvider: "/packageInfo/autoConfirm/setting", // 设置是否立即交运
  get_issuedLogisticsProvider: "/packageInfo/autoConfirm/setting", // 获取是否立即交运
  export_ExcelCarrierType: "/packageInfo/exportExcelCarrierType", // 导出自定义物流包裹excel (导出即为已下发)
  update_ignoreShipping: "/packageInfo/ignoreShipping", // 跳过上传
  update_ignoreConfirm: "/packageInfo/ignoreConfirm", // 跳过交运
  get_unsuccessfulData: "/packageInfo/queryForTrackingNumberUncatch", // 下发物流商未获取列表
  supplementTrackingNumber: "/packageInfo/supplementTrackingNumber", // excel 补录运单号
  get_queryForConfirm: "/packageInfo/queryForConfirm", // 交运列表
  put_transport: "/wmsPicking/putTransportContent", // 出库管理-上传物流信息
  get_boxDetail: "/wmsPickingBoxDetail/query", // 出库单箱子明细管理-根据出库单编号查询装箱详情
  get_fbaShipping: "/wmsPicking/fbaShipping", // 出库管理-fba发货
  get_printWeightLabel: "/wmsPickingBox/printOverweightLabel", // Fba库存管理-FBA打印超重标签
  get_fbaPickDetail: "/wmsFbaPickingDetail/", // 打印FNSKU标签
  print_fbaLables: "/wmsPicking/fbaGetPackageLabels", // 出库管理-FBA打印外箱标签
  put_fbaSubmitFeed: "/wmsPicking/fbaSubmitFeed/", // 出库管理-fba上传装箱信息
  update_fbaInfo: "/wmsInventoryAllot/createFbaInboundOrder/", // 更新货件信息
  get_storeList: "/wms/api/warehouse/query/warehouseList", // 仓库列表
  set_saveWmsPickingBox: "/wmsPickingBox/saveWmsPickingBox", // 添加箱子
  set_uploadPickingExcel: "/wmsPickingBox/importPickingBox", // 箱子excel导入
  get_boxTemplet: "/wmsPickingBox/getTemplet", // 获取箱子导入模板
  update_Picking: "/wmsPicking/updatePicking", // 其他出库 删除
  del_obsoletePicking: "/wmsPicking/obsoletePicking/", // 其他出库 删除
  batchReplaceShippingMethod: "/packageInfo/batchReplaceShippingMethod", // wms系统-批量更换邮寄方式
  batchReplaceWarehouseAndShippingMethodwms: "/packageInfo/batchReplaceWarehouseAndShippingMethod", // wms系统-批量更换仓库和邮寄方式
  batchInvalidPackage: "/packageInfo/batchInvalidPackage", // 作废出库单
  /** ******* 拣货单列表 ***********/
  get_pickList: "/wmsPickingGoods/list", // 获取拣货单列表
  mark_hasPicked: "/wmsPickingGoods/modifyToPicking", // 标记为已拣货
  get_pickListDtl: "/wmsPickingGoods/detail", // 查看拣货单详情
  get_pickListTableData: "/wmsPickingGoods/query",
  search_SendType: "/wmsPickingGoods/choose", // 查询邮寄方式
  allocatedInventoryStatistics: "/wmsPicking/allocatedInventoryStatistics/", // 分配中的个数
  create_pickList: "/wmsPickingGoods/create", // 创建拣货单
  delete_pickNo: "/wmsPickingGoods/modifyPickingByNo", // 删除拣货单(详情内部)
  delete_listPickNo: "/wmsPickingGoods/remove", // 列表的拣货单删除
  get_exportSkuNumber: "/wmsPickingGoods/exportSkuNumber", // 拣货单导出单个sku
  get_locationInv: "/wmsPicking/queryListParamInventory", // 获取库位
  deliver_goods: "/wmsPicking/moidfyDeliverGoods", // 其他出库发货
  deliver_sellGoods: "/wmsPicking/moidfySalesDeliverGoods", // 其他出库发货
  saveDeclareInfo: "/packageDeclare/insert", // 保存申报信息
  getOrderFront: "/erpCommon/setting-service/saleAccount/getSaleAccountsByIds",
  getImportExportList: "/wmsPicking/queryTaskList",
  categoryList: "/wms/common/categoryList",
  queryAllwarehouse: "/wmsWarehouse/queryUserAllwarehouse", // 查询仓库
  queryPickingGoodsTask: "/wmsPickingGoods/queryPickingGoodsTask", // 查询自动波次
  getBarCode: "/wms/check/doing/queryPrintSkuData", // 获取打印拣货单条码
  createOtherPickingGoods: "/wmsPicking/createOtherPickingGoods",
  getSalesPickingStatus: "/wmsPicking/getSalesPickingStatus/", // 销售出库的图标状态
  getOtherPickingStatus: "/wmsPicking/getOtherPickingStatus/", // 其他出库的图标状态
  createTask: "/wmsPickingGoods/createTask", // 创建任务
  printListNum: "/wmsPickingGoods/print", // 拣货单打印
  updateDeclare: "/packageDeclare", // 更新包裹
  otherUnread: "/wmsPicking/other/count", // 其他出库未读
  waitAssignUnread: "/wmsPicking/sales/count", // 等待分配未读
  createListUnread: "/wmsPicking/sales/waitPickingCount", // 生成拣货单未读
  getProductMaterial: "/wmsWorking/compositeProduct",
  get_wareAreaGroupList: "/wmsWarehouseBlockGroup", // 获取库区组数据
  // 获取可用库区组数据(生成拣货 单页面使用) /{warehouseId}
  get_queryEnableBlockGroup: "/wmsWarehouseBlockGroup/queryEnableBlockGroup",
  get_warehouseBlock: "/wmsWarehouseBlock/query", // 获取库区数据
  // 获取库区数据(生成拣货单 页面使用)接口后接 /{warehouseId} 再传 data 参数
  post_queryEnableBlock: "/wmsWarehouseBlockGroup/queryEnableBlock",
  get_warehouseLocation: "/wmsWarehouseLocation/query", // 获取库位数据
  // 获取库位数据(生成拣货单 页面使用)接口后接 /{warehouseId} 再传 data 参数
  post_queryBlockLocation: "/wmsWarehouseBlockGroup/queryBlockLocation",
  get_linkage_warehouseLocation: "/wmsWarehouseLocation/queryByBlocks", // 获取联动库位数据
  get_faceSheetData: "/packageInfo/queryForWaitingGetLabel", // 获取面单未获取数据
  ignoreGetLabel: "/packageInfo/ignoreGetLabel", // 跳过获取面单
  get_faceSheet: "/packageInfo/waitingUploadGetExpressBill", // 等待下发物流页面获取面单
  get_queryForSupplementTrackingNumber: "/packageInfo/queryForSupplementTrackingNumber", // 包裹-包裹补录跟踪号列表
  export_SupplementTrackingNumber: "/packageInfo/exportSupplementTrackingNumber", // 包裹-补录跟踪号检索 导出
  import_SupplementTrackingNumber: "/packageInfo/importSupplementTrackingNumber", // 补录 导入
  get_SupplementTrackingNumberTemplet: "/packageInfo/getSupplementTrackingNumberTemplet", // 获取补录
  get_chooseShippingMethodOnSupTkNum: "/packageInfo/chooseShippingMethodOnSupTkNum", // 包裹补录跟踪号列表"-选择邮寄方式
  get_againGetTrackingNumber: "/packageInfo/againGetTrackingNumber", // 单个及批量重新获取运单号
  get_pickingGoodsTags: "/wmsPickingGoods/pickingGoodsTags", // 获取拣货单标签
  add_pickingGoodsTags: "/wmsPickingGoods/pickingGoodsTags/save", // 生成拣货单标签
  delete_pickingGoodsTags: "/wmsPickingGoods/pickingGoodsTag", // 删除拣货单标签
  get_FrozenInventory: "/wmsPicking/getOtherPickingFrozenInventory", // 获取冻结分配列表的数据
  post_otherPickingDistributionFrozen: "/wmsPicking/otherPickingDistributionFrozen", // 解冻并分配的接口
  queryByBlocksAndFlag: "/wmsWarehouseLocation/queryByBlocksAndFlag", // 通过库区和库位使用查询库位下拉项
  bindPackageExceptionHandLocation: "/packageInfo/bindPackageExceptionHandLocation", // 绑定异常库位（权限key:bindPackageExceptionHandLocation）
  receiveSupplementPicking: "/supplementPicking/receiveSupplementPicking", // 领取补件任务，指定id的就传PackageIdList过来，跟那个移除异常标记一样
  assignSupplementPicking: "/supplementPicking/assignSupplementPicking", // 指派补件任务，指定id的就传PackageIdList过来，跟那个移除异常标记一样
  queryDetailByWarehouseId: "/wmsWarehouseBlock/queryDetailByWarehouseId", // 库区列表接口
  post_supplementPicking: "/supplementPicking/list", // 补拣任务列表
  get_detailSupplementResult: "/supplementPicking/detailSupplementResult/", // 录入补拣结果的查询
  post_submitSupplementResult: "/supplementPicking/submitSupplementResult", // 提交录入补拣结果
  post_queryPrintSupplementPickingDetail: "/supplementPicking/queryPrintSupplementPickingDetail", // 打印补拣单

  post_exportSalesPicking: "/wmsPicking/exportSalesPicking", // 等待下发物流-导出未获取面单号
  post_wmsPickupOrder_query: "/wmsPickupOrder/query", // 获取装箱/袋管理列表的数据
  get_wmsPickupOrder: "/wmsPickupOrder/", // 获取查看装箱详情的数据
  post_wmsPickupOrderDetail: "/wmsPickupOrderDetail", // 批量添加出库单
  delete_wmsPickupOrder: "/wmsPickupOrder/", // 装箱列表--删除包裹
  get_wmsPickupOrder_continuePickupOrder: "/wmsPickupOrder/continuePickupOrder/", // 继续装箱
  post_wmsPickupOrderDetail_scanPackaging: "/wmsPickupOrderDetail/scanPackaging/", // 扫描出库单号/运单号
  post_wmsPickupOrder: "/wmsPickupOrder", // 新增装箱/袋
  delete_wmsPickupOrderDetail_deletePackage: "/wmsPickupOrderDetail/deletePackage/", // 移除已扫描的出库单号
  put_wmsPickupOrder_overPickupOrder: "/wmsPickupOrder/overPickupOrder/", // 结束装箱
  put_wmsPickupOrder_printWmsPickupOrder: "/wmsPickupOrder/printWmsPickupOrder/", // 打印箱唛
  post_systemTrackingMoreCarrier_query: "/erpCommon/common-service/systemTrackingMoreCarrier/query", // 获取承运商的数据
  get_packageLogisticsTrackingDetail: "/packageLogisticsTrackingDetail/queryByPackageLogisticsTrackingId", // 获取跟踪信息的数据
  post_queryPltForCondition: "/packageLogisticsTracking/queryPltForCondition", // 获取物流跟踪列表的数据
  post_packageLogisticsTracking: "/packageLogisticsTracking/queryPltCountByCondition", // 获取物流跟踪信息的统计数据
  post_batchAddPackageLogisticsTracking: "/packageLogisticsTracking/batchAddPackageLogisticsTracking", // 批量添加出库单
  get_packageLogisticsTracking_researchTracking: "/packageLogisticsTracking/researchTracking", // 重新查询
  post_batchUpdateCarrierCode: "/packageLogisticsTracking/batchUpdateCarrierCode", // 批量更新承运商

  exportWaitingApply: "/packageInfo/exportWaitingApply", // 导出待申请
  exportWaitingGetLabel: "/packageInfo/exportWaitingGetLabel", // 等待下发物流-导出未获取面单号
  exportTrackingNumUncatch: "/packageInfo/exportTrackingNumUncatch", // 等待下发物流-导出未获取运单号
  exportQueryForConfirm: "/packageInfo/exportQueryForConfirm", // 等待下发物流-导出等待交运单
  printLabel: "/wmsPickingGoods/printLabel", // 谷仓商品标签打印
  printWytLabel: "/wmsPickingGoods/printWytLabel", // 打印万邑通标签
  printStockLabel: "/wmsPickingGoods/printStockLabel", // 打印temu备货标签

  generateSituation: "/wmsPickingGoods/generateSituation", // 查询出库单拣货单关系
  post_wmsPickupOrder_commitPickupOrder: "/wmsPickupOrder/commitPickupOrder", // 速卖通预约交货
  put_wmsPickupOrder_printPdfGetWmsPickupOrder: "/wmsPickupOrder/printPdfGetWmsPickupOrder/", // 打印预约面单 {pickupOrderNumber}
  get_wmsPickupOrder_cancelPickupOrder: "/wmsPickupOrder/cancelPickupOrder/", // 取消预约面单 {pickupOrderNumber}
  get_wmsPickupOrder_expressageHundred_query: "/erpCommon/common-service/expressageHundred/query", //
  createLabel: "/wmsPickingGoods/createLabel", //

  // 全托管出库单
  directQueryOtherPicking: "/wmsPickingDirect/queryOtherPicking", // 全托管出库单列表查询
  directCreatePicking: "/wmsPickingDirect/createPicking", // 创建全托管出库单
  directQueryPickingDetail: "/wmsPickingDirect/queryPickingDetail", // 全托管出库单详情
  directCreateOtherPickingGoods: "/wmsPickingDirect/createOtherPickingGoods", // 全托管出库单生成拣货单
  directExportPicking: "/wmsPickingDirect/exportPicking", // 导出全托管出库单
  directImportPicking: "/wmsPickingDirect/importPicking", // 导入全托管出库单
  directQueryThirdPartyLabelsInfo: "/wmsPickingDirect/queryThirdPartyLabelsInfo", // 获取直发标签信息表数据
  directModifyDistributionAll: "/wmsPickingDirect/modifyDistributionAll", // 全部分配
  directDistributionCancelSingle: "/wmsPickingDirect/modifyDistributionCancelSingle", // 取消分配
  directOtherPickingDistributionFrozen: "/wmsPickingDirect/otherPickingDistributionFrozen", // 冻结分配
  directObsoletePicking: "/wmsPickingDirect/obsoletePicking/", // 删除出库单
  directModifyDistributionSingle: "/wmsPickingDirect/modifyDistributionSingle", // 选择分配
  directUpdatePicking: "/wmsPickingDirect/updatePicking", // 修改出库单
  directMoidfyDeliverGoods: "/wmsPickingDirect/moidfyDeliverGoods", // 全托管出库发货
  directModifyDistributionCancelAll: "/wmsPickingDirect/modifyDistributionCancelAll", // 所有取消分配
  directGetOtherPickingStatus: "/wmsPickingDirect/getOtherPickingStatus/", // 全托管出库的图标状态
  directAddNote: "/wmsPickingDirect/createLog", // 新增日志列表

  get_querySaleAccounts: "/erpCommon/setting-service/saleAccount/api/subsystem/querySaleAccounts", // 查询商户可用店铺列表
  // 第三方标签-获取平台 http://192.168.91.7:882/project/273/interface/api/15417
  queryPlatformId: "/erpCommon/product-service/thirdPartyTag/queryPlatformId",
  // 第三方标签-根据平台获取用户有权限的店铺 http://192.168.91.7:882/project/273/interface/api/15421
  queryAccountByPlatformId: "/erpCommon/product-service/thirdPartyTag/queryAccountByPlatformId",
  // queryAccountByPlatformId: "/erpCommon/product-service/thirdPartyTag/queryTrusteeshipAccountByPlatformId",

  // 全托管出库单（新）
  fullManage_queryList: "/fullTrusteeshipPicking/queryList", // 全托管出库单列表查询
  fullManage_detail: "/fullTrusteeshipPicking/detail", // 出库单详细
  fullManage_create: "/fullTrusteeshipPicking/create", // 创建出库单
  fullManage_update: "/fullTrusteeshipPicking/update", // 修改出库单
  fullManage_getCheckBatch: "/pickingQualityCheck/getFullTrusteeshipCheckBatch", // 质检批次信息
  fullManage_getCheckBatchInfo: "/pickingQualityCheck/getFullTrusteeshipCheckBatchInfo", // 质检-查询选中批次信息
  fullManage_getCheckBatchSum: "/pickingQualityCheck/getCheckBatchSum", // 查询当前所有质检批次各种数据总和
  fullManage_genPickingBox: "/trusteeshipPickingBox/genPickingBox/", // 生成新货箱
  fullManage_modifyPickingBox: "/trusteeshipPickingBox/modifyPickingBox", // 修改货箱
  fullManage_finishPickingBox: "/trusteeshipPickingBox/finishPickingBox/", // 完成装箱
  fullManage_deletePickingBox: "/trusteeshipPickingBox/deletePickingBox/", // 删除货箱
  fullManage_queryPickingBox: "/trusteeshipPickingBox/queryPickingBox/", // 查询货箱信息
  fullManage_importPickingBox: "/trusteeshipPickingBox/importPickingBox/", // 导入货箱明细
  fullManage_exportDeliveryOrder: "/fullTrusteeshipPicking/exportDeliveryOrder", // 导出交货单
  fullManage_exportPicking: "/fullTrusteeshipPicking/exportPicking", // 导出出库单
  fullManage_finishUploadFile: "/fullTrusteeshipPicking/finishUploadFile", // 完成上传文件
  fullManage_exportBox: "/trusteeshipPickingBox/exportBox/", // 导出货箱信息
  fullManage_getCheckQuestionBatch: "/pickingQualityCheck/getCheckQuestionBatch", // 出库单问题件
  fullManage_updateCheckQuestionInfo: "/pickingQualityCheck/updateCheckQuestionInfo", // 修改问题件处理类型
  fullManage_submitCheckResult: "/pickingQualityCheck/submitCheckResult", // 提交质检结果
  fullManage_finishQualityCheck: "/pickingQualityCheck/finishQualityCheck/", // 完成质检
  fullManage_importPicking: "/fullTrusteeshipPicking/importPicking", // 导入出库单
  fullManage_uploadBoxLabel: "/trusteeshipPickingBox/uploadBoxLabel", // 上传货箱标签
  fullManage_finishHandlerQuestion: "/pickingQualityCheck/finishHandlerQuestion/", // 完成质检
  fullManage_exportQualityCheck: "/pickingQualityCheck/exportQualityCheck", // 导出质检统计
  fullManage_getDispatchOrderFile: "/fullTrusteeshipPicking/getDispatchOrderFile/", // 获取发货单文件
  fullManage_updateDispatchOrderFile: "/fullTrusteeshipPicking/updateDispatchOrderFile", // 更新发货单文件
  fullManage_deleteDispatchOrderFile: "/fullTrusteeshipPicking/deleteDispatchOrderFile", // 删除发货单文件
  fullManage_insertDispatchOrderFile: "/fullTrusteeshipPicking/insertDispatchOrderFile/", // 新增发货单文件
  fullManage_queryBoxDetail: "/trusteeshipPickingBox/queryBoxDetail", // 货箱详细查询
  fullManage_queryBoxInfo: "/trusteeshipPickingBox/queryBoxInfo", // 货箱信息查询
  fullManage_queryDispatchOrderFileInfoList: "/fullTrusteeshipPicking/queryDispatchOrderFileInfoList", // 列表页上传文件列表查询
  fullManage_batchUpdate: "/fullTrusteeshipPicking/batchUpdate", // 批量上传文件
  fullManage_queryByExpressDelivery: "/fullTrusteeshipPicking/queryByExpressDelivery", // 快递详情
  fullManage_goodsList: "/fullTrusteeshipPicking/goodsList", // 快递详情
  fullManage_queryStatusCount: "/fullTrusteeshipPicking/queryStatusCount/", // 查询出库单各状态数量
  // 借样出库功能
  // 创建出库单 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-166856826
  lendSampleCreate: '/borrowSamplePicking/create',
  // 出库单各状态数量 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-167415291
  lendSampleQueryCount: '/borrowSamplePicking/queryCount',
  // 出库单列表查询 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-167415290
  lendSampleQueryList: '/borrowSamplePicking/queryList',
  // 出库单导入 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-167415292
  lendSampleImportPicking: '/borrowSamplePicking/importPicking',
  // 出库单明细查询 入参 /{pickingId} https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-167648294
  lendSampleDetail: '/borrowSamplePicking/queryDetail',
  // 编辑出库单 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-168596732
  lendSampleEditPicking: '/borrowSamplePicking/editPicking',
  // 审核 入参 /{pickingId} https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-167915774
  lendSampleAudit: '/borrowSamplePicking/auditPass',
  // 确认借出 入参 /{pickingId} https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-167881467
  lendSamplBorrow: '/borrowSamplePicking/borrowProduct',
  // 修改出库单(用于修改地址信息) https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-168364743
  lendSamplUpdatePicking: '/borrowSamplePicking/updatePicking',
  // 导出出库单 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-169829927
  lendSamplExportPicking: '/borrowSamplePicking/exportPicking',
  uploadYmsPackage: "/packageInfo/uploadYmsPackage", // 申请按钮
  queryWaitUploadYmsPackage: "/packageInfo/queryWaitUploadYmsPackage", // 查询
  exportWaitUploadYmsPackage: "/packageInfo/exportWaitUploadYmsPackage", // 导出
  // 出库管理-更新增值服务 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-175371359
  updateValueAddedService: '/wmsPicking/updateValueAddedService/',
  queryForDistributionLogisticsError: "/packageInfo/queryForDistributionLogisticsError", // 已下发物流异常列表
  exportForDistributionLogisticsError: "/packageInfo/exportForDistributionLogisticsError", // 已下发物流异常导出接口
  // 销售出库/出库单检索的店铺权限列表 http://192.168.91.7:882/project/263/interface/api/16084
  queryUserSaleAccounts: "/wms/common/queryUserSaleAccounts", // 店铺权限
};

// 处理
const handApi = (obj, prefix) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] == 'string') {
      obj[key] = `${prefix}${obj[key]}`;
    } else if (typeof obj[key] == 'object') {
      handApi(obj[key], obj[key]);
    }
  });
}

handApi(outStockApi, '/wms-service');

export default {
  ...outStockApi,
  ...packageApi
};
