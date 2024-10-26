import addressApi from "./address";
import ali from "./ali1688ProductInfo";
import choosGood from "./choosGood";
import lapapds from "./lapapds";
import { pdsSettingApi } from "./pdsSettingApi"; // 基础设置API
let localSetting = '/pds-service/erpCommon/setting-service';
let local = "/pds-service";

const apiJson = {
  get_token: "/auth/",
  refresh_token: "/refresh/",
  token_time: 540000,
  tokenToId: "/tokenToId/",
  get_erpConfig: "/erpCommon/loadConfig", // 用户信息
  logOut: "/logout/", //  登出
  manageList: "/pds/flow/config/list", //  流程配置列表 get
  manageUpdate: "/pds/flow/config/update", //  流程配置编辑 post
  managementList: "/pds/requirement/management/list", //  获取已有需求列表信息 post
  saveBase: "/pds/workbench/product/saveBase", //  工作台-保存新品开发需求基本信息 post
  createOrModifyVari: "/pds/workbench/product/createOrModifyVari", //  新品开发需求新增或修改多属性分类信息 post
  fileUpLoad: "/pds/workbench/product/upload", //  上传图片 post
  createId: "/pds/workbench/product/createId", //  创建生成产品id get
  getQueryVari: "/pds/workbench/product/queryProductGoodsList", //  获取多属性列表 get
  setMainVariType: "/pds/workbench/product/setMainVariType", // 设置主属性
  saveVariationPictureList: "/pds/workbench/product/saveVariationPictureList", // 保存属性图片
  getQueryVariType: "/pds/workbench/product/queryVariType", //  查询多属性分类信息 get
  removeProductGoods: "/pds/workbench/product/removeProductGoods", //  删除子产品 post
  createProductGoods: "/pds/workbench/product/createProductGoods", //  工作台-新增子产品 post
  getQueryBaseInfo: "/pds/workbench/product/queryBaseInfo", //  工作台-查询基础信息、备注信息 get
  saveProductDescription: "/pds/workbench/product/saveProductDescription", //  工作台-保存采集描述 post
  queryDescription: "/pds/workbench/product/queryDescription", //  工作台-查询描述信息 get
  queryPicture: "/pds/workbench/product/queryPicture", //  工作台-查询图片 get
  savePicture: "/pds/workbench/product/savePicture", //  保存图片 post
  removePicture: "/pds/workbench/product/remove", //  删除图片 post
  removeDescription: "/pds/workbench/product/removeDescription", //  工作台-删除描述信息 get
  productSubmit: "/pds/workbench/product/submit", //  工作台-提交需求 post
  getNextTodoInfo: "/pds/workbench/product/getNextTodoInfo", //  获取流程接收节点信息 post
  getNextTodoInfoByList: "/pds/flow/flowService/getNextTodoInfoByList", //  批量获取流程接收节点信息 post
  sendFlowByList: "/pds/flow/flowService/sendFlowByList", //  批量发送流程
  taskList: "/pds/workbench/product/taskList", //  查询已办、待办列表 post
  queryPersonalWorkData: "/pds/workbench/product/queryPersonalWorkData", //  新待办、已办
  taskSelect: "/pds/workbench/product/selectProductDetail", //  查看待办接口  post
  productSelect: "/pds/workbench/product/select", //  基本信息-查看 总接口 post
  queryQuotationInfo: "/pds/workbench/product/queryQuotationInfo", //  特殊询价
  querySampleInfo: "/pds/workbench/product/querySampleInfo", //  特殊取样

  /* 生成UPC规则 */
  get_queryProductSpu: '/pds/setting/queryProductSpu', // 查询商户编号信息
  post_createProductSpu: '/pds/setting/createProductSpu', // 创建商户编号信息
  post_queryProductUpcAll: '/pds/setting/queryProductUpcAll', // 获取所有upc编码项
  put_insertProductUpc: '/pds/setting/insertProductUpc', // 新增编码项
  put_updateProductUpc: '/pds/setting/updateProductUpc', // 编辑编码项
  get_queryProductUpcById: '/pds/setting/queryProductUpcById', // 查看指定的编码项信息
  delete_deleteProductUpcById: '/pds/setting/deleteProductUpcById', // 删除编码项
  put_sortProductUpcSetting: '/pds/setting/sortProductUpcSetting', // 编码项排序

  //  分类类型管理
  queryProductTypeList: '/pds/lapa/workbench/product/queryAllProductSpuConfigList',
  deleteProductType: '/pds/lapa/workbench/product/removeProductSpuConfig',
  addProductType: '/pds/lapa/workbench/product/saveProductSpuConfig',
  editProductType: '/pds/lapa/workbench/product/updateProductSpuConfig',

  // SKC颜色管理
  queryProductColorAttribute: '/pds/lapa/workbench/product/queryProductColorAttribute', // 查询skc属性名
  updateProductColorAttribute: '/pds/lapa/workbench/product/updateProductColorAttribute', // 编辑skc属性名

  // 尺码类型管理
  saveProductSizeTypeRel:'/pds/lapa/workbench/product/saveProductSizeTypeRel', // 修改-尺码类型管理
  exportProductSizeTypeRelList:'/pds/lapa/workbench/product/exportProductSizeTypeRelList', // 导出-尺码类型关联

  // 新品默认审核人
  saveProductDefaulReviewer: '/pds/lapa/workbench/product/saveProductDefaulReviewer', // 新品默认审核人-查询

  saveProductQuotationDetail:
    "/pds/workbench/product/saveProductQuotationDetail", //  保存供应商报价详情 post
  queryProductQuotationDetail:
    "/pds/workbench/product/queryProductQuotationDetail", //  查询供应商报价详情 post
  setDefaultSupplier: "/pds/workbench/product/setDefaultSupplier", //  选择默认供应商，用于审核询价时选择默认供应商
  deleteProductQuotation: "/pds/workbench/product/deleteProductQuotation", //  删除供应商报价信息，用于列表删除
  generatingSku: "/pds/workbench/product/generating", //  生成sku     get
  saveGoodsSku: "/pds/workbench/product/saveGoodsSku", //  修改保存sku  post
  queryProductPurchase: "/pds/purchase/management/queryProductPurchase", //  查询采购单信息 get
  savePurchase: "/pds/workbench/product/savePurchase", //  工作台-待办下单取样，保存取样采购信息
  queryProductGoodsInfo: "/pds/workbench/product/queryProductGoodsInfo", //  待办下单取样-根据多属性查询商品信息  POST
  queryPurchase: "/pds/workbench/purchase/queryPurchase", //  样品采购列表信息 post
  operation: "/pds/workbench/purchase/operation", //  操作采购单
  saveProductCheckInfo: "/pds/workbench/product/saveProductCheckInfo", //  保存质检详情信息
  queryProductCheckInfo: "/pds/workbench/product/queryProductCheckInfo", //  查询质检详情信息
  deleteCheckCategoryByList: "/pds/workbench/product/deleteCheckCategoryByList", //  删除质检类目（级联删除质检项）
  deleteCheckDetailByList: "/pds/workbench/product/deleteCheckDetailByList", //  删除质检详情信息
  saleAudit: "/pds/workbench/product/saleAudit", //  批量试卖审核
  confirmationSales: "/pds/workbench/product/confirmationSales", //  批量确认销售
  record: "/pds/workbench/payment/record", //  查询付款记录
  queryCountry: "/pds/workbench/product/queryCountry", //  获取国家
  queryByStateId: "/pds/workbench/product/queryByStateId", //  根据省获取市
  queryByCountryId: "/pds/workbench/product/queryByCountryId", //  根据国家获取省
  collectData: "/pds/dataCollection/collectData", //  采集接口
  downloadImg: "/pds/workbench/product/download", //  图片下载
  queryPlatformInfo: "/pds/dataCollection/queryPlatformInfo", //  渠道
  queryPlatformSiteInfo: "/pds/dataCollection/queryPlatformSiteInfo", //  站点
  payList: "/pds/workbench/payment/payList", //  标记付款
  canclePayList: "/pds/workbench/payment/canclePayList", //  取消付款
  getProductTypeList: "/pds/dataCollection/getTopProductType", //  查询顶层产品分类信息
  getChildProductTypeById: "/pds/dataCollection/getChildProductTypeById", //  查询下级产品分类信息
  getParentProductTypeById: "/pds/dataCollection/getParentProductTypeById", //  查询上级产品分类信息
  getProductTypeByIds: "/pds/dataCollection/getProductTypeByIds", //  查询指定ID范围内的产品分类信息
  // get_queryByStatus: "./merchantPlatform/queryByStatus", //  获取平台信息
  getSupplierInfo: "/pds/dataCollection/getSupplierInfo", //  供货商列表
  getNewSupplierInfo: "/erpCommon/sps-service/sps/api/supplierManagement/list", //  新3.0供货商列表
  // 供应商管理-查询供应商列表（不根据事业部查询）
  querySupplierInfo: '/erpCommon/sps-service/sps/api/supplierManagement/listNoPermission',
  // 查询所有供应商
  queryAllSupplierInfo: '/erpCommon/sps-service/sps/supplier/all',
  baseDataList: "/erpCommon/sps-service/sps/api/common/baseDataList", //  新3.0基础数据
  categoryQuery: "/erpCommon/sps-service/sps/supplierManagement/category/query", //  新3.0供应商管理-主营品类查询
  country: "/erpCommon/common-service/country/query", //  新3.0国家
  province: "/erpCommon/common-service/state/queryByCountryId", // 基础数据—省份列表
  allCity: "/erpCommon/common-service/city/queryByStateId", // 基础数据—城市列表
  spsFileUpLoad: "/erpCommon/sps-service/sps/supplierManagement/upload", // 供应商管理-上传图片
  managementSubmit: "/erpCommon/sps-service/sps/api/supplierManagement/submit", // 供应商管理-提交供应商
  supplierManagementSubmit: "/erpCommon/sps/api/supplierManagement/submit", //  新3.提交供应商
  getCurrencyDropdownList: "/pds/dataCollection/getCurrencyDropdownList", //  查询币种下拉框基础数据
  getCurrencyExchangeInfo: "/pds/dataCollection/getCurrencyExchangeInfo", //  查询币种汇率信息
  queryProductVari: "/pds/workbench/product/queryProductVari", //  查询多属性
  queryProductSupplier: "/pds/workbench/product/queryProductSupplier", //  流程提交查询供应商
  getLogisticsCompany: "/pds/dataCollection/getLogisticsCompany", //  物流商
  deleteVariInfo: "/pds/workbench/product/deleteVariInfo", //  删除多属性
  purchasePerson: "/pds/workbench/payment/purchasePerson", //  采购员
  platAuth: "/cs/wish/serviceIds",
  getWarehouseAndEnableShipMethod:
    "/pds/dataCollection/getWarehouseAndEnableShipMethod", //  获取仓库和邮寄方式信息
  getShipFeeByApiHandler: "/pds/dataCollection/getShipFeeByApiHandler", //  验证运费
  setInvalid: "/pds/flow/flowService/setInvalidWithPermission", //  作废
  sendProductInfoToListing: "/pds/workbench/product/sendProductInfoToListing", //  推送数据至listing（单条数据）
  sendProductInfoToListingByBatch:
    "/pds/workbench/product/sendProductInfoToListingByBatch", //  推送数据至listing（单条数据）
  setErpPictureStatus: "/pds/workbench/product/setErpPictureStatus", //  设置是否推送图片至ERP，此接口在保存图片处理、提交图片处理的时候调用
  merchantDataSetting: "/pds/flow/config/merchantDataSetting", //  保存推送配置
  queryMerchantDataSetting: "/pds/flow/config/queryMerchantDataSetting", //  推送配置查询接口
  suiteId: "/merchant/suiteList",
  buyer: "/merchant/buyModule", //  点击购买
  refreshModule: "/merchant/refreshModule",
  queryAllRolesByAppid: "/erpCommon/setting-service/role/queryAll", //  获取角色
  removeProductGoodsList: "/pds/workbench/product/removeProductGoodsList", //  增加批量删除子产品接口
  checkAssignPermission: "/pds/flow/flowService/checkAssignPermission", //  判断是否有权限指派
  setSendErpPicture: "/pds/workbench/product/setSendErpPicture", //  修改erp图片推送状态
  getProductLabelInfo: "/pds/workbench/product/getProductLabelInfo", //  特性标签
  uploadUserFiles: "/pds/workbench/product/uploadUserFiles", // 上传附件
  removeUserFile: "/pds/workbench/product/removeUserFile", // 删除附件
  downloadUserFiles: "/pds/workbench/product/downloadUserFiles", // 下载附件
  isConfigOk: "/pds/flow/config/isConfigOk", // 检查商户是否已完成流程必需节点的配置
  checkListingSkuExist: "/pds/workbench/product/checkListingSkuExist", // 检测sku在listing是否存在
  getTodoNumLog: "/pds/frontPage/getTodoNum", // 首页 获取待办总数
  getDoneNum: "/pds/frontPage/getDoneNum", // 首页 获取已办总数
  getCreatedNum: "/pds/frontPage/getCreatedNum", // 首页 获取已创建需求总数
  getChartData: "/pds/frontPage/getChartData", // 获取首页统计曲线图数据
  getReportList: "/pds/frontPage/getReportList", // 获取首页统计列表数据
  queryAnnounceList: "/pds/frontPage/queryAnnounceList", //  查询公告
  saveAnnounce: "/pds/frontPage/saveAnnounce", //  保存公告
  deleteAnnounceByIds: "/pds/frontPage/deleteAnnounceByIds", //  删除公告
  getSetInvalidPermission: "/pds/flow/flowService/getSetInvalidPermission", // 判断用户是否有权限删除
  chargeTemplateCreate: "/pds/chargeTemplate/create", // 费用模版管理-创建费用模版
  chargeTemplateList: "/pds/chargeTemplate/list", // 费用模版管理-列表
  chargeTemplateModify: "/pds/chargeTemplate/modify", // 费用模版管理-更新费用模版
  chargeTemplateRemove: "/pds/chargeTemplate/remove", // 费用模版管理-删除费用模版
  carriageModeList: "/pds/carriageMode/list", // 获取头程列表
  carriageModeSync: "/pds/carriageMode/sync", // 头程运输方式-同步
  costCreate: "/pds/workbench/product/cost/create", // 产品成本及费用设置-创建产品成本及费用
  costDetail: "/pds/workbench/product/cost/detail", // 产品成本及费用设置-查看产品成本及费用
  costModify: "/pds/workbench/product/cost/modify", // 产品成本及费用设置-更新产品成本及费用
  batchRecipient: "/pds/flow/flowService/batchRecipient", //  批量领取
  chargeTemplatePlatTemplate: "/pds/chargeTemplate/platTemplate", // 费用模版管理-根据平台查询模版列表
  set_addSupplier: "/pds/requirement/management/addSupplier", // 添加供应商
  get_userInfoCommon: "/erpCommon/common-service/userInfo/getAllUser",
  get_developer: "/erpCommon/setting-service/userInfo/queryByBusinessRoleType/", // 获取开发员的数据
  post_collectData: "/pds/dataCollection/collectData", // 插件采集回去的数据给后端
  get_samePic: "/pds/dataCollection/tongkuanUrl",
  get_wmsWarehouse: "/erpCommon/wms-service/wmsWarehouse/queryUserAllwarehouse",
  get_enableCarriersApi:
    "/erpCommon/setting-service/carrier/api/queryForEnableCarriers", // 查询可用物流
  get_enableShippingMethodsApi:
    "/erpCommon/setting-service/carrierShippingMethod/api/queryForEnableShippingMethods", // 物流-根据物流方式查询有效运输方式
  get_shippingMethodParamsApi:
    "/erpCommon/setting-service/carrierParam/api/queryForShippingMethodParams", // 物流渠道配置
  ueditorEnter: "/erpCommon/ueditorEnter", // 物流渠道配置
  get_menus: "/erpCommon/setting-service/userSubsystem/query", // 查询子系统
  delete_Remark: "/pds/productRemark/batchDelete", // 删除开发备注
  get_menuResource: "/erpCommon/setting-service/menuResource/all", // 获取自定义菜单
  post_erpCommon_disableNoticeInfo: '/erpCommon/disableNoticeInfo', // 不再提醒版本迭代通知
  upload_files: '/erpCommon/uploadFiles',
  get_erpCommon_queryNoticeInfo: '/erpCommon/queryNoticeInfo', // 查询版本迭代通知
  post_saveProductGoods: "/pds/workbench/product/saveProductGoods", // 保存属性中的商品尺寸和重量
};

