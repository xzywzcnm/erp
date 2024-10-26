export default {
  // 物流模块
  get_disableCarriers: './erpCommon/setting-service/carrier/queryForDisableCarriers', // 查询未启用的物流商
  get_enableCarriers: './erpCommon/setting-service/carrier/api/queryForEnableCarriers', // 查询可用物流
  get_shippingMethodParams: './erpCommon/setting-service/carrierParam/queryForShippingMethodParams', // 物流渠道配置
  get_shippingMethodParamsApi: './erpCommon/setting-service/carrierParam/api/queryForShippingMethodParams', // 物流渠道配置
  get_queryBindingShippingMethods: '/setting-service/carrierShippingMethod/api/queryBindingShippingMethods',
  get_allEnabalShippingMethods: './erpCommon/setting-service/carrierShippingMethod/queryByIds', // 物流-批量查询邮寄方式
  set_carrierShippingMethod: './erpCommon/setting-service/carrierShippingMethod/', // 物流-更新物流方式
  get_carrierShippingMethod: './erpCommon/setting-service/carrierShippingMethod/', // 获取物流渠道设置详情
  add_withApi: './erpCommon/setting-service/carrier/insertWithApi/', // 新增对接物流商
  get_newCarrierAccountModal: './erpCommon/setting-service/carrierAccount/getCarrierAccount/', // 获取新账户模板{carrierId}
  set_carrierShippingMethodDisable: './erpCommon/setting-service/carrierShippingMethod/disable', // 停用物流方式
  get_queryForDisableShippingMethods: './erpCommon/setting-service/carrierShippingMethod/queryForDisableShippingMethods', // 查詢未啟用的物流方式
  set_carrierShippingMethodEnable: './erpCommon/setting-service/carrierShippingMethod/enable', // 啟用物流方式
  get_carrierAccount: './erpCommon/setting-service/carrierAccount/queryByCarrierId/', // 查询物流账号
  queryCarrierShippingName: './erpCommon/setting-service/carrierShippingMethod/queryCarrierShippingName',
  set_accountSaving: './erpCommon/setting-service/carrierAccount/save', // 保存帳號
  delete_carrierAccount: './erpCommon/setting-service/carrierAccount/', //  + carrierAccountId
  get_carrierAccountMes: './erpCommon/setting-service/carrierAccount/', // 获取帐号信息
  get_queryBaseDetails: './erpCommon/setting-service/carrierShippingMethod/queryBaseDetail/', // {shippingMethodId}
  // 物流-根据物流方式ID查询渠道基础信息
  get_standardPrice: './erpCommon/setting-service/carrierShippingMethodPriceModel/queryBySystemShippingMethodId' // 获取标准报价
};
