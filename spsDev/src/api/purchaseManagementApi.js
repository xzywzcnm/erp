/*
 * @Author: w
 * @Date: 2021-09-18 14:26:26
 * @LastEditors: w
 * @LastEditTime: 2021-09-28 15:13:38
 */
const flag = '/sps-service';
export default {
  // 本地仓、海外仓备货建议，快速生成采购单
  suggestCalc: flag + '/sps/purchase/suggest/calc', // 备货建议设置-计算备货需求
  suggestExcludeList: flag + '/sps/purchase/suggest/excludeList', // 备货建议设置-查询非备货建议列表
  suggestExport: flag + '/sps/purchase/suggest/export', // 备货建议设置-导出备货建议
  suggestList: flag + '/sps/purchase/suggest/list', // 备货建议设置-查询列表
  suggestGoodsStatus: flag + '/sps/purchase/suggest/goodsStatus', // 备货建议-获取商品状态
  suggestRemoveExclude: flag + '/sps/purchase/suggest/removeExclude', // 备货建议设置-移除非备货建议列表
  suggestSaveExclude: flag + '/sps/purchase/suggest/saveExclude', // 备货建议设置-保存非备货建议
  suggestSavePlan: flag + '/sps/purchase/suggest/savePlan', // 备货建议设置-保存备货计划
  suggestSetWarehouse: flag + '/sps/purchase/suggest/setWarehouse', // 备货建议设置-设置中转仓
  suggestSavePurchase: flag + '/sps/purchase/suggest/savePurchase', // 备货建议设置-生成采购单
  // 备货计划
  planAudit: flag + '/sps/plan/audit', // 备货计划-审核
  planDelete: flag + '/sps/plan/delete', // 备货计划-删除
  planExport: flag + '/sps/plan/export', // 备货计划-导出备货计划
  planInfo: flag + '/sps/plan/info', // 备货计划-查看备货计划详情
  planList: flag + '/sps/plan/list', // 备货计划-查询备货计划列表
  cancelList: flag + '/sps/purchaseCancel/queryPage', // 备货计划-查询采购单取消列表
  planLogList: flag + '/sps/plan/log/list', // 备货计划-查询操作日志列表
  planQueryGoodsInfo: flag + '/sps/plan/queryGoodsInfo', // 备货计划-查询商品信息
  planSubmit: flag + '/sps/plan/submit', // 备货计划-提交备货计划
  planSave: flag + '/sps/plan/save', // 备货计划-提交备货计划
  queryGoodsInfo: flag + '/sps/plan/queryGoodsInfo', // 备货计划-查询商品信息 检验是否有供应商报价
  planQueryRelatedPurchase: flag + '/sps/plan/queryRelatedPurchase', // 备货计划-查询相关采购单
  planFbaAddGoods: flag + '/sps/common/amazonListing', // fba新增商品
  skuRelation: flag + '/sps/purchase/suggest/skuRelation', // 未关联的选择
  queryAccounts: flag + '/erpCommon/setting-service/saleAccount/api/subsystem/queryAccounts', // 获取平台下的店铺

  // 备货需求管理
  query_requirementList: flag + '/sps/stockRequirement/list', // 备货需求管理-查询列表
  query_requirementDetails: flag + '/sps/stockRequirement/info', // 备货需求管理-获取详情信息
  save_requirementOrder: flag + '/sps/stockRequirement/save', // 备货需求管理-新增备货需求
  update_requirementOrder: flag + '/sps/stockRequirement/update', // 备货需求管理-更新备货需求
  delete_requirementOrder: flag + '/sps/stockRequirement/deleteStockRequirement', // 备货需求管理-删除待提交备货需求
  export_requirementOrder: flag + '/sps/stockRequirement/export', // 备货需求管理-导出
  add_plan: flag + '/sps/stockRequirement/addPlan', //备货需求管理-添加备货计划绑定

  // 采购需求管理
  requirementApplyOrder: flag + '/sps/requirement/applyOrder', // 采购需求管理-申请下单
  batchCancelOrder: flag + '/sps/requirement/batchCancelOrder', // 采购需求管理-批量作废
  requirementCancelOrder: flag + '/sps/requirement/cancelOrder', // 采购需求管理-取消下单
  requirementExport: flag + '/sps/requirement/export', // 采购需求管理-导出采购需求
  requirementBatchModify: flag + '/sps/requirement/batchModify', // 采购需求管理-批量修改
  // 获取备货类型下每个事业部采购需求总数 http://192.168.91.7:882/project/233/interface/api/14813
  get_numberByBusinessDept: flag + '/sps/requirement/numberByBusinessDept',
  requirementList: flag + '/sps/requirement/list', // 采购单管理-批量操作
  applyOrders: flag + '/sps/requirement/applyOrders', // 采购单管理-批量操作
  submitBatch: flag + '/sps/purchase/submitBatch', // 采购需求管理-批量提交到待提交
  get_samePic: flag + '/erpCommon/pds-service/pds/dataCollection/tongkuanUrl', // 搜1688同款
  getPopularizeLink: flag + '/erpCommon/pds-service/pds/dataCollection/getPopularizeLink', // 采购单管理 获取1688推广链接
  // 采购单管理
  purchaseExport: flag + '/sps/purchase/export', // 采购单管理-导出采购单
  purchaseInfo: flag + '/sps/purchase/info', // 采购单管理-查看采购单详情
  purchaseList: flag + '/sps/purchase/list', // 采购单管理-查询采购单列表
  purchaseOperation: flag + '/sps/purchase/operation', // 采购单管理-批量操作
  purchaseRemark: flag + '/purchaseRemark', // 采购单管理-备注 增加 删除 修改
  purchaseQueryGoodsInfo: flag + '/sps/purchase/queryGoodsInfo', // 采购单管理-查询商品信息
  get_SupplierGoodsUnitiPrice: flag + '/sps/supplier/product/querySupplierGoodsUnitiPrice', // 采购单管理-查询商品信息
  purchaseSubmit: flag + '/sps/purchase/submit', // 采购需求管理-提交采购单
  purchaseSupplierData: flag + '/sps/purchase/supplierData', // 采购单管理-查看供应商列表以及对应的结算方式
  get_supplierInfo: flag + '/sps/purchase/supplier/', // 查询供应商信息
  purchaseQueryPlan: flag + '/sps/purchase/queryPlan', // 采购单管理-查询相关备货计划
  batchFlagTag: flag + '/sps/purchase/batchFlagTag', // 批量打标签
  batchDeleteTag: flag + '/sps/purchase/batchDeleteTag', // 批量清空标签
  purchaseTag_all: flag + '/sps/purchaseTag/queryAll', // 查询所有标签
  add_purchaseTag: flag + '/sps/purchaseTag/', // 新增标签
  edit_purchaseTag: flag + '/sps/purchaseTag', // 编辑标签名
  delete_purchaseTag: flag + '/sps/purchaseTag/', // 删除标签
  post_endOvershoot: flag + '/sps/purchase/endOvershoot', // 批量结束超发 purchaseId 采购单id集合
  put_closePurchaseInfo: flag + '/sps/purchase/closePurchaseInfo', // 关闭、作废采购单
  batchCreateOrderGoods: flag + '/sps/purchase/batchCreateOrderGoods', // 批量向供应商下单
  getReceiptInfo: '/wms-service/wmsReceipt/getReceiptInfo', // 获取入库单表单详情 (直接调用仓储的接口)
  getReceiptGoodsInfo: '/wms-service/wmsReceipt/getReceiptGoodsInfo', // 获取入库单表格详情 (直接调用仓储的接口)
  changeOrder: flag + '/sps/purchase/modify', // 下单后修改

  // 入库出库申请
  query_goodsStockApplyList: flag + '/goodsStockApply/query', // 入库出库申请-列表查询
  get_goodsStockApplyDetail: flag + '/goodsStockApply/detail', // 入库出库申请-查看详情
  add_stockApply: flag + '/goodsStockApply/addStockApply', // 入库出库申请-新增申请单
  update_stockApply: flag + '/goodsStockApply/updateStockApply', // 入库出库申请-更新申请单
  return_stockApply: flag + '/goodsStockApply/returnStockApply', //  入库出库申请-退回申请单
  get_SupplierInfo: flag + '/sps/supplierBillApply/getSupplierInfo', // 入库出库申请-根据当前用户获取可查看事业部下的供应商
  import_goodsStockApply: flag + '/goodsStockApply/importGoods', // 入库出库申请-导入
  export_goodsStockGoodsExport: flag + '/goodsStockApply/export', // 入库出库申请-商品信息导出
  delete_apply: flag + '/goodsStockApply/deleteApply', // 入库出库申请-删除申请
  export_syncApply: flag + '/goodsStockApply/exportSync', // 入库出库申请-导出
  add_remark: flag + '/goodsStockApply/addRemark',  // 入库出库申请-添加备注

  // 寄出运费核对
  query_freightCheckList: flag + '/sps/supplierFreightCheck/list', // 运费核对单-查询列表
  add_freightCheck: flag + '/sps/supplierFreightCheck/created', // 运费核对单-添加运费核对单
  add_freightCheckRemark: flag + '/sps/supplierFreightCheck/createdRemark', // 运费核对单-新增备注
  get_freightCheckDetail: flag + '/sps/supplierFreightCheck/detail', // 运费核对单-运费核对单详细
  cancel_freightCheck: flag + '/sps/supplierFreightCheck/cancel', // 运费核对单-寄出运费核对单作废
  submit_freightCheck: flag + '/sps/supplierFreightCheck/summit', // 运费核对单-提交
  save_freightCheck: flag + '/sps/supplierFreightCheck/save', // 运费核对单-保存
  back_freightCheck: flag + '/sps/supplierFreightCheck/back', // 运费核对单-退回
  batchSummit_freightCheck: flag + '/sps/supplierFreightCheck/batchSummit', // 运费核对单-批量审核
  export_freightCheck: flag + '/sps/supplierFreightCheck/exportList', // 运费核对单-导出
  import_freightCheckFile: flag + '/sps/supplierFreightCheck/import', // 运费核对单-导入
  query_freightCheckImport: flag + '/supplierFreightCheckImport/list', // 运费核对单导入数据查询
  export_freightCheckImport: flag + '/supplierFreightCheckImport/exportList',  //运费核对单导入-导出列表
  query_businessDeptUser: flag + '/sps/common/queryBusinessDeptUser', // 查询事业部下的erp用户id
  query_importRule: flag + '/sps/supplierFreightCheck/importRule',  // 查询当前用户是否存在导入运费按钮权限

  // 到货异常处理模块
  // 到货异常处理-新增到货异常处理 http://192.168.91.7:882/project/263/interface/api/15747
  addOrUpdateProcess: flag + '/erpCommon/wms-service/processAbnormalArrival/addOrUpdateProcess',
  // 到货异常处理-新增备注 http://192.168.91.7:882/project/263/interface/api/15748
  addOperate: flag + '/erpCommon/wms-service/processAbnormalArrival/addOperate',
  // 到货异常处理-查询列表 http://192.168.91.7:882/project/263/interface/api/15749
  // abnormalList: flag + '/erpCommon/wms-service/processAbnormalArrival/list',
  abnormalList: flag + '/processAbnormalArrival/list',
  // 到货异常处理-查询详情 http://192.168.91.7:882/project/263/interface/api/15750
  abnormalDetail: flag + '/erpCommon/wms-service/processAbnormalArrival/detail',
  // 到货异常处理-导出 http://192.168.91.7:882/project/263/interface/api/15751
  abnormalExport: flag + '/processAbnormalArrival/export',
  // 到货异常处理-操作日志 http://192.168.91.7:882/project/263/interface/api/15768
  abnormalRemarkDetail: flag + '/erpCommon/wms-service/processAbnormalArrival/remarkDetail',
  // 到货异常处理-退回 http://192.168.91.7:882/project/263/interface/api/15772
  abnormalReturn: flag + '/erpCommon/wms-service/processAbnormalArrival/return',
  // 到货异常处理-删除 http://192.168.91.7:882/project/263/interface/api/15783
  abnormalDelete: flag + '/erpCommon/wms-service/processAbnormalArrival/delete',
  // 到货异常处理-转交 http://192.168.91.7:882/project/263/interface/api/15845
  changePurchase: flag + '/erpCommon/wms-service/processAbnormalArrival/changePurchase',
  // 查询采购员事业部 http://192.168.91.7:882/project/263/interface/api/15938
  getUserBusinessDeptName: flag + '/erpCommon/wms-service/processAbnormalArrival/getUserBusinessDeptName',
  // 到货异常处理-批量提交 http://192.168.91.7:882/project/263/interface/api/16024
  processSubmitBatch: flag + '/erpCommon/wms-service/processAbnormalArrival/submitBatch',
  // 通过sku查询商品信息
  queryProductInfoBySkuList: flag + '/erpCommon/wms-service/goodsStockApply/queryProductInfoBySkuList',

  // 供应商订单管理
  orderInfo_list: flag + '/sps/orderInfo/list', // 查询列表
  urgentOrderSign: flag + '/sps/orderInfo/urgentOrderSign', // 急单标记
  changeSupplyState: flag + '/sps/orderInfo/changeSupplyState', // 供应状态变更
  orderStatusFeedback: flag + '/sps/orderInfo/orderStatusFeedback', // 订单状态反馈
  sendGoods: flag + '/sps/orderInfo/sendGoods', // 发货
  cancelSurplus: flag + '/sps/orderInfo/cancelSurplus', // 剩余取消
  queryDetails: flag + '/sps/orderInfo/queryDetails', // 详情
  querySKUDetails: flag + '/sps/orderInfo/querySKUDetails', // 获取sku信息
  addRemarks: flag + '/sps/orderInfo/addRemarks', // 新增备注
  queryRemarks: flag + '/sps/orderInfo/queryRemarks', // 查看备注
  // orderInfoEexport: flag + '/sps/orderInfo/export', // 导出
  isDeveloper: flag + '/sps/despatch/developer', // 用户业务角色是否“商品开发员”
  confirmShortage: flag + '/sps/orderInfo/confirmShortage', // 确认少货
  exportByIds: flag + '/sps/orderInfo/exportByIds', // 导出选中
  exportByall: flag + '/sps/orderInfo/export', // 导出所有
  exportManufactureMeans: flag + '/sps/orderInfo/exportManufactureMeans', // 导出生产资料
  getWarehouseInfo: flag + '/sps/api/orderInfo/getWarehouseInfo', // 获取仓库信息
  modifyRemark: flag + '/sps/orderInfo/modifyRemark', //保存备注信息
  getStatusCount: flag + '/sps/orderInfo/statusCount', // 获取统计状态数量
  // 获取1688 产品信息参数： ?platformId=${temp}
  get_aliProduct: '/sps-service/sps/aliProduct/queryProduct',

  // 供应商发货单列表
  despatchList: flag + '/sps/despatch/list', // 发货单列表
  signIssuedLogistics: flag + '/sps/despatch/signIssuedLogistics', // 标记已发物流
  maintainDespatch: flag + '/sps/despatch/maintainDespatch', // 维护发货单
  maintainShippingMark: flag + '/sps/despatch/maintainShippingMark', // 维护箱唛
  queryShippingMark: flag + '/sps/despatch/queryShippingMark', // 查看箱唛
  despatchqueryDetails: flag + '/sps/despatch/queryDetails', // 发货单详情/打印发货单
  printShippingMark: flag + '/sps/despatch/printShippingMark', // 打印箱唛
  cancelDespatch: flag + '/sps/despatch/cancelDespatch', // 作废发货单
  logistics: flag + '/sps/despatch/logistics', // 查看物流商平台
  despatchExport: flag + '/sps/despatch/export', // 导出
  exportOrderInfo: flag + '/sps/despatch/exportOrderInfo', // 导出订单信息

  queryComingSpecial: flag + '/sps/purchase/queryComingSpecial', // 查询所有的来货特项

  // 供应商账单申请与付款
  query_supplierBillApplyList: flag + '/sps/supplierBillApply/list', // 查询账单申请列表
  get_billSupplierInfo: flag + '/sps/supplierBillApply/getSupplierInfo', // 账单申请-根据当前用户获取可查看事业部下的供应商
  add_billApply: flag + '/sps/supplierBillApply/addBillApply', // 账单申请-新增账单申请
  export_billList: flag + '/sps/supplierBillApply/exportList', // 账单申请-导出列表
  get_billDetails: flag + '/sps/supplierBillApply/detail', // 账单申请-查询详情
  export_paymentList: flag + '/sps/supplierBillApply/exportPaymentList', // 账单申请-导出财务付款列表
  add_billApplyRemark: flag + '/sps/supplierBillApply/addBillApplyRemark', // 账单申请-新增备注
  submit_billApply: flag + '/sps/supplierBillApply/submit', // 账单申请-提交供应商账单申请
  add_billApplyPayment: flag + '/sps/supplierBillApply/addBillApplyPayment', // 账单申请-新增付款情况说明
  del_billApplyPayment: flag + '/sps/supplierBillApply/delBillApplyPayment', // 账单申请-删除付款情况说明
  cancel_bill: flag + '/sps/supplierBillApply/cancel', // 账单申请-作废供应商账单申请
  getBySupplierAndBillMonth: flag + '/sps/supplierBillApply/deduction/getBySupplierAndBillMonth', // 汇总抵扣管理-根据供应商和账单月份获取汇总信息

  // 汇总抵扣管理
  deduction_list: flag + '/sps/supplierBillApply/deduction/list', // 汇总抵扣管理-列表展示
  deduction_get: flag + '/sps/supplierBillApply/deduction/get', // 汇总抵扣管理-列表明细展示
  deduction_insert: flag + '/sps/supplierBillApply/deduction/insert', // 汇总抵扣管理-新建
  deduction_update: flag + '/sps/supplierBillApply/deduction/update', // 汇总抵扣管理-编辑
  deduction_delete: flag + '/sps/supplierBillApply/deduction/delete', // 汇总抵扣管理-删除
  deduction_exportList: flag + '/sps/supplierBillApply/deduction/exportList', // 汇总抵扣管理-导出
};