let settingApi = {
  get_menuRole: "/userInfo/queryMenu", //  菜单
  userInfoQuery: "/userInfo/query", //  查询角色下的用户列表
  userInfo: "/userInfo/", //  根据用户ID查询用户详情
  getAllUser: "/userInfo/getAllUser", //  查询当前商户下的所有用户 固定执行人接口
  /* --wis */
  roleQuery: "/role/query", //  查询角色列表
  userInfoName: "/userInfo/", // 权限
  role_authList: "/role/", //  细化到按钮的权限
  del_role: "/role/", //  删除权限
  get_singlePageRoleCommon: '/userInfo/queryOperByMenu/', // 获取单页权限
  getAllUserByParm: '/userInfo/getAllUserByParm', // 设置中心-新品人员查询-剔除荒废用户
  edit_auth: "/role",
  get_roleList: "/role/query", //  角色
  user_list: "/userInfo/query", //  表格数据
  check_user: "/userInfo/", //  查看员工详情
  add_user: "/userInfo", //  增加用户&& 更新用户
  check_email: "/userInfo/check", //  邮箱验证
  update_user: "/user/update", //  更新用户信息
  enable_user: "/userInfo/enable", //  启用员工
  disable_user: "/userInfo/disable" // 启用员工
};

const orherAPI = {
  getTicket: '/setting-service/auth/getTicket',
  // 属性列表
  attributeLists: '/pds-service/erpCommon/product-service/attribute/list',
  // 删除属性
  attributeDel: '/pds-service/erpCommon/product-service/attribute/del',
}

