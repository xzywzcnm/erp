const prefix = '/sps-service';
export default { // 基础模块
  // 跨系统prefix
  carrierServiceCommon: '/setting-service/erpCommon',
  wmsErpCommon: '/wms-service/erpCommon',
  productService: '/product-service/',
  erpService: '/order-service/',
  wmsService: '/wms-service/',
  commonService: '/common-service/',
  carrierService: '/setting-service',
  erpServiceCommon: '/order-service/erpCommon/',
  csServiceCommon: '/cs-service/erpCommon',
  productServiceCommon: '/product-service/erpCommon/',
  prodcutServiceCommon: '/peroduct_service/erpCommon/',
  get_countrys: '/order-service/erpCommon/common-service/country/query', // 获取国家区域列表 post
  get_menu: '/order-service/erpCommon/common-service/selectAllMenus', // 菜单列表
  add_menu: '/order-service/erpCommon/common-service/menu/', // 新增菜单
  update_menu: '/order-service/erpCommon/common-service/menu/', // 更新菜单
  del_menu: '/order-service/erpCommon/common-service/menu/', // 删除菜单
  get_oper: '/order-service/erpCommon/common-service/selectAllOpers', // 权限列表
  add_oper: '/order-service/erpCommon/common-service/oper/save', // 新增权限
  update_oper: '/order-service/erpCommon/common-service/oper/update', // 更新权限
  del_oper: '/order-service/erpCommon/common-service/oper/delete', // 删除权限
  get_singlePageRole: prefix + '/erpCommon/setting-service/userInfo/queryOperByMenu/', // 获取单页权限
  get_singlePageRoleCommon: prefix + '/erpCommon/setting-service/userInfo/queryOperByMenu/', // 获取单页权限
  get_userInfo: prefix + '/erpCommon/setting-service/userInfo/getAllUser', // 获取用户信息
  get_userInfoCommon: prefix + '/erpCommon/setting-service/userInfo/getAllUser', // 获取用户信息
  get_userInfoMap: prefix + '/erpCommon/common-service/userInfo/queryMapByUserIds', // 根据用户Id列表查询用户信息
  logout: prefix + '/logout/', // 登出
  get_token: prefix + '/auth/', // get token
  refresh_token: prefix + '/refresh/', // 刷新token
  token_time: 540000, // token生存时间
  get_commonParameter: '/setting-service/erpCommon/common-service/commonParameter/list', // 顶级CommonParameter查询
  get_downloadPrint: prefix + '/productCommon/downloadTongtoolPrinter',
  get_menus: prefix + '/erpCommon/setting-service/userSubsystem/query', // 查询子系统
  getTicketToken: '/setting-service/auth/getTicket', // 获取 ticket
  set_updateTimeZone: '/wms-service/erpCommon/setting-service/erpCommon/updateTimeZone', // 设置时区
  get_productCategory: '/wms-service/erpCommon/product-service/productCategory/queryAll', // 查询商品分类
  // 获取店铺平台信息
  get_queryByStatus: prefix + '/erpCommon/order-service/merchantPlatform/queryByStatus',
  // 店铺授权失效提醒 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-201599204
  queryAuthWarn: prefix + '/erpCommon/setting-service/saleAccountCommon/queryAuthWarn',
  // alibaba: prefix + '/erpCommon/setting-service/sps/common/account/alibaba', //获取1688帐号列表

  post_erpCommon_disableNoticeInfo: prefix + '/erpCommon/disableNoticeInfo', // 不再提醒版本迭代通知
  get_erpCommon_queryNoticeInfo: prefix + '/erpCommon/queryNoticeInfo', // 查询版本迭代通知
};
