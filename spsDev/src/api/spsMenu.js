export default {
  menu: [
    {
      'name': '供应商管理',
      'menuKey': '',
      'icon': 'icon-yuangong',
      'children': [
        {
          'name': '供应商信息管理',
          'path': '/supplierManagement',
          'menuKey': 'supplierPurchase_supplierManagement'
        },
        {
          'name': '供应商商品管理',
          'path': '/productPrice',
          'menuKey': 'supplierPurchase_productPrice'
        },
        {
          'name': '供应商询价管理',
          'path': '/inquiryManagement',
          'menuKey': 'supplierPurchase_inquiryManagement'
        },
        // {
        //   'name': '供应商产品',
        //   'path': '/supplierProduct',
        //   'menuKey': 'supplierPurchase_supplierProduct'
        // },
        {
          'name': '供应商品类管理',
          'path': '/mainCategory',
          'menuKey': 'supplierPurchase_mainCategory'
        },
        {
          'name': '供应商系统管理',
          'path': '/merchantSystem',
          'menuKey': 'supplierPurchase_merchantSystem'
        }
      ]
    },
    {
      'name': '采购管理',
      'icon': 'icon-dingdan1',
      'menuKey': '',
      'children': [
        {
          'name': '备货需求申请',
          'path': '/stockingDemand',
          'menuKey': 'supplierPurchase_stockingDemand'
        },
        {
          'name': '备货计划管理',
          'path': '/stockingPlan',
          'menuKey': 'supplierPurchase_stockingPlan'
        }, {
          'name': '采购需求下单',
          'path': '/purchaseRequirement',
          'menuKey': 'supplierPurchase_purchaseRequirement'
        },
        {
          'name': '采购订单管理',
          'path': '/purchaseOrder',
          'menuKey': 'supplierPurchase_purchaseOrder'
        },
        {
          'name': '订单产品详情',
          'path': '/supplyOrder',
          'menuKey': 'supplierPurchase_supplyOrder'
        },
        {
          'name': '发货单号列表',
          'path': '/supplyOrdersend',
          'menuKey': 'supplierPurchase_supplyOrdersend'
        },
        {
          'name': '质检单管理',
          'path': '/qualityTest',
          'menuKey': 'supplierPurchase_qualityTest'
        },
        {
          'name': '问题件处理',
          'path': '/qualityTestHandle',
          'menuKey': 'supplierPurchase_qualityTestHandle'
        },
        {
          'name': '入库出库申请',
          'path': '/receivedProOutboundApply',
          'menuKey': 'supplierPurchase_receivedProOutboundApply'
        },
        {
          'name': '寄出运费核对',
          'path': '/checkAllShippingCosts',
          'menuKey': 'supplierPurchase_checkAllShippingCosts'
        },
        {
          'name': '到货异常处理',
          'path': '/productAbnormal',
          'menuKey': 'sps_productAbnormal',
        },
      ]
    },
    {
      'name': '财务管理',
      'icon': 'icon-caiwuguanli',
      'menuKey': '',
      'children': [
        {
          'name': '付款申请管理',
          'path': '/paymentRequest',
          'menuKey': 'supplierPurchase_paymentRequest'
        },
        {
          'name': '退款申请管理',
          'path': '/refundRequest',
          'menuKey': 'supplierPurchase_refundRequest'
        },
        {
          'name': '账单申请管理',
          'path': '/billPrepayment',
          'menuKey': 'supplierPurchase_billPrepayment'
        }
      ]
    },
    {
      'name': '采购设置',
      'icon': 'icon-jinlingyingcaiwangtubiao20',
      'menuKey': '',
      'children': [
        {
          'name': '采购基础设置',
          'path': '/basicSetting',
          'menuKey': 'supplierPurchase_basicSetting'
        },
        {
          'name': '审核规则设置',
          'path': '/auditRules',
          'menuKey': 'supplierPurchase_auditRules'
        },
        {
          'name': '采购标签设置',
          'path': '/tag',
          'menuKey': 'supplierPurchase_tag'
        },
        {
          'name': '收货地址设置',
          'path': '/warereceAddress',
          'menuKey': 'supplierPurchase_warereceAddress'
        },
        {
          'name': '1688账号设置',
          'path': '/accountSetting',
          'menuKey': 'supplierPurchase_accountSetting'
        }
      ]
    },
    {
      'name': '退货管理',
      'icon': '',
      'menuKey': '',
      'children': [
        {
          'name': '全托管退货管理',
          'path': '/fullCustodyReturnDataManagement',
          'menuKey': 'supplierPurchase_fullCustodyReturnDataManagement'
        }
      ]
    },
    {
      'name': '导入/导出任务',
      'icon': 'icon-daorudaochu',
      'menuKey': '',
      'children': [
        {
          'name': '导入查看',
          'path': '/importTask',
          'menuKey': 'sps_importTask'
        }, {
          'name': '导出查看',
          'path': '/exportTask',
          'menuKey': 'sps_exportTask'
        }
      ]
    },
    // {
    //   'name': '质检分类管理',
    //   'icon': 'icon-daorudaochu',
    //   'menuKey': '',
    //   'children': [
    //     {
    //       'name': '质检项目管理',
    //       'path': '/qualityTestPro',
    //       'menuKey': 'sps_importTask'
    //     }, {
    //       'name': '质检分类管理',
    //       'path': '/qualityTestClassify',
    //       'menuKey': 'sps_exportTask'
    //     }
    //   ]
    // },
    // {
    //   'name': '1688采购管理',
    //   'icon': 'icon-daorudaochu',
    //   'menuKey': '',
    //   'children': [
    //     {
    //       'name': '1688商品配对',
    //       'path': '/commodityMatch',
    //       'menuKey': 'supplierPurchase_aliProduct'
    //     }
    //   ]
    // }
  ]
};
