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
  get_businessDeptList: '/dyt-cloud-upms-admin/sys/businessDept/list', // 从 UPMS 获取所有事业部列表
  // 查询所有物流 http://192.168.91.7:882/project/343/interface/api/16083
  queryLogisticsChannel: './erpCommon/setting-service/carrier/api/query',
  get_countrys: '/common-service/country/query', // 获取国家区域列表 post
  get_menu: '/order-service/erpCommon/common-service/selectAllMenus', // 菜单列表
  add_menu: '/order-service/erpCommon/common-service/menu/', // 新增菜单
  update_menu: '/order-service/erpCommon/common-service/menu/', // 更新菜单
  del_menu: '/order-service/erpCommon/common-service/menu/', // 删除菜单
  get_oper: '/order-service/erpCommon/common-service/selectAllOpers', // 权限列表
  add_oper: '/order-service/erpCommon/common-service/oper/save', // 新增权限
  update_oper: '/order-service/erpCommon/common-service/oper/update', // 更新权限
  del_oper: '/order-service/erpCommon/common-service/oper/delete', // 删除权限
  get_singlePageRoleCommon: '/setting-service/userInfo/queryOperByMenu/', // 获取单页权限
  get_userInfoCommon: '/setting-service/userInfo/getAllUser', // 获取用户信息
  getAllUser: './erpCommon/setting-service/userInfo/getAllUser', // 获取用户信息
  get_userInfoMap: '/order-service/erpCommon/common-service/userInfo/queryMapByUserIds', // 根据用户Id列表查询用户信息
  get_businessDept: '/dyt-cloud-upms-admin/sys/businessDept/list', // 获取事业部列表
  logout: './logout/', // 登出
  get_token: './auth/', // get token
  refresh_token: './refresh/', // 刷新token
  token_time: 540000, // token生存时间
  getTicket: '/setting-service/auth/getTicket', // 获取 ticket
  get_downloadPrint: '/product-service/productCommon/downloadTongtoolPrinter',
  get_downloadPrintWms: '/wms-service/packageCommon/downloadTongtoolPrinter',
  get_menus: '/setting-service/userSubsystem/query', // 查询子系统
  set_updateTimeZone: '/wms-service/erpCommon/setting-service/erpCommon/updateTimeZone' // 设置时区
};
