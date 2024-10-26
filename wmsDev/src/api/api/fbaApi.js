let prefix = "";
process.env.NODE_ENV === "production" || process.env.NODE_ENV === "TEST"
  ? (prefix = "/wms-service")
  : (prefix = "/wms-service"); // 开发环境
export default {
  queryFbaPicking: prefix + "//fbaPicking/queryFbaPicking", // 查询海外仓出库单列表数据
  importFbaPicking: prefix + "/fbaPicking/importFbaPicking", // 导入海外仓出库单
  createFbaPicking: prefix + "/fbaPicking/createFbaPicking", // 创建出库单
  queryFbaDetail: prefix + "/fbaPicking/queryFbaDetail", // 查询海外仓出库单详情
  modifyFbaDistributionAll: prefix + "/fbaPicking/modifyFbaDistributionAll", // 分配按订单
  addFbaPackingBox: prefix + "/fbaPicking/addFbaPackingBox", // 新增货箱信息
  editFbaPicking: prefix + "/fbaPicking/editFbaPicking", // 编辑
  uploadFbaOutBoxLabel: prefix + "/fbaPicking/uploadFbaOutBoxLabel", // 上传FBA外箱标签
  obtainTrackingNumber: prefix + "/fbaPicking/obtainTrackingNumber", // 获取物流商信息
  invalid: prefix + "/fbaPicking/invalid", // 作废
  fbaPickingExportBatch: prefix + "/fbaPicking/exportBatch", // 海外仓出库单导出选中
  exportAll: prefix + "/fbaPicking/exportAll", // 海外仓出库单导出全部
  removeGoods: prefix + "/fbaPicking/removeGoods", // 移除货品
  exportCargoBox: prefix + "/fbaPicking/exportCargoBox", // 导出货箱信息

  FBAImport: prefix + "/template/FBAImportS.xlsx", // 下载入库单FBA,WFS,EF模板
  GCImport: prefix + "/template/GCImport.xlsx", // 下载入库单谷仓模板
  SHLImport: prefix + "/template/SHLImport.xlsx", // 下载入库单SHL模板
  WYTImport: prefix + "/template/WYTImport.xlsx", // 下载入库单万邑通模板
  StockImport: prefix + "/template/StockImport.xlsx", // 备货导入模板
  SendImport: prefix + "/template/SendImport.xlsx", // 寄样导入模板
  FBKImport: prefix + "/template/FBKImport.xlsx", // FBK导入模板
  RuiYiDaImport: prefix + "/template/RuiYiDaImport.xlsx", // 睿邑达导入模板
  FBPTemplate: prefix + "/template/FBPTemplate.xlsx", // FBP导入模板
  amlImport: prefix + "/template/amlImport.xlsx", // AIMULET导入模板
  ymsImport: prefix + "/template/ymsImport.xlsx", // YMS导入模板
  FBPURALImport: prefix + "/template/FBP-URAL.xlsx", // FBP-URAL导入模板
  qualityCheckStandard: prefix + "/template/qualityCheckStandard.pdf", // 质检标准文件模板

  printFbaOutBoxLabel: prefix + "/fbaPicking/printFbaOutBoxLabel", // FBA打印外箱标签
  printBulkLabel: prefix + "/fbaPicking/printBulkLabel", // 打印大货标签
  wmsPickingBoxesGetInit: prefix + '/wmsPickingBoxes/getInit', // 获取出库单详情
  wmsPickingBoxesSacn: prefix + '/wmsPickingBoxes/scan', // 扫描sku（移除）
  wmsPickingBoxesNext: prefix + '/wmsPickingBoxes/next', // 下一个箱
  pickingSubPackageBarcode: prefix + '/wmsPickingBoxes/pickingSubPackageBarcode', // 装袋扫描sku(袋号) /{subPackageNo}?pickingId=12312312412321
  pickingSubPackageBarcodeOpen: prefix + '/wmsPickingBoxes/pickingSubPackageBarcodeOpen', // 解袋扫描sku(袋号) /{subPackageNo}?pickingId=12312312412321
  removeSubPackage: prefix + '/wmsPickingBoxes/removeSubPackage', // 移除袋号 /{subPackageNo}?pickingId=12312312412321
  getWytSubPackageBarcode: prefix + '/wmsPickingBoxes/getWytSubPackageBarcode', // 批量获取袋号(打印代标) /{size} 最大100
  wmsBoxesList: prefix + '/wmsBoxes/list', // 货箱体积列表
  getNonBoxSku: prefix + '/wmsPickingBoxes/getNonBoxSku', // 查询未完成装箱的sku
  wmsPickingBoxesFinish: prefix + '/wmsPickingBoxes/finish', // 完成装箱
  wmsPickingBoxesGet: prefix + '/wmsPickingBoxes/get', // 查询箱内详情
  wmsPickingBoxesExcel: prefix + '/wmsPickingBoxes/excel', // 导出箱内详情
  cancelZHCrated: prefix + '/wmsPickingBoxes/cancelZHCrated', // 组合产品取消装箱
  reBoxingInit: prefix + '/wmsPickingBoxes/reBoxingInit', // 开启重新装箱
  reBoxingScan: prefix + '/wmsPickingBoxes/reBoxingScan', // 重新装箱扫描接口
  finishReBox: prefix + '/wmsPickingBoxes/finishReBox', // 装箱扫描-完成重装
  cancelZHCratedReBox: prefix + '/wmsPickingBoxes/cancelZHCratedReBox', // 取消组合产品扫描-重新装箱流程
  uploadFbaQuality: prefix + '/fbaPicking/uploadFbaQuality', // 上传excel文件
  querySendLabelDetailInfo: prefix + '/wmsPicking/querySendLabelDetailInfo', // 查询寄样标签明细信息
  addDeliveryOrderSn: prefix + '/wmsPicking/addDeliveryOrderSn', // 添加发货单号
  getBoxMarkLabelInfo: prefix + '/wmsPickingGoods/getBoxMarkLabelInfo', // 获取箱唛标签
  genRuiYiDaBoxLabel: prefix + '/fbaPicking/genRuiYiDaBoxLabel/', // 生成瑞邑达外箱标签
  uploadFbaDeliveryLabel: prefix + '/fbaPicking/uploadFbaDeliveryLabel', // fbp出库单类型添加交货单/清单
  updateFbaOutBoxLabel: prefix + '/fbaPicking/updateFbaOutBoxLabel', // 删除已上传外箱标签
  queryBoxingExtendInfo: prefix + "/wmsPickingBoxes/queryBoxingExtendInfo/", // 获取sku额外的印度标签信息
};
