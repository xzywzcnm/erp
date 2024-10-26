/*
 * @Author: w
 * @Date: 2021-02-08 09:27:39
 * @LastEditors: w
 * @LastEditTime: 2021-02-08 10:08:07
 */
export default {
  get_token: './auth/', // get token
  refresh_token: './refresh/', // 刷新token
  logout: '/wms-service/logout/', // 登出
  get_erpConfig: '/erpCommon/loadConfig', // 用户信息
  get_imgPrefix: '/wms-service/wms/common/getProductImagFiex', // 跨系统prefix
  carrierServiceCommon: './erpCommon/',
  productService: '/product-service/',
  erpService: '/order-service/',
  wmsService: '/wms-service/',
  commonService: '/common-service/',
  carrierService: './erpCommon/setting-service',
  wmsServiceCommon: './erpCommon/', // End
  get_countrys: './erpCommon/common-service/country/query', // 获取国家区域列表 post
  get_shopList: '/setting-service/saleAccount/getSaleAccounts', // 查询店铺列表
  get_saleAccountById: './erpCommon/setting-service/saleAccount/getSaleAccountsByIds', // 根据店铺主键列表查询店铺列表
  get_enableShippingMethods: './erpCommon/setting-service/carrierShippingMethod/api/queryForEnableShippingMethods', // 物流-根据物流方式查询有效运输方式
  get_enablePlatform: './erpCommon/order-service/merchantPlatform/queryEnablePlatform', // 查询用户可用平台
  get_menuRole: '/userInfo/queryMenu', // 查询用户菜单
  get_menus: './erpCommon/setting-service/userSubsystem/query', // 查询子系统
  get_loadUrlTxt: './erpCommon/loadUrl', // 读取url文本
  get_businessDept: '/dyt-cloud-upms-admin/sys/businessDept/list', // 获取事业部列表
  get_singlePageRole: './userInfo/queryOperByMenu/', // 获取单页权限
  get_singlePageRoleCommon: './erpCommon/setting-service/userInfo/queryOperByMenu/', // 获取单页权限
  get_downloadPrint: '/wms-service/packageCommon/downloadTongtoolPrinter',
  get_userInfoCommon: './erpCommon/setting-service/userInfo/getAllUser', // 获取用户信息
  get_currencyInfo: './erpCommon/common-service/currencyInfo/query', // 获取币种
  get_menuResource: './erpCommon/setting-service/menuResource/all', // 获取自定义菜单
  getTicketToken: '/setting-service/auth/getTicket', // 获取 ticket
  set_updateTimeZone: './erpCommon/setting-service/erpCommon/updateTimeZone', // 设置时区
  queryProductQualityInfoList: './erpCommon/product-service/productInfo/queryProductQualityInfoList', // 获取质检
  get_querySkuNumAndBatchNum: '/wms-service/wmsReceiptCheckDetailShelve/querySkuNumAndBatchNum', // 查询首页统计数据
  queryOutstoreSalesPackageDetail: '/wms-service/wmsPicking/queryOutstoreSalesPackageDetail', // 上传包裹
  // 获取店铺平台信息
  get_queryByStatus: './erpCommon/order-service/merchantPlatform/queryByStatus',
  // 店铺授权失效提醒 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-201599204
  queryAuthWarn: './erpCommon/setting-service/saleAccountCommon/queryAuthWarn',
  // // 获取平台主体接口
  // queryPlatformId: './erpCommon/product-service/thirdPartyTag/queryPlatformId',
  // 获取对应平台主体下店铺
  queryThirdAccountByPlatformId: './erpCommon/product-service/thirdPartyTag/queryAccountByPlatformId',
  // 获取第三方标签列表 http://192.168.91.7:882/project/273/interface/api/15881
  queryproductOverseaTag: '/wms-service/wmsDirectDeliverPicking/query',
};
