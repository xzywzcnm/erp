const flag = '/sps-service';
export default {
  //质检项目管理
  queryProjectList: flag + '/productQualityProject/queryProductQualityProjectList', // 条件查询质检项目
  addProjectList: flag + '/productQualityProject/saveProductQualityProject', // 添加质检项目
  editProjectList: flag + '/productQualityProject/saveProductQualityProject', // 修改质检项目
  deleteProjectList: flag + '/productQualityProject/saveProductQualityProject', // 删除质检项目

  //质检分类管理
  queryClassifyList: flag + '/productQualityClassification/qualityClassificationVOS', // 条件查询质检分类
  addClassifyList: flag + '/productQualityClassification/saveProductQualityProject', // 添加质检分类
  editClassifyList: flag + '/productQualityClassification/updateProductQualityProject', // 修改质检分类
  deleteClassifyList: flag + '/productQualityClassification/deleteProductQualityClassificationById', // 删除质检分类

  //质检单管理
  getReceiptCheck: flag + '/wmsReceiptBatchCheck/getReceiptCheck', // 质检单列表
  createProcessingQuery: flag + '/wmsReceiptBatchCheck/createProcessingQuery', // 创建处理单查询
  getReceiptProblem: flag + '/wmsReceiptBatchCheck/getReceiptProblem', // 问题产品详情
  wmsReceiptBatchCheck_export: flag + '/wmsReceiptBatchCheck/export', // 质检单导出
  supplierAll: flag + '/sps/supplier/all',//查询供应商
  userInfo_getAllUser: flag + '/erpCommon/setting-service/userInfo/getAllUser',//查询采购员
  createProcessing: flag + '/wmsReceiptBatchCheck/createProcessing',//创建处理单
  getReceiptCheckDetail: flag + '/wmsReceiptBatchCheck/getReceiptCheckDetail',//获取质检单详情
  updateReceiptCheckType: flag + '/wmsReceiptBatchCheck/updateReceiptCheckType',//修改质检单详情
  createRemarkDTO: flag + '/wmsReceiptBatchCheck/createRemarkDTO',//增加备注
  getTotalCheckBatchInfo: flag + '/wmsReceiptBatchCheck/getTotalCheckBatchInfo',//质检单详情-查询当前批次总信息
  getCheckBatchInfo: flag + '/wmsReceiptBatchCheck/getCheckBatchInfo',//质检单详情-查询当前批次总信息
  getCheckBatchDetail: flag + '/wmsReceiptBatchCheck/getCheckBatchDetail',//质检单详情-查询当前批次总信息
  queryQualityProjectListById: flag + '/erpCommon/product-service/productQualityProject/queryQualityProjectListById',//质检标准

  //问题件处理
  getReceiptCheckToHandle: flag + '/wmsReceiptBatchCheck/getReceiptCheckToHandle', // 待处理查询接口
  exportAsyncOther: flag + '/wmsReceiptBatchCheck/exportAsyncOther', // 待处理导出接口
  exporting: flag + '/wmsReceiptCheckQuestion/export', // 处理中导出接口
  exportHandleSync: flag + '/wmsReceiptCheckQuestion/exportHandleSync', // 处理完成导出接口
  exportSelected: flag + '/wmsReceiptCheckQuestion/exportSelected',
  exportSelectedHandleSync : flag  + '/wmsReceiptCheckQuestion/exportSelectedHandleSync',
  //质检问题处理单
  getReceiptCheckQuestion: flag + '/wmsReceiptCheckQuestion/getReceiptCheckQuestion',//处理单查询列表
  wmsReceiptCheckQuestion_export: flag + '/wmsReceiptCheckQuestion/export',//处理单导出
  getReceiptCheckQuestionDetail: flag + '/wmsReceiptCheckQuestion/getReceiptCheckQuestionDetail',//处理单详情
  wmsReceiptCheckQuestion_update: flag + '/wmsReceiptCheckQuestion/update',//修改处理单
};