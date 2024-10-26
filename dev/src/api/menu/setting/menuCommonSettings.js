export default {
  generalSettings: [
    {
      'mainTitle': '通用',
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'generalSettings.html#/',
      'type': 'Group',
      'id': 'generalSettings1'
    }, {
      'mainTitle': '通用',
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'generalSettings.html#/',
      'type': 'Group-title',
      'display': true,
      'id': 'generalSettings3',
      'pid': 'generalSettings1'
    }, {
      'mainTitle': '平台店铺', // 平台店铺
      'link': 'generalSettings.html#/shop',
      'menuKey': 'generalSettings_shop',
      'id': 'generalSettings17',
      'pid': 'generalSettings3'
    }, {
      'mainTitle': '员工管理', // 员工管理
      'link': 'generalSettings.html#/management',
      'menuKey': 'generalSettings_management',
      'id': 'generalSettings2',
      'pid': 'generalSettings3'
    },
    {
      'mainTitle': 'YMS账号管理',
      'link': 'generalSettings.html#/ymsAccountManage',
      'menuKey': 'generalSettings_ymsAccountManage',
      'id': 'generalSettings8',
      'pid': 'generalSettings3'
    },
    {
      'mainTitle': '业务角色管理', // 业务角色管理
      'link': 'generalSettings.html#/businessRoleManage',
      'menuKey': 'generalSettings_businessRoleManage',
      'id': 'generalSettings5',
      'pid': 'generalSettings3'
    }, {
      'mainTitle': 'Paypal账号', // Paypal账号
      'link': 'generalSettings.html#/paypalAccountSetting',
      'menuKey': 'generalSettings_paypalAccountSetting',
      'id': 'generalSettings4',
      'pid': 'generalSettings3'
    }, {
      'mainTitle': '汇率管理', // 汇率管理
      'link': 'generalSettings.html#/exchangeRate',
      'menuKey': 'generalSettings_exchangeRate',
      'id': 'generalSettings6',
      'pid': 'generalSettings3'
    },
    {
      'mainTitle': '月平均汇率管理', // 汇率管理
      'link': 'generalSettings.html#/monthlyAverageRate',
      'menuKey': 'generalSettings_monthlyAverageRate',
      'id': 'generalSettings7',
      'pid': 'generalSettings3'
    }
  ],
  logistics: [
    {
      'mainTitle': '仓储管理', // 仓储管理
      'link': 'logistics.html#/',
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'type': 'Group',
      'id': 'logistics1'
    }, {
      'mainTitle': '仓储管理', // 仓储管理
      'link': 'logistics.html#/',
      'display': true,
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'type': 'Group-title',
      'id': 'logistics2',
      'pid': 'logistics1'
    }, {
      'mainTitle': '仓库设置', // 仓库设置
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/wareSetting',
      'menuKey': 'logistics_wareSetting',
      'id': 'logistics15',
      'pid': 'logistics2'
    },
    {
      'mainTitle': '仓库费用设置',
      'menuKey': 'logistics_storageSettings',
      'link': './logistics.html#/storageSettings',
      'id': 57,
      'pid': 17
    },
    {
      'mainTitle': '库区设置', // 库区设置
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/wareArea',
      'menuKey': 'logistics_wareArea',
      'id': 'logistics16',
      'pid': 'logistics2'
    }, {
      'mainTitle': '库位设置', // 库位设置
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/wareLocate',
      'menuKey': 'logistics_wareLocate',
      'id': 'logistics3',
      'pid': 'logistics2'
    }, {
      'mainTitle': '物流设置', // 物流设置
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/logisticsSettings',
      'menuKey': 'logistics_logisticsSettings',
      'id': 'logistics4',
      'pid': 'logistics2'
    }, {
      'mainTitle': '常用申报', // 常用申报
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/baseDelcaration',
      'menuKey': 'logistics_baseDelcaration',
      'id': 'logistics5',
      'pid': 'logistics2'
    }, {
      'mainTitle': '见货出单设置', // 见货出单设置
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/sortOrderSetting',
      'menuKey': 'logistics_sortOrderSetting',
      'id': 'logistics6',
      'pid': 'logistics2'
    }, {
      'mainTitle': '包材管理', // 包材管理
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/wrapperManage',
      'menuKey': 'logistics_wrapperManage',
      'id': 'logistics7',
      'pid': 'logistics2'
    }, {
      'mainTitle': '自动分配', // 自动分配
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/allotRule',
      'menuKey': 'logistics_allotRule',
      'id': 'logistics8',
      'pid': 'logistics2'
    }, {
      'mainTitle': '下发物流商规则', // 下发物流商规则
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/issueLogisticsRule',
      'menuKey': 'logistics_issueLogisticsRule',
      'id': 'logistics11',
      'pid': 'logistics2'
    }, {
      'mainTitle': '分区方案管理', // 分区方案管理
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/zoningScheme',
      'menuKey': 'logistics_zoningScheme',
      'id': 'logistics12',
      'pid': 'logistics2'
    }, {
      'mainTitle': '申报规则', // 申报规则
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'logistics.html#/declarationRules',
      'menuKey': 'logistics_declarationRules',
      'id': 'logistics13',
      'pid': 'logistics2'
    }, {
      'mainTitle': '带电资质', // 带电资质
      'icon': 'icon-jinlingyingcaiwangtubiao21',
      'link': 'logistics.html#/carrierGoodsBattery',
      'menuKey': 'logistics_carrierGoodsBattery',
      'id': 'logistics14',
      'pid': 'logistics2'
    }, {
      'mainTitle': '货箱体积设置', // 货箱体积设置
      'icon': 'icon-jinlingyingcaiwangtubiao22',
      'link': 'logistics.html#/boxVolumnAuthority',
      'menuKey': 'logistics_boxVolumnAuthority',
      'id': 'logistics15',
      'pid': 'logistics2'
    }
  ],
  orderSettings: [
    {
      'mainTitle': '订单管理', // 订单管理
      'link': 'orderSettings.html#/',
      'type': 'Group',
      'display': true,
      'id': 'orderSettings1'
    }, {
      'mainTitle': '订单管理', // 订单管理
      'link': 'orderSettings.html#/',
      'type': 'Group-title',
      'icon': 'icon-icon-dingdan',
      'display': true,
      'id': 'orderSettings2',
      'pid': 'orderSettings1'
    }, {
      'mainTitle': '自动分仓规则', // 自动分仓规则
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'orderSettings.html#/autoDistributionWarehouseRule',
      'menuKey': 'orderSettings_autoDistributionWarehouseRule',
      'id': 'orderSettings3',
      'pid': 'orderSettings2'
    }, {
      'mainTitle': '智能物流规则', // 智能物流规则
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'link': 'orderSettings.html#/smartLogisticsRule',
      'menuKey': 'orderSettings_smartLogisticsRule',
      'id': 'orderSettings99',
      'pid': 'orderSettings2'
    }, {
      'mainTitle': '订单审核规则', // 订单审核规则
      'icon': '',
      'link': 'orderSettings.html#/orderReviewRule',
      'menuKey': 'orderSettings_orderReviewRule',
      'id': 'orderSettings4',
      'pid': 'orderSettings2'
    }, {
      'mainTitle': '订单标签管理', // 订单标签管理
      'icon': '',
      'link': 'orderSettings.html#/orderTagSetting',
      'menuKey': 'orderSettings_orderTagSetting',
      'id': 'orderSettings5',
      'pid': 'orderSettings2'
    }, {
      'mainTitle': 'SKU匹配设置', // sku匹配设置
      'icon': '',
      'link': 'orderSettings.html#/skuMatchSetting',
      'menuKey': 'orderSettings_skuMatchSetting',
      'id': 'orderSettings6',
      'pid': 'orderSettings2'
    }
  ],
  customSettings: [
    {
      'mainTitle': '客服管理', // 客服管理
      'link': 'customSettings.html#/',
      'type': 'Group',
      'id': 'customSettings1'
    }, {
      'mainTitle': '客服管理', // 客服管理
      'link': 'customSettings.html#/',
      'type': 'Group-title',
      'icon': 'icon-Shape',
      'pid': 'customSettings1',
      'id': 'customSettings2'
    }, {
      'mainTitle': '站内信文件夹', // 站内信文件夹
      'icon': '',
      'link': 'customSettings.html#/mailFolder',
      'menuKey': 'customSettings_mailFolder',
      'id': 'customSettings99',
      'pid': 'customSettings2'
    }, {
      'mainTitle': '站内信优先级', // 站内信优先级
      'icon': '',
      'link': 'customSettings.html#/mailPriority',
      'menuKey': 'customSettings_mailPriority',
      'id': 'customSettings3',
      'pid': 'customSettings2'
    }, {
      'mainTitle': '站内信回复模板',
      'icon': '',
      'link': 'customSettings.html#/mailRecoveryTemp',
      'menuKey': 'customSettings_mailRecoveryTemp',
      'id': 'customSettings4',
      'pid': 'customSettings2'
    }, /* { // 站内信自动发送规则
     'mainTitle': '站内信自动发送规则',
     'icon': '',
     'link': 'customSettings.html#/automaticSendingMessageRulesOfStation',
     'menuKey': 'customSettings_automaticSendingMessageRulesOfStation',
     'id': 'customSettings5',
     'pid': 'customSettings1'
     }, */
    { // 站内信自动规则
      'mainTitle': '站内信自动规则',
      'icon': '',
      'link': 'customSettings.html#/mailAutoRule',
      'menuKey': 'customSettings_mailAutoRule',
      'id': 'customSettings6',
      'pid': 'customSettings2'
    }, { // 评价模板
      'mainTitle': '评价模板',
      'icon': '',
      'link': 'customSettings.html#/evaluateSettings',
      'menuKey': 'customSettings_evaluateSettings',
      'id': 'customSettings7',
      'pid': 'customSettings2'
    },
    {
      'mainTitle': '站内信自动发送邮件',
      'icon': '',
      'link': 'customSettings.html#/autoSendEmail',
      'menuKey': 'customSettings_autoSendEmail',
      'id': 'customSettings10',
      'pid': 'customSettings2'
    }
    /*,
     { // 自动退款
     'mainTitle': '自动退款',
     'icon': '',
     'link': 'customSettings.html#/automaticRefund',
     'menuKey': 'customSettings_automaticRefund',
     'id': 'customSettings8',
     'pid': 'customSettings1'
     },
     { // 自动评价
     'mainTitle': '自动评价',
     'icon': '',
     'link': 'customSettings.html#/automaticEvaluation',
     'menuKey': 'customSettings_automaticEvaluation',
     'id': 'customSettings9',
     'pid': 'customSettings1'
     } */
  ],
  pdsSettings: [
    // {
    //   'mainTitle': '新品开发管理',
    //   'type': 'Group-title', // 没有子菜单
    //   'icon': 'icon-jinlingyingcaiwangtubiao20',
    //   'display': true,
    //   'platformType': 'pdsSettings',
    //   'id': 'pdsSettings2',
    //   'pid': 'pdsSettings1'
    // }, {
    //   'mainTitle': '商品编码自动编码规则',
    //   'display': true,
    //   'platformType': 'pdsSettings',
    //   'id': 'pdsSettings3',
    //   'pid': 'pdsSettings2',
    //   'link': './pdsSettings.html#/codingRules',
    //   'menuKey': 'pdsSettings_codingRules'
    // }, {
    //   'mainTitle': 'UPC生成规则',
    //   'display': true,
    //   'platformType': 'pdsSettings',
    //   'id': 'pdsSettings4',
    //   'pid': 'pdsSettings2',
    //   'link': './pdsSettings.html#/upcGenerationRules',
    //   'menuKey': 'pdsSettings_upcGenerationRules'
    // },
    // {
    //   'mainTitle': 'SKC颜色管理',
    //   'display': true,
    //   'platformType': 'pdsSettings',
    //   'id': 'pdsSettings5',
    //   'pid': 'pdsSettings2',
    //   'link': './pdsSettings.html#/skcColormanage',
    //   'menuKey': 'pdsSettings_skcColormanage'
    // },
    // {
    //   'mainTitle': '分类类型管理',
    //   'display': true,
    //   'platformType': 'pdsSettings',
    //   'id': 'pdsSettings9',
    //   'pid': 'pdsSettings2',
    //   'link': './pdsSettings.html#/typeManage',
    //   'menuKey': 'pdsSettings_typeManage'
    // },
    // {
    //   'mainTitle': '尺码管理',
    //   'display': true,
    //   'platformType': 'pdsSettings',
    //   'id': 'pdsSettings6',
    //   'pid': 'pdsSettings2',
    //   'link': './pdsSettings.html#/sizeManage',
    //   'menuKey': 'pdsSettings_sizeManage'
    // },
    // {
    //   'mainTitle': '尺码和尺码类型管理',
    //   'display': true,
    //   'platformType': 'pdsSettings',
    //   'id': 'pdsSettings7',
    //   'pid': 'pdsSettings2',
    //   'link': './pdsSettings.html#/sizeManage',
    //   'menuKey': 'pdsSettings_sizeManage'
    // },
    // {
    //   'mainTitle': '审核人员设置',
    //   'display': true,
    //   'platformType': 'pdsSettings',
    //   'id': 'pdsSettings8',
    //   'pid': 'pdsSettings2',
    //   'link': './pdsSettings.html#/approverSettings',
    //   'menuKey': 'pdsSettings_approverSettings'
    // }
  ],
  financeSettings: [
    {
      'mainTitle': '财务计费设置',
      'type': 'Group-title', // 没有子菜单
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'display': true,
      'platformType': 'financeSettings',
      'id': 'financeSettings2',
      'pid': 'financeSettings1'
    },
    {
      'mainTitle': '操作费用模版',
      'display': true,
      'platformType': 'financeSettings',
      'id': 'financeSettings3',
      'pid': 'financeSettings',
      'link': './financeSettings.html#/operateTemplate',
      'menuKey': 'financeSettings_operateTemplate'
    },
    {
      'mainTitle': '仓储费用模版',
      'display': true,
      'platformType': 'financeSettings',
      'id': 'financeSettings4',
      'pid': 'financeSettings',
      'link': './financeSettings.html#/storageTemplate',
      'menuKey': 'financeSettings_storageTemplate'
    },
    {
      'mainTitle': '出仓费用模版',
      'display': true,
      'platformType': 'financeSettings',
      'id': 'financeSettings5',
      'pid': 'financeSettings',
      'link': './financeSettings.html#/deliverTemplate',
      'menuKey': 'financeSettings_deliverTemplate'
    },
    {
      'mainTitle': '运费模版',
      'display': true,
      'platformType': 'financeSettings',
      'id': 'financeSettings6',
      'pid': 'financeSettings',
      'link': './financeSettings.html#/freightTemplate',
      'menuKey': 'financeSettings_freightTemplate'
    },
    {
      'mainTitle': '偏远地区费用模版',
      'display': true,
      'platformType': 'financeSettings',
      'id': 'financeSettings7',
      'pid': 'financeSettings',
      'link': './financeSettings.html#/remoteAreaCostTemplate',
      'menuKey': 'financeSettings_remoteAreaCostTemplate'
    },
  ],
  productSettings: [],
  spsSettings: []
};
