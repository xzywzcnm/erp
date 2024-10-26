/**
 * @Description: 侧边栏菜单和头部下拉菜单的公共配置
 * @author jing
 * @date 2021/1/13 10:17
 * @params:
 */

export default {
  // 订单处理系统
  menuOrder: {
    // 全平台
    allplatform: [
      {
        name: '订单检索',
        platformType: 'allplatform',
        menuKey: 'allplatform_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=allplatform',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'allplatform',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'allplatform',
            menuKey: 'allplatform_importTask',
            path: './commonOrder.html#/importTask?platform=allplatform'
          },
          {
            name: '导出查看',
            platformType: 'allplatform',
            menuKey: 'allplatform_exportTask',
            path: './commonOrder.html#/exportTask?platform=allplatform'
          }
        ]
      }
    ],
    // ebay平台
    ebay: [
      {
        name: '订单检索',
        platformType: 'ebay',
        menuKey: 'ebay_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=ebay',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'ebay',
        menuKey: 'ebay_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=ebay',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'ebay',
        menuKey: 'ebay_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=ebay',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'ebay',
        menuKey: 'ebay_markShipments',
        path: './commonOrder.html#/markShipments?platform=ebay',
        icon: 'icon-biaoji'
      },
      {
        name: '平台仓订单',
        platformType: 'ebay',
        menuKey: 'ebay_platformShippedOrder',
        path: './commonOrder.html#/platformShippedOrder?platform=ebay',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '订单审核', // 订单审核
        platformType: 'ebay',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'ebay',
            menuKey: 'ebay_messageToBeProcessed', // menukey匹配菜单订单数
            path: './commonOrder.html#/messageToBeProcessed?platform=ebay',
            dataItemNum: 0
          },
          {
            name: '未匹配商品', // 未匹配商品
            platformType: 'ebay',
            menuKey: 'ebay_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=ebay',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'ebay',
            menuKey: 'ebay_combineOrder',
            path: './ebay.html#/combineOrder',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '未付款',
        platformType: 'ebay',
        menuKey: 'ebay_nonPayment',
        path: './ebay.html#/nonPayment',
        icon: 'icon-fukuan'
      },
      {
        name: '待匹配仓库物流',
        platformType: 'ebay',
        icon: 'icon-wuliu1',
        dataItemNum: 0,
        path: './ebay.html#/matchTheLogistics',
        menuKey: 'ebay_matchTheLogistics'
      },
      {
        name: '已取消订单', // 已取消订单
        platformType: 'ebay',
        menuKey: 'ebay_cancelOrder',
        path: './ebay.html#/cancelOrder',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '手工订单',
        platformType: 'ebay',
        menuKey: 'ebay_manualOrder',
        path: './ebay.html#/manualOrder',
        icon: 'icon-shougong'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'ebay',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'ebay',
            menuKey: 'ebay_importTask',
            path: './ebay.html#/importTask'
          }, {
            name: '导出查看',
            platformType: 'ebay',
            menuKey: 'ebay_exportTask',
            path: './ebay.html#/exportTask'
          }
        ]
      }
    ],
    // 速卖通平台
    aliexpress: [
      {
        name: '订单检索',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=aliexpress',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        menuKey: 'aliexpress_stockoutOrder',
        platformType: 'aliexpress',
        path: './commonOrder.html#/stockoutOrder?platform=aliexpress',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=aliexpress',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_markShipments',
        path: './commonOrder.html#/markShipments?platform=aliexpress',
        icon: 'icon-biaoji'
      },
      {
        name: '风控中的订单',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_riskOrder',
        path: './aliexpress.html#/riskOrder',
        icon: 'icon-risk'
      },
      {
        name: '订单审核',
        platformType: 'aliexpress',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'aliexpress',
            menuKey: 'aliexpress_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=aliexpress',
            dataItemNum: 0
          }, {
            name: '未匹配商品', // 未匹配商品
            platformType: 'aliexpress',
            menuKey: 'aliexpress_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=aliexpress',
            dataItemNum: 0
          }, {
            name: '可合并',
            platformType: 'aliexpress',
            menuKey: 'aliexpress_combineOrder',
            path: './aliexpress.html#/combineOrder',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'aliexpress',
        icon: 'icon-wuliu1',
        dataItemNum: 0,
        path: './aliexpress.html#/matchTheLogistics',
        menuKey: 'aliexpress_matchTheLogistics'
      },
      {
        name: '未付款',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_nonPayment',
        path: './aliexpress.html#/nonPayment',
        icon: 'icon-fukuan'
      },
      {
        name: '待收货确认',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_waitingForReceivingConfirmation',
        path: './aliexpress.html#/waitingForReceivingConfirmation',
        icon: 'icon-dengdaiqueren'
      },
      {
        name: '已取消订单', // 已取消订单
        platformType: 'aliexpress',
        menuKey: 'aliexpress_cancelOrder',
        path: './aliexpress.html#/cancelOrder',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '手工订单',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_manualOrder',
        path: './aliexpress.html#/manualOrder',
        icon: 'icon-shougong'
      },
      {
        name: '全托管订单',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_trusteeshipOrder',
        path: './aliexpress.html#/trusteeshipOrder?platform=aliexpress',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '菜鸟仓履约订单',
        platformType: 'aliexpress',
        menuKey: 'aliexpress_certificationOrder',
        path: './aliexpress.html#/certificationOrder?platform=aliexpress',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'aliexpress',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'aliexpress',
            menuKey: 'aliexpress_importTask',
            path: './aliexpress.html#/importTask'
          }, {
            name: '导出查看',
            platformType: 'aliexpress',
            menuKey: 'aliexpress_exportTask',
            path: './aliexpress.html#/exportTask'
          }
        ]
      }
    ],
    // 亚马逊平台
    amazon: [
      {
        name: '订单检索',
        platformType: 'amazon',
        menuKey: 'amazon_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=amazon',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'amazon',
        menuKey: 'amazon_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=amazon',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'amazon',
        menuKey: 'amazon_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=amazon',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'amazon',
        menuKey: 'amazon_markShipments',
        path: './commonOrder.html#/markShipments?platform=amazon',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'amazon',
        icon: 'icon-shenhe',
        children: [
          {
            name: '未匹配商品', // 未匹配商品
            platformType: 'amazon',
            menuKey: 'amazon_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=amazon',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'amazon',
            menuKey: 'amazon_combineOrder',
            path: './amazon.html#/combineOrder',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配物流',
        platformType: 'amazon',
        icon: 'icon-wuliu1',
        dataItemNum: 0,
        path: './amazon.html#/matchTheLogistics',
        menuKey: 'amazon_matchTheLogistics'
      },
      {
        name: 'FBA',
        platformType: 'amazon',
        icon: 'icon-shenhe',
        children: [
          {
            name: 'FBA订单列表',
            platformType: 'amazon',
            menuKey: 'amazon_fbaOrder',
            path: './amazon.html#/fbaOrder?platform=amazon',
            icon: 'icon-sousuowushuju'
          }
        ]
      },
      {
        name: '已取消订单', // 已取消订单
        platformType: 'amazon',
        menuKey: 'amazon_cancelOrder',
        path: './amazon.html#/cancelOrder',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '手工订单',
        platformType: 'amazon',
        menuKey: 'amazon_manualOrder',
        path: './amazon.html#/manualOrder',
        icon: 'icon-shougong'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'amazon',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'amazon',
            menuKey: 'amazon_importTask',
            path: './amazon.html#/importTask'
          },
          {
            name: '导出查看',
            platformType: 'amazon',
            menuKey: 'amazon_exportTask',
            path: './amazon.html#/exportTask'
          }
        ]
      }
    ],
    // 公共平台
    wish: [
      {
        name: '订单检索',
        platformType: 'wish',
        menuKey: 'wish_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=wish',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'wish',
        menuKey: 'wish_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=wish',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'wish',
        menuKey: 'wish_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=wish',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'wish',
        menuKey: 'wish_markShipments',
        path: './commonOrder.html#/markShipments?platform=wish',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'wish',
        icon: 'icon-shenhe',
        children: [
          // {
          //   name: '有留言', // 留言待处理
          //   platformType: 'wish',
          //   menuKey: 'wish_messageToBeProcessed',
          //   path: './wish.html#/messageToBeProcessed?platform=wish',
          //   dataItemNum: 0
          // },
          {
            name: '未匹配商品',
            platformType: 'wish',
            menuKey: 'wish_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=wish',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'wish',
            menuKey: 'wish_combineOrder',
            path: './wish.html#/combineOrder?platform=wish',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'wish',
        icon: 'icon-wuliu1',
        path: './wish.html#/matchTheLogistics?platform=wish',
        menuKey: 'wish_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'wish',
        menuKey: 'wish_manualOrder',
        path: './wish.html#/manualOrder?platform=wish',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'wish',
        menuKey: 'wish_cancelOrder',
        path: './wish.html#/cancelOrder?platform=wish',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'wish',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'wish',
            menuKey: 'wish_importTask',
            path: './wish.html#/importTask?platform=wish'
          },
          {
            name: '导出查看',
            platformType: 'wish',
            menuKey: 'wish_exportTask',
            path: './wish.html#/exportTask?platform=wish'
          }
        ]
      }
    ],
    shopee: [
      {
        name: '订单检索',
        platformType: 'shopee',
        menuKey: 'shopee_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=shopee',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'shopee',
        menuKey: 'shopee_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=shopee',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'shopee',
        menuKey: 'shopee_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=shopee',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'shopee',
        menuKey: 'shopee_markShipments',
        path: './commonOrder.html#/markShipments?platform=shopee',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'shopee',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'shopee',
            menuKey: 'shopee_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=shopee',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'shopee',
            menuKey: 'shopee_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=shopee',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'shopee',
            menuKey: 'shopee_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=shopee',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'shopee',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=shopee',
        menuKey: 'shopee_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'shopee',
        menuKey: 'shopee_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=shopee',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'shopee',
        menuKey: 'shopee_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=shopee',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'shopee',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'shopee',
            menuKey: 'shopee_importTask',
            path: './commonOrder.html#/importTask?platform=shopee'
          },
          {
            name: '导出查看',
            platformType: 'shopee',
            menuKey: 'shopee_exportTask',
            path: './commonOrder.html#/exportTask?platform=shopee'
          }
        ]
      }
    ],
    dhgate: [
      {
        name: '订单检索',
        platformType: 'dhgate',
        menuKey: 'dhgate_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=dhgate',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'dhgate',
        menuKey: 'dhgate_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=dhgate',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'dhgate',
        menuKey: 'dhgate_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=dhgate',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'dhgate',
        menuKey: 'dhgate_markShipments',
        path: './commonOrder.html#/markShipments?platform=dhgate',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'dhgate',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'dhgate',
            menuKey: 'dhgate_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=dhgate',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'dhgate',
            menuKey: 'dhgate_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=dhgate',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'dhgate',
            menuKey: 'dhgate_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=dhgate',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'dhgate',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=dhgate',
        menuKey: 'dhgate_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'dhgate',
        menuKey: 'dhgate_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=dhgate',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'dhgate',
        menuKey: 'dhgate_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=dhgate',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'dhgate',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'dhgate',
            menuKey: 'dhgate_importTask',
            path: './commonOrder.html#/importTask?platform=dhgate'
          },
          {
            name: '导出查看',
            platformType: 'dhgate',
            menuKey: 'dhgate_exportTask',
            path: './commonOrder.html#/exportTask?platform=dhgate'
          }
        ]
      }
    ],
    lazada: [
      {
        name: '订单检索',
        platformType: 'lazada',
        menuKey: 'lazada_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=lazada',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'lazada',
        menuKey: 'lazada_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=lazada',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'lazada',
        menuKey: 'lazada_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=lazada',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'lazada',
        menuKey: 'lazada_markShipments',
        path: './commonOrder.html#/markShipments?platform=lazada',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'lazada',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'lazada',
            menuKey: 'lazada_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=lazada',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'lazada',
            menuKey: 'lazada_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=lazada',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'lazada',
            menuKey: 'lazada_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=lazada',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'lazada',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=lazada',
        menuKey: 'lazada_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'lazada',
        menuKey: 'lazada_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=lazada',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'lazada',
        menuKey: 'lazada_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=lazada',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'lazada',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'lazada',
            menuKey: 'lazada_importTask',
            path: './commonOrder.html#/importTask?platform=lazada'
          },
          {
            name: '导出查看',
            platformType: 'lazada',
            menuKey: 'lazada_exportTask',
            path: './commonOrder.html#/exportTask?platform=lazada'
          }
        ]
      }
    ],
    shopify: [
      {
        name: '订单检索',
        platformType: 'shopify',
        menuKey: 'shopify_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=shopify',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'shopify',
        menuKey: 'shopify_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=shopify',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'shopify',
        menuKey: 'shopify_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=shopify',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'shopify',
        menuKey: 'shopify_markShipments',
        path: './commonOrder.html#/markShipments?platform=shopify',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'shopify',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'shopify',
            menuKey: 'shopify_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=shopify',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'shopify',
            menuKey: 'shopify_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=shopify',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'shopify',
            menuKey: 'shopify_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=shopify',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'shopify',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=shopify',
        menuKey: 'shopify_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'shopify',
        menuKey: 'shopify_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=shopify',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'shopify',
        menuKey: 'shopify_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=shopify',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'shopify',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'shopify',
            menuKey: 'shopify_importTask',
            path: './commonOrder.html#/importTask?platform=shopify'
          },
          {
            name: '导出查看',
            platformType: 'shopify',
            menuKey: 'shopify_exportTask',
            path: './commonOrder.html#/exportTask?platform=shopify'
          }
        ]
      }
    ],
    joom: [
      {
        name: '订单检索',
        platformType: 'joom',
        menuKey: 'joom_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=joom',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'joom',
        menuKey: 'joom_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=joom',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'joom',
        menuKey: 'joom_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=joom',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'joom',
        menuKey: 'joom_markShipments',
        path: './commonOrder.html#/markShipments?platform=joom',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'joom',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'joom',
            menuKey: 'joom_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=joom',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'joom',
            menuKey: 'joom_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=joom',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'joom',
            menuKey: 'joom_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=joom',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'joom',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=joom',
        menuKey: 'joom_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'joom',
        menuKey: 'joom_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=joom',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'joom',
        menuKey: 'joom_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=joom',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'joom',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'joom',
            menuKey: 'joom_importTask',
            path: './commonOrder.html#/importTask?platform=joom'
          },
          {
            name: '导出查看',
            platformType: 'joom',
            menuKey: 'joom_exportTask',
            path: './commonOrder.html#/exportTask?platform=joom'
          }
        ]
      }
    ],
    yandex: [
      {
        name: '订单检索',
        platformType: 'yandex',
        menuKey: 'yandex_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=yandex',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'yandex',
        menuKey: 'yandex_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=yandex',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'yandex',
        menuKey: 'yandex_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=yandex',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'yandex',
        menuKey: 'yandex_markShipments',
        path: './commonOrder.html#/markShipments?platform=yandex',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'yandex',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'yandex',
            menuKey: 'yandex_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=yandex',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'yandex',
            menuKey: 'yandex_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=yandex',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'yandex',
            menuKey: 'yandex_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=yandex',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'yandex',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=yandex',
        menuKey: 'yandex_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'yandex',
        menuKey: 'yandex_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=yandex',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'yandex',
        menuKey: 'yandex_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=yandex',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'yandex',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'yandex',
            menuKey: 'yandex_importTask',
            path: './commonOrder.html#/importTask?platform=yandex'
          },
          {
            name: '导出查看',
            platformType: 'yandex',
            menuKey: 'yandex_exportTask',
            path: './commonOrder.html#/exportTask?platform=yandex'
          }
        ]
      }
    ],
    walmart: [
      {
        name: '订单检索',
        platformType: 'walmart',
        menuKey: 'walmart_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=walmart',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'walmart',
        menuKey: 'walmart_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=walmart',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'walmart',
        menuKey: 'walmart_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=walmart',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'walmart',
        menuKey: 'walmart_markShipments',
        path: './commonOrder.html#/markShipments?platform=walmart',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'walmart',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'walmart',
            menuKey: 'walmart_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=walmart',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'walmart',
            menuKey: 'walmart_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=walmart',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'walmart',
            menuKey: 'walmart_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=walmart',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'walmart',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=walmart',
        menuKey: 'walmart_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'walmart',
        menuKey: 'walmart_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=walmart',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'walmart',
        menuKey: 'walmart_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=walmart',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '平台仓发货订单',
        platformType: 'walmart',
        menuKey: 'walmart_platformWarehouseDelivery',
        path: './commonOrder.html#/platformWarehouseDelivery?platform=walmart',
        dataItemNum: 0,
        icon: 'icon-sousuowushuju'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'walmart',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'walmart',
            menuKey: 'walmart_importTask',
            path: './commonOrder.html#/importTask?platform=walmart'
          }, {
            name: '导出查看',
            platformType: 'walmart',
            menuKey: 'walmart_exportTask',
            path: './commonOrder.html#/exportTask?platform=walmart'
          }
        ]
      }
    ],
    jdyn: [
      {
        name: '订单检索',
        platformType: 'jdyn',
        menuKey: 'jdyn_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=jdyn',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'jdyn',
        menuKey: 'jdyn_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=jdyn',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'jdyn',
        menuKey: 'jdyn_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=jdyn',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'jdyn',
        menuKey: 'jdyn_markShipments',
        path: './commonOrder.html#/markShipments?platform=jdyn',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'jdyn',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'jdyn',
            menuKey: 'jdyn_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=jdyn',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'jdyn',
            menuKey: 'jdyn_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=jdyn',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'jdyn',
            menuKey: 'jdyn_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=jdyn',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'jdyn',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=jdyn',
        menuKey: 'jdyn_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'jdyn',
        menuKey: 'jdyn_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=jdyn',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'jdyn',
        menuKey: 'jdyn_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=jdyn',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'jdyn',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'jdyn',
            menuKey: 'jdyn_importTask',
            path: './commonOrder.html#/importTask?platform=jdyn'
          },
          {
            name: '导出查看',
            platformType: 'jdyn',
            menuKey: 'jdyn_exportTask',
            path: './commonOrder.html#/exportTask?platform=jdyn'
          }
        ]
      }
    ],
    ept: [
      {
        name: '订单检索',
        platformType: 'ept',
        menuKey: 'ept_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=ept',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'ept',
        menuKey: 'ept_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=ept',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'ept',
        menuKey: 'ept_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=ept',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'ept',
        menuKey: 'ept_markShipments',
        path: './commonOrder.html#/markShipments?platform=ept',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'ept',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'ept',
            menuKey: 'ept_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=ept',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'ept',
            menuKey: 'ept_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=ept',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'ept',
            menuKey: 'ept_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=ept',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'ept',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=ept',
        menuKey: 'ept_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'ept',
        menuKey: 'ept_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=ept',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'ept',
        menuKey: 'ept_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=ept',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'ept',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'ept',
            menuKey: 'ept_importTask',
            path: './commonOrder.html#/importTask?platform=ept'
          },
          {
            name: '导出查看',
            platformType: 'ept',
            menuKey: 'ept_exportTask',
            path: './commonOrder.html#/exportTask?platform=ept'
          }
        ]
      }
    ],
    alibaba: [
      {
        name: '订单检索',
        platformType: 'alibaba',
        menuKey: 'alibaba_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=alibaba',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'alibaba',
        menuKey: 'alibaba_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=alibaba',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'alibaba',
        menuKey: 'alibaba_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=alibaba',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'alibaba',
        menuKey: 'alibaba_markShipments',
        path: './commonOrder.html#/markShipments?platform=alibaba',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'alibaba',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'alibaba',
            menuKey: 'alibaba_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=alibaba',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'alibaba',
            menuKey: 'alibaba_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=alibaba',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'alibaba',
            menuKey: 'alibaba_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=alibaba',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'alibaba',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=alibaba',
        menuKey: 'alibaba_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'alibaba',
        menuKey: 'alibaba_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=alibaba',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'alibaba',
        menuKey: 'alibaba_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=alibaba',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'alibaba',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'alibaba',
            menuKey: 'alibaba_importTask',
            path: './commonOrder.html#/importTask?platform=alibaba'
          },
          {
            name: '导出查看',
            platformType: 'alibaba',
            menuKey: 'alibaba_exportTask',
            path: './commonOrder.html#/exportTask?platform=alibaba'
          }
        ]
      }
    ],
    cdiscount: [
      {
        name: '订单检索',
        platformType: 'cdiscount',
        menuKey: 'cdiscount_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=cdiscount',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'cdiscount',
        menuKey: 'cdiscount_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=cdiscount',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'cdiscount',
        menuKey: 'cdiscount_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=cdiscount',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'cdiscount',
        menuKey: 'cdiscount_markShipments',
        path: './commonOrder.html#/markShipments?platform=cdiscount',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'cdiscount',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'cdiscount',
            menuKey: 'cdiscount_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=cdiscount',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'cdiscount',
            menuKey: 'cdiscount_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=cdiscount',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'cdiscount',
            menuKey: 'cdiscount_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=cdiscount',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'cdiscount',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=cdiscount',
        menuKey: 'cdiscount_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'cdiscount',
        menuKey: 'cdiscount_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=cdiscount',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'cdiscount',
        menuKey: 'cdiscount_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=cdiscount',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'cdiscount',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'cdiscount',
            menuKey: 'cdiscount_importTask',
            path: './commonOrder.html#/importTask?platform=cdiscount'
          },
          {
            name: '导出查看',
            platformType: 'cdiscount',
            menuKey: 'cdiscount_exportTask',
            path: './commonOrder.html#/exportTask?platform=cdiscount'
          }
        ]
      }
    ],
    factorymarket: [
      {
        name: '订单检索',
        platformType: 'factorymarket',
        menuKey: 'factorymarket_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=factorymarket',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'factorymarket',
        menuKey: 'factorymarket_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=factorymarket',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'factorymarket',
        menuKey: 'factorymarket_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=factorymarket',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'factorymarket',
        menuKey: 'factorymarket_markShipments',
        path: './commonOrder.html#/markShipments?platform=factorymarket',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'factorymarket',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'factorymarket',
            menuKey: 'factorymarket_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=factorymarket',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'factorymarket',
            menuKey: 'factorymarket_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=factorymarket',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'factorymarket',
            menuKey: 'factorymarket_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=factorymarket',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'factorymarket',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=factorymarket',
        menuKey: 'factorymarket_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'factorymarket',
        menuKey: 'factorymarket_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=factorymarket',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'factorymarket',
        menuKey: 'factorymarket_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=factorymarket',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'factorymarket',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'factorymarket',
            menuKey: 'factorymarket_importTask',
            path: './commonOrder.html#/importTask?platform=factorymarket'
          },
          {
            name: '导出查看',
            platformType: 'factorymarket',
            menuKey: 'factorymarket_exportTask',
            path: './commonOrder.html#/exportTask?platform=factorymarket'
          }
        ]
      }
    ],
    mycom: [
      {
        name: '订单检索',
        platformType: 'mycom',
        menuKey: 'mycom_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=mycom',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'mycom',
        menuKey: 'mycom_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=mycom',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'mycom',
        menuKey: 'mycom_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=mycom',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'mycom',
        menuKey: 'mycom_markShipments',
        path: './commonOrder.html#/markShipments?platform=mycom',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'mycom',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'mycom',
            menuKey: 'mycom_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=mycom',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'mycom',
            menuKey: 'mycom_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=mycom',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'mycom',
            menuKey: 'mycom_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=mycom',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'mycom',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=mycom',
        menuKey: 'mycom_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'mycom',
        menuKey: 'mycom_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=mycom',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'mycom',
        menuKey: 'mycom_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=mycom',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'mycom',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'mycom',
            menuKey: 'mycom_importTask',
            path: './commonOrder.html#/importTask?platform=mycom'
          },
          {
            name: '导出查看',
            platformType: 'mycom',
            menuKey: 'mycom_exportTask',
            path: './commonOrder.html#/exportTask?platform=mycom'
          }
        ]
      }
    ],
    newegg: [
      {
        name: '订单检索',
        platformType: 'newegg',
        menuKey: 'newegg_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=newegg',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'newegg',
        menuKey: 'newegg_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=newegg',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'newegg',
        menuKey: 'newegg_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=newegg',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'newegg',
        menuKey: 'newegg_markShipments',
        path: './commonOrder.html#/markShipments?platform=newegg',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'newegg',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'newegg',
            menuKey: 'newegg_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=newegg',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'newegg',
            menuKey: 'newegg_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=newegg',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'newegg',
            menuKey: 'newegg_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=newegg',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'newegg',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=newegg',
        menuKey: 'newegg_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'newegg',
        menuKey: 'newegg_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=newegg',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'newegg',
        menuKey: 'newegg_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=newegg',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'newegg',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'newegg',
            menuKey: 'newegg_importTask',
            path: './commonOrder.html#/importTask?platform=newegg'
          },
          {
            name: '导出查看',
            platformType: 'newegg',
            menuKey: 'newegg_exportTask',
            path: './commonOrder.html#/exportTask?platform=newegg'
          }
        ]
      }
    ],
    priceminister: [
      {
        name: '订单检索',
        platformType: 'priceminister',
        menuKey: 'priceminister_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=priceminister',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'priceminister',
        menuKey: 'priceminister_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=priceminister',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'priceminister',
        menuKey: 'priceminister_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=priceminister',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '订单审核',
        platformType: 'priceminister',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'priceminister',
            menuKey: 'priceminister_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=priceminister',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'priceminister',
            menuKey: 'priceminister_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=priceminister',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'priceminister',
            menuKey: 'priceminister_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=priceminister',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '标发货',
        platformType: 'priceminister',
        menuKey: 'priceminister_markShipments',
        path: './commonOrder.html#/markShipments?platform=priceminister',
        icon: 'icon-biaoji'
      },
      {
        name: '待匹配仓库物流',
        platformType: 'priceminister',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=priceminister',
        menuKey: 'priceminister_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'priceminister',
        menuKey: 'priceminister_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=priceminister',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'priceminister',
        menuKey: 'priceminister_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=priceminister',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'priceminister',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'priceminister',
            menuKey: 'priceminister_importTask',
            path: './commonOrder.html#/importTask?platform=priceminister'
          },
          {
            name: '导出查看',
            platformType: 'priceminister',
            menuKey: 'priceminister_exportTask',
            path: './commonOrder.html#/exportTask?platform=priceminister'
          }
        ]
      }
    ],
    tophatter: [
      {
        name: '订单检索',
        platformType: 'tophatter',
        menuKey: 'tophatter_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=tophatter',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'tophatter',
        menuKey: 'tophatter_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=tophatter',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'tophatter',
        menuKey: 'tophatter_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=tophatter',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'tophatter',
        menuKey: 'tophatter_markShipments',
        path: './commonOrder.html#/markShipments?platform=tophatter',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'tophatter',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'tophatter',
            menuKey: 'tophatter_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=tophatter',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'tophatter',
            menuKey: 'tophatter_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=tophatter',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'tophatter',
            menuKey: 'tophatter_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=tophatter',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'tophatter',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=tophatter',
        menuKey: 'tophatter_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'tophatter',
        menuKey: 'tophatter_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=tophatter',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'tophatter',
        menuKey: 'tophatter_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=tophatter',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'tophatter',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'tophatter',
            menuKey: 'tophatter_importTask',
            path: './commonOrder.html#/importTask?platform=tophatter'
          },
          {
            name: '导出查看',
            platformType: 'tophatter',
            menuKey: 'tophatter_exportTask',
            path: './commonOrder.html#/exportTask?platform=tophatter'
          }
        ]
      }
    ],
    vova: [
      {
        name: '订单检索',
        platformType: 'vova',
        menuKey: 'vova_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=vova',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'vova',
        menuKey: 'vova_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=vova',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'vova',
        menuKey: 'vova_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=vova',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'vova',
        menuKey: 'vova_markShipments',
        path: './commonOrder.html#/markShipments?platform=vova',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'vova',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'vova',
            menuKey: 'vova_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=vova',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'vova',
            menuKey: 'vova_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=vova',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'vova',
            menuKey: 'vova_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=vova',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'vova',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=vova',
        menuKey: 'vova_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'vova',
        menuKey: 'vova_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=vova',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'vova',
        menuKey: 'vova_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=vova',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'vova',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'vova',
            menuKey: 'vova_importTask',
            path: './commonOrder.html#/importTask?platform=vova'
          },
          {
            name: '导出查看',
            platformType: 'vova',
            menuKey: 'vova_exportTask',
            path: './commonOrder.html#/exportTask?platform=vova'
          }
        ]
      }
    ],
    mercadolibre: [
      {
        name: '订单检索',
        platformType: 'mercadolibre',
        menuKey: 'mercadolibre_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=mercadolibre',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'mercadolibre',
        menuKey: 'mercadolibre_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=mercadolibre',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'mercadolibre',
        menuKey: 'mercadolibre_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=mercadolibre',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'mercadolibre',
        menuKey: 'mercadolibre_markShipments',
        path: './commonOrder.html#/markShipments?platform=mercadolibre',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'mercadolibre',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'mercadolibre',
            menuKey: 'mercadolibre_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=mercadolibre',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'mercadolibre',
            menuKey: 'mercadolibre_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=mercadolibre',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'mercadolibre',
            menuKey: 'mercadolibre_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=mercadolibre',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'mercadolibre',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=mercadolibre',
        menuKey: 'mercadolibre_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'mercadolibre',
        menuKey: 'mercadolibre_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=mercadolibre',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'mercadolibre',
        menuKey: 'mercadolibre_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=mercadolibre',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'mercadolibre',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'mercadolibre',
            menuKey: 'mercadolibre_importTask',
            path: './commonOrder.html#/importTask?platform=mercadolibre'
          },
          {
            name: '导出查看',
            platformType: 'mercadolibre',
            menuKey: 'mercadolibre_exportTask',
            path: './commonOrder.html#/exportTask?platform=mercadolibre'
          }
        ]
      }
    ],
    real: [
      {
        name: '订单检索',
        platformType: 'real',
        menuKey: 'real_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=real',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'real',
        menuKey: 'real_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=real',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'real',
        menuKey: 'real_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=real',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'real',
        menuKey: 'real_markShipments',
        path: './commonOrder.html#/markShipments?platform=real',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'real',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'real',
            menuKey: 'real_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=real',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'real',
            menuKey: 'real_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=real',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'real',
            menuKey: 'real_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=real',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'real',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=real',
        menuKey: 'real_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'real',
        menuKey: 'real_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=real',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'real',
        menuKey: 'real_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=real',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'real',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'real',
            menuKey: 'real_importTask',
            path: './commonOrder.html#/importTask?platform=real'
          },
          {
            name: '导出查看',
            platformType: 'real',
            menuKey: 'real_exportTask',
            path: './commonOrder.html#/exportTask?platform=real'
          }
        ]
      }
    ],
    allegro: [
      {
        name: '订单检索',
        platformType: 'allegro',
        menuKey: 'allegro_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=allegro',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'allegro',
        menuKey: 'allegro_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=allegro',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'allegro',
        menuKey: 'allegro_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=allegro',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'allegro',
        menuKey: 'allegro_markShipments',
        path: './commonOrder.html#/markShipments?platform=allegro',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'allegro',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'allegro',
            menuKey: 'allegro_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=allegro',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'allegro',
            menuKey: 'allegro_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=allegro',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'allegro',
            menuKey: 'allegro_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=allegro',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'allegro',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=allegro',
        menuKey: 'allegro_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'allegro',
        menuKey: 'allegro_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=allegro',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'allegro',
        menuKey: 'allegro_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=allegro',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'allegro',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'allegro',
            menuKey: 'allegro_importTask',
            path: './commonOrder.html#/importTask?platform=allegro'
          },
          {
            name: '导出查看',
            platformType: 'allegro',
            menuKey: 'allegro_exportTask',
            path: './commonOrder.html#/exportTask?platform=allegro'
          }
        ]
      }
    ],
    otto: [
      {
        name: '订单检索',
        platformType: 'otto',
        menuKey: 'otto_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=otto',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'otto',
        menuKey: 'otto_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=otto',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'otto',
        menuKey: 'otto_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=otto',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'otto',
        menuKey: 'otto_markShipments',
        path: './commonOrder.html#/markShipments?platform=otto',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'otto',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'otto',
            menuKey: 'otto_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=otto',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'otto',
            menuKey: 'otto_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=otto',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'otto',
            menuKey: 'otto_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=otto',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'otto',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=otto',
        menuKey: 'otto_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'otto',
        menuKey: 'otto_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=otto',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'otto',
        menuKey: 'otto_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=otto',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '退货包裹管理',
        platformType: 'otto',
        menuKey: 'otto_returnPackage',
        path: './commonOrder.html#/returnPackage?platform=otto',
        dataItemNum: 0,
        lapaIcon: 'lapa lapa-tuihuo'
      },
      {
        name: '退款申请处理',
        platformType: 'otto',
        menuKey: 'otto_refundProcess',
        path: './commonOrder.html#/refundProcess?platform=otto',
        dataItemNum: 0,
        lapaIcon: 'lapa lapa-tuikuanshenqing'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'otto',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'otto',
            menuKey: 'otto_importTask',
            path: './commonOrder.html#/importTask?platform=otto'
          },
          {
            name: '导出查看',
            platformType: 'otto',
            menuKey: 'otto_exportTask',
            path: './commonOrder.html#/exportTask?platform=otto'
          }
        ]
      }
    ],
    // tiktok 平台
    tiktok: [
      {
        name: '订单检索',
        platformType: 'tiktok',
        menuKey: 'tiktok_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=tiktok',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'tiktok',
        menuKey: 'tiktok_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=tiktok',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'tiktok',
        menuKey: 'tiktok_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=tiktok',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'tiktok',
        menuKey: 'tiktok_markShipments',
        path: './commonOrder.html#/markShipments?platform=tiktok',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核', // 订单审核
        platformType: 'tiktok',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'tiktok',
            menuKey: 'tiktok_messageToBeProcessed', // menukey匹配菜单订单数
            path: './commonOrder.html#/messageToBeProcessed?platform=tiktok',
            dataItemNum: 0
          },
          {
            name: '未匹配商品', // 未匹配商品
            platformType: 'tiktok',
            menuKey: 'tiktok_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=tiktok',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'tiktok',
            menuKey: 'tiktok_combineOrder',
            path: './tiktok.html#/combineOrder',
            dataItemNum: 0
          }
        ]
      },
      // {
      //   name: '未付款',
      //   platformType: 'tiktok',
      //   menuKey: 'tiktok_nonPayment',
      //   path: './tiktok.html#/nonPayment',
      //   icon: 'icon-fukuan'
      // },
      {
        name: '待匹配仓库物流',
        platformType: 'tiktok',
        icon: 'icon-wuliu1',
        dataItemNum: 0,
        path: './tiktok.html#/matchTheLogistics',
        menuKey: 'tiktok_matchTheLogistics'
      },
      {
        name: '已取消订单', // 已取消订单
        platformType: 'tiktok',
        menuKey: 'tiktok_cancelOrder',
        path: './tiktok.html#/cancelOrder',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '手工订单',
        platformType: 'tiktok',
        menuKey: 'tiktok_manualOrder',
        path: './tiktok.html#/manualOrder',
        icon: 'icon-shougong'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'tiktok',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'tiktok',
            menuKey: 'tiktok_importTask',
            path: './tiktok.html#/importTask'
          }, {
            name: '导出查看',
            platformType: 'tiktok',
            menuKey: 'tiktok_exportTask',
            path: './tiktok.html#/exportTask'
          }
        ]
      }
    ],
    // temu 半托管平台
    temux: [
      {
        name: '订单检索',
        platformType: 'temux',
        menuKey: 'temux_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=temux',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'temux',
        menuKey: 'temux_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=temux',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'temux',
        menuKey: 'temux_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=temux',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'temux',
        menuKey: 'temux_markShipments',
        path: './commonOrder.html#/markShipments?platform=temux',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'temux',
        icon: 'icon-shenhe',
        children: [
          // {
          //   name: '有留言', // 留言待处理
          //   platformType: 'temux',
          //   menuKey: 'temux_messageToBeProcessed',
          //   path: './commonOrder.html#/messageToBeProcessed?platform=temux',
          //   dataItemNum: 0
          // },
          {
            name: '未匹配商品',
            platformType: 'temux',
            menuKey: 'temux_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=temux',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'temux',
            menuKey: 'temux_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=temux',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'temux',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=temux',
        menuKey: 'temux_matchTheLogistics'
      },
      {
        name: '已取消订单',
        platformType: 'temux',
        menuKey: 'temux_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=temux',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '手工订单',
        platformType: 'temux',
        menuKey: 'temux_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=temux',
        icon: 'icon-shougong'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'temux',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'temux',
            menuKey: 'temux_importTask',
            path: './commonOrder.html#/importTask?platform=temux'
          },
          {
            name: '导出查看',
            platformType: 'temux',
            menuKey: 'temux_exportTask',
            path: './commonOrder.html#/exportTask?platform=temux'
          }
        ]
      }
    ],
    // ozon 平台
    ozon: [
      {
        name: '订单检索',
        platformType: 'ozon',
        menuKey: 'ozon_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=ozon',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'ozon',
        menuKey: 'ozon_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=ozon',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'ozon',
        menuKey: 'ozon_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=ozon',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'ozon',
        menuKey: 'ozon_markShipments',
        path: './commonOrder.html#/markShipments?platform=ozon',
        icon: 'icon-biaoji'
      },
      {
        name: '平台仓订单',
        platformType: 'ozon',
        menuKey: 'ozon_platformShippedOrder',
        path: './commonOrder.html#/platformShippedOrder?platform=ozon',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '订单审核', // 订单审核
        platformType: 'ozon',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'ozon',
            menuKey: 'ozon_messageToBeProcessed', // menukey匹配菜单订单数
            path: './commonOrder.html#/messageToBeProcessed?platform=ozon',
            dataItemNum: 0
          },
          {
            name: '未匹配商品', // 未匹配商品
            platformType: 'ozon',
            menuKey: 'ozon_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=ozon',
            dataItemNum: 0
          },
          // {
          //   name: '可合并',
          //   platformType: 'ozon',
          //   menuKey: 'ozon_combineOrder',
          //   path: './ozon.html#/combineOrder',
          //   dataItemNum: 0
          // }
        ]
      },
      // {
      //   name: '未付款',
      //   platformType: 'ozon',
      //   menuKey: 'ozon_nonPayment',
      //   path: './ozon.html#/nonPayment',
      //   icon: 'icon-fukuan'
      // },
      {
        name: '待匹配仓库物流',
        platformType: 'ozon',
        icon: 'icon-wuliu1',
        dataItemNum: 0,
        path: './ozon.html#/matchTheLogistics',
        menuKey: 'ozon_matchTheLogistics'
      },
      {
        name: '已取消订单', // 已取消订单
        platformType: 'ozon',
        menuKey: 'ozon_cancelOrder',
        path: './ozon.html#/cancelOrder',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '手工订单',
        platformType: 'ozon',
        menuKey: 'ozon_manualOrder',
        path: './ozon.html#/manualOrder',
        icon: 'icon-shougong'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'ozon',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'ozon',
            menuKey: 'ozon_importTask',
            path: './ozon.html#/importTask'
          }, {
            name: '导出查看',
            platformType: 'ozon',
            menuKey: 'ozon_exportTask',
            path: './ozon.html#/exportTask'
          }
        ]
      }
    ],
    // shein 半托管
    sheinx: [
      {
        name: '订单检索',
        platformType: 'sheinx',
        menuKey: 'sheinx_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=sheinx',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'sheinx',
        menuKey: 'sheinx_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=sheinx',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'sheinx',
        menuKey: 'sheinx_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=sheinx',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'sheinx',
        menuKey: 'sheinx_markShipments',
        path: './commonOrder.html#/markShipments?platform=sheinx',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'sheinx',
        icon: 'icon-shenhe',
        children: [
          // {
          //   name: '有留言', // 留言待处理
          //   platformType: 'sheinx',
          //   menuKey: 'sheinx_messageToBeProcessed',
          //   path: './commonOrder.html#/messageToBeProcessed?platform=sheinx',
          //   dataItemNum: 0
          // },
          {
            name: '未匹配商品',
            platformType: 'sheinx',
            menuKey: 'sheinx_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=sheinx',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'sheinx',
            menuKey: 'sheinx_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=sheinx',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'sheinx',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=sheinx',
        menuKey: 'sheinx_matchTheLogistics'
      },
      {
        name: '已取消订单',
        platformType: 'sheinx',
        menuKey: 'sheinx_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=sheinx',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '手工订单',
        platformType: 'sheinx',
        menuKey: 'sheinx_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=sheinx',
        icon: 'icon-shougong'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'sheinx',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'sheinx',
            menuKey: 'sheinx_importTask',
            path: './commonOrder.html#/importTask?platform=sheinx'
          },
          {
            name: '导出查看',
            platformType: 'sheinx',
            menuKey: 'sheinx_exportTask',
            path: './commonOrder.html#/exportTask?platform=sheinx'
          }
        ]
      }
    ],
    // MVA 平台
    miravia: [
      {
        name: '订单检索',
        platformType: 'miravia',
        menuKey: 'miravia_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=miravia',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'miravia',
        menuKey: 'miravia_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=miravia',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'miravia',
        menuKey: 'miravia_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=miravia',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'miravia',
        menuKey: 'miravia_markShipments',
        path: './commonOrder.html#/markShipments?platform=miravia',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'miravia',
        icon: 'icon-shenhe',
        children: [
          {
            name: '有留言', // 留言待处理
            platformType: 'miravia',
            menuKey: 'miravia_messageToBeProcessed',
            path: './commonOrder.html#/messageToBeProcessed?platform=miravia',
            dataItemNum: 0
          },
          {
            name: '未匹配商品',
            platformType: 'miravia',
            menuKey: 'miravia_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=miravia',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'miravia',
            menuKey: 'miravia_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=miravia',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'miravia',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=miravia',
        menuKey: 'miravia_matchTheLogistics'
      },
      {
        name: '手工订单',
        platformType: 'miravia',
        menuKey: 'miravia_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=miravia',
        icon: 'icon-shougong'
      },
      {
        name: '已取消订单',
        platformType: 'miravia',
        menuKey: 'miravia_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=miravia',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'miravia',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'miravia',
            menuKey: 'miravia_importTask',
            path: './commonOrder.html#/importTask?platform=miravia'
          },
          {
            name: '导出查看',
            platformType: 'miravia',
            menuKey: 'miravia_exportTask',
            path: './commonOrder.html#/exportTask?platform=miravia'
          }
        ]
      }
    ],
    // WB平台对接
    wb: [
      {
        name: '订单检索',
        platformType: 'wb',
        menuKey: 'wb_orderToRetrieve',
        path: './commonOrder.html#/orderToRetrieve?platform=wb',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'wb',
        menuKey: 'wb_stockoutOrder',
        path: './commonOrder.html#/stockoutOrder?platform=wb',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'wb',
        menuKey: 'wb_interceptOrder',
        path: './commonOrder.html#/interceptOrder?platform=wb',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '标发货',
        platformType: 'wb',
        menuKey: 'wb_markShipments',
        path: './commonOrder.html#/markShipments?platform=wb',
        icon: 'icon-biaoji'
      },
      {
        name: '订单审核',
        platformType: 'wb',
        icon: 'icon-shenhe',
        children: [
          // {
          //   name: '有留言', // 留言待处理
          //   platformType: 'wb',
          //   menuKey: 'wb_messageToBeProcessed',
          //   path: './commonOrder.html#/messageToBeProcessed?platform=wb',
          //   dataItemNum: 0
          // },
          {
            name: '未匹配商品',
            platformType: 'wb',
            menuKey: 'wb_unmatchProduct',
            path: './commonOrder.html#/unmatchProduct?platform=wb',
            dataItemNum: 0
          },
          {
            name: '可合并',
            platformType: 'wb',
            menuKey: 'wb_combineOrder',
            path: './commonOrder.html#/combineOrder?platform=wb',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '待匹配仓库物流',
        platformType: 'wb',
        icon: 'icon-wuliu1',
        path: './commonOrder.html#/matchTheLogistics?platform=wb',
        menuKey: 'wb_matchTheLogistics'
      },
      {
        name: '已取消订单',
        platformType: 'wb',
        menuKey: 'wb_cancelOrder',
        path: './commonOrder.html#/cancelOrder?platform=wb',
        dataItemNum: 0,
        icon: 'icon-iconfontzhizuobiaozhun0262'
      },
      {
        name: '手工订单',
        platformType: 'wb',
        menuKey: 'wb_manualOrder',
        path: './commonOrder.html#/manualOrder?platform=wb',
        icon: 'icon-shougong'
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'wb',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'wb',
            menuKey: 'wb_importTask',
            path: './commonOrder.html#/importTask?platform=wb'
          },
          {
            name: '导出查看',
            platformType: 'wb',
            menuKey: 'wb_exportTask',
            path: './commonOrder.html#/exportTask?platform=wb'
          }
        ]
      }
    ],
    // 自定义渠道
    definePlatform: [
      {
        name: '订单检索',
        platformType: 'definePlatform',
        menuKey: 'definePlatform_orderToRetrieve',
        path: './definePlatform.html#/orderToRetrieve',
        icon: 'icon-sousuowushuju'
      },
      {
        name: '异常订单',
        platformType: 'definePlatform',
        menuKey: 'definePlatform_stockoutOrder',
        path: './definePlatform.html#/stockoutOrder',
        icon: 'iconjinggao'
      },
      {
        name: '截留订单',
        platformType: 'definePlatform',
        menuKey: 'definePlatform_interceptOrder',
        path: './definePlatform.html#/interceptOrder',
        lapaIcon: 'lapa lapa-jieliudingdan'
        // icon: 'ivu-icon ivu-icon-ios-calendar-outline'
      },
      {
        name: '异常订单处理', // 异常订单处理
        platformType: 'definePlatform',
        icon: 'icon-shenhe',
        children: [
          {
            name: '待匹配商品', // 待匹配商品
            platformType: 'definePlatform',
            menuKey: 'definePlatform_unmatchProduct',
            path: './definePlatform.html#/unmatchProduct',
            dataItemNum: 0
          },
          {
            name: '待匹配仓库物流',
            platformType: 'definePlatform',
            dataItemNum: 0,
            path: './definePlatform.html#/matchTheLogistics',
            menuKey: 'definePlatform_matchTheLogistics'
          },
          {
            name: '已取消订单', // 已取消订单
            platformType: 'definePlatform',
            menuKey: 'definePlatform_cancelOrder',
            path: './definePlatform.html#/cancelOrder',
            dataItemNum: 0
          }
        ]
      },
      {
        name: '导入/导出任务', // 导入导出任务
        platformType: 'definePlatform',
        icon: 'icon-shenhe',
        children: [
          {
            name: '导入查看',
            platformType: 'definePlatform',
            menuKey: 'definePlatform_importTask',
            path: './definePlatform.html#/importTask'
          }, {
            name: '导出查看',
            platformType: 'definePlatform',
            menuKey: 'definePlatform_exportTask',
            path: './definePlatform.html#/exportTask'
          }
        ]
      }
    ]
  },
  // 商品管理系统
  menuProduct: [
    {
      name: '商品管理中心',
      icon: 'icon-shangpinguanli',
      platformType: 'productCenter',
      children: [
        {
          name: '商品管理',
          path: './productCenter.html#/productGoods',
          platformType: 'productCenter',
          menuKey: 'productCenter_productGoods'
        },
        /* {
          name: '商品管理(旧)',
          path: './productCenter.html#/newProductGoods',
          platformType: 'productCenter',
          menuKey: 'productCenter_newProductGoods'
        }, */
        {
          name: '分类管理',
          path: './productCenter.html#/productCategory',
          platformType: 'productCenter',
          menuKey: 'productCenter_productCategory'
        },
        {
          name: '标签管理',
          path: './productCenter.html#/productTag',
          platformType: 'productCenter',
          menuKey: 'productCenter_productTag'
        },
        {
          name: '品牌管理',
          path: './productCenter.html#/productBrand',
          platformType: 'productCenter',
          menuKey: 'productCenter_productBrand'
        },
        {
          name: 'SKU映射',
          path: './productCenter.html#/productSkuMapping',
          platformType: 'productCenter',
          menuKey: 'productCenter_productSkuMapping'
        },
        {
          name: '第三方标签管理',
          path: './productCenter.html#/thirdpartyTagManage',
          platformType: 'productCenter',
          menuKey: 'productCenter_thirdpartyTagManage'
        }
      ]
    },
    {
      name: '导入/导出任务',
      icon: 'icon-shenhe',
      platformType: 'productCenter',
      children: [
        {
          name: '导入查看',
          path: './productCenter.html#/importTask',
          platformType: 'productCenter',
          menuKey: 'productCenter_importTask'
        },
        {
          name: '导出查看',
          path: './productCenter.html#/exportTask',
          platformType: 'productCenter',
          menuKey: 'productCenter_exportTask'
        }
      ]
    },
    {
      name: '属性分类管理',
      icon: 'icon-shenhe',
      platformType: 'productCenter',
      children: [
        {
          name: '属性管理',
          path: './productCenter.html#/attributeManagement',
          platformType: 'productCenter',
          menuKey: 'productCenter_attributeManagement'
        },
        {
          name: '分类管理',
          path: './productCenter.html#/attributeClassification',
          platformType: 'productCenter',
          menuKey: 'productCenter_attributeClassification'
        }
      ]
    },
    // {
    //   name: '分类管理',
    //   icon: 'icon-shenhe',
    //   platformType: 'productCenter',
    //   path: './productCenter.html#/classifyManagement',
    //   menuKey: 'productCenter_attributeManagement'
    // },
    {
      name: '质检分类管理',
      icon: 'icon-shenhe',
      platformType: 'productCenter',
      children: [
        {
          name: '质检项目管理',
          path: './productCenter.html#/qualityProject',
          platformType: 'productCenter',
          menuKey: 'productCenter_qualityProject'
        },
        {
          name: '质检模块管理',
          path: './productCenter.html#/qualityClassification',
          platformType: 'productCenter',
          menuKey: 'productCenter_qualityClassification'
        }
      ]
    }

  ],
  // 客服管理系统
  menuCustomer: [
    {
      name: '客服管理',
      icon: 'icon-kefu1',
      platformType: 'customer',
      children: [
        {
          name: 'Ebay站内信',
          path: './customer.html#/ebayMail',
          platformType: 'customer',
          menuKey: 'customer_ebayMail'
        }
      ]
    },
    {
      name: 'Ebay纠纷管理', // Ebay纠纷管理
      icon: 'icon-mingxiweihuyichang',
      platformType: 'customer',
      children: [
        {
          name: '取消交易', // 取消交易
          menuKey: 'customer_ebayCancelOrder',
          platformType: 'customer',
          path: './customer.html#/ebayCancelOrder'
        },
        {
          name: '未收到货品', // 未收到货品
          menuKey: 'customer_notReceivedTheGoodsInEbay',
          platformType: 'customer',
          path: './customer.html#/notReceivedTheGoodsInEbay'
        },
        {
          name: '退款退货', // 退款退货
          menuKey: 'customer_ebayRefundReturn',
          platformType: 'customer',
          path: './customer.html#/ebayRefundReturn'
        },
        {
          name: '付款纠纷', // 退款退货
          menuKey: 'customer_paymentDispute',
          platformType: 'customer',
          path: './customer.html#/paymentDispute'
        },
        {
          name: 'Walmart退款管理', // Walmart退款管理
          menuKey: 'customer_walmartRefundManage',
          platformType: 'customer',
          path: './customer.html#/walmartRefundManage'
        }
      ]
    },
    {
      name: '评价', // 评价
      icon: 'icon-pingjia',
      platformType: 'customer',
      children: [
        {
          name: '好评', // 评价
          menuKey: 'customer_goodReputation',
          platformType: 'customer',
          path: './customer.html#/goodReputation'
        },
        {
          name: '中评', // 中评
          menuKey: 'customer_mediumReputaion',
          platformType: 'customer',
          path: './customer.html#/mediumReputaion'
        },
        {
          name: '差评', // 差评
          menuKey: 'customer_badReputation',
          platformType: 'customer',
          path: './customer.html#/badReputation'
        },
        {
          name: '需要留评价', // 需要留评价
          menuKey: 'customer_needEvauate',
          platformType: 'customer',
          path: './customer.html#/needEvauate'
        },
        {
          name: '等待买家评价', // 等待买家评价
          menuKey: 'customer_waitBuyerEvauate',
          platformType: 'customer',
          path: './customer.html#/waitBuyerEvauate'
        }
      ]
    },
    {
      name: '售后处理', // 售后处理
      icon: 'icon-postsale',
      platformType: 'customer',
      children: [
        {
          name: '售后处理', // 售后处理
          menuKey: 'customer_postSaleTreatment',
          platformType: 'customer',
          path: './customer.html#/postSaleTreatment'
        },
        {
          name: '售后原因管理', // 售后原因管理
          menuKey: 'customer_postSaleReasonsTreatment',
          platformType: 'customer',
          path: './customer.html#/postSaleReasonsTreatment'
        }
      ]
    },
    {
      name: '黑名单', // 黑名单
      icon: 'icon-heimingdan',
      platformType: 'customer',
      children: [
        {
          name: '黑名单', // 黑名单
          menuKey: 'customer_blacklistManage',
          platformType: 'customer',
          path: './customer.html#/blacklistManage'
        }
      ]
    },
    {
      name: '客服统计', // 客服统计
      icon: 'icon-kefutongji',
      platformType: 'customer',
      children: [
        {
          name: '客服统计', // 客服统计
          menuKey: 'customer_mailStatistics',
          platformType: 'customer',
          path: './customer.html#/mailStatistics'
        }
      ]
    },
    {
      name: '导入/导出任务',
      icon: 'icon-erji-dashujupingtai',
      platformType: 'customer',
      children: [
        {
          name: '导入查看',
          path: './customer.html#/importTask',
          platformType: 'customer',
          menuKey: 'customer_importTask'
        },
        {
          name: '导出查看',
          path: './customer.html#/exportTask',
          platformType: 'customer',
          menuKey: 'customer_exportTask'
        }
      ]
    }
  ],
  // 设置中心
  menuSetting: {
    generalSettings: [
      {
        name: '通用',
        icon: 'icon-jinlingyingcaiwangtubiao20',
        platformType: 'generalSettings',
        children: [
          {
            name: '平台店铺', // 平台店铺
            path: './generalSettings.html#/shop',
            platformType: 'generalSettings',
            menuKey: 'generalSettings_shop'
          },
          {
            name: '员工管理', // 员工管理
            path: './generalSettings.html#/management',
            platformType: 'generalSettings',
            menuKey: 'generalSettings_management'
          },
          {
            name: 'YMS账号管理',
            path: './generalSettings.html#/ymsAccountManage',
            platformType: 'generalSettings',
            menuKey: 'generalSettings_ymsAccountManage'
          },
          {
            name: '业务角色管理', // 业务角色管理
            path: './generalSettings.html#/businessRoleManage',
            platformType: 'generalSettings',
            menuKey: 'generalSettings_businessRoleManage'
          },
          {
            name: 'Paypal账号', // Paypal账号
            path: './generalSettings.html#/paypalAccountSetting',
            platformType: 'generalSettings',
            menuKey: 'generalSettings_paypalAccountSetting'
          },
          {
            name: '汇率管理', // 汇率管理
            path: './generalSettings.html#/exchangeRate',
            platformType: 'generalSettings',
            menuKey: 'generalSettings_exchangeRate'
          },
          {
            name: '月平均汇率管理', // 汇率管理
            path: './generalSettings.html#/monthlyAverageRate',
            platformType: 'generalSettings',
            menuKey: 'generalSettings_monthlyAverageRate'
          }
        ]
      }
    ],
    logistics: [
      {
        name: '仓储管理', // 仓储管理
        icon: 'icon-jinlingyingcaiwangtubiao20',
        platformType: 'logistics',
        children: [
          {
            name: '仓库设置', // 仓库设置
            path: './logistics.html#/wareSetting',
            platformType: 'logistics',
            menuKey: 'logistics_wareSetting'
          },
          {
            name: '库区设置', // 库区设置
            path: './logistics.html#/wareArea',
            platformType: 'logistics',
            menuKey: 'logistics_wareArea'
          },
          {
            name: '库位设置', // 库位设置
            path: './logistics.html#/wareLocate',
            platformType: 'logistics',
            menuKey: 'logistics_wareLocate'
          },
          {
            name: '物流设置', // 物流设置
            path: './logistics.html#/logisticsSettings',
            platformType: 'logistics',
            menuKey: 'logistics_logisticsSettings'
          },
          {
            name: '常用申报', // 常用申报
            path: './logistics.html#/baseDelcaration',
            platformType: 'logistics',
            menuKey: 'logistics_baseDelcaration'
          },
          {
            name: '见货出单设置', // 见货出单设置
            path: './logistics.html#/sortOrderSetting',
            platformType: 'logistics',
            menuKey: 'logistics_sortOrderSetting'
          },
          {
            name: '包材管理', // 包材管理
            path: './logistics.html#/wrapperManage',
            platformType: 'logistics',
            menuKey: 'logistics_wrapperManage'
          },
          {
            name: '自动分配', // 自动分配
            path: './logistics.html#/allotRule',
            platformType: 'logistics',
            menuKey: 'logistics_allotRule'
          },
          {
            name: '下发物流商规则', // 下发物流商规则
            path: './logistics.html#/issueLogisticsRule',
            platformType: 'logistics',
            menuKey: 'logistics_issueLogisticsRule'
          },
          {
            name: '分区方案管理', // 分区方案管理
            path: './logistics.html#/zoningScheme',
            platformType: 'logistics',
            menuKey: 'logistics_zoningScheme'
          },
          {
            name: '申报规则', // 申报规则
            path: './logistics.html#/declarationRules',
            platformType: 'logistics',
            menuKey: 'logistics_declarationRules'
          },
          {
            name: '带电资质', // 带电资质
            path: './logistics.html#/carrierGoodsBattery',
            platformType: 'logistics',
            menuKey: 'logistics_carrierGoodsBattery'
          },
          {
            name: '货箱体积设置', // 货箱体积设置
            path: './logistics.html#/boxVolumnAuthority',
            platformType: 'logistics',
            menuKey: 'logistics_boxVolumnAuthority'
          },
          {
            name: '仓库费用设置',
            path: './logistics.html#/storageSettings',
            platformType: 'logistics',
            menuKey: 'logistics_storageSettings'
          }
        ]
      }
    ],
    orderSettings: [
      {
        name: '订单管理', // 订单管理
        icon: 'icon-icon-dingdan',
        platformType: 'orderSettings',
        children: [
          {
            name: '自动分仓规则', // 自动分仓规则
            path: './orderSettings.html#/autoDistributionWarehouseRule',
            platformType: 'orderSettings',
            menuKey: 'orderSettings_autoDistributionWarehouseRule'
          },
          {
            name: '智能物流规则', // 智能物流规则
            path: './orderSettings.html#/smartLogisticsRule',
            platformType: 'orderSettings',
            menuKey: 'orderSettings_smartLogisticsRule'
          },
          {
            name: '订单审核规则', // 订单审核规则
            path: './orderSettings.html#/orderReviewRule',
            platformType: 'orderSettings',
            menuKey: 'orderSettings_orderReviewRule'
          },
          {
            name: '订单标签管理', // 订单标签管理
            path: './orderSettings.html#/orderTagSetting',
            platformType: 'orderSettings',
            menuKey: 'orderSettings_orderTagSetting'
          },
          {
            name: 'SKU匹配设置', // sku匹配设置
            path: './orderSettings.html#/skuMatchSetting',
            platformType: 'orderSettings',
            menuKey: 'orderSettings_skuMatchSetting'
          }
        ]
      }
    ],
    customSettings: [
      {
        name: '客服管理', // 客服管理
        icon: 'icon-Shape',
        platformType: 'customSettings',
        children: [
          {
            name: '站内信文件夹', // 站内信文件夹
            path: './customSettings.html#/mailFolder',
            platformType: 'customSettings',
            menuKey: 'customSettings_mailFolder'
          },
          {
            name: '站内信优先级', // 站内信优先级
            path: './customSettings.html#/mailPriority',
            platformType: 'customSettings',
            menuKey: 'customSettings_mailPriority'
          },
          {
            name: '站内信回复模板',
            path: './customSettings.html#/mailRecoveryTemp',
            platformType: 'customSettings',
            menuKey: 'customSettings_mailRecoveryTemp'
          },
          { // 站内信自动规则
            name: '站内信自动规则',
            path: './customSettings.html#/mailAutoRule',
            platformType: 'customSettings',
            menuKey: 'customSettings_mailAutoRule'
          },
          { // 评价模板
            name: '评价模板',
            path: './customSettings.html#/evaluateSettings',
            platformType: 'customSettings',
            menuKey: 'customSettings_evaluateSettings'
          },
          {
            name: '站内信自动发送邮件',
            path: './customSettings.html#/autoSendEmail',
            platformType: 'customSettings',
            menuKey: 'customSettings_autoSendEmail'
          }
        ]
      }
    ],
    pdsSettings: [
      {
        name: '新品开发管理',
        icon: 'icon-Shape',
        platformType: 'pdsSettings',
        children: [
          {
            name: '商品编码自动编码规则',
            path: './pdsSettings.html#/codingRules',
            platformType: 'pdsSettings',
            menuKey: 'pdsSettings_codingRules'
          },
          {
            name: 'UPC生成规则',
            path: './pdsSettings.html#/upcGenerationRules',
            platformType: 'pdsSettings',
            menuKey: 'pdsSettings_upcGenerationRules'
          },
          {
            name: 'SKC颜色管理',
            path: './pdsSettings.html#/skcColormanage',
            platformType: 'pdsSettings',
            menuKey: 'pdsSettings_skcColormanage'
          },
          {
            name: '分类类型管理',
            path: './pdsSettings.html#/typeManage',
            platformType: 'pdsSettings',
            menuKey: 'pdsSettings_typeManage'
          },
          // {
          //   name: '尺码管理',
          //   path: './pdsSettings.html#/sizeManage',
          //   platformType: 'pdsSettings',
          //   menuKey: 'pdsSettings_sizeManage'
          // },
          {
            name: '尺码和尺码类型管理',
            path: './pdsSettings.html#/sizeManage',
            platformType: 'pdsSettings',
            menuKey: 'pdsSettings_sizeManage'
          },
          {
            name: '审核人员设置',
            path: './pdsSettings.html#/approverSettings',
            platformType: 'pdsSettings',
            menuKey: 'pdsSettings_approverSettings'
          }
        ]
      }
    ],
    financeSettings: [
      {
        name: '财务计费设置',
        icon: 'icon-Shape',
        platformType: 'financeSettings',
        children: [
          {
            name: '操作费用模版',
            path: './financeSettings.html#/operateTemplate',
            platformType: 'financeSettings',
            menuKey: 'financeSettings_operateTemplate'
          },
          {
            name: '仓储费用模版',
            path: './financeSettings.html#/storageTemplate',
            platformType: 'financeSettings',
            menuKey: 'financeSettings_storageTemplate'
          },
          {
            name: '出仓费用模版',
            path: './financeSettings.html#/deliverTemplate',
            platformType: 'financeSettings',
            menuKey: 'financeSettings_deliverTemplate'
          },
          {
            name: '运费模版',
            path: './financeSettings.html#/freightTemplate',
            platformType: 'financeSettings',
            menuKey: 'financeSettings_freightTemplate'
          },
          {
            name: '偏远地区费用模版',
            path: './financeSettings.html#/remoteAreaCostTemplate',
            platformType: 'financeSettings',
            menuKey: 'financeSettings_remoteAreaCostTemplate'
          }
        ]
      }
    ],
    productSettings: [],
    spsSettings: []
  }
};
