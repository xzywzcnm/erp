export default { // 订单模块
  get_orderList: '/order-service/orderInfo/queryForPendingNotes', // 订单列表
  get_orderDetails: '/order-service/orderInfo/detail', // 订单详情
  // 平台仓---订单详情  /{orderId}
  platformOrderDetail: '/order-service/orderInfo/platformOrderDetail',
  stockOutDetail: './erpCommon/wms-service/packageInfo/api/stockOut/detail', // 查询包裹缺货详情
  get_wmsInventory: './erpCommon/wms-service/wmsInventory/api/query', // 库存管理-获取已有库存列表信息
  get_orderCommonParameter: './erpCommon/common-service/commonParameter/list', // 物流 remark
  set_allMarkRead: '/order-service/orderInfo/markAllAsRead', // 标记所有为已读
  set_markRead: '/order-service/orderInfo/markAsRead', // 标记为已读=
  get_interceptOrderList: '/order-service/orderInfo/queryForSuspend', // 截留订单列表
  batchUpdateReceiverAddress: '/order-service/orderShippingInfo/batchUpdateReceiverAddress', // 批量修改地址
  set_orderRelease: '/order-service/orderInfo/updateForSuspendPass', // 有条件放行
  get_combineOrderList: '/order-service/orderInfo/queryForAllowMerge', // 可合并订单列表查询
  get_orderProductList: '/order-service/orderTransaction/queryByOrderIds', // 根据订单号查询产品
  get_orderRemark: '/order-service/orderRemark/queryByOrderIds', // 根据订单号查询订单备注
  get_shipmentsList: '/order-service/orderInfo/queryForMarkShipments', // 标发货列表
  syncIgnore: '/order-service/orderInfo/syncIgnore/', // 忽略标记发货
  batchSyncIgnore: '/order-service/orderInfo/batchSyncIgnore', // 订单 - 批量忽略订单标记发货
  batchSyncIgnoreWay: '/order-service/orderInfo/batchSyncIgnoreUpdated', // 订单 - 批量忽略订单标记发货
  cancelSyncIgnore: '/order-service/orderInfo/cancelSyncIgnore/', // 订单 - 取消忽略订单标记发货
  get_fullTextSearch: '/order-service/orderInfo/fullTextSearch', // 订单 - 订单全文检索
  orderRetrievalBatchInsertRemark: '/order-service/orderRemark/orderRetrievalBatchInsertRemark', // 订单检索批量备注
  distributionBatchInsertRemark: '/order-service/orderRemark/distributionBatchInsertRemark', // 配货失败批量备注
  interceptBatchInsertRemark: '/order-service/orderRemark/interceptBatchInsertRemark', // 截留订单批量备注
  unMatchGoodsBatchnsertRemark: '/order-service/orderRemark/unMatchGoodsBatchnsertRemark', // 未匹配商品批量备注
  // 更新包裹尺码 put 请求方式 入参 {length: Number, width: Number, height: Number, orderShippingId: String}
  updatePackageSize: '/order-service/orderShippingInfo/updatePackageSize',

  get_listByOrderId: './erpCommon/cs-service/afterSales/api/listByOrderId/', // 查询订单售后单列表
  get_lqueryOrderAfterSalesById: '/order-service/orderInfo/api/queryOrderAfterSalesById/', // 订单系统售后单查询订单
  get_afterSalesApiDetail: './erpCommon/cs-service/afterSales/api/detail/', // 售后单处理详情
  get_afterSalesOrderReason: './erpCommon/cs-service/afterSales/queryReason', // 售后单处理原因
  post_orderAfterSales: './erpCommon/cs-service/afterSales/api', // 售后处理-新增售后

  update_order: '/order-service/orderInfo', // 更新订单
  set_intercept: '/order-service/orderInfo/suspend', // 截留
  get_searchOrders: '/order-service/orderInfo/query', // 订单检索
  // ozon订单拆分 http://192.168.91.7:882/project/268/interface/api/15828
  splitOrderInfo: '/order-service/orderInfo/ozon/splitOrderInfo',
  asyncSendByQueryResult: '/order-service/orderInfo/ebaySendBuyerMessage/asyncSendByQueryResult', //  批量联系所有买家
  get_queryForInvalid: '/order-service/orderInfo/queryForInvalid', // 已取消订单检索
  get_platformShippedOrder: '/order-service/platformShippedOrder/query', // 平台发货订单-分页查询
  export_orders: '/order-service/orderInfo/exportOrders', // 订单导出
  exportSuspendOrders: '/order-service/orderInfo/exportSuspendOrders', // 截留订单导出(后端未提供API文档)
  get_trackUpdateList: '/order-service/orderInfo/queryForTrackUpdated', // 运单号有更新列表
  add_remark: '/order-service/orderRemark/insert', // 添加备注
  del_remark: '/order-service/orderRemark/delete/', // 删除备注
  get_queryHandOrder: '/order-service/orderInfo/queryHandOrder', // 订单-手工单列表  分页查询
  get_createHandOrder: '/order-service/orderInfo/createHandOrder', // 订单-手工单列表  分页查询
  resume_order: '/order-service/orderInfo/resume/', // 恢复订单
  get_orderShippingInfoByOrder: '/order-service/orderShippingInfo/queryUpdateWarehouseOrShippingMethodByOrder', // 查询订单下的可以修改仓库或者邮寄方式的发货信息列表
  put_batchUpdateWarehouse: '/order-service/orderShippingInfo/batchUpdateWarehouse', // 订单系统-批量更换仓库
  put_batchReplaceShippingMethod: '/order-service/orderShippingInfo/batchReplaceShippingMethod', // 订单系统-批量更换邮寄方式
  update_orderApplyWaybill: '/order-service/orderInfo/uploadOrder', // 批量申请运单

  get_nonPaymentList: '/order-service/orderInfo/queryForNonPayment', // 未付款列表
  post_orderInfo_convertToShippedSelf: '/order-service/orderInfo/convertToShippedSelf', // 未付款列表
  get_orderMenuNum: '/order-service/orderInfo/queryForBadges', // 订单数
  get_mergeDigest: '/order-service/orderInfo/queryForMergeDigest', // 订单-可合并订单列表-详情列表
  merge_BatchOrder: '/order-service/orderInfo/updateForBatchMerge', // 批量合并订单
  merge_singleOrder: '/order-service/orderInfo/updateForMerge', // 单个合并
  export_retrieveOrder: '/order-service/orderInfo/exportOrders', // 订单检索导出
  export_platformShippedOrderFBA: '/order-service/platformShippedOrder/export', // FBA订单检索导出
  export_platformShippedOrder: '/order-service/platformShippedOrder/exportPlatformOrder', // 速卖通菜鸟仓、沃尔玛平台仓导出
  // aliexpress 全托管-采购单列表分页查询 http://192.168.91.7:882/project/268/interface/api/15373
  aliexpressList: '/order-service/aliexpress/purchaseOrder/list',
  // aliexpress 全托管-采购单列表分页导出 http://192.168.91.7:882/project/268/interface/api/15381
  aliexpressExport: '/order-service/aliexpress/purchaseOrder/export',
  // aliexpress 全托管-确认接单 http://192.168.91.7:882/project/268/interface/api/15385
  confirmPurchaseOrder: '/order-service/aliexpress/purchaseOrder/confirmPurchaseOrder',
  // 预约揽收单 http://192.168.91.7:882/project/268/interface/api/15718
  appointmentPickupOrder: '/order-service/aliexpress/purchaseOrder/appointmentPickupOrder',
  // 查询揽收面单 http://192.168.91.7:882/project/268/interface/api/15717
  pickupShippingMarkPdf: '/order-service/aliexpress/purchaseOrder/pickupShippingMarkPdf',
  // 查询物流面单 http://192.168.91.7:882/project/268/interface/api/15716
  shippingLogisticsMarkPdf: '/order-service/aliexpress/purchaseOrder/shippingMarkPdf',
  // 获取 速卖通授权为全托管的店铺
  queryAliexpressAccountList: '/order-service/erpCommon/setting-service/saleAccount/api/subsystem/queryAliexpressAccountList',
  export_stockOutOrder: '/order-service/orderInfo/exportGoodsMissing', // 沃尔玛 异常订单 导出
  export_cancelOrder: '/order-service/orderInfo/exportInvalidOrders', // 已取消订单导出
  mark_paid: '/order-service/orderInfo/markOrderPayment', // 标记为已付款,
  export_excelImportHandOrder: '/order-service/orderInfo/excelImportHandOrder', // Excel导入 手工单,
  invalid_order: '/orderInfo/api/invalid', // 作废订单
  get_markShipmentNum: '/order-service/orderInfo/queryMarkShippingBadges', // 标发货数量
  get_queryNotShippingAndtrackingUpdatedBadges: '/order-service/orderInfo/queryNotShippingAndtrackingUpdatedBadges',
  // otto 平台 标发货列表数量 https://app.apifox.com/project/3429548(订单模块标发货)
  ottoForMarkShipmentsCount: '/order-service/orderInfo/queryForMarkShipmentsCount',
  cancel_delivery: '/order-service/orderInfo/cancelOrder', // 取消order,
  markShipment: '/order-service/orderInfo/updateForShipments', // 标记发货
  set_asyncTrackUpdate: '/order-service/orderInfo/updateForTrackUpdated', // 订单-同步运单号有更新
  cancel_splitOrder: '/order-service/orderInfo/cancelSplitOrder', // 取消拆分订单
  update_forDismantleAndPack: '/order-service/orderInfo/updateForDismantleAndPack', // 拆除包裹
  set_splitOrder: '/order-service/orderInfo/splitOrder', // 拆分订单到包裹
  get_queryForGoodsMissing: '/order-service/orderInfo/queryForGoodsMissing', // 缺货订单分页查询
  set_orderNoDeliver: '/order-service/orderTransaction/markNoDeliver', // 标记商品不发货
  set_cancelOrderForNonPayment: '/order-service/orderInfo/cancelOrderForNonPayment', // 未付款取消订单
  get_queryByStatus: '/order-service/merchantPlatform/queryByStatus', // 获取平台信息
  update_packageAddress: '/order-service/orderShippingInfo/updateReceiverAddress', // 更新包裹地址
  update_packageDetails: '/order-service/orderShippingInfo/updateOrderShippingDetail', // 更新包裹详情
  get_matchTheLogicticsList: '/order-service/orderInfo/queryForSetShippingMethod', // 待匹配的物流方式订单
  batchMatchWarehouseRules: '/order-service/orderTransaction/batchMatchWarehouseRules', // 批量匹配参考/邮寄方式
  set_shippingMethod: '/order-service/orderInfo/batchSetShippingMethod', // 批量指定物流方式
  set_singleShippingMethod: '/order-service/orderInfo/setShippingMethod', // 单个指定物流方式
  create_newPackage: '/order-service/orderShippingInfo', // 添加新包裹
  reset_package: '/order-service/orderShippingInfo/resetPackage', // 重置包裹
  post_split: '/order-service/orderShippingInfo/split', // 拆包包裹
  drop_package: '/order-service/orderShippingInfo/', // 订单详情包裹删除
  individual_delivery: '/order-service/orderInfo/moveFromPackage', // 单独发货
  update_singleShippingMethod: '/order-service/orderShippingInfo/replaceShippingMethod', // 订单详情包裹更换物流方式
  get_unmatchGoods: '/order-service/orderInfo/queryForUnmatchedGoods', // 分页查询未匹配商品
  batchMatchProductGoods: '/order-service/orderTransaction/batchMatchProductGoods', // 批量匹配商品
  query_productSkuMapping: '/erpCommon/product-service/productSkuMapping/api/query', // 查询SKU映射列表
  query_productGoods: '/erpCommon/product-service/productGoods/api/query', // 查询货品列表 前面加前缀
  query_productImgs: '/erpCommon/product-service/productGoodsImage/api/queryByProductGoodsIds', // 查询货品图片
  query_imageByProductGoodsIds: '/product-service/productGoods/api/queryImageByProductGoodsIds',
  query_byGoodsMissing: '/order-service/orderInfo/queryByGoodsMissing', // 缺货订单信息查询
  orderInfoList: '/sps-service/sps/orderInfoList', // 查询订单采购信息
  wmsInventoryList: '/wms-service/wmsInventory/wmsInventoryList', // 库存余量信息查询
  create_productSkuMap: '/erpCommon/product-service/productSkuMapping/api', // 新建sku映射
  match_productGoods: '/order-service/orderTransaction/matchProductGoods', // 订单匹配商品
  match_productGoodMatch: '/erpCommon/order-service/orderTransaction/matchProductGoods', // 订单匹配商品
  get_orderCarrierRule: '/orderCarrierRule/', // 获取物流规则
  set_orderCarrierRule: '/order-service/orderCarrierRule/batchUpdate', // 更新物流规则
  updateOrderShippingInfo_warehouse: '/order-service/orderShippingInfo/updateWarehouse', // 更换仓库
  get_orderDetailsNewPackageProductDetails: '/order-service/orderShippingInfo/queryOrderShippingDetailByOrderId',
  qury_productSku: '/order-service/erpCommon/product-service/productSku/api/queryBySku', // 人工匹配前先查一下sku映射列表
  getCsMessage: '/order-service/erpCommon/cs-service/cs/api/message/detailList',
  query_taskData: '/order-service/orderCommonTaskInfo/queryCommonTaskInfoData', // 查询任务数据列表
  get_orderCarrierScope: '/order-service/orderCarrierScope/warehouseId/', // 查询物流渠道适用范围列表
  put_orderCarrierScope: '/order-service/orderCarrierScope/', // 更新物流渠道适用范围
  queryByBuyerIdAndItemId: '/order-service/orderInfo/api/queryByBuyerIdAndItemId', // 常用模板
  get_splitChars: '/order-service/skuMatchSetting/splitChars', // 获取截取符号列表
  get_skuMatchSetting: '/order-service/skuMatchSetting/platformSettings', // 查询平台sku匹配设置
  get_platformSkuMatchSetting: '/order-service/skuMatchSetting/querySettingByPlatform', // 查询平台sku匹配设置 后面带参数{platformId}
  skuMatchSettingSave: '/order-service/skuMatchSetting/create', // 保存sku匹配设置 post
  splitSku: '/order-service/skuMatchSetting/splitSku', // 截取匹配的sku  post
  enableSetting: '/order-service/skuMatchSetting/enable', // 启用 /{skuMatchSettingId} PUT
  disableSetting: '/order-service/skuMatchSetting/disable', // 停用 /{skuMatchSettingId} PUT
  batchDisable: '/order-service/skuMatchSetting/batchDisable', // 批量停用 PUT
  shopSkuSetting: '/order-service/skuMatchSetting', // 查询具体店铺sku设置详情 {skuMatchSettingId} GET
  update_ebaySendBuyerMessage: '/order-service/orderInfo/ebaySendBuyerMessage', // ebay站内信-发送站内信
  update_ebaySendBuyerMessageNew: '/order-service/orderInfo/ebaySendBuyerMessage/list', // 批量 ebay站内信-发送站内信
  import_channel: '/order-service/orderInfo/prepareImportOrder', // 自定义渠道的上传
  import_channel_data: '/order-service/orderInfo/importDefineOrder', // 自定义渠道的导入
  get_enoughInventoryWarehouses: '/order-service/erpCommon/wms-service/wms/api/picking/enoughInventoryWarehouses', // 库存仓库的数据
  get_analysisLogistics: '/order-service/orderShippingInfo/queryMatchShippingMethod', // 可用物流方式
  post_orderInfo_queryByOrderIdForCarrierShippingMethod: '/order-service/orderInfo/queryByOrderIdForCarrierShippingMethod', // 订单标发货列表-退货跟踪号列表
  post_orderInfo_updateReturnTrackingNumber: '/order-service/orderInfo/updateReturnTrackingNumber', // 订单标发货列表-退货跟踪号列表
  post_orderInfo_excelImportHandReturnTrackingNumber: '/order-service/orderInfo/excelImportHandReturnTrackingNumber', // 订单标发货-导入退货跟踪号
  get_orderInfo_getTemplet: '/order-service/orderInfo/getTemplet', // 获取退货模板

  post_orderShippingInfo_decryptByOrderId: '/order-service/orderShippingInfo/decryptByOrderId', // 发货系统- 收件人地址解密接口  deleteMatchSkuMapping: '/order-service/orderTransaction/deleteMatchSkuMapping', // 删除sku映射
  create_productSkuMap_single: '/product-service/productSkuMapping/api', // 删除sku映射
  queryInventoryByWarehouseOverseaType: '/wms-service/wmsInventory/api/queryInventoryByWarehouseOverseaType', // 查询包裹下产品真实库存
  // 查询otto品牌 http://192.168.91.7:882/project/268/interface/api/16105
  getBrandData: '/order-service/orderInfo/otto/getBrand',

  // otto退货包裹
  otto_importReturnPackage: '/order-service/returnPackageManager/importReturnPackage', // 退货包裹导入
  otto_query: '/order-service/returnPackageManager/query', // 退货包裹查询
  otto_queryPackageDetail: '/order-service/returnPackageManager/queryPackageDetail', // 退货包裹明细查询
  otto_invalidReturnPackage: '/order-service/returnPackageManager/invalidReturnPackage', // 退货包裹作废
  otto_queryMatchingReturnPackage: '/order-service/returnPackageManager/queryMatchingReturnPackage', // 查询匹配退货包裹明细
  otto_exportReturnPackage: '/order-service/returnPackageManager/exportReturnPackage', // 导出退货包裹列表
  otto_cancelBindingReturnPackage: '/order-service/returnPackageManager/cancelBindingReturnPackage/', // 取消退件匹配
  otto_batchInvalidReturn: '/order-service/returnPackageManager/batchInvalidReturnPackage', // 批量作废退货包裹
  otto_updateRemark: '/order-service/returnPackageManager/updateRemark', // 更新备注

  // otto退款申请处理
  ott_queryOttoRefundInfo: '/order-service/orderInfo/queryOttoRefundInfo', // 查询otto退款信息列表
  ott_acceptedOttoRefund: '/order-service/orderInfo/acceptedOttoRefund', // 接受退款处理 put
  ott_rejectedOttoRefund: '/order-service/orderInfo/rejectedOttoRefund', // 拒绝退款处理 put
  ott_batchAcceptedOttoRefund: '/order-service/orderInfo/batchAcceptedOttoRefund', // 批量接受退款处理
  // 第三方物流服务商设置信息 http://192.168.91.7:882/project/343/interface/api/16061
  otherPlatformCarrier: '/setting-service/erpCommonSettingParam/query',
  // shein 物流服务商设置信息 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-199999148
  queryCarrierChannel: '/setting-service/sheinxAccount/queryCarrierChannel',
  // 导出退款信息 http://192.168.91.7:882/project/268/interface/api/15173
  exportOttoRefund: '/order-service/orderInfo/exportOttoRefund',
  ott_batchRejectedOttoRefund: '/order-service/orderInfo/batchRejectedOttoRefund', // 批量拒绝退款处理
  queryTiktokCarrier: '/setting-service/tiktokAccount/queryTiktokCarrier', // tiktok物流商列表
};
