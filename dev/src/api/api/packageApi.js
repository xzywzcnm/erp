export default { // 包裹相关
  cancel_package: './orderShippingInfo/invalid/', // 包裹作废 + {packageCode}
  get_packageDetails: './packageInfo/', // 包裹详情
  update_packageDeclare: './packageDeclare', // 更新包裹申报
  add_packageDeclare: './packageDeclare/insert', // 新增包裹申报
  del_packageDeclare: './packageDeclare/delete/', // 删除包裹申报
  get_packageCommonDeclare: './packageCommonDeclare/query', // 常用申报信息
  add_packageCommonDeclare: './packageCommonDeclare', // 添加常用申报信息
  update_packageCommonDeclare: '/packageCommonDeclare', // 更新常用申报信息
  del_packageCommonDeclare: '/packageCommonDeclare/', // 删除常用申报
  set_uploadPackage: './packageInfo/uploadPackage', // 申请运单号
  update_moreShippingMethod: './packageInfo/replaceWaitingUploadShippingMethod', // 待申请包裹批量更换物流方式
  update_printShippingMethod: './packageInfo/replaceAllowPrintShippingMethod', // 待打印包裹批量更换物流方式
  get_printList: './packageInfo/queryForAllowPrint', // 包裹打印分页
  get_exList: './packageInfo/queryForOutWarehouse', // 包裹出库列表
  get_packagePrintBatchInfo: 'packagePrintBatchInfo/query', // 搜索批次打印的包裹
  get_cancelPackageList: './packageInfo/queryForRecycle', // 回收包裹列表
  get_queryForAfreshPrint: './packageInfo/queryForAfreshPrint', // 搜索重打面单的包裹
  express_sheet: './packageInfo/printExpressBill', // 打印面单
  get_singleExpressBillPath: '/packageInfo/printExpressBill/', // 获取单个打印面单地址
  get_packageToRetrieve: './packageInfoInactive/query', // 已出库包裹检索
  export_package: './packageInfoInactive/export', // 导出
  get_packageByCode: './packageInfo/getPackageByCode/', // 扫描包裹
  set_batchMarkPackageDelivery: './packageInfo/batchMarkPackageDelivery', // 标记出库
  set_markPackageDelivery: './packageInfo/markPackageDelivery', // 标记包裹出库
  get_deliveryBatchNo: './packageInfo/getDeliveryBatchNo', // 获取发货批次号
  set_packageOverBag: './packageInfoInactive/createExcelForBagging', // 结袋导出
  get_packageProductList: './packageInfo/queryPackageGoodsForMissing', // 获取选取包裹商品详情
  set_markPackageGoodsMissing: './packageInfo/markPackageGoodsMissing', // 标记缺货
  mark_printed: './packageInfo/markPackagePrinted', // 标记包裹已打印
  print_pickingOrder: './packageInfo/queryForPrintPickingOrder', // 打印拣货单
  get_logistickPackageInfo: './packageInfo/getLogisticsPackgeInfo', // 获取运单号 && 获取面单
  delete_packageInfo: './packageInfo/', // +packageId 删除包裹
  get_expressBill: './packageInfo/getExpressBill', // 获取面单
  set_rePrintExpressBill: './packageInfo/rePrintExpressBill', // 重打面单,
  get_issuedBadge: './packageInfo/queryNotAddPackageAndNoTrackingNumberBadge', // 获取
  del_package: './packageInfo/updateRecycle', // 回收包裹
  update_warehouse: './packageInfo/updateWarehouse', // 更换仓库
  get_deliveryMenuNum: './packageInfo/queryForBadges', // 发货菜单角标数字
  get_sortingList: '/wmsPickingGoods/querySortingList', // 分拣-获取正在进行的分拣
  get_pickingId: '/wmsPickingGoods/startSorting', // 开始分拣
  get_pickList: './packageGoods/queryByPickingGoodsId/', // 拣货单货品列表查询
  get_packageList: './packageInfo/queryByPickingGoodsId/', // 出库单列表查询
  get_packageSetting: './packageSettingCommon/queryErpCommonSettingParam', // 查询分拣架设置列表
  get_packingPickingGoodsInfo: '/wmsPickingGoods/getPackingPickingGoodsInfo', // 获取当前用户作业包裹统计数量 与 系统正在进行的包装作业
  get_getScanningPickingGoods: '/wmsPickingGoods/getScanningPickingGoods', // 获取当前用户正在包装作业中的拣货单信息
  get_scanPickingGoodsNo: '/wmsPickingGoods/scanPickingGoodsNo', // 包装作业扫描拣货单
  get_scanSku: '/wmsPickingGoods/packingScanSku', // 扫描sku,传参若成功匹配包裹,则返回包裹数据,反之返回null
  update_weighting: '/wmsPickingGoods/packingWeighting', // 称重
  end_sorting: '/wmsPickingGoods/endSorting', // 分拣结束
  cancel_sorting: '/wmsPickingGoods/cancelSorting/', // 撤销本次分拣
  del_packageInfo: '/wmsPickingGoods/excludePackageInfo', // 将该包裹从当前拣货单中移除等待生成新的拣货单
  prepar_finishPack: '/wmsPickingGoods/preparFinishPacking/', // 结束作业
  get_statisticsPack: '/wmsPickingGoods/statisticsPacking/', // 结束作业后 - 获取包装统计
  get_warnPackages: '/wmsPickingGoods/getPackingWarnPackages/', // 结束作业后 - 获取异常包裹信息
  confirm_finishPaxking: '/wmsPickingGoods/confirmFinishPacking', // 确认强制结束作业
  quit_packingWork: '/wmsPickingGoods/quitPacking/', // 退出作业
  update_packageFinishPrint: '/wmsPickingGoods/packageFinishPrint', // 打印面单成功后 - 扫描包装完成
  update_clearScan: '/wmsPickingGoods/packingClearScan', // 清空扫描货品,针对已扫描未打印的包裹,把扫描状态修改为初始值
  get_allWrapper: '/wmsPackageMaterial/queryAll' // 查询用户所有包材
};
