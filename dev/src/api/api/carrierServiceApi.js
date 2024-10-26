export default { // 物流模块

  add_carrierAddDefine: '/setting-service/carrier/addDefine', // 物流-添加(自定义)物流商
  get_carrierDefine: '/setting-service/carrier/define/', // 物流-自定义物流商详情 GET
  disabled_carrierDisable: '/setting-service/carrier/disable/', // 物流-物流商停用
  enable_carrierEnable: '/setting-service/carrier/enable/', // 物流-物流商启用
  get_carrierListDefine: '/setting-service/carrier/listDefine', // 物流-物流商列表
  update_carrierListDefine: '/setting-service/carrier/updateDefine', // 物流-编辑
  // 仓库设置
  // 获取第三方 CNE 可选仓库 http://192.168.91.7:882/project/392/interface/api/14797 （暂时弃用）
  post_warehouses: '/setting-service/thirdCarrier/api/cne/warehouses',
  // 获取 CNE 服务商信息 http://192.168.91.7:882/project/392/interface/api/14801
  get_cneDetail: '/setting-service/carrier/api/getCarrierDetail/cne',

  get_disableCarriers: '/setting-service/carrier/queryForDisableCarriers', // 查询未启用的物流商
  get_enableCarriers: '/setting-service/carrier/queryForEnableCarriers', // 查询可用物流
  getMethodPriceModelZoneTemplet: '/setting-service/carrierShippingMethodPriceModelZone/getTemplet/', // 下载运费模板
  get_enableCarriersApi: '/setting-service/carrier/api/queryForEnableCarriers', // 查询可用物流
  get_shippingMethodParams: './erpCommon/setting-service/carrierParam/queryForShippingMethodParams', // 物流渠道配置
  get_shippingMethodParamsApi: './erpCommon/setting-service/carrierParam/api/queryForShippingMethodParams', // 物流渠道配置
  get_pickingLog: './erpCommon/wms-service/picking/log/api/list', // wms 操作日志
  get_orderOperationLog: './orderOperationLog/listByNextToken', // 订单处理系统-订单日志
  get_CsOrderOperationLog: './erpCommon/order-service/orderOperationLog/listByNextToken', // 客服管理系统-订单日志
  get_productGoodsTag: './erpCommon/product-service/productGoodsTag/api/queryByProductGoodsIds', // 查询货品标签列表
  post_queryGoodsSpecificationByIds: './erpCommon/product-service/productGoods/api/queryGoodsSpecificationByIds', // 查询货品规格属性
  get_enableShippingMethods: '/setting-service/carrierShippingMethod/queryForEnableShippingMethods', // 物流-根据物流方式查询有效运输方式
  get_enableShippingMethodsApi: '/setting-service/carrierShippingMethod/api/queryForEnableShippingMethods', // 物流-根据物流方式查询有效运输方式
  get_queryBindingShippingMethods: '/setting-service/carrierShippingMethod/api/queryByWarehouseId', // 物流-根据物流方式查询有效运输方式
  get_allEnabalShippingMethods: './erpCommon/setting-service/carrierShippingMethod/queryByIds', // 物流-批量查询邮寄方式
  set_carrierShippingMethod: '/setting-service/carrierShippingMethod/', // 物流-更新物流方式
  copy_carrierShippingMethod: '/setting-service/carrierShippingMethod/copyCarrierShippingMethod', // 复制物流渠道
  get_allShippingMethod: '/setting-service/carrierShippingMethod/api/query', // 物流-根据物流商ID查询运输方式
  set_updateWithAccount: '/setting-service/carrierShippingMethod/updateWithAccount', // 速卖通线上发货 更新物流方式
  add_customShip: '/setting-service/carrierShippingMethod/addDefine', // 添加自定义物流方式
  get_carrierShippingMethod: '/setting-service/carrierShippingMethod/', // 获取物流渠道设置详情
  get_carrierAliexpressAddress: '/setting-service/carrierPlatformAccountAddress/', // 获取速卖通线上发货设置信息
  get_carrierAliexpressSync: '/setting-service/carrierPlatformAccountAddress/syncAddress', // 速卖通线上发货 同步
  get_carrierAliexpressDetail: '/setting-service/carrierShippingMethod/detailByAccountShippingMethodId', // 速卖通线上发货
  // 物流渠道详情
  add_withApi: '/setting-service/carrier/insertWithApi/', // 新增对接物流商
  get_newCarrierAccountModal: '/setting-service/carrierAccount/getCarrierAccount/', // 获取新账户模板{carrierId}
  set_carrierShippingMethodDisable: '/setting-service/carrierShippingMethod/disable', // 停用物流方式
  // 批量停用物流方式 https://app.apifox.com/project/3429548
  carrierBatchDisable: '/setting-service/carrierShippingMethod/batchDisable',
  get_queryForDisableShippingMethodsApi: '/setting-service/carrierShippingMethod/api/queryForDisableShippingMethods', // 查詢未啟用的物流方式
  get_queryForDisableShippingMethods: '/setting-service/carrierShippingMethod/queryForDisableShippingMethods', // 查詢未啟用的物流方式
  set_carrierShippingMethodEnable: '/setting-service/carrierShippingMethod/enable', // 啟用物流方式
  get_overseaWarehouseAccount: '/setting-service/carrierAccount/api/getOverseaWarehouseAccount', // 授权万邑通
  get_carrierAccount: '/setting-service/carrierAccount/queryByCarrierId/', // 查询物流账号
  queryCarrierShippingName: './erpCommon/setting-service/carrierShippingMethod/queryCarrierShippingName', // 获取物流商名称和物流渠道名称
  set_accountSaving: './erpCommon/setting-service/carrierAccount/save', // 保存帳號
  delete_carrierAccount: '/setting-service/carrierAccount/', //  + carrierAccountId
  get_carrierAccountMes: '/setting-service/carrierAccount/queryByCarrierAccountId', // 获取帐号信息
  get_queryBaseDetails: '/setting-service/carrierShippingMethod/queryBaseDetail/', // {shippingMethodId}
  // 物流-根据物流方式ID查询渠道基础信息
  get_standardPrice: '/setting-service/carrierShippingMethodPriceModel/queryBySystemShippingMethodId', // 获取标准报价
  get_authURL: '/setting-service/carrierAccount/authUrl/', // {{carrierAccountId}} 获取授权地址
  get_aliexpressAccount: '/setting-service/aliexpressAccount/api', // 获取速卖通线上发货商户有效账号
  set_authSave: '/setting-service/carrierAccount/auth', // 01 授权验证
  get_vovaAddress: '/setting-service/carrierVovaAddress', // vova地址查询
  get_zoneCountry: '/setting-service/carrierShippingMethodPriceModelZoneCountry/query', // 查询邮寄方式分区可达国家
  update_baseDetail: '/setting-service/carrierShippingMethod/updateBaseDetail', // 物流-物流方式基本属性修改
  queryForEnableCarriersExcludeWarehouse: '/setting-service/carrier/api/queryForEnableCarriersExcludeWarehouse', // 自营邮寄方式下拉
  queryForEnableShipMethodsExcludeWarehouse: '/setting-service/carrierShippingMethod/api/queryForEnableShipMethodsExcludeWarehouse', // 自营邮寄方式下拉2
  bindingShippingMethodWarehouse: '/setting-service/carrierShippingMethod/api/bindingShippingMethodWarehouse', // 自营仓点添加邮寄方式
  unbindingShippingMethodWarehouse: '/wms-service/wmsWarehouse/unbindingShippingMethodWarehouse', // 自营仓点移除邮寄方式
  // 查询YMS商品库存 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-171293193
  queryYMSInventory: '/wms-service/wmsWarehouse/queryYMSInventory',
  get_carrierCode: './erpCommon/setting-service/carrier/api/getCarrierDetail/', // 新增仓库时，获取appKey appToken的动态参数
  get_warehouseSaleAccountTax: './erpCommon/wms-service/wmsWarehouse/warehouseSaleAccountTax/', // 获取店铺税率列表数据
  get_EnabledSaleAccounts: '/wms-service/erpCommon/setting-service/saleAccount/api/getEnabledSaleAccounts', // 查询可用平台店铺
  get_carrierShippingMethodPrice: '/setting-service/carrierShippingMethodPriceModel/getByShippingMethodId' // 获取引用其他渠道的计费模板信息的数据
};
