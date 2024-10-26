// 设置中心-尺码模板
const pdsSettingsApiConfig = require('@/views/pdsSettings/apiConfig.js');
// const baseUrl = '/setting-service/erpCommon';
const baseUrl = '';
export default { // 设置模块
  get_uesrList: './userInfo/query', // 分页获取员工列表
  add_user: './userInfo', // 增加用户&& 更新用户
  check_email: './userInfo/check', // 邮箱验证
  update_user: './user/update', // 更新用户信息
  set_userEnabled: './userInfo/enable', // 启用员工
  set_userDisabled: './userInfo/disable', // 启用员工
  get_userDetail: './userInfo/', // 查看员工详情
  edit_role: './role', // 修改角色
  add_role: './role', // 添加角色
  del_role: './role/', // 删除角色
  set_operResource: '/setting-service/operResource', // 添加post/更新put权限资源
  get_roleAuthList: './role/', // 角色授权列表
  get_roleList: './role/query', // 获取所有角色列表
  get_querySaleAccounts: '/setting-service/saleAccount/api/subsystem/querySaleAccounts', // 查询商户可用店铺列表
  queryUserAdditionPermissions: '/setting-service/erpCommon/queryUserAdditionPermissions', // 查詢仓库下级权限
  post_erpCommonSettingParam1_queryByUK: '/setting-service/erpCommonSettingParam/queryByUK', // 根据keys查询用户基础设置

  operate_disableSaleAccount: '/setting-service/saleAccount/disable', // 停用帐户
  operate_enableSaleAccount: '/setting-service/saleAccount/enable', // 启用帐户
  get_ottoAccount_getToken: '/setting-service/ottoAccount/getToken/', // 获取授权信息
  post_auth2Url: './ebayAccount/auth2Url/', // ebay添加auth授权
  // 获取 shein 授权地址 http://192.168.91.7:882/project/343/interface/api/16031
  sheinAuthorizeUrl: '/setting-service/saleAccount/getSheinAuthorizeUrl',

  post_saleAccount_thirdAuth_applyAuth: "./saleAccount/thirdAuth/applyAuth", // 三方授权添加店铺
  post_saleAccount_thirdAuth_query: "./saleAccount/thirdAuth/query", // 三方授权列表
  post_saleAccount_thirdAuth_updateSelective: "./saleAccount/thirdAuth/updateSelective", // 三方授权编辑
  put_saleAccount_thirdAuth_disable: "./saleAccount/thirdAuth/disable", // 三方授权停用
  put_saleAccount_thirdAuth_enable: "./saleAccount/thirdAuth/enable", // 三方授权停用
  // 查询业务配置信息 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-201599073 /erpCommonSetting/{businessId}
  getAbnormalWarnSet: '/setting-service/erpCommonSetting',
  // 修改业务配置信息 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-201599074
  updateAbnormalWarnSet: '/setting-service/erpCommonSetting',
  // 店铺授权失效提醒 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-201599204
  queryAuthWarn: '/setting-service/saleAccountCommon/queryAuthWarn',

  post_ebayAccount_batchUpdateFeedback: './ebayAccount/batchUpdateFeedback', // 批量更新信用评价
  syn_child_account: '/setting-service/shopeeAccount/synChildAccount', // shopee获取附属店铺
  ebay: { // Ebay, key以平台命名
    get_accountList: '/setting-service/ebayAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/ebayAccount', // 添加账号绑定
    set_auth: '/setting-service/ebayAccount/authUrl/', // +{ebayAccountId} ebay授权
    add_saleAccount: '/setting-service/ebayAccount/save', // 添加新帐户绑定
    check_saleAccountDetails: '/setting-service/ebayAccount/detail', // 查询帐户详情
    get_accountDetails: '/setting-service/ebayAccount/' // 查詢帳號詳情（設置）
  },
  aliexpress: { // 速卖通, key以平台命名
    get_accountList: '/setting-service/aliexpressAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/aliexpressAccount', // 添加账号绑定
    set_auth: '/setting-service/aliexpressAccount/authUrl/', // +{ebayAccountId} ebay授权
    add_saleAccount: '/setting-service/aliexpressAccount', // 添加新帐户绑定
    check_saleAccountDetails: '/setting-service/aliexpressAccount/detail', // 查询帐户详情
    get_accountDetails: '/setting-service/aliexpressAccount/' // 查詢帳號詳情（設置）
  },
  shopify: { // shopify, key以平台命名
    get_accountList: '/setting-service/shopifyAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/shopifyAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/shopifyAccount/', // 查看帐号详情
    set_auth: '/setting-service/shopifyAccount/getAuthUrl' // +{shopifyAccountId} shopify授权
  },
  lazada: { // lazada, key以平台命名
    get_accountList: '/setting-service/lazadaAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/lazadaAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/lazadaAccount/', // 查看帐号详情
    set_auth: '/setting-service/lazadaAccount/authUrl/' // +{lazadaAccountId} lazada授权
  },
  wish: { // wish, key以平台命名
    get_accountList: '/setting-service/wishAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/wishAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/wishAccount/', // 查看帐号详情
    set_auth: '/setting-service/wishAccount/authUrl/' // +{wishAccountId} wish授权
  },
  joom: { // joom, key以平台命名
    get_accountList: '/setting-service/joomAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/joomAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/joomAccount/', // 查看帐号详情
    set_auth: '/setting-service/joomAccount/authUrl/' // +{joomAccountId} joom授权
  },
  tophatter: { // tophatter, key以平台命名
    get_accountList: '/setting-service/tophatterAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/tophatterAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/tophatterAccount/' // 查看帐号详情
  },
  cdiscount: { // cdiscount, key以平台命名
    get_accountList: '/setting-service/cdiscountAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/cdiscountAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/cdiscountAccount/' // 查看帐号详情
  },
  newegg: { // newegg, key以平台命名
    get_accountList: '/setting-service/neweggAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/neweggAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/neweggAccount/' // 查看帐号详情
  },
  priceminister: { // priceminister, key以平台命名
    get_accountList: '/setting-service/priceministerAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/priceministerAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/priceministerAccount/' // 查看帐号详情
  },
  walmart: { // walmart, key以平台命名
    get_accountList: '/setting-service/walmartAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/walmartAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/walmartAccount/' // 查看帐号详情
  },
  dhgate: { // dhgate, key以平台命名
    get_accountList: '/setting-service/dhgateAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/dhgateAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/dhgateAccount/', // 查看帐号详情
    set_auth: '/setting-service/dhgateAccount/authUrl/' // dhgate授权
  },
  alibaba: { // alibaba, key以平台命名
    get_accountList: '/setting-service/alibabaAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/alibabaAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/alibabaAccount/', // 查看帐号详情
    set_auth: '/setting-service/alibabaAccount/authUrl/' // alibaba授权
  },
  yandex: { // yandex, key以平台命名
    get_accountList: '/setting-service/yandexAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/yandexAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/yandexAccount/', // 查看帐号详情
    set_auth: '/setting-service/yandexAccount/authUrl/' // yandex授权
  },
  mycom: { // mycom, key以平台命名
    get_accountList: '/setting-service/mycomAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/mycomAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/mycomAccount/', // 查看帐号详情
    set_auth: '/setting-service/mycomAccount/authUrl/' // yandex授权
  },
  shopee: { // shopee, key以平台命名
    get_accountList: '/setting-service/shopeeAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/shopeeAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/shopeeAccount/', // 查看帐号详情
    set_auth: '/setting-service/shopeeAccount/authUrl/', // shopee授权
    syn_child_account: '/setting-service/shopeeAccount/synChildAccount' // shopee获取附属店铺
  },
  factorymarket: { // factorymarket, key以平台命名
    get_accountList: '/setting-service/factorymarketAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/factorymarketAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/factorymarketAccount/', // 查看帐号详情
    set_auth: '/setting-service/factorymarketAccount/authUrl/' // factorymarket授权
  },
  mercadolibre: { // mercadolibre, key以平台命名
    get_accountList: '/setting-service/mercadolibreAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/mercadolibreAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/mercadolibreAccount/', // 查看帐号详情
    set_auth: '/setting-service/mercadolibreAccount/authUrl/' // mercadolibre授权
  },
  amazon: { // amazon, key以平台命名
    get_accountList: '/setting-service/amazonAccount/list', // '/setting-service/cs/mail/acccount/accountShopList', //
    // 分页查询帐户列表
    // binding_account: '/setting-service/amazonAccount/addAccountShop', // 添加账号绑定
    binding_account: '/setting-service/amazonAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/amazonAccount/' // 查看帐号详情
  },
  alibabagj: { // alibabagj, key以平台命名
    get_accountList: '/setting-service/alibabagjAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/alibabagjAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/alibabagjAccount/', // 查看帐号详情
    set_auth: '/setting-service/alibabagjAccount/authUrl/' // +{alibabagjAccountId} alibabagj授权
  },
  vova: { // vova, key以平台命名
    get_accountList: '/setting-service/vovaAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/vovaAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/vovaAccount/' // 查看帐号详情
  },
  real: { // real, key以平台命名
    get_accountList: '/setting-service/realAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/realAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/realAccount/' // 查看帐号详情
  },
  allegro: { // allegro, key以平台命名
    get_accountList: '/setting-service/allegroAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/allegroAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/allegroAccount/', // 查看帐号详情
    set_auth: '/setting-service/allegroAccount/authUrl/' // +{allegroAccountId} allegro授权
  },
  ept: { // ept, key以平台命名
    get_accountList: '/setting-service/eptAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/eptAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/eptAccount/' // 查看帐号详情
  },
  jdyn: { // jdyn, key以平台命名
    get_accountList: '/setting-service/jdynAccount/list', // 分页查询帐户列表
    binding_account: '/setting-service/jdynAccount', // 添加账号绑定
    get_accountDetails: '/setting-service/jdynAccount/', // 查看帐号详情
    operate_enableSaleAccount: '/setting-service/saleAccount/enable', // 启用帐户
    operate_disableSaleAccount: '/setting-service/saleAccount/disable' // 停用帐户
  },
  get_site: '/salesPlatformSite/query', // 获取lazada站点
  get_wishToken: '/setting-service/wishAccount/getToken', // wish getToken
  get_yandexToken: '/setting-service/yandexAccount/getToken', // yandex getToken
  get_fmToken: '/setting-service/factorymarketAccount/getToken', // factorymarket getToken
  get_allegroToken: '/setting-service/allegroAccount/getToken', // allegro getToken
  get_orderAutoAuditRuleList: '/order-service/orderAutoRule/query', // 查询订单自动审核规则
  del_orderAutoAuditRule: '/order-service/orderAutoRule', // 删除订单自动审核规则
  set_orderAutoAuditRuleDisabled: '/order-service/orderAutoRule/disable/', // 停用订单自动审核规则
  set_orderAutoAuditRuleEnabled: '/order-service/orderAutoRule/enable/', // 启用订单自动审核规则
  get_automatickWarehouseRuleList: '/order-service/warehouseAutoRule/query', // 自动分仓规则查询列表
  update_warehouseRulePriority: '/order-service/warehouseAutoRule/updatePriority', // 更新自动规则优先级
  set_warehouseRuleEnabled: '/order-service/warehouseAutoRule/enable/', // + {autoRuleId} 启用自动分仓规则
  set_warehouseRuleDisabled: '/order-service/warehouseAutoRule/disable/', // + {autoRuleId} 停用自动分仓规则
  get_warehouseRuleDetail: '/order-service/warehouseAutoRule/', // + {autoRuleId} 获取自动分仓规则详情
  get_orderAutoAuditRuleDetail: '/order-service/orderAutoRule/', // + {autoRuleId} 获取自动审核规则详情
  set_orderAutoRule: '/order-service/orderAutoRule', // 更新自动审核规则
  set_warehouseAutoRule: '/order-service/warehouseAutoRule', // 更新自动分仓规则
  get_queryEnablePlatform: '/order-service/merchantPlatform/queryEnablePlatform', // 商户平台-服务
  get_queryShippingMethod: '/setting-service/merchantShippingMethod/queryShippingMethod', // 商户平台-服务
  add_merchantShippingMethod: '/setting-service/merchantShippingMethod', // 新增商户平台邮寄方式
  delete_merchantShippingMethod: '/setting-service/merchantShippingMethod/', // 删除商户平台邮寄方式
  set_autoAssignInventory: '/order-service/warehouseAutoRule/autoAssignInventory', // 有货仓库
  get_autoAssignInventory: '/order-service/warehouseAutoRule/autoAssignInventoryStatus', // 查询有货仓库状态

  get_platformIdToName: '/order-service/merchantPlatform/queryPlatformsByIds', // 查询平台ID对应名字
  get_accountIdToName: '/order-service/merchantPlatform/queryPlatformSaleAccounts', // 帐号id查询帐号
  get_sitesIdToName: '/order-service/merchantPlatform/queryPlatformSites', // 站点id查询站点
  // 查询用户店铺权限平台信息 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-203628066
  queryUserPlatform: '/order-service/merchantPlatform/queryPlatform',
  get_packageSetting: '/wms/packageSettingCommon/queryErpCommonSettingParam', // 查询见货出单设置
  update_sortingSetting: '/packageSettingCommon/updateSortingSetting', // 更新见货出单设置
  get_packMeterial: 'wms-service/wmsPackageMaterial/list', // 获取包材列表
  cerated_packMeterial: '/wmsPackageMaterial/create', // 创建包材
  edit_wrapper: '/wmsPackageMaterial/edit', // 编辑包材
  enable_status: '/wmsPackageMaterial/openStatus', // 包材管理 启用
  disable_status: '/wmsPackageMaterial/disableStatus', // 包材管理 停用
  import_wrapper: '/wmsPackageMaterial/excelImport', // 包材管理 导入
  get_wrapperTemp: '/wmsPackageMaterial/getTemplet', // 包材管理 下载模板
  export_wrapper: '/wmsPackageMaterial/exportPackageMaterial', // 包材管理 导出
  wareLocateSearchData: '/wmsWarehouseLocation/list', // 库位管理的查询功能
  queryAllwarehouseNoStatus: '/wms-service/wmsWarehouse/queryAllwarehouseNoStatus', // 选择仓库名称下拉列表
  blockBatchModify: '/wms-service/wmsWarehouseBlock/batchModify', // 批量修改库区
  locationBatchModify: '/wms-service/wmsWarehouseLocation/batchModify', // 批量修改库位
  modifyCheckLocation: '/wmsWarehouseLocation/modifyCheckLocation',
  getCheckWarehouseLoction: '/wmsWarehouseLocation/getCheckWarehouseLoction/',
  exportWarehouseLocation: '/wmsWarehouseLocation/exportWarehouseLocation',
  selectBlockType: '/wmsWarehouseLocation/blockList', // 根据仓库联动获取库区类型
  getBarCode: '/wms/check/doing/queryPrintSkuData', // 获取打印拣货单条码
  exportWarehouseBlock: '/wmsWarehouseBlock/exportWarehouseBlock',
  wareAreaSearchData: '/wmsWarehouseBlock/list', // 库区管理的查询功能
  get_queryByWarehouseId: '/wmsWarehouseAreaRelated/queryByWarehouseId', // 根据仓库id查询
  get_AreaList: '/wmsWarehouseAreaProgram/queryAll', // 方案列表
  save_wmsWarehouseAreaRelated: '/wmsWarehouseAreaRelated', // 保存权重
  wareSetSearchData: '/wmsWarehouse/list', // 仓库设置的查询功能
  get_warehouseList: './erpCommon/wms-service/wmsWarehouse/warehouse/list', // 获取所有仓库列表, 参数 {"warehouseStatus": 0}
  selectWareLocation: '/wmsReceipt/locationList', // 入库单详情-获取库位信息列表
  shelfWareLocationList: '/wmsReceiptCheckDetailShelve/queryListParamInventory', // 提交上架结果-获取库位列表信息
  selectDetailWareBlock: '/wmsReceipt/locationAllwb', // 入库单详情-获取库区下拉列表
  selectShelfWareBlockName: '/wmsReceiptCheckDetailShelve/warehouseBlockAll', // 提交上架结果-获取库区下拉列表
  addWareAreaData: '/wmsWarehouseBlock/create', // 新增库区
  wareAreaWatchDtl: '/wmsWarehouseBlock/modify', // 库区管理修改和查看仓库数据
  // 新增仓库信息 http://192.168.91.7:882/project/392/interface/api/14837
  addWareSetData: 'wmsWarehouse/create', // 新增仓库信息
  wareSetWatchDtl: '/wmsWarehouse/modify', // 仓库设置修改和查看仓库数据
  addWareLocateData: '/wmsWarehouseLocation/create', // 新增库位
  wareLocateWatchDtl: '/wmsWarehouseLocation/modify', // 库位管理的新建和查看仓库数据
  importWarehouseBlock: '/wmsWarehouseBlock/importWarehouseBlock', // 库区设置导入
  importWarehouseLocation: '/wmsWarehouseLocation/importWarehouseLocation', // 库位导入
  check_warehouse: '/wmsWarehouse/check', // 仓库设置-查看仓库是否存在
  check_wareArea: '/wmsWarehouseBlock/check', // 库区设置-查看库区是否存在
  check_wareLocate: '/wmsWarehouseLocation/check', // 库位设置-查看库位是否存在
  downloadModalFile: '/wms/common/queryExcelTemplate', // 下载模板文件

  get_carrierGoodsBattery: '/wms-service/carrierGoodsBattery/query', // 查询帐号货品带电资质
  del_carrierGoodsBattery: '/wms-service/carrierGoodsBattery/', // 单条删除带电资质
  add_carrierGoodsBattery: '/wms-service/carrierGoodsBattery', // 新增帐号货品带电资质
  del_carrierGoodsBatteryBatch: '/wms-service/carrierGoodsBattery/batchDelete', // 批量删除带电资质
  // 删除所有带电资质
  del_deleteByAllList: '/wms-service/carrierGoodsBattery/deleteByList',
  get_queryCarrierBattery: '/wms-service/carrierGoodsBattery/queryCarrierBattery', // 物流-查询帐号带电资质
  // 导入带电资质 http://192.168.91.7:882/project/263/interface/api/15799
  importCarrierGoodsBattery: '/wms-service/carrierGoodsBattery/importCarrierGoodsBattery',

  get_orderTagList: '/order-service/tag/query', // 获取订单标签列表
  add_orderTag: '/order-service/tag', // 订单标签管理 新增
  delete_orderTag: '/order-service/tag/', // 订单标签管理 删除
  // 获取订单标签数据-有分页 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/endpoint-193835147
  queryOrderTagList: '/order-service/tag/queryTagList',

  get_exchangeRateOfficial: '/setting-service/exchangeRate/official', // 汇率-官方汇率列表
  get_exchangeRateQuery: '/setting-service/exchangeRate/query', // 汇率-查询商户汇率
  update_exchangeRate: '/setting-service/exchangeRate/update', // 汇率-实时更新商户汇率
  update_exchangeRateUpdateByHand: '/setting-service/exchangeRate/updateByHand', // 汇率-手动更新商户汇率
  update_exchangeRateUpdateById: '/setting-service/exchangeRate/updateById', // 汇率-更新商户汇率
  put_exchangeRateUpdateOfficialExchange: '/setting-service/exchangeRate/updateOfficialExchange', // 汇率-更新官方汇率
  insert_ExchangeRate: '/setting-service/exchangeRate/insert', // 添加商户汇率
  update_BatchExchageOfficialToLocal: '/setting-service/exchangeRate/officialToLocal', // 批量更新汇率至商户汇率
  get_queryExistUpdateRate: '/setting-service/exchangeRate/queryExistUpdateRate', // 查询汇率更新比率列表
  detele_deleteUpdateRate: '/setting-service/exchangeRate/deleteUpdateRate/', // 删除商户汇率更新比率
  update_settingUpdateRate: '/setting-service/exchangeRate/settingUpdateRate', // 新增、更新商户汇率更新比率
  updateShowStatusById: '/setting-service/exchangeRate/updateShowStatusById', // 修改汇率展示状态

  /* 新增(修改、获取、删除)商户账号信息
  post 新增商户账号信息
  put 修改商户账号信息， 当后面链接后面带上 /{merchantAccountId} 启用/禁用商户账号信息
  get 请求时链接后面带上 /{merchantAccountId} 是查询商户账号信息
  delete 请求时链接后面带上 /{merchantAccountId} 是删除商户账号信息
  */
  ymsMerchantAccount: '/setting-service/ymsMerchantAccount',
  // 查询商户账号列表 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-219700757
  queryYmsList: '/setting-service/ymsMerchantAccount/queryList',

  get_business: './accountBusinessSale', // 查询店铺账户业务角色列表
  get_businessInfo: './accountBusinessSale/', // 获取账户业务销售详情
  get_allCategory: '/erpCommon/product-service/productCategory/api/queryAll', // 获取多人管理模式分类列表
  update_businessSale: './accountBusinessSale/edit', // 新增或更新店铺账户业务销售详情
  get_queryByBusinessRoleType: '/setting-service/userInfo/queryByBusinessRoleType/', // 开发员列表数据调接口获取
  // /product-service/erpCommon/setting-service
  get_OverseaWarehousesType: '/wmsWarehouse/getOverseaWarehousesType', // 获取第三方物流商
  get_OverseaWarehouses: '/wmsWarehouse/getOverseaWarehouses', // 获取第三方物流仓
  get_threeWarehouses: '/setting-service/carrier/api/', // 第三方仓管理-获取第三方仓库列表
  get_ThirdCarriers: '/setting-service/carrier/api/getThirdCarriers', // 获取第三方服务商
  get_amazonStore: '/setting-service/amazonAccount/api/queryAllAmazonAccount', // 获取亚马逊店铺
  get_OWarehouseShippingMethods: '/wmsWarehouse/getOWarehouseShippingMethods', // 获取海外仓信息列表
  get_saleAccountList: '/setting-service/saleAccount/list', // 获取自定义渠道
  // 导入邮寄方式限制条件 http://192.168.91.7:882/project/343/interface/api/16094
  importShippingLogistics: '/setting-service/carrierShippingMethodLogisticsLimit/importShippingMethodLogisticsLimit',
  // 导出邮寄方式限制条件 http://192.168.91.7:882/project/343/interface/api/16095
  exportShippingLogistics: '/setting-service/carrierShippingMethodLogisticsLimit/exportShippingMethodLogisticsLimit',
  add_merchantPlatform: './erpCommon/order-service/merchantPlatform/insertDefine', // 添加自定义平台
  update_merchantPlatform: './erpCommon/order-service/merchantPlatform/updateDefine', // 更新自定义平台
  create_saleAccount: '/setting-service/saleAccount/insert', // 新增自定义店铺
  update_saleAccount: '/setting-service/saleAccount/update', // 更新自定义店铺
  get_saleAccount: '/setting-service/saleAccount/', // 查看自定义店铺
  enable_saleAccount: '/setting-service/saleAccount/enable', // 启用自定义店铺
  disable_saleAccount: '/setting-service/saleAccount/disable', // 停用自定义店铺
  sort_commonPlatform: '/order-service/merchantPlatform/updateSort', // 更新平台排序
  update_platformStatus: '/order-service/merchantPlatform/updatePlatformStatus', // 启用停用自定义平台
  // 站内信回复模板
  get_categoryTemp: '/cs-service/messageTemplateCategory/queryAll', // 获取模板分类
  del_categoryTemp: '/cs-service/messageTemplateCategory/', // 站内信回复模板分类 - 删除分类
  create_categoryTemp: '/cs-service/messageTemplateCategory', // 创建分类
  update_categoryTemp: '/cs-service/messageTemplateCategory', // 修改分类名称
  query_categoryTemp: '/cs-service/messageTemplate/query', // 查询模板列表
  del_mesTemp: '/cs-service/messageTemplate/', // 删除模板（单条）
  // 翻译 http://192.168.91.7:882/project/343/interface/api/16111
  aliTranslate: '/cs-service/aliTranslate',
  del_mesTempBatch: '/cs-service/messageTemplate/batchDelete', // 批量删除模板
  set_messageTemplate: '/cs-service/messageTemplate', // 创建模板
  get_messagePriority: '/cs-service/messagePriority', // 查询站内信优先级
  update_messagePriority: '/cs-service/messagePriority', // 更新站内信优先级
  get_messageTemplate: '/cs-service/messageTemplate/', // 获取模板详情
  update_messageTemplate: '/cs-service/messageTemplate', // 修改模板
  get_folder: '/cs-service/messageFolder/queryAll', // 站内信文件夹-查询所有文件夹
  create_folder: '/cs-service/messageFolder', // 创建文件夹
  update_folderName: '/cs-service/messageFolder', // 修改文件夹名称
  del_folder: '/cs-service/messageFolder/', // 删除文件夹
  update_folderOrder: '/cs-service/messageFolder/changeOrder', // 调整文件夹顺序
  get_ebayAutoRule: '/cs-service/ebayMessageAutoRule/query', // 查询ebay站内信规则
  del_ebayAutoRule: '/cs-service/ebayMessageAutoRule', // 删除ebay站内信规则
  put_ebayRuleEnable: '/cs-service/ebayMessageAutoRule/enable/', // 启用ebay站内信规则
  put_ebayRuleDisenable: '/cs-service/ebayMessageAutoRule/disable/', // 停用ebay站内信规则
  get_ebayAutoRuleDetail: '/cs-service/ebayMessageAutoRule/', // 获取规则详情
  add_ebayAutoRule: '/cs-service/ebayMessageAutoRule', // 添加ebay站内信自动规则
  edit_ebayAutoRule: '/cs-service/ebayMessageAutoRule', // 编辑ebay站内信自动规则
  update_ebayAutoRule: '/cs-service/ebayMessageAutoRule/updatePriority', // 更新ebay自动规则优先级
  get_syncWarehouse: '/wmsWarehouse/queryFromOldErp', // 获取同步仓库下拉列表
  query_distributeRule: '/wmsWarehouseAutoRule/queryAutoDistributeRule', // 查询仓库分配规则
  disable_distributeRule: '/wmsWarehouseAutoRule/disableAutoDistributeRule/', // 停用仓库分配规则
  enable_distributeRule: '/wmsWarehouseAutoRule/enableAutoDistributeRule/', // 启用仓库分配规则
  set_distributeRule: '/wmsWarehouseAutoRule/setAutoDistributeTask', // 出库管理-设置自动配货时间
  query_carrierRule: '/wmsWarehouseAutoRule/queryAutoUploadCarrierRule', // 查询仓库自动下发物流规则
  disable_carrierRule: '/wmsWarehouseAutoRule/disableAutoUploadCarrierRule/', // 停用仓库自动下发物流规则
  enable_carrierRule: '/wmsWarehouseAutoRule/enableAutoUploadCarrierRule/', // 启用仓库自动下发物流规则
  set_carrierRule: '/wmsWarehouseAutoRule/setAutoUploadCarrierTask', // 出库管理-设置自动下发物流时间
  get_wareAreaGroupList: '/wmsWarehouseBlockGroup', // 获取库区组列表
  add_wareAreaGroup: '/wmsWarehouseBlockGroup', // 新增库区组
  del_wareAreaGroup: '/wmsWarehouseBlockGroup', // 删除库区组
  put_wareAreaGroupName: '/wmsWarehouseBlockGroup', // 更新库区组名称
  get_wmsWarehouseAreaProgram: '/wmsWarehouseAreaProgram/query', // 分区方案列表(分页)
  put_wmsWarehouseAreaProgramDisable: '/wmsWarehouseAreaProgram/disable', // 分区 停用
  put_wmsWarehouseAreaProgramEnable: '/wmsWarehouseAreaProgram/enable', // 分区 启用
  get_queryByWmsWarehouseAreaProgramId: '/wmsWarehouseArea/queryByWmsWarehouseAreaProgramId', // 分区 启用
  wmsWarehouseAreaProgram: '/wmsWarehouseAreaProgram', // 新建分区方案 post  修改 put
  wmsWarehouseArea: '/wmsWarehouseArea', // 分区 post  修改 put 删除 delete
  delete_wmsWarehouseArea: '/wmsWarehouseArea/delete', // 分区删除
  wmsWarehouseAreaDetail: '/wmsWarehouseAreaDetail', // 分区组  post  修改 put 删除 delete
  delete_wmsWarehouseAreaDetail: '/wmsWarehouseAreaDetail/delete', // 分区组删除
  importWarehouseArea: '/wmsWarehouseArea/importWarehouseArea', // 导入分区模板
  importPriceModelZoneExcel: '/carrierShippingMethodPriceModelZone/importExcel', // 邮寄方式导入
  // 物流设置-物流渠道-运费模板导入 https://app.apifox.com/project/3429548
  importParseExcel: '/carrierShippingMethodPriceModelZone/parseExcel',
  // 物流设置-物流渠道-导出计费模型 api/{shippingMethodId} https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-209022806
  exportPriceModelZone: '/setting-service/carrierShippingMethodPriceModelZone/exportPriceModelZone',
  getAreaTemplet: '/wmsWarehouseArea/getTemplet', // 获取模板
  getAreaDetailTemplet: '/wmsWarehouseAreaDetail/getTemplet', // 获取模板
  importWarehouseAreaDetail: '/wmsWarehouseAreaDetail/importWarehouseAreaDetail', // 导入分组模板
  get_orderCarrierAutoRule: '/order-service/orderCarrierAutoRule/query', // 查询物流自动审核规则(智能物流-物流规则)
  get_carrierAutoRule: '/order-service/orderCarrierAutoRule/', // 获取规则详情
  add_orderCarrierRule: '/order-service/orderCarrierAutoRule', // 智能物流规则-添加和编辑规则
  // 智能物流规则 批量启动物流自动审核规则 https://app.apifox.com/project/3429548 订单模块中
  autoRuleBatchEnable: '/order-service/orderCarrierAutoRule/batchEnable',
  // 智能物流规则 批量停用物流自动审核规则 https://app.apifox.com/project/3429548 订单模块中
  autoRuleBatchDisable: '/order-service/orderCarrierAutoRule/batchDisable',
  get_currencyInfo: './erpCommon/common-service/currencyInfo/query', // 获取币种
  update_carrierAutoRule: '/order-service/orderCarrierAutoRule/updatePriority', // 跟新智能物流规则优先级
  set_disableAutoRule: '/order-service/orderCarrierAutoRule/disable/', // 停用智能物流规则
  set_enableAutoRule: '/order-service/orderCarrierAutoRule/enable/', // 启用智能物流规则
  // 批量复制物流规则 http://192.168.91.7:882/project/268/interface/api/16093
  batchOrderAutoRuleCopy: '/order-service/orderCarrierAutoRule/batchOrderAutoRuleCopy',
  del_wareAutoRule: '/order-service/warehouseAutoRule', // 删除自动分仓规则
  query_warehouse: '/wmsWarehouse/queryAllwarehouse', // 获取自动分仓规则带权重的仓库列表
  queryUserAllwarehouse: '/wms-service/wmsWarehouse/queryUserAllwarehouse', // 获取自动分仓规则带权重的仓库列表（后端说是旧的）
  get_queryReason: '/cs-service/afterSales/queryReason', // 获取原因列表
  set_queryReason: '/cs-service/afterSales/saveReason', // 设置原因列表
  add_reason: '/cs-service/afterSales/saveReason', // 添加原因
  get_afterSales: '/cs-service/afterSales/query', // 售后处理列表
  set_afterSales: '/cs-service/afterSales', // 提交审批
  update_backReview: '/cs-service/afterSales/backReview', // 提交
  update_approvePass: '/cs-service/afterSales/approvePass', // 审批通过
  batch_batchReview: '/cs-service/afterSales/batchSubmitApprove', // 批量提交审批
  batch_batchApprovePass: '/cs-service/afterSales/batchApprovePass', // 批量审批通过
  batch_batchBackReview: '/cs-service/afterSales/batchBackReview', // 批量退回修改
  get_queryOrder: '/cs-service/afterSales/queryOrder', // 查询订单详情
  get_afterExport: '/cs-service/afterSales/export', // 导入
  get_salesDetail: '/cs-service/afterSales/detail', // 售后处理详情
  update_afterSales: '/cs-service/afterSales', // 查询订单详情
  export_queryTask: '/cs-service/erpCommon/queryTask', // 导出查看
  get_autoMessage: '/cs-service/autoMessage/queryAll', // 获取自动客服消息
  reSendMessage: '/cs-service/autoMessageHistory/reSend/', // 发送消息
  put_cancelMessage: '/cs-service/autoMessage/cancel', // 取消消息
  put_batchCancelMessage: '/cs-service/autoMessage', // 批量取消自动客服消息
  put_autoSendMessageAutoRule: '/cs-service/autoSendMessageAutoRule/query', // 批量取消自动客服消息
  post_csSettingCommon_queryCsConfig: '/cs-service/csSettingCommon/queryCsConfig', // 查询cs的配置
  post_csSettingCommon_saveAutoReview: '/cs-service/csSettingCommon/saveAutoReview', // 保存自动审核设置
  /* 申报规则 */
  update_packageRuleDetails: '/wms-service/packageRuleDetails/save', // 保存默认申报设置 post
  get_packageRuleDetails: '/wms-service/packageRuleDetails/default', // 获取默认申报设置 get
  get_ruleDetails: '/wms-service/packageRuleDetails/', // 获取规则里面详情
  get_packageDeclareAutoRule: '/wms-service/packageDeclareAutoRule/', // GET 获取规则详情
  add_packageDeclareAutoRule: '/wms-service/packageDeclareAutoRule', // 添加包裹申报规则
  update_packageDeclareAutoRule: '/wms-service/packageDeclareAutoRule', // PUT  更新包裹申报规则
  disable_packageDeclareAutoRule: '/wms-service/packageDeclareAutoRule/disable/', // PUT  停用包裹申报规则
  enable_packageDeclareAutoRule: '/wms-service/packageDeclareAutoRule/enable/', // PUT  启用包裹申报规则
  get_packageDeclareAutoRuleQuery: '/wms-service/packageDeclareAutoRule/query', // PUT  查询包裹申报规则
  updatePriority_packageDeclareAutoRuleQuery: '/wms-service/packageDeclareAutoRule/updatePriority', // PUT  更新优先级

  /* 黑名单 */
  update_privateBlackList: '/cs-service/privateBlackList', // 专有黑名单-新增专有黑名单  专有黑名单-删除专有黑名单  专有黑名单-修改专有黑名单
  export_privateBlackList: '/cs-service/privateBlackList/export', // 专有黑名单——导出
  import_privateBlackList: '/cs-service/privateBlackList/import', // 专有黑名单——导入
  downBlackTemp: '/cs-service/privateBlackList/getTemplate', // 专有黑名单——模板
  get_privateBlackList: '/cs-service/privateBlackList/queryAll', // 专有黑名单-查询专有黑名单
  update_whiteList: '/cs-service/whiteList', // 白名单-新增白名单 post 白名单-修改白名单 put 删除 de
  get_whiteList: '/cs-service/whiteList/queryAll', // 白名单-查询白名单
  get_publicBlackList: '/common-service/publicBlackList/queryAll', // 公共黑名单
  get_publicBlackListRemark: '/common-service/publicBlackListRemark/queryAll', // 公共黑名单
  update_publicBlackList: '/common-service/publicBlackList', // 公共黑名单-新增公共黑名单 post 公共黑名单-删除公共黑名单 delete
  /* 售后设置 */
  getFeedTemplate: '/cs-service/feedbackTemplate/queryAllByPlatform/', // 获取模板
  get_detailAutoFeedbackSetting: '/cs-service/afterSalesSetting/detailAutoFeedbackSetting', // 售后设置自动评价查询
  get_detailAutoRefundSetting: '/cs-service/afterSalesSetting/detailAutoRefundSetting', // 售后设置自动退款查询
  update_saveAutoFeedback: '/cs-service/afterSalesSetting/saveAutoFeedback', // 售后设置-保存售后自动评价设置
  update_saveAutoRefund: '/cs-service/afterSalesSetting/saveAutoRefund', // 售后设置-保存售后自动退款设置
  /* 自定义菜单 */
  add_menuResource: '/setting-service/menuResource', // 添加自定义菜单
  get_menuResource: '/setting-service/menuResource/all', // 获取自定义菜单
  /* 生成UPC规则 */
  get_queryProductSpu: baseUrl + '/pds-service/pds/setting/queryProductSpu', // 查询商户编号信息
  post_createProductSpu: baseUrl + '/pds-service/pds/setting/createProductSpu', // 创建商户编号信息
  post_queryProductUpcAll: baseUrl + '/pds-service/pds/setting/queryProductUpcAll', // 获取所有upc编码项
  put_insertProductUpc: baseUrl + '/pds-service/pds/setting/insertProductUpc', // 新增编码项
  put_updateProductUpc: baseUrl + '/pds-service/pds/setting/updateProductUpc', // 编辑编码项
  get_queryProductUpcById: baseUrl + '/pds-service/pds/setting/queryProductUpcById', // 查看指定的编码项信息
  delete_deleteProductUpcById: baseUrl + '/pds-service/pds/setting/deleteProductUpcById', // 删除编码项
  put_sortProductUpcSetting: baseUrl + '/pds-service/pds/setting/sortProductUpcSetting', // 编码项排序

  // 尺码管理
  queryProductSizeList: baseUrl + '/pds-service/pds/lapa/workbench/product/queryProductSizeList', // 查询-尺码管理
  saveProductSize: baseUrl + '/pds-service/pds/lapa/workbench/product/saveProductSize', // 添加-尺码管理
  exportProductSizeList: baseUrl + '/pds-service/pds/lapa/workbench/product/exportProductSizeList', // 导出-尺码管理

  // 尺码类型管理
  queryProductSizeTypeRel: baseUrl + '/pds-service/pds/lapa/workbench/product/queryProductSizeTypeRel', // 查询-尺码类型关联
  queryProductSizeTypeList: baseUrl + '/pds-service/pds/lapa/workbench/product/queryProductSizeTypeList', // 查询-尺码类型
  saveProductSizeTypeRel: baseUrl + '/pds-service/pds/lapa/workbench/product/saveProductSizeTypeRel', // 修改-尺码类型管理
  exportProductSizeTypeRelList: baseUrl + '/pds-service/pds/lapa/workbench/product/exportProductSizeTypeRelList', // 导出-尺码类型关联

  // SKC颜色管理
  queryProductColorList: baseUrl + '/pds-service/pds/lapa/workbench/product/queryProductColorList', // 设置-SKC颜色管理-查询
  saveProductColor: baseUrl + '/pds-service/pds/lapa/workbench/product/saveProductColor', // 设置-SKC颜色管理-添加
  exportProductColorList: baseUrl + '/pds-service/pds/lapa/workbench/product/exportProductColorList', // 设置-SKC颜色管理-导出
  queryProductColorAttribute: baseUrl + '/pds-service/pds/lapa/workbench/product/queryProductColorAttribute', // 查询skc属性名
  updateProductColorAttribute: baseUrl + '/pds-service/pds/lapa/workbench/product/updateProductColorAttribute', // 编辑skc属性名

  //  新3.0供货商列表
  getNewSupplierInfo: "./erpCommon/sps-service/sps/api/supplierManagement/list",

  //  分类类型管理
  queryProductTypeList: baseUrl + '/pds-service/pds/lapa/workbench/product/queryAllProductSpuConfigList',
  deleteProductType: baseUrl + '/pds-service/pds/lapa/workbench/product/removeProductSpuConfig',
  addProductType: baseUrl + '/pds-service/pds/lapa/workbench/product/saveProductSpuConfig',
  editProductType: baseUrl + '/pds-service/pds/lapa/workbench/product/updateProductSpuConfig',
  // 新品默认审核人
  queryProductDefaulReviewer: baseUrl + '/pds-service/pds/lapa/workbench/product/queryProductDefaulReviewer', // 新品默认审核人-查询
  saveProductDefaulReviewer: baseUrl + '/pds-service/pds/lapa/workbench/product/saveProductDefaulReviewer', // 新品默认审核人-查询
  // 设置中心-尺码模板
  ...pdsSettingsApiConfig,
  getAllUserByParm: '/setting-service/userInfo/getAllUserByParm', // 设置中心-新品人员查询-剔除荒废用户

  // 货箱体积设置
  wmsBoxesList: '/wms-service/wmsBoxes/list', // 列出所有箱
  wmsBoxesSave: '/wms-service/wmsBoxes/save', // 保存箱
  wmsBoxesGet: '/wms-service/wmsBoxes/get', // 查看箱
  wmsBoxesEdit: '/wms-service/wmsBoxes/edit' // 编辑箱
};
