let prefix = "/wms-service";
export default {
  // 入库单管理模块
  inWareListSearchData: prefix + "/wmsReceipt/query", // 入库单管理的查询功能
  createInWareOrder: prefix + "/wmsReceipt/create", // 手工创建ASN入库单
  addNewProduct: prefix + "/wms/receipt/receiptBatch/createDetailReceipt", // 添加货品
  watchInWareDetails: prefix + "/wmsReceipt/detail", // 查看入库单明细
  get_addNewProductListData: prefix + "/wms/receipt/list", // 获取新增产品的列表信息
  add_receiveBatch: prefix + "/wmsReceiptBatch/create", // 添加收货批次
  detail_receiveBatch: prefix + "/wmsReceiptBatch/detail/create", // 批量添加收货批次
  add_Notes: prefix + "/wmsReceiptLog/create", // 添加备注信息
  close_order: prefix + "/wmsReceipt/close", // 关闭入库单
  selectWareLocation: prefix + "/wmsReceipt/locationList", // 入库单详情-获取库位信息列表
  selectDetailWareBlock: prefix + "/wmsReceipt/locationAllwb", // 入库单详情-获取库区下拉列表
  selectReceiptWareName: prefix + "/wms/receipt/warehouse/list", // 获取入库单管理仓库下拉列表
  downloadModalFile: prefix + "/wms/common/queryExcelTemplate", // 下载模板文件
  get_inWareGoodsList: prefix + "/wmsReceipt/goodsList",
  get_wmsPickingLog: prefix + "/wmsPickingLog/listByNextToken", // 获取wms 操作日志
  updateReceiptTransitStatus: prefix + "/wmsReceipt/updateReceiptTransitStatus", // 设置入库单冻结状态
  // 质检管理模块
  qualitySearchData: prefix + "/wmsReceiptBatchCheck/list", // 质检管理的查询功能
  submitQualityData: prefix + "/wmsReceiptBatchCheck/detail", // 提交质检结果前信息查询
  upload_Img: prefix + "/wmsReceiptBatchCheck/upload", // 上传图片(最大 5M)
  uploadFile: prefix + '/processAbnormalArrival/upload', // 上传文件(最大 10M)
  submitQualityCheck: prefix + "/wmsReceiptBatchCheck/submit", // 提交质检结果
  get_qualityPersonName: prefix + "/wmsReceiptBatchCheck/createdby", // 获取所有质检人信息列表
  selectCheckWareHouseName: prefix + "/wms/receipt/check/queryAllwarehouse", // 获取质检管理仓库下拉列表
  // 上架管理模块
  get_shelvesListData: prefix + "/wmsReceiptCheckDetailShelve/query", // 获取上架管理的表格数据
  shelvesListSearchData: prefix + "/wmsReceiptCheckDetailShelve/query", // 上架管理的查询功能
  submitShelvesData: prefix + "/wmsReceiptCheckDetailShelve/", // 提交上架管理前的信息查询
  submitShelvesCheck: prefix + "/wmsReceiptCheckDetailShelve/createShelve", // 提交上架结果
  get_shelvePersonName: prefix + "/wmsReceiptCheckDetailShelve/queryAllCreatedBy", // 获取所有上架人信息列表
  shelfWareLocationList: prefix + "/wmsReceiptCheckDetailShelve/queryListParamInventory", // 提交上架结果-获取库位列表信息
  selectShelfWareHouseName: prefix + "/wms/receipt/shelve/warehouseList", // 获取上架管理仓库下拉列表
  selectShelfWareBlockName: prefix + "/wmsReceiptCheckDetailShelve/warehouseBlockAll", // 提交上架结果-获取库区下拉列表
  // 导出数据
  shelveExportData: prefix + "/wmsReceiptCheckDetailShelve/export",
  wmsReceiptQueryDetail: prefix + "/wmsReceipt/detail", // 入库管理-扫描或输入搜索入库单或参考编号查询仓储入库单详细内容(基本信息+货品信息+日志信息)
  wmsReceiptScan: prefix + "/wmsReceipt/scan", // 收货扫描
  queryAllByReceiptNo: prefix + "/wmsReceiptDetail/queryAllByReceiptNo", // 入库管理-根据入库单号查询所有入库单详情 (质检列表)
  post_wmsReceipt_detailAll: prefix + "/wmsReceipt/detailAll", // 入库管理-查询仓储入库单详细内容(基本信息+货品信息+日志信息)
  queryByProductGoodsIds: prefix + "/wmsWarehouseBlock/queryBindBlockByProductGoodsIds", // 库存余量打印 查询货品分类库区
  wmsGoodsQueryGoodsBySku: prefix + "/wmsGoods/queryGoodsBySku",
  queryWaitCheckShelve: prefix + "/wmsReceipt/queryWaitCheckShelve/", // 取消收货 入库单待质检 待上架列表
  cancelReceipt: prefix + "/wmsReceipt/cancelReceipt", // 取消收货
  goodWarehouseLocal: prefix + "/wmsWarehouseLocation/queryRecommendedListParamInventory", // 上架管理-查询推荐库位
  batchSubmit: prefix + "/wmsReceiptBatchCheck/batchSubmit", // 批量质检
  batchCreateShelve: prefix + "/wmsReceiptCheckDetailShelve/batchCreateShelve", // 批量上架
  listByCondition: prefix + "/wmsWarehouseLocation/listByCondition", // 新库位接口
  wmsInventoryExport: prefix + "/wmsInventory/export", // excel导出
  exportRegular: prefix + "/wmsInventory/exportRegular", // 库存余量导出
  query_allDeveloper:
    prefix + "/erpCommon/product-service/productGoods/select/allDeveloper", // 获取开发产品人员
  get_productCategory: prefix + "/erpCommon/product-service/productCategory/queryAll", // 查询商品分类
  printReceiptLabel: prefix + "/wmsReceipt/printReceiptLabel", // 将多个文件(pdf/图片)合并生成一个文件pdf
  printReceiptLabelImage: prefix + "/wmsReceipt/printReceiptLabelImage", // 将pdf转图片

  // 质检模块
  get_addresstreeList: "/dyt-cloud-upms-admin/district/treeList", // 获取退货地址(在 UPMS 系统中)
  get_createProcessingGetSupplierInfo:
    prefix + "/wmsReceiptBatchCheck/createProcessingGetSupplierInfo", // 质检-创建处理单获取供应商信息
  quality_getReceiptCheckQuestion:
    prefix + "/wmsReceiptCheckQuestion/getReceiptCheckQuestion", // 处理单-查询列表
  export_Sync: prefix + "/wmsReceiptCheckQuestion/exportSync", // 处理单-处理单列表导出
  get_receiptCheckQuestionDetail:
    prefix + "/wmsReceiptCheckQuestion/getReceiptCheckQuestionDetail", // 处理单-详情
  get_refundAddress: prefix + "/wmsReceiptBatchCheck/getRefundAddress", // 创建处理单-获取供应商退货地址
  get_createProcessingQuery: prefix + "/wmsReceiptBatchCheck/createProcessingQuery", // 创建处理单时获取详情
  create_processing: prefix + "/wmsReceiptBatchCheck/createProcessing", // 创建处理单
  update_processing: prefix + "/wmsReceiptCheckQuestion/update", // 修改处理单
  get_logistics: prefix + "/erpCommon/sps-service/sps/despatch/logistics", // 获取物流商(快递公司)
  quality_getSupplierList: prefix + "/erpCommon/sps-service/sps/supplier/all", // 查询供应商列表
  quality_getReceiptCheck: prefix + "/wmsReceiptBatchCheck/getReceiptCheck", // 查询质检单列表
  quality_getReceiptCheckDetail: prefix + "/wmsReceiptBatchCheck/getReceiptCheckDetail", // 获取质检单明细
  quality_getAllCheckBatch: prefix + "/wmsReceiptBatchCheck/getAllCheckBatch", // 质检-查询当前所有质检批次
  quality_getTotalCheckBatchInfo: prefix + "/wmsReceiptBatchCheck/getTotalCheckBatchInfo", // 质检-查询当前批次总信息
  quality_queryQualityProjectListById:
    prefix +
    "/erpCommon/product-service/productQualityProject/queryQualityProjectListById", // 获取质检标准列表
  quality_wmsReceiptBatchCheckexport: prefix + "/wmsReceiptBatchCheck/export", // 质检单导出
  quality_getCheckBatchInfo: prefix + "/wmsReceiptBatchCheck/getCheckBatchInfo", // 质检-查询选中批次信息
  quality_getCheckBatchDetail: prefix + "/wmsReceiptBatchCheck/getCheckBatchDetail", // 质检-查询送检批次的质检详情
  update_batchUpdateReturn: prefix + "/wmsReceiptCheckQuestion/batchUpdateReturn", // 批量标记已退货
  update_batchUpdateDestroy: prefix + "/wmsReceiptCheckQuestion/batchUpdateDestroy", // 批量标记已销毁
  getGoodsShelfSlot: prefix + "/wmsReceiptBatchCheck/getGoodsShelfSlot", // 获取质检存放编码信息
  queryReceiptCheckStoreCode:
    prefix + "/api/wmsReceiptBatchCheck/queryReceiptCheckStoreCode", // 获取质检单存储编码
  receiptCheckPrint: prefix + "/wmsReceiptBatchCheck/receiptCheckPrint", // 获取质检编码打印信息
  updateReceiptCheckStoreCode:
    prefix + "/wmsReceiptBatchCheck/updateReceiptCheckStoreCode", // 修改质检单质检编码
  delReceiptCheckQuestion: prefix + "/wmsReceiptCheckQuestion", // 删除处理单
  checkBatchCreateShelve: prefix + "/wmsReceiptBatchCheck/batchCreateShelve", // 创建处理单-转合格上架
  exportNotHandleSync: prefix + "/wmsReceiptCheckQuestion/exportNotHandleSync", // 处理中的导出
  exportSelectNotHandleSync:
    prefix + "/wmsReceiptCheckQuestion/exportSelectNotHandleSync", // 处理中的导出明细
  exportHandleSync: prefix + "/wmsReceiptCheckQuestion/exportHandleSync", // 创处理完成的导出。
  exportSelectHandleSync: prefix + "/wmsReceiptCheckQuestion/exportSelectHandleSync", // 处理完成的导出明细。
  exportAsyncOther: prefix + "/wmsReceiptBatchCheck/exportAsyncOther", // 问题件处理-待处理的导出。
  getReceiptCheckToHandle: prefix + "/wmsReceiptBatchCheck/getReceiptCheckToHandle", // 问题件待处理
  getReceiptCheckQuestionFinal:
    prefix + "/wmsReceiptCheckQuestion/getReceiptCheckQuestionFinal", // 问题件处理完成

  // 获取所有质检模板数据，get方式
  getAllQualityTemplate:
    prefix + "/erpCommon/product-service/productInfo/getAllQualityTemplate",
  quality_createShelve: prefix + "/wmsReceiptBatchCheck/createShelve", // 质检单-转合格上架
  quality_updateReceiptCheckType: prefix + "/wmsReceiptBatchCheck/updateReceiptCheckType", // 质检-修改应检
  quality_createRemarkDTO: prefix + "/wmsReceiptBatchCheck/createRemarkDTO", // 增加备注
  quality_exportSync: prefix + "/wmsReceiptBatchCheck/exportSync", // 质检单导出-异步
  quality_queryQualifiedData: prefix + "/wmsReceiptBatchCheck/queryQualifiedData", // 质检-查询质检问题产品详情（转合格上架）
  quality_getReceiptProblem: prefix + "/wmsReceiptBatchCheck/getReceiptProblem", // 查询质检问题产品详情

  // 全托管退货管理
  scan_getReturnInfo: prefix + "/wmsReceipt/scanGetReturnInfo", // 扫描或输入退货单号
  query_productGoodsInfoBySkuList:
    prefix + "/erpCommon/product-service/productGoods/api/queryProductGoodsInfoBySkuList", // 通过SKU查询商品名称
  query_list: prefix + "/erpCommon/sps-service/sps/return/list", // 全托管退货数据管理-获取列表信息
  get_temuStore: prefix + "/erpCommon/sps-service/sps/return/temu/ignoreAuth/store", // 获取temu店铺权限信息
  get_temuDetailList: prefix + "/erpCommon/sps-service/sps/return/detail", // 全托管退货数据管理-获取temu明细列表信息
  view_refundHandle: prefix + "/erpCommon/sps-service/sps/return/viewRefundHandle", // 全托管退货管理-查看处理单
  processingCompletion:
    prefix + "/erpCommon/sps-service/sps/return/api/processingCompletion", // 全托管退货管理-标记处理完结
  update_returnInfo: prefix + "/erpCommon/sps-service/sps/return/api/updateReturnInfo", // 全托管退货管理-修改处理单
  query_waitRefundedList:
    prefix + "/erpCommon/sps-service/sps/return/api/waitRefundedList", // 全托管退货管理-待退供处理分页查询
  confirm_receipt: prefix + "/wmsReceipt/confirmReceipt", // 全托管退货管理-确认收货
  waitRefunded_export: prefix + "/wmsReceipt/waitRefundedExport", // 全托管退货管理-待退供列表导出
  refunded_export: prefix + "/wmsReceipt/refundedExport", // 全托管退货管理-退货单列表导出
  batch_create: prefix + "/wmsReceiptBatch/batchCreate", // 全托管退货管理-批量收货
  query_returnCodeList:
    prefix + "/erpCommon/sps-service/sps/return/api/queryReturnCodeList", // 全托管退货管理-查询退货单

  queryComingSpecial:
    prefix + "/erpCommon/sps-service/sps/api/purchase/queryComingSpecial", // 查询所有的来货特项
  // 装箱/集包
  packing_query: prefix + "/aliexpressPickupOrder/query", // 查询列表
  packing_scan: prefix + "/aliexpressPickupOrder/scan", // 扫描
  packing_queryDetail: prefix + "/aliexpressPickupOrder/queryDetail", // 详情
  packing_completePacking: prefix + "/aliexpressPickupOrder/completePacking", // 完成装箱
  packing_deleteContainer: prefix + "/aliexpressPickupOrder/deleteContainer", // 删除货箱
  packing_appointmentPickupOrder: prefix + "/aliexpressPickupOrder/appointmentPickupOrder", // 预约揽收单
  packing_printPickupOrder: prefix + "/aliexpressPickupOrder/printPickupOrder", // 打印揽收面单
  packing_export: prefix + "/aliexpressPickupOrder/export", // 导出
  packing_packingReview: prefix + "/aliexpressPickupOrder/packingReview", // 装箱复核
  packing_uploadPickupOrder: prefix + "/aliexpressPickupOrder/uploadPickupOrder", // 上传揽收单
  packing_markAccepted: prefix + "/aliexpressPickupOrder/markAccepted", // 标记已揽收
  packing_batchAppointmentPickupOrder: prefix + "/aliexpressPickupOrder/batchAppointmentPickupOrder", // 批量预约揽收单
  packing_queryPickupOrderBoxNumInfo: prefix + "/aliexpressPickupOrder/queryPickupOrderBoxNumInfo", // 校验预约揽收单
  packing_queryPackingCount: prefix + "/aliexpressPickupOrder/queryPackingCount", // 校验预约揽收单
  packing_batchCompletePacking: prefix + "/aliexpressPickupOrder/batchCompletePacking",//批量完成装箱
  // 获取 速卖通授权为全托管的店铺
  queryAliexpressAccountList: prefix + "/erpCommon/setting-service/saleAccount/api/subsystem/queryAliexpressAccountList",
  scanConvert: prefix + "/erpCommon/product-service/productTag/scanConvert",
};
