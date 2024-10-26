export default {
  menu: [
    {
      // 'mainTitle': '当前位置',
      'type': 'Group',
      'menuKey': '',
      'id': 0
    }, {
      'mainTitle': '供应商管理',
      'type': 'Group-title',
      'menuKey': '',
      'icon': 'icon-yuangong',
      'id': 1,
      'pid': 0
    }, {
      'mainTitle': '供应商信息管理', // 供应商管理
      'link': './supplierPurchase.html#/supplierManagement',
      'menuKey': 'supplierPurchase_supplierManagement',
      'id': 11,
      'pid': 1
    }, {
      'mainTitle': '供应商商品管理', // 产品报价
      'link': './supplierPurchase.html#/productPrice',
      'menuKey': 'supplierPurchase_productPrice',
      'id': 12,
      'pid': 1
    }, {
      'mainTitle': '供应商产品', // 供应商产品
      'link': './supplierPurchase.html#/supplierProduct',
      'menuKey': 'supplierPurchase_supplierProduct',
      'id': 13,
      'pid': 1
    }, /* {
     'mainTitle': '供应商审核规则',
     'link': './supplierManagement.html#/checkRule',
     'id': 14,
     'pid': 1
     }, */
    {
      'mainTitle': '供应商询价单管理', // 供应商询价单管理
      'link': './supplierPurchase.html#/inquiryManagement',
      'menuKey': 'supplierPurchase_inquiryManagement',
      'id': 42,
      'pid': 1
    },
    {
      'mainTitle': '供应商品类管理', // 主营品类管理
      'link': './supplierPurchase.html#/mainCategory',
      'menuKey': 'supplierPurchase_mainCategory',
      'id': 15,
      'pid': 1
    },
    {
      'mainTitle': '供应商系统管理', // 商家系统管理
      'link': './supplierPurchase.html#/merchantSystem',
      'menuKey': 'supplierPurchase_merchantSystem',
      'id': 16,
      'pid': 1
    },
    {
      'mainTitle': '采购管理', // 采购管理
      'type': 'Group-title',
      'icon': 'icon-dingdan1',
      'menuKey': '',
      'id': 2,
      'pid': 0
    }, /* {
     'mainTitle': '自营仓备货建议',
     'link': './supplierPurchase.html#/localWarehouse',
     'menuKey': 'supplierPurchase_localWarehouse',
     'id': 21,
     'pid': 2,
     'purchaseMode': '1'
     }, */
    /* {
     'mainTitle': '第三方仓备货建议',
     'link': './supplierPurchase.html#/overseasWarehouse',
     'menuKey': 'supplierPurchase_overseasWarehouse',
     'id': 22,
     'pid': 2,
     'purchaseMode': '1' //1：常规 2：快捷
     }, */
    /* {
     'mainTitle': 'FBA备货建议',
     'link': './supplierPurchase.html#/fbaStockingAdvice',
     'menuKey': 'supplierPurchase_fbaStockingAdvice',
     'id': 23,
     'pid': 2,
     'purchaseMode': '1'
     },
     {
     'mainTitle': '快速生成采购单',
     'link': './supplierPurchase.html#/createOrder',
     'menuKey': 'supplierPurchase_createOrder',
     'id': 24,
     'pid': 2,
     'purchaseMode': '2'
     }, */
    {
      'mainTitle': '备货需求申请', // 备货计划
      'link': './supplierPurchase.html#/stockingDemand',
      'menuKey': 'supplierPurchase_stockingDemand',
      'id': 24,
      'pid': 2,
      'purchaseMode': '1'
    }, {
      'mainTitle': '备货计划管理', // 备货计划
      'link': './supplierPurchase.html#/stockingPlan',
      'menuKey': 'supplierPurchase_stockingPlan',
      'id': 25,
      'pid': 2,
      'purchaseMode': '1'
    }, {
      'mainTitle': '采购需求管理', // 采购需求管理
      'link': './supplierPurchase.html#/purchaseRequirement',
      'menuKey': 'supplierPurchase_purchaseRequirement',
      'id': 26,
      'pid': 2,
      'purchaseMode': '1'
    }, {
      'mainTitle': '采购订单管理', // 采购单管理
      'link': './supplierPurchase.html#/purchaseOrder',
      'menuKey': 'supplierPurchase_purchaseOrder',
      'id': 27,
      'pid': 2
    }, {
      'mainTitle': '订单产品详情', // 供应商订单管理
      'link': './supplierPurchase.html#/supplyOrder',
      'menuKey': 'supplierPurchase_supplyOrder',
      'id': 27,
      'pid': 2
    }, {
      'mainTitle': '发货单号列表', // 供应商发货单列表
      'link': './supplierPurchase.html#/supplyOrdersend',
      'menuKey': 'supplierPurchase_supplyOrdersend',
      'id': 27,
      'pid': 2
    }, {
      'mainTitle': '付款申请管理', // 付款申请管理
      'link': './supplierPurchase.html#/paymentRequest',
      'menuKey': 'supplierPurchase_paymentRequest',
      'id': 36,
      'pid': 2
    },
    {
      'mainTitle': '退款申请管理', // 退款申请管理
      'link': './supplierPurchase.html#/refundRequest',
      'menuKey': 'supplierPurchase_refundRequest',
      'id': 36,
      'pid': 2
    },

    {
      'mainTitle': '采购设置', // 采购设置
      'type': 'Group-title',
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'menuKey': '',
      'id': 3,
      'pid': 0
    }, /* {
     'mainTitle': '备货策略设置',
     'link': './supplierPurchase.html#/strategySetting',
     'menuKey': 'supplierPurchase_strategySetting',
     'id': 31,
     'pid': 3
     }, */
    {
      'mainTitle': '采购基础设置', // 采购基础设置
      'link': './supplierPurchase.html#/basicSetting',
      'menuKey': 'supplierPurchase_basicSetting',
      'id': 32,
      'pid': 3
    }, {
      'mainTitle': '审核规则设置', // 审核规则设置
      'link': './supplierPurchase.html#/auditRules',
      'menuKey': 'supplierPurchase_auditRules',
      'id': 33,
      'pid': 3
    }, {
      'mainTitle': '采购标签设置', // 采购单标签管理
      'link': './supplierPurchase.html#/tag',
      'menuKey': 'supplierPurchase_tag',
      'id': 38,
      'pid': 3
    },

    {
      'mainTitle': '收货地址设置', // 仓库收货地址
      'link': './supplierPurchase.html#/warereceAddress',
      'menuKey': 'supplierPurchase_warereceAddress',
      'id': 38,
      'pid': 3
    }, {
      'mainTitle': '导入/导出任务', // 导入/导出任务
      'type': 'Group-title',
      'icon': 'ios-share',
      'menuKey': '',
      'id': 4,
      'pid': 0
    }, {
      'mainTitle': '导入查看', // 导入查看
      'link': './supplierPurchase.html#/importTask',
      'menuKey': 'supplierPurchase_importTask',
      'id': 36,
      'pid': 4
    }, {
      'mainTitle': '导出查看', // 导出查看
      'link': './supplierPurchase.html#/exportTask',
      'menuKey': 'supplierPurchase_exportTask',
      'id': 37,
      'pid': 4
    },
    {
      'mainTitle': '质检单管理', // 导出查看
      'link': './supplierPurchase.html#/qualityTest',
      'menuKey': 'supplierPurchase_qualityTest',
      'id': 38,
      'pid': 4
    },
    {
      'mainTitle': '问题件处理', // 导出查看
      'link': './supplierPurchase.html#/qualityTestHandle',
      'menuKey': 'supplierPurchase_qualityTestHandle',
      'id': 39,
      'pid': 4
    },
    {
      'mainTitle': '账单申请管理', // 账单申请管理
      'link': './supplierPurchase.html#/billPrepayment',
      'menuKey': 'supplierPurchase_billPrepayment',
      'id': 42,
      'pid': 4
    },
    {
      'mainTitle': '1688账号设置',
      'link': './supplierPurchase.html#/accountSetting',
      'menuKey': 'supplierPurchase_accountSetting',
      'id': 40,
      'pid': 4
    },
    {
      'mainTitle': '全托管退货数据管理',
      'link': './supplierPurchase.html#/fullCustodyReturnDataManagement',
      'menuKey': 'supplierPurchase_fullCustodyReturnDataManagement',
      'id': 41,
      'pid': 4
    },
    {
      'mainTitle': '入库出库申请',
      'link': './supplierPurchase.html#/receivedProOutboundApply',
      'menuKey': 'supplierPurchase_receivedProOutboundApply',
      'id': 43,
      'pid': 4
    },
    {
      'mainTitle': '寄出运费核对',
      'link': './supplierPurchase.html#/checkAllShippingCosts',
      'menuKey': 'supplierPurchase_checkAllShippingCosts',
      'id': 44,
      'pid': 4
    },
    {
      'mainTitle': '到货异常处理',
      'link': './supplierPurchase.html#/productAbnormal',
      'menuKey': 'supplierPurchase_productAbnormal',
      'id': 45,
      'pid': 4
    },
    // {
    //   'mainTitle': '1688商品配对管理',
    //   'link': './supplierPurchase.html#/commodityMatch',
    //   'menuKey': 'supplierPurchase_commodityMatch',
    //   'id': 41,
    //   'pid': 4
    // },

    /* {
     'mainTitle': '安全交期',
     'link': './supplierPurchase.html#/safeDelivery',
     'menuKey': 'supplierPurchase_safeDelivery',
     'id': 34,
     'pid': 3
     } */
    /* {
     'mainTitle': '1688账号管理',
     'link': './purchaseSetting.html#/accountManagement',
     'id': 35,
     'pid': 3
     } */
  ]
};
