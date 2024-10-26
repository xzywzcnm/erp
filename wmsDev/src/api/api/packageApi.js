export default {
  // 包裹相关
  cancel_package: '/wms-service/orderShippingInfo/invalid/', // 包裹作废 + {packageCode}
  get_packageDetails: '/wms-service/packageInfo/', // 包裹详情
  update_packageDeclare: '/wms-service/packageDeclare', // 更新包裹申报
  add_packageDeclare: '/wms-service/packageDeclare/insert', // 新增包裹申报
  del_packageDeclare: '/wms-service/packageDeclare/delete/', // 删除包裹申报
  get_packageCommonDeclare: '/wms-service/packageCommonDeclare/query', // 常用申报信息
  add_packageCommonDeclare: '/wms-service/packageCommonDeclare', // 添加常用申报信息
  update_packageCommonDeclare: '/wms-service/packageCommonDeclare', // 更新常用申报信息
  del_packageCommonDeclare: '/wms-service/packageCommonDeclare/', // 删除常用申报
  set_uploadPackage: '/wms-service/packageInfo/uploadPackage', // 申请运单号
  restCreateTracking: './erpCommon/order-service/orderShippingInfo/updatePackageSize', // 重新申请运单号接口
  update_moreShippingMethod: '/wms-service/packageInfo/replaceWaitingUploadShippingMethod', // 待申请包裹批量更换物流方式
  update_printShippingMethod: '/wms-service/packageInfo/replaceAllowPrintShippingMethod', // 待打印包裹批量更换物流方式
  get_printList: '/wms-service/packageInfo/queryForAllowPrint', // 包裹打印分页
  get_exList: '/wms-service/packageInfo/queryForOutWarehouse', // 包裹出库列表
  get_packagePrintBatchInfo: '/wms-service/packagePrintBatchInfo/query', // 搜索批次打印的包裹
  down_loadPickingOrderPdf: '/wms-service/packageInfo/loadPickingOrderPdf', // 重打面单 下载pdf
  down_queryDistribution: '/wms-service/packageInfo/queryDistribution', // 搜索配货清单  打印配货清单
  get_cancelPackageList: '/wms-service/packageInfo/queryForRecycle', // 回收包裹列表
  export_cancelPackageList: '/wms-service/packageInfo/exportForRecycle', // 导出作废出库单
  get_recycledProducts: '/wms-service/packageRecycleProduct/query', // 异常包裹归库 -- 已回收产品
  get_stockForm: '/wms-service/packageRegressProduct/query', // 异常包裹归库 -- 归库单
  get_generate: '/wms-service/packageRecycleProduct/applay/', // 生成归库单
  get_generateAll: '/wms-service/packageRecycleProduct/batchApplay', // 批量生成归库单
  get_markStock: '/wms-service/packageRegressProduct/editStatus', // 标记归库完成
  get_InventoryDetails: '/wms-service/packageRegressProduct/', // 归库单详情
  export_ProductNumbers: '/wms-service/packageRegressProduct/queryByRegressProductNumbers', // 批量打印归库单
  get_queryForAfreshPrint: '/wms-service/packageInfo/queryForAfreshPrint', // 搜索重打面单的包裹
  express_sheet: '/wms-service/packageInfo/printExpressBill', // 打印面单
  get_singleExpressBillPath: '/wms-service/packageInfo/printExpressBill/', // 获取单个打印面单地址
  get_packageToRetrieve: '/wms-service/packageInfo/query', // 已出库包裹检索
  export_package: '/wms-service/packageInfo/export', // 导出
  get_packageByCode: '/wms-service/packageInfo/getPackageByCode/', // 扫描包裹
  validateDeliveryPackage: '/wms-service/packageInfo/validateDeliveryPackage', // 扫描称重后校验包裹
  put_validatePickingPackage: '/wms-service/packageInfo/validatePickingPackage', // 包装作业--扫描称重后校验包裹
  markPackageDelivery: '/wms-service/packageInfo/markPackageDelivery', // 单个标发货
  scanBatchMarkPackageDelivery: '/wms-service/packageInfo/scanBatchMarkPackageDelivery', // 扫描批量标出库
  set_batchMarkPackageDelivery: '/wms-service/packageInfo/batchMarkPackageDelivery', // 标记出库
  set_markPackageDelivery: '/wms-service/packageInfo/markPackageDelivery', // 标记包裹出库
  get_deliveryBatchNo: '/wms-service/packageInfo/getDeliveryBatchNo', // 获取发货批次号
  set_DeliverySetting: '/wms-service/packageSettingCommon/saveDeliverySetting', // 保存发货设置
  get_OperationsSetting: '/wms-service/packageSettingCommon/queryPackingOperationsSetting', // 获取包装设置
  get_DeliverySetting: '/wms-service/packageSettingCommon/queryDeliverySetting', // 获取发货设置
  put_scanPackaging: '/wms-service/wmsPicking/scanPackaging/', // 包装作业扫描出库单号、运单号、物流商单号
  get_packingMaterial: '/wms-service/wmsPackageMaterial/queryAll', // 查询所有包材编号
  post_markException: '/wms-service/wmsPickingGoods/markException', // 包装作业---标记异常
  put_packingWeighting: '/wms-service/wmsPicking/packingWeighting', // 称重
  set_packageOverBag: '/wms-service/packageInfo/createExcelForBagging', // 结袋导出
  post_wmsPickupOrder_packageBagging: '/wms-service/wmsPickupOrder/packageBagging', // 供应商的结袋
  get_packageProductList: '/wms-service/packageInfo/queryPackageGoodsForMissing', // 获取选取包裹商品详情
  set_markPackageGoodsMissing: '/wms-service/packageInfo/markPackageGoodsMissing', // 标记缺货
  mark_printed: '/wms-service/packageInfo/markPackagePrinted', // 标记包裹已打印
  markPackagePrinted: '/wms-service/packageInfo/markPackagePrinted', // 发货系统-标识包裹已打印,生成打印批次
  print_pickingOrder: '/wms-service/packageInfo/queryForPrintPickingOrder', // 打印拣货单
  get_logistickPackageInfo: '/wms-service/packageInfo/getLogisticsPackgeInfo', // 获取运单号 && 获取面单
  get_batchConfirm: '/wms-service/packageInfo/batchConfirm', // 批量交运
  get_confirm: '/wms-service/packageInfo/confirm/', // 单独交运
  delete_packageInfo: '/wms-service/packageInfo/', // +packageId 删除包裹
  get_expressBill: '/wms-service/packageInfo/getExpressBill', // 获取面单
  set_rePrintExpressBill: '/wms-service/packageInfo/rePrintExpressBill', // 重打面单,
  get_issuedBadge: '/wms-service/packageInfo/queryNotAddPackageAndNoTrackingNumberBadge', // 获取
  del_package: '/wms-service/packageInfo/updateRecycle', // 回收包裹
  update_warehouse: '/wms-service/packageInfo/updateWarehouse', // 更换仓库
  get_deliveryMenuNum: '/wms-service/packageInfo/queryForBadges', // 发货菜单角标数字
  get_sortingList: '/wms-service/wmsPickingGoods/querySortingList', // 分拣-获取正在进行的分拣
  get_pickingId: '/wms-service/wmsPickingGoods/startSorting', // 开始分拣
  get_pickListOfGoods: '/wms-service/packageGoods/queryByPickingGoodsId/', // 拣货单货品列表查询
  get_packageList: '/wms-service/packageInfo/queryByPickingGoodsId/', // 出库单列表查询
  get_packageSetting: '/wms-service/packageSettingCommon/queryErpCommonSettingParam', // 查询分拣架设置列表
  put_sortingFinishPrint: '/wms-service/wmsPickingGoods/sortingFinishPrint', // 打印面单成功后 -分拣打印完成
  get_packingPickingGoodsInfo: '/wms-service/wmsPickingGoods/getPackingPickingGoodsInfo', // 获取当前用户作业包裹统计数量 与
  // 系统正在进行的包装作业
  get_getScanningPickingGoods: '/wms-service/wmsPickingGoods/getScanningPickingGoods', // 获取当前用户正在包装作业中的拣货单信息
  get_scanPickingGoodsNo: '/wms-service/wmsPickingGoods/scanPickingGoodsNo', // 包装作业扫描拣货单
  get_scanSku: '/wms-service/wmsPickingGoods/packingScanSku', // 扫描sku,传参若成功匹配包裹,则返回包裹数据,反之返回null
  update_weighting: '/wms-service/wmsPickingGoods/packingWeighting', // 称重
  end_sorting: '/wms-service/wmsPickingGoods/endSorting', // 分拣结束
  cancel_sorting: '/wms-service/wmsPickingGoods/cancelSorting/', // 撤销本次分拣
  del_packageInfo: '/wms-service/wmsPickingGoods/excludePackageInfo', // 将该包裹从当前拣货单中移除等待生成新的拣货单
  prepar_finishPack: '/wms-service/wmsPickingGoods/preparFinishPacking/', // 结束作业
  get_statisticsPack: '/wms-service/wmsPickingGoods/statisticsPacking/', // 结束作业后 - 获取包装统计
  get_warnPackages: '/wms-service/wmsPickingGoods/getPackingWarnPackages/', // 结束作业后 - 获取异常包裹信息
  confirm_finishPaxking: '/wms-service/wmsPickingGoods/confirmFinishPacking', // 确认强制结束作业
  quit_packingWork: '/wms-service/wmsPickingGoods/quitPacking/', // 退出作业
  update_packageFinishPrint: '/wms-service/wmsPickingGoods/packageFinishPrint', // 打印面单成功后 - 扫描包装完成
  update_clearScan: '/wms-service/wmsPickingGoods/packingClearScan', // 清空扫描货品,针对已扫描未打印的包裹,把扫描状态修改为初始值
  get_allWrapper: '/wms-service/wmsPackageMaterial/queryAll', // 查询用户所有包材
  get_userInfoMap: './erpCommon/common-service/userInfo/queryMapByUserIds', // 根据用户Id列表查询用户信息
  import_excel: '/wms-service/packageInfo/exportOrderExcel', // 导出excel
  import_printingExcel: '/wms-service/packageInfo/exportPackingPrintingExcel', // 包装作业结束异常，正在打印中出库单异常列表
  import_unPrintExcel: '/wms-service/packageInfo/exportPackingUnPrintExcel', // 包装作业结束异常，尚未打印或打印前作废出库单异常列表
  import_invalidExcel: '/wms-service/packageInfo/exportPackingInvalidExcel', // 包装作业结束异常，打印后作废出库单异常列表
  import_printingSkuExcel: '/wms-service/packageGoods/exportPackingPrintingSkusExcel', // 包装作业结束异常，正在打印中货品异常列表
  import_unPrintSkuExcel: '/wms-service/packageGoods/exportPackingUnPrintSkusExcel', // 包装作业结束异常，尚未打印或打印前作废货品异常列表
  import_invalidSkuExcel: '/wms-service/packageGoods/exportPackingInvalidSkusExcel', // 包装作业结束异常，打印后作废货品异常列表
  mark_packagePrinted: '/wms-service/packageInfo/markPackagePrinted', // 发货系统-标识包裹已打印,生成打印批次
  import_packageInfoExcelImport: '/wms-service/packageInfo/excelImport', // 出库单检索 Excel导入
  down_SalePackageTemplet: '/wms-service/packageInfo/getSalePackageTemplet', // 出库单检索 Excel导入模板
  get_organizationSource: '/setting-service/organizationSource/query', // 获取组织列表
  post_cancelPackageDistribution: '/wms-service/packageInfo/cancelPackageDistribution', // 批量取消分配
  queryDeliveryListPath: '/wms-service/packageInfo/queryDeliveryListPath', // 打印配货清单
  post_erpCommon_disableNoticeInfo: './erpCommon/disableNoticeInfo', // 不再提醒版本迭代通知
  get_erpCommon_queryNoticeInfo: './erpCommon/queryNoticeInfo', // 查询版本迭代通知
  pickingReminderSetting: '/wms-service/pickingReminderSetting', // 获取货品增项操作列表
  get_querySkuScanCodes: '/wms-service/erpCommon/product-service/productTag/querySkuScanCodes', // 查询sku扫描条码

  productOverseaTagList: '/wms-service/erpCommon/product-service/productOverseaTag/list', // 获取所有第三方标签名称信息
  queryOtherPickingCommonOverseaTag: '/wms-service/wmsPicking/queryOtherPickingCommonOverseaTag', // 获取当前出库单的第三方标签初始化值
  modifyOtherPickingOverseaTag: '/wms-service/wmsPicking/modifyOtherPickingOverseaTag/', // 修改出库单第三方标签值

  queryProductGoodsCommonOverseaTag: '/wms-service/wmsReceipt/queryProductGoodsCommonOverseaTag/', // 获取当前入库单的第三方标签初始化值
  modifyReceiptOverseaTag: '/wms-service/wmsReceipt/modifyReceiptOverseaTag/', // 修改入库单第三方标签值
  get_queryByStatus: '/wms-service/erpCommon/order-service/merchantPlatform/queryByStatus', // 获取平台信息
};