let addLocal = {
  apiJson: apiJson,
  addressApi: addressApi,
  ali: ali,
  choosGood: choosGood,
  lapapds: lapapds
};

for (let key in addLocal) {
  for (let apiKey in addLocal[key]) {
    addLocal[key][apiKey] = local + addLocal[key][apiKey];
  }
}
for (let key in settingApi) {
  settingApi[key] = localSetting + settingApi[key];
}

const allApi = {
  ...addLocal,
  settingApi: settingApi,
  orherAPI: orherAPI,
  sizeManageApiConfig: {
    sizeManageApiConfig: pdsSettingApi
  }
};

let api = {};
let allKeys = [];
Object.keys(allApi).forEach(key => {
  allKeys = [...allKeys, ...Object.keys(allApi[key])];
  api = { ...api, ...allApi[key] }
});

let apiKeys = [];
let repetitionKey = {};
allKeys.forEach(key => {
  if (apiKeys.includes(key)) {
    repetitionKey[key] = typeof repetitionKey[key] == 'number' ? repetitionKey[key] + 1 : 1;
  } else {
    apiKeys.push(key);
  }
})

const errorKey = Object.keys(repetitionKey);
if (errorKey.length > 0) {
  errorKey.forEach(errKey => {
    console.error(`api ${errKey} 命名重复 ${repetitionKey[errKey]} 次`);
  })
}

export default api;
