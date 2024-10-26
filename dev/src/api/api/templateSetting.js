export default { // aliexpress api
  //查询列表
  queryOperateTemplate: '/setting-service/templateInfo/queryOperateTemplate',
  queryStorageTemplate: '/setting-service/templateInfo/queryStorageTemplate',
  queryDeliverTemplate: '/setting-service/templateInfo/queryDeliverTemplate',
  queryFreightTemplate: '/setting-service/templateInfo/queryFreightTemplate',

  //查询币种
  queryCurrency: '/setting-service/templateInfo/queryCurrency',

  //新增模版
  addOperateTemplate: '/setting-service/templateInfo/addOperateTemplate',
  addStorageTemplate: '/setting-service/templateInfo/addStorageTemplate',
  addDeliverTemplate: '/setting-service/templateInfo/addDeliverTemplate',
  addFreightTemplate: '/setting-service/templateInfo/addFreightTemplate',

  //更新模板状态
  updateOperateTemplateStatus: '/setting-service/templateInfo/updateOperateTemplateStatus',
  updateStorageTemplateStatus: '/setting-service/templateInfo/updateStorageTemplateStatus',
  updateDeliverTemplateStatus: '/setting-service/templateInfo/updateDeliverTemplateStatus',
  updateFreightTemplateStatus: '/setting-service/templateInfo/updateFreightTemplateStatus',

  //删除模版
  removeOutOfWarehouse: '/setting-service/outOfWarehouseExpensesTemplate/remove',
  deleteByIdOutOfWarehouse: '/setting-service/outOfWarehouseExpensesTemplate/deleteById/',
  deleteByIdfreightTemplate: '/setting-service/freightTemplate/deleteById/',

  //查看模版详情
  queryTemplateDetail: '/setting-service/templateInfo/queryTemplateDetail',

  //更新模版详情
  updateOperateTemplate: '/setting-service/templateInfo/updateOperateTemplate',
  updateStorageTemplate: '/setting-service/templateInfo/updateStorageTemplate',
  updateDeliverTemplate: '/setting-service/templateInfo/updateDeliverTemplate',
  updateFreightTemplate: '/setting-service/templateInfo/updateFreightTemplate',

  //导入模版
  importFreightTemplate: '/setting-service/templateInfo/importFreightTemplate',
  getTemplatePath: '/setting-service/templateInfo/getTemplatePath',

  //仓库设置
  getWarehouseInfo: '/setting-service/warehouseAssociationTemplate/getWarehouseInfo',
  queryOperateExpenseTemplate: '/setting-service/warehouseAssociationTemplate/queryOperateExpenseTemplate',
  queryStorageTemplateWarehouse: '/setting-service/warehouseAssociationTemplate/queryStorageTemplate',
  queryOutOfWarehouseExpensesTemplate: '/setting-service/warehouseAssociationTemplate/queryOutOfWarehouseExpensesTemplate',
  queryFreightTemplateWarehouse: '/setting-service/warehouseAssociationTemplate/queryFreightTemplate',
  queryWarehouseLinkTemplateInfo: '/setting-service/warehouseAssociationTemplate/queryWarehouseLinkTemplateInfo',
  addWarehouseLinkTemplateInfo: '/setting-service/warehouseAssociationTemplate/addWarehouseLinkTemplateInfo',
};