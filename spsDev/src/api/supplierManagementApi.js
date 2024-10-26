const flag = '/sps-service';
export default {
  // 供应商管理
  batchExport: flag + '/sps/supplier/management/batchExport', // 供应商管理-批量导出供应商信息
  update_editSupplier: flag + '/sps/supplierManagement/batchUpdate', // 批量修改供应商
  categoryQuery: flag + '/sps/supplierManagement/category/query', // 供应商管理-主营品类查询
  supplierDownloadImportTemplate: flag + '/sps/supplierManagement/downloadImportTemplate', // 下载供应商模板
  goodsQuery: flag + '/sps/supplierManagement/goods/query', // 供应商管理-根据供应商Id查询相应的产品报价
  batchImport: flag + '/sps/supplier/management/batchImport', // 供应商管理-批量导入
  operation: flag + '/sps/supplier/management/operation', // 供应商管理-批量操作
  managementInfo: flag + '/sps/supplierManagement/info', // 供应商管理-获取供应商详细信息
  managementList: flag + '/sps/supplierManagement/list', // 供应商管理-获取已有供应商列表信息
  managementSave: flag + '/sps/supplierManagement/save', // 供应商管理-保存供应商
  managementSubmit: flag + '/sps/supplierManagement/submit', // 供应商管理-提交供应商
  managementLogList: flag + '/sps/supplierManagement/log/list', // 供应商管理-查询操作日志列表
  fileUpLoad: flag + '/sps/supplierManagement/upload', // 供应商管理-上传图片

  // 产品报价
  adjustSupplierOrder: flag + '/sps/supplier/price/adjustSupplierOrder', // 产品报价-调整供应商顺序
  priceExport: flag + '/sps/supplier/price/export', // 产品报价-导出正式报价列表数据
  getRelatedDetail: flag + '/sps/supplier/price/getRelatedDetail', // 产品报价-获取1688关联明细
  priceDownloadImportTemplate: flag + '/sps/supplier/price/downloadImportTemplate', // 下载商品报价模板
  importSupplierGoods: flag + '/sps/supplier/price/importSupplierGoods', // 产品报价-导入产品报价
  cloudImportSupplierGoods:flag + '/sps/supplier/price/importCloudWarehouseGoods', // 云仓批量导入
  operationProductQuotation: flag + '/sps/supplier/price/operationProductQuotation', // 产品报价-批量操作--修改审核状态
  operationProductReject: flag + '/sps/supplier/price/reject', // 产品报价-批量操作--审核驳回
  parsingLinks: flag + '/sps/supplier/price/parsingLinks', // 产品报价-批量解析1688链接获取属性
  queryIdAndName: flag + '/sps/supplier/all', // 查询所有供应商下拉列表
  queryIdAndNameOld: flag + '/sps/supplier/price/queryIdAndName', // 产品报价-查询供应商下拉列表
  queryPriceHistory: flag + '/sps/supplier/price/queryPriceHistory', // 产品报价-分页查询历史价格
  querySupplierGoods: flag + '/sps/supplier/price/querySupplierGoods', // 产品报价-查看报价详情
  querySupplierGoodsPage: flag + '/sps/supplier/price/querySupplierGoodsPage', // 产品报价-条件查询报价分页列表
  relationItemAttributes: flag + '/sps/supplier/price/relationItemAttributes', // 产品报价-批量关联1688商品属性
  saveSupplier: flag + '/sps/supplier/price/saveSupplier', // 产品报价-保存供应商
  submitSupplier: flag + '/sps/supplier/price/submitSupplier', // 产品报价-提交供应商
  saveSupplierGoods: flag + '/sps/supplier/price/saveSupplierGoods', // 产品报价-保存报价信息
  selectPlatformGoodsDetail: flag + '/sps/supplier/price/selectPlatformGoodsDetail', // 产品报价-查看1688关联明细
  submitProductQuotation: flag + '/sps/supplier/price/submitProductQuotation', // 产品报价-提交报价信息
  // 查询所有供应商报价商品
  querySupplierGoodsAll: flag + '/sps/supplier/price/querySupplierGoodsAll',

  // 供应商产品
  productDelete: flag + '/sps/supplier/product/delete', // 供应商产品-删除产品
  productList: flag + '/sps/supplier/product/list', // 供应商产品-获取供应商产品列表信息
  productQueryPriceHistory: flag + '/sps/supplier/product/queryPriceHistory', // 供应商产品-分页查询历史价格
  productQuerySupplierGoods: flag + '/sps/supplier/product/querySupplierGoods', // 供应商产品-查看产品详情
  productUpdate: flag + '/sps/supplier/product/update', // 供应商产品-修改产品信息

  // 供应商审核规则
  adjustAuditPriority: flag + '/sps/rule/adjustAuditPriority', // 供应商审核规则-调整规则优先级
  checkAuditRules: flag + '/sps/rule/checkAuditRules', // 供应商审核规则-审核规则冲突检测
  saveAuditRules: flag + '/sps/rule/saveAuditRules', // 供应商审核规则-保存审核规则
  saveBycheckAuditRules: flag + '/sps/rule/saveBycheckAuditRules', // 供应商审核规则-保存前审核规则冲突检测
  useFlag: flag + '/sps/rule/useFlag', // 供应商审核规则-启用停用
  queryAuditRulesDetail: flag + '/sps/rule/queryAuditRulesDetail', // 供应商审核规则-查看审核规则详情
  queryAuditRulesList: flag + '/sps/rule/queryAuditRulesList', // 供应商审核规则-查询审核规则列表（分页）
  removeAuditRules: flag + '/sps/rule/removeAuditRules', // 供应商审核规则-删除审核规则

  // 主营品类管理
  categoryDownloadImportTemplate: flag + '/sps/supplier/category/downloadImportTemplate', // 下载主营品类模板
  categoryBatchImport: flag + '/sps/supplier/category/batchImport', // 主营品类管理-批量导入
  batchRemove: flag + '/sps/supplier/category/batchRemove', // 主营品类管理-批量删除
  create: flag + '/sps/supplier/category/create', // 主营品类管理-新增
  downloadImportTemplate: flag + '/sps/supplier/category/downloadImportTemplate', // 主营品类管理-下载导入模板
  modify: flag + '/sps/supplier/category/modify', // 主营品类管理-修改
  query: flag + '/sps/supplier/category/query', // 主营品类管理-查询列表
  remove: flag + '/sps/supplier/category/remove', // 主营品类管理-删除
  test: flag + '/sps/supplier/category/test', // 主营品类管理-测试

  // 商家系统管理
  businessList: flag + '/sps/business/list', // 商家信息列表
  businessSave: flag + '/sps/business/save', // 商家系统管理设置
  exportBusiness: flag + '/sps/supplier/business/exportBusiness', // 导出
  initializationPassword: flag + '/sps/supplier/business/initializationPassword', // 重置密码
};
