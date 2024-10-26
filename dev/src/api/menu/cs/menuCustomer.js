export default {
  menu: [
    {
      'mainTitle': '客服管理系统',
      'menuKey': 'Group',
      'link': '/customer.html#/',
      'type': 'Group', // 没有子菜单
      'alias': 'customer',
      'id': 'customer1'
    }, {
      'mainTitle': '客服管理',
      'type': 'Group-title', // 没有子菜单
      'icon': 'icon-kefu1',
      'id': 'customer-title',
      'pid': 'customer1'
    }, {
      'mainTitle': 'Ebay站内信',
      'id': 'customer2',
      'pid': 'customer-title',
      'link': './customer.html#/ebayMail',
      'menuKey': 'customer_ebayMail'
    }, {
      'mainTitle': 'Ebay纠纷管理', // Ebay纠纷管理
      'id': 'customer3',
      'icon': 'icon-mingxiweihuyichang',
      'type': 'Group-title', // 分组
      'pid': 'customer1'
    }, {
      'mainTitle': '取消交易', // 取消交易
      'menuKey': 'customer_ebayCancelOrder',
      'link': './customer.html#/ebayCancelOrder',
      'id': 'customer4',
      'pid': 'customer3'
    }, {
      'mainTitle': '未收到货品', // 未收到货品
      'menuKey': 'customer_notReceivedTheGoodsInEbay',
      'link': './customer.html#/notReceivedTheGoodsInEbay',
      'id': 'customer5',
      'pid': 'customer3'
    }, {
      'mainTitle': '退款退货', // 退款退货
      'menuKey': 'customer_ebayRefundReturn',
      'link': './customer.html#/ebayRefundReturn',
      'id': 'customer6',
      'pid': 'customer3'
    }, {
      'mainTitle': '付款纠纷', // 退款退货
      'menuKey': 'customer_paymentDispute',
      'link': './customer.html#/paymentDispute',
      'id': 'customer33',
      'pid': 'customer3'
    },
    {
      'mainTitle': 'Walmart退款管理', // Walmart退款管理
      'menuKey': 'customer_walmartRefundManage',
      'link': './customer.html#/walmartRefundManage',
      'id': 'customer35',
      'pid': 'customer3'
    },
    {
      'mainTitle': '评价', // 评价
      'id': 'customer7',
      'icon': 'icon-pingjia',
      'type': 'Group-title', // 分组
      'pid': 'customer1'
    }, {
      'mainTitle': '好评', // 评价
      'id': 'customer8',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_goodReputation',
      'link': './customer.html#/goodReputation',
      'pid': 'customer7'
    }, {
      'mainTitle': '中评', // 中评
      'id': 'customer9',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_mediumReputaion',
      'link': './customer.html#/mediumReputaion',
      'pid': 'customer7'
    }, {
      'mainTitle': '差评', // 差评
      'id': 'customer10',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_badReputation',
      'link': './customer.html#/badReputation',
      'pid': 'customer7'
    }, {
      'mainTitle': '需要留评价', // 需要留评价
      'id': 'customer11',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_needEvauate',
      'link': './customer.html#/needEvauate',
      'pid': 'customer7'
    }, {
      'mainTitle': '等待买家评价', // 等待买家评价
      'id': 'customer12',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_waitBuyerEvauate',
      'link': './customer.html#/waitBuyerEvauate',
      'pid': 'customer7'
    }, {
      'mainTitle': '售后处理', // 售后处理
      'id': 'customer13',
      'icon': 'icon-postsale',
      'type': 'Group-title', // 分组
      'pid': 'customer1'
    }, {
      'mainTitle': '售后处理', // 售后处理
      'id': 'customer14',
      'icon': 'icon-postsale',
      'menuKey': 'customer_postSaleTreatment',
      'link': './customer.html#/postSaleTreatment',
      'pid': 'customer13'
    }, {
      'mainTitle': '售后原因管理', // 售后原因管理
      'id': 'customer25',
      'icon': 'icon-postsale',
      'menuKey': 'customer_postSaleReasonsTreatment',
      'link': './customer.html#/postSaleReasonsTreatment',
      'pid': 'customer13'
    }, /* {
     'mainTitle': '自动客服', // 自动客服
     'id': 'customer15',
     'type': 'Group-title', // 分组
     'pid': 'customer1'
     },
     {
     'mainTitle': '自动客服消息', // 评价
     'id': 'customer16',
     'menuKey': 'customer_autoCustomer',
     'link': './customer.html#/autoCustomer',
     'pid': 'customer15'
     }, */
    {
      'mainTitle': '黑名单', // 黑名单
      'id': 'customer17',
      'type': 'Group-title', // 分组
      'pid': 'customer1'
    }, {
      'mainTitle': '黑名单', // 黑名单
      'id': 'customer18',
      'menuKey': 'customer_blacklistManage',
      'link': './customer.html#/blacklistManage',
      'pid': 'customer17'
    }, {
      'mainTitle': '客服统计', // 客服统计
      'id': 'customer20',
      'menuKey': 'customer_mailStatistics',
      'link': './customer.html#/mailStatistics',
      'pid': 'customer19'
    }, {
      'mainTitle': '导入/导出任务',
      'id': 'productCenter7',
      'pid': 'customer1',
      'type': 'Group-title', // 没有子菜单
      'link': './customer.html#/',
      'alias': 'productGoods'
    }, {
      'mainTitle': '导入查看',
      'id': 'productCenter8',
      'icon': 'icon-erji-dashujupingtai',
      'link': './customer.html#/importTask',
      'menuKey': 'customer_importTask'
    }, {
      'mainTitle': '导出查看',
      'id': 'productCenter9',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter7',
      'link': './customer.html#/exportTask',
      'menuKey': 'customer_exportTask',
      'display': ''
    }
    /* {
     'mainTitle': '议价', // 议价
     'id': 'customer27',
     'icon': 'icon-shenhe',
     'type': 'Group-title', // 分组
     'pid': 'customer1'
     },
     {
     'mainTitle': 'Best Offer', //
     'id': 'customer28',
     'menuKey': 'customer_bestOffer',
     'link': './customer.html#/bestOffer',
     'pid': 'customer27'
     } */
    // {
    //   'mainTitle': '客户', // 客户
    //   'id': 'customer30',
    //   'icon': 'icon-shenhe',
    //   'type': 'Group-title', // 分组
    //   'pid': 'customer1'
    // },
    // {
    //   'mainTitle': '所有客户', // Best Offer
    //   'id': 'customer31',
    //   'menuKey': 'customer_allCustomer',
    //   'link': './customer.html#/allCustomer',
    //   'pid': 'customer30'
    // }, {
    //   'mainTitle': '回头客', // Best Offer
    //   'id': 'customer32',
    //   'menuKey': 'customer_returnedCustomer',
    //   'link': './customer.html#/returnedCustomer',
    //   'pid': 'customer30'
    // }, {
    //   'mainTitle': '回收站', // Best Offer
    //   'id': 'customer33',
    //   'menuKey': 'customer_recycleBin',
    //   'link': './customer.html#/recycleBin',
    //   'pid': 'customer30'
    // }
  ],
  customer: [
    {
      'mainTitle': '客服管理系统',
      'menuKey': 'Group',
      'link': '/customer.html#/',
      'type': 'Group', // 没有子菜单
      'alias': 'customer',
      'id': 'customer1'
    }, {
      'mainTitle': '客服管理',
      'type': 'Group-title', // 没有子菜单
      'icon': 'icon-kefu1',
      'id': 'customer-title',
      'pid': 'customer1'
    }, {
      'mainTitle': 'Ebay站内信',
      'id': 'customer2',
      'pid': 'customer-title',
      'link': './customer.html#/ebayMail',
      'menuKey': 'customer_ebayMail'
    }, {
      'mainTitle': 'Ebay纠纷管理', // Ebay纠纷管理
      'id': 'customer3',
      'icon': 'icon-mingxiweihuyichang',
      'type': 'Group-title', // 分组
      'pid': 'customer1'
    }, {
      'mainTitle': '取消交易', // 取消交易
      'menuKey': 'customer_ebayCancelOrder',
      'link': './customer.html#/ebayCancelOrder',
      'id': 'customer4',
      'pid': 'customer3'
    }, {
      'mainTitle': '未收到货品', // 未收到货品
      'menuKey': 'customer_notReceivedTheGoodsInEbay',
      'link': './customer.html#/notReceivedTheGoodsInEbay',
      'id': 'customer5',
      'pid': 'customer3'
    }, {
      'mainTitle': '退款退货', // 退款退货
      'menuKey': 'customer_ebayRefundReturn',
      'link': './customer.html#/ebayRefundReturn',
      'id': 'customer6',
      'pid': 'customer3'
    }, {
      'mainTitle': '付款纠纷', // 退款退货
      'menuKey': 'customer_paymentDispute',
      'link': './customer.html#/paymentDispute',
      'id': 'customer23',
      'pid': 'customer3'
    },
    {
      'mainTitle': 'Walmart退款管理', // Walmart退款管理
      'menuKey': 'customer_walmartRefundManage',
      'link': './customer.html#/walmartRefundManage',
      'id': 'customer35',
      'pid': 'customer3'
    },
    {
      'mainTitle': '评价', // 评价
      'id': 'customer7',
      'icon': 'icon-pingjia',
      'type': 'Group-title', // 分组
      'pid': 'customer1'
    }, {
      'mainTitle': '好评', // 评价
      'id': 'customer8',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_goodReputation',
      'link': './customer.html#/goodReputation',
      'pid': 'customer7'
    }, {
      'mainTitle': '中评', // 中评
      'id': 'customer9',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_mediumReputaion',
      'link': './customer.html#/mediumReputaion',
      'pid': 'customer7'
    }, {
      'mainTitle': '差评', // 差评
      'id': 'customer10',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_badReputation',
      'link': './customer.html#/badReputation',
      'pid': 'customer7'
    }, {
      'mainTitle': '需要留评价', // 需要留评价
      'id': 'customer11',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_needEvauate',
      'link': './customer.html#/needEvauate',
      'pid': 'customer7'
    }, {
      'mainTitle': '等待买家评价', // 等待买家评价
      'id': 'customer12',
      'icon': 'icon-pingjia',
      'menuKey': 'customer_waitBuyerEvauate',
      'link': './customer.html#/waitBuyerEvauate',
      'pid': 'customer7'
    }, {
      'mainTitle': '售后处理', // 售后处理
      'id': 'customer13',
      'icon': 'icon-postsale',
      'type': 'Group-title', // 分组
      'pid': 'customer1'
    }, {
      'mainTitle': '售后处理', // 售后处理
      'id': 'customer14',
      'icon': 'icon-postsale',
      'menuKey': 'customer_postSaleTreatment',
      'link': './customer.html#/postSaleTreatment',
      'pid': 'customer13'
    }, {
      'mainTitle': '售后原因管理', // 售后原因管理
      'id': 'customer25',
      'icon': 'icon-postsale',
      'menuKey': 'customer_postSaleReasonsTreatment',
      'link': './customer.html#/postSaleReasonsTreatment',
      'pid': 'customer13'
    }, /* {
     'mainTitle': '自动客服', // 评价
     'id': 'customer15',
     'type': 'Group-title', // 分组
     'pid': 'customer1'
     },
     {
     'mainTitle': '自动客服消息', // 评价
     'id': 'customer16',
     'menuKey': 'customer_autoCustomer',
     'link': './customer.html#/autoCustomer',
     'pid': 'customer15'
     }, */
    {
      'mainTitle': '黑名单', // 黑名单
      'id': 'customer17',
      'type': 'Group-title', // 分组
      'icon': 'icon-heimingdan',
      'pid': 'customer1'
    }, {
      'mainTitle': '黑名单', // 黑名单
      'id': 'customer18',
      'menuKey': 'customer_blacklistManage',
      'link': './customer.html#/blacklistManage',
      'pid': 'customer17'
    }, {
      'mainTitle': '客服统计', // 客服统计
      'id': 'customer19',
      'type': 'Group-title',
      'icon': 'icon-kefutongji',
      'pid': 'customer1'
    }, {
      'mainTitle': '客服统计',
      'id': 'customer20',
      'menuKey': 'customer_mailStatistics',
      'link': './customer.html#/mailStatistics',
      'pid': 'customer19'
    }, {
      'mainTitle': '导入/导出任务',
      'id': 'productCenter7',
      'pid': 'customer1',
      'icon': 'icon-daorudaochu',
      'type': 'Group-title', // 没有子菜单
      'link': './customer.html#/',
      'alias': 'productGoods'
    }, {
      'mainTitle': '导入查看',
      'id': 'productCenter8',
      'icon': 'icon-erji-dashujupingtai',
      'link': './customer.html#/importTask',
      'menuKey': 'customer_importTask'
    }, {
      'mainTitle': '导出查看',
      'id': 'productCenter9',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter7',
      'link': './customer.html#/exportTask',
      'menuKey': 'customer_exportTask',
      'display': ''
    }
    /* {
     'mainTitle': '议价', // 议价
     'id': 'customer27',
     'icon': 'icon-shenhe',
     'type': 'Group-title', // 分组
     'pid': 'customer1'
     },
     {
     'mainTitle': 'Best Offer', //
     'id': 'customer28',
     'menuKey': 'customer_bestOffer',
     'link': './customer.html#/bestOffer',
     'pid': 'customer27'
     } */
    // {
    //   'mainTitle': '客户', // 客户
    //   'id': 'customer30',
    //   'icon': 'icon-shenhe',
    //   'type': 'Group-title', // 分组
    //   'pid': 'customer1'
    // },
    // {
    //   'mainTitle': '所有客户', // Best Offer
    //   'id': 'customer31',
    //   'menuKey': 'customer_allCustomer',
    //   'link': './customer.html#/allCustomer',
    //   'pid': 'customer30'
    // }, {
    //   'mainTitle': '回头客', // Best Offer
    //   'id': 'customer32',
    //   'menuKey': 'customer_returnedCustomer',
    //   'link': './customer.html#/returnedCustomer',
    //   'pid': 'customer30'
    // }, {
    //   'mainTitle': '回收站', // Best Offer
    //   'id': 'customer33',
    //   'menuKey': 'customer_recycleBin',
    //   'link': './customer.html#/recycleBin',
    //   'pid': 'customer30'
    // }
  ]
};
