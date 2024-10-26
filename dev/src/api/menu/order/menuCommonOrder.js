export default {
  // 全平台
  allplatform: [
    {
      'mainTitle': '全平台',
      'platformType': 'allplatform',
      'menuKey': 'Group',
      'link': './commonOrder.html#/messageToBeProcessed?platform=allplatform',
      'type': 'Group', // 没有子菜单
      'alias': 'messageToBeProcessed',
      'id': 'allplatform1'
    },
    {
      'mainTitle': '订单检索',
      'platformType': 'allplatform',
      'menuKey': 'allplatform_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=allplatform',
      'icon': 'icon-sousuowushuju',
      'id': 'allplatform12',
      'pid': 'allplatform1'
    },
    {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'allplatform',
      'id': 'allplatform11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'allplatform1'
    },
    {
      'mainTitle': '导入查看',
      'platformType': 'allplatform',
      'menuKey': 'allplatform_importTask',
      'link': './commonOrder.html#/importTask?platform=allplatform',
      'id': 'allplatform12',
      'pid': 'allplatform11'
    },
    {
      'mainTitle': '导出查看',
      'platformType': 'allplatform',
      'menuKey': 'allplatform_exportTask',
      'link': './commonOrder.html#/exportTask?platform=allplatform',
      'id': 'allplatform13',
      'pid': 'allplatform11'
    }
  ],
  shopee: [
    {
      'mainTitle': 'shopee',
      'platformType': 'shopee',
      'link': './commonOrder.html#/messageToBeProcessed?platform=shopee',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'shopee1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'shopee',
      'menuKey': 'shopee_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=shopee',
      'icon': 'icon-sousuowushuju',
      'id': 'shopee10',
      'pid': 'shopee1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'shopee',
      'menuKey': 'shopee_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=shopee',
      'icon': 'iconjinggao',
      'id': 'shopee7',
      'pid': 'shopee1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'shopee',
      'menuKey': 'shopee_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=shopee',
      'dataItemNum': '0',
      'id': 'shopee6',
      'pid': 'shopee2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'shopee',
      'menuKey': 'shopee_markShipments',
      'link': './commonOrder.html#/markShipments?platform=shopee',
      'icon': 'icon-biaoji',
      'id': 'shopee8',
      'pid': 'shopee1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'shopee',
      'id': 'shopee2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'shopee1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'shopee',
      'menuKey': 'shopee_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=shopee',
      'dataItemNum': '0',
      'id': 'shopee3',
      'pid': 'shopee2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'shopee',
      'menuKey': 'shopee_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=shopee',
      'dataItemNum': '0',
      'id': 'shopee4',
      'pid': 'shopee2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'shopee',
      'menuKey': 'shopee_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=shopee',
      'dataItemNum': '0',
      'id': 'shopee5',
      'pid': 'shopee2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'shopee',
      'id': 'shopee9',
      'icon': 'icon-wuliu1',
      'pid': 'shopee1',
      'link': './commonOrder.html#/matchTheLogistics?platform=shopee',
      'menuKey': 'shopee_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'shopee',
      'menuKey': 'shopee_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=shopee',
      'icon': 'icon-shougong',
      'id': 'shopee16',
      'pid': 'shopee1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'shopee',
      'menuKey': 'shopee_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=shopee',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'shopee19',
      'pid': 'shopee1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'shopee',
      'id': 'shopee11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'shopee1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'shopee',
      'menuKey': 'shopee_importTask',
      'link': './commonOrder.html#/importTask?platform=shopee',
      'id': 'shopee12',
      'pid': 'shopee11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'shopee',
      'menuKey': 'shopee_exportTask',
      'link': './commonOrder.html#/exportTask?platform=shopee',
      'id': 'shopee13',
      'pid': 'shopee11'
    }
  ],
  dhgate: [
    {
      'mainTitle': 'dhgate',
      'platformType': 'dhgate',
      'link': './commonOrder.html#/messageToBeProcessed?platform=dhgate',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'dhgate1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=dhgate',
      'icon': 'icon-sousuowushuju',
      'id': 'dhgate10',
      'pid': 'dhgate1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=dhgate',
      'icon': 'iconjinggao',
      'id': 'dhgate7',
      'pid': 'dhgate1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=dhgate',
      'dataItemNum': '0',
      'id': 'dhgate6',
      'pid': 'dhgate2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_markShipments',
      'link': './commonOrder.html#/markShipments?platform=dhgate',
      'icon': 'icon-biaoji',
      'id': 'dhgate8',
      'pid': 'dhgate1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'dhgate',
      'id': 'dhgate2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'dhgate1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'dhgate',
      'menuKey': 'dhgate_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=dhgate',
      'dataItemNum': '0',
      'id': 'dhgate3',
      'pid': 'dhgate2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=dhgate',
      'dataItemNum': '0',
      'id': 'dhgate4',
      'pid': 'dhgate2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=dhgate',
      'dataItemNum': '0',
      'id': 'dhgate5',
      'pid': 'dhgate2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'dhgate',
      'id': 'dhgate9',
      'icon': 'icon-wuliu1',
      'pid': 'dhgate1',
      'link': './commonOrder.html#/matchTheLogistics?platform=dhgate',
      'menuKey': 'dhgate_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=dhgate',
      'icon': 'icon-shougong',
      'id': 'dhgate16',
      'pid': 'dhgate1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=dhgate',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'dhgate19',
      'pid': 'dhgate1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'dhgate',
      'id': 'dhgate11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'dhgate1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_importTask',
      'link': './commonOrder.html#/importTask?platform=dhgate',
      'id': 'dhgate12',
      'pid': 'dhgate11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'dhgate',
      'menuKey': 'dhgate_exportTask',
      'link': './commonOrder.html#/exportTask?platform=dhgate',
      'id': 'dhgate13',
      'pid': 'dhgate11'
    }
  ],
  lazada: [
    {
      'mainTitle': 'lazada',
      'platformType': 'lazada',
      'link': './commonOrder.html#/messageToBeProcessed?platform=lazada',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'lazada1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'lazada',
      'menuKey': 'lazada_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=lazada',
      'icon': 'icon-sousuowushuju',
      'id': 'lazada10',
      'pid': 'lazada1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'lazada',
      'menuKey': 'lazada_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=lazada',
      'icon': 'iconjinggao',
      'id': 'lazada7',
      'pid': 'lazada1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'lazada',
      'menuKey': 'lazada_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=lazada',
      'dataItemNum': '0',
      'id': 'lazada6',
      'pid': 'lazada2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'lazada',
      'menuKey': 'lazada_markShipments',
      'link': './commonOrder.html#/markShipments?platform=lazada',
      'icon': 'icon-biaoji',
      'id': 'lazada8',
      'pid': 'lazada1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'lazada',
      'id': 'lazada2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'lazada1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'lazada',
      'menuKey': 'lazada_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=lazada',
      'dataItemNum': '0',
      'id': 'lazada3',
      'pid': 'lazada2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'lazada',
      'menuKey': 'lazada_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=lazada',
      'dataItemNum': '0',
      'id': 'lazada4',
      'pid': 'lazada2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'lazada',
      'menuKey': 'lazada_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=lazada',
      'dataItemNum': '0',
      'id': 'lazada5',
      'pid': 'lazada2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'lazada',
      'id': 'lazada9',
      'icon': 'icon-wuliu1',
      'pid': 'lazada1',
      'link': './commonOrder.html#/matchTheLogistics?platform=lazada',
      'menuKey': 'lazada_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'lazada',
      'menuKey': 'lazada_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=lazada',
      'icon': 'icon-shougong',
      'id': 'lazada16',
      'pid': 'lazada1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'lazada',
      'menuKey': 'lazada_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=lazada',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'lazada19',
      'pid': 'lazada1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'lazada',
      'id': 'lazada11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'lazada1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'lazada',
      'menuKey': 'lazada_importTask',
      'link': './commonOrder.html#/importTask?platform=lazada',
      'id': 'lazada12',
      'pid': 'lazada11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'lazada',
      'menuKey': 'lazada_exportTask',
      'link': './commonOrder.html#/exportTask?platform=lazada',
      'id': 'lazada13',
      'pid': 'lazada11'
    }
  ],
  shopify: [
    {
      'mainTitle': 'shopify',
      'platformType': 'shopify',
      'link': './commonOrder.html#/messageToBeProcessed?platform=shopify',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'shopify1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'shopify',
      'menuKey': 'shopify_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=shopify',
      'icon': 'icon-sousuowushuju',
      'id': 'shopify10',
      'pid': 'shopify1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'shopify',
      'menuKey': 'shopify_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=shopify',
      'icon': 'iconjinggao',
      'id': 'shopify7',
      'pid': 'shopify1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'shopify',
      'menuKey': 'shopify_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=shopify',
      'dataItemNum': '0',
      'id': 'shopify6',
      'pid': 'shopify2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'shopify',
      'menuKey': 'shopify_markShipments',
      'link': './commonOrder.html#/markShipments?platform=shopify',
      'icon': 'icon-biaoji',
      'id': 'shopify8',
      'pid': 'shopify1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'shopify',
      'id': 'shopify2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'shopify1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'shopify',
      'menuKey': 'shopify_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=shopify',
      'dataItemNum': '0',
      'id': 'shopify3',
      'pid': 'shopify2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'shopify',
      'menuKey': 'shopify_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=shopify',
      'dataItemNum': '0',
      'id': 'shopify4',
      'pid': 'shopify2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'shopify',
      'menuKey': 'shopify_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=shopify',
      'dataItemNum': '0',
      'id': 'shopify5',
      'pid': 'shopify2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'shopify',
      'id': 'shopify9',
      'icon': 'icon-wuliu1',
      'pid': 'shopify1',
      'link': './commonOrder.html#/matchTheLogistics?platform=shopify',
      'menuKey': 'shopify_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'shopify',
      'menuKey': 'shopify_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=shopify',
      'icon': 'icon-shougong',
      'id': 'shopify16',
      'pid': 'shopify1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'shopify',
      'menuKey': 'shopify_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=shopify',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'shopify19',
      'pid': 'shopify1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'shopify',
      'id': 'shopify11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'shopify1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'shopify',
      'menuKey': 'shopify_importTask',
      'link': './commonOrder.html#/importTask?platform=shopify',
      'id': 'shopify12',
      'pid': 'shopify11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'shopify',
      'menuKey': 'shopify_exportTask',
      'link': './commonOrder.html#/exportTask?platform=shopify',
      'id': 'shopify13',
      'pid': 'shopify11'
    }
  ],
  joom: [
    {
      'mainTitle': 'joom',
      'platformType': 'joom',
      'link': './commonOrder.html#/messageToBeProcessed?platform=joom',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'joom1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'joom',
      'menuKey': 'joom_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=joom',
      'icon': 'icon-sousuowushuju',
      'id': 'joom10',
      'pid': 'joom1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'joom',
      'menuKey': 'joom_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=joom',
      'icon': 'iconjinggao',
      'id': 'joom7',
      'pid': 'joom1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'joom',
      'menuKey': 'joom_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=joom',
      'dataItemNum': '0',
      'id': 'joom6',
      'pid': 'joom2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'joom',
      'menuKey': 'joom_markShipments',
      'link': './commonOrder.html#/markShipments?platform=joom',
      'icon': 'icon-biaoji',
      'id': 'joom8',
      'pid': 'joom1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'joom',
      'id': 'joom2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'joom1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'joom',
      'menuKey': 'joom_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=joom',
      'dataItemNum': '0',
      'id': 'joom3',
      'pid': 'joom2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'joom',
      'menuKey': 'joom_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=joom',
      'dataItemNum': '0',
      'id': 'joom4',
      'pid': 'joom2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'joom',
      'menuKey': 'joom_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=joom',
      'dataItemNum': '0',
      'id': 'joom5',
      'pid': 'joom2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'joom',
      'id': 'joom9',
      'icon': 'icon-wuliu1',
      'pid': 'joom1',
      'link': './commonOrder.html#/matchTheLogistics?platform=joom',
      'menuKey': 'joom_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'joom',
      'menuKey': 'joom_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=joom',
      'icon': 'icon-shougong',
      'id': 'joom16',
      'pid': 'joom1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'joom',
      'menuKey': 'joom_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=joom',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'joom19',
      'pid': 'joom1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'joom',
      'id': 'joom11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'joom1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'joom',
      'menuKey': 'joom_importTask',
      'link': './commonOrder.html#/importTask?platform=joom',
      'id': 'joom12',
      'pid': 'joom11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'joom',
      'menuKey': 'joom_exportTask',
      'link': './commonOrder.html#/exportTask?platform=joom',
      'id': 'joom13',
      'pid': 'joom11'
    }
  ],
  yandex: [
    {
      'mainTitle': 'yandex',
      'platformType': 'yandex',
      'link': './commonOrder.html#/messageToBeProcessed?platform=yandex',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'yandex1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'yandex',
      'menuKey': 'yandex_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=yandex',
      'icon': 'icon-sousuowushuju',
      'id': 'yandex10',
      'pid': 'yandex1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'yandex',
      'menuKey': 'yandex_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=yandex',
      'icon': 'iconjinggao',
      'id': 'yandex7',
      'pid': 'yandex1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'yandex',
      'menuKey': 'yandex_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=yandex',
      'dataItemNum': '0',
      'id': 'yandex6',
      'pid': 'yandex2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'yandex',
      'menuKey': 'yandex_markShipments',
      'link': './commonOrder.html#/markShipments?platform=yandex',
      'icon': 'icon-biaoji',
      'id': 'yandex8',
      'pid': 'yandex1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'yandex',
      'id': 'yandex2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'yandex1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'yandex',
      'menuKey': 'yandex_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=yandex',
      'dataItemNum': '0',
      'id': 'yandex3',
      'pid': 'yandex2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'yandex',
      'menuKey': 'yandex_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=yandex',
      'dataItemNum': '0',
      'id': 'yandex4',
      'pid': 'yandex2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'yandex',
      'menuKey': 'yandex_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=yandex',
      'dataItemNum': '0',
      'id': 'yandex5',
      'pid': 'yandex2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'yandex',
      'id': 'yandex9',
      'icon': 'icon-wuliu1',
      'pid': 'yandex1',
      'link': './commonOrder.html#/matchTheLogistics?platform=yandex',
      'menuKey': 'yandex_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'yandex',
      'menuKey': 'yandex_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=yandex',
      'icon': 'icon-shougong',
      'id': 'yandex16',
      'pid': 'yandex1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'yandex',
      'menuKey': 'yandex_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=yandex',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'yandex19',
      'pid': 'yandex1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'yandex',
      'id': 'yandex11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'yandex1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'yandex',
      'menuKey': 'yandex_importTask',
      'link': './commonOrder.html#/importTask?platform=yandex',
      'id': 'yandex12',
      'pid': 'yandex11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'yandex',
      'menuKey': 'yandex_exportTask',
      'link': './commonOrder.html#/exportTask?platform=yandex',
      'id': 'yandex13',
      'pid': 'yandex11'
    }
  ],
  walmart: [
    {
      'mainTitle': 'walmart',
      'platformType': 'walmart',
      'link': './commonOrder.html#/messageToBeProcessed?platform=walmart',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'walmart1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'walmart',
      'menuKey': 'walmart_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=walmart',
      'icon': 'icon-sousuowushuju',
      'id': 'walmart10',
      'pid': 'walmart1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'walmart',
      'menuKey': 'walmart_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=walmart',
      'icon': 'iconjinggao',
      'id': 'walmart7',
      'pid': 'walmart1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'walmart',
      'menuKey': 'walmart_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=walmart',
      'dataItemNum': '0',
      'id': 'walmart6',
      'pid': 'walmart2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'walmart',
      'menuKey': 'walmart_markShipments',
      'link': './commonOrder.html#/markShipments?platform=walmart',
      'icon': 'icon-biaoji',
      'id': 'walmart8',
      'pid': 'walmart1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'walmart',
      'id': 'walmart2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'walmart1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'walmart',
      'menuKey': 'walmart_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=walmart',
      'dataItemNum': '0',
      'id': 'walmart3',
      'pid': 'walmart2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'walmart',
      'menuKey': 'walmart_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=walmart',
      'dataItemNum': '0',
      'id': 'walmart4',
      'pid': 'walmart2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'walmart',
      'menuKey': 'walmart_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=walmart',
      'dataItemNum': '0',
      'id': 'walmart5',
      'pid': 'walmart2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'walmart',
      'id': 'walmart9',
      'icon': 'icon-wuliu1',
      'pid': 'walmart1',
      'link': './commonOrder.html#/matchTheLogistics?platform=walmart',
      'menuKey': 'walmart_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'walmart',
      'menuKey': 'walmart_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=walmart',
      'icon': 'icon-shougong',
      'id': 'walmart16',
      'pid': 'walmart1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'walmart',
      'menuKey': 'walmart_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=walmart',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'walmart19',
      'pid': 'walmart1'
    }, {
      'mainTitle': '平台仓发货订单',
      'platformType': 'walmart',
      'menuKey': 'walmart_platformWarehouseDelivery',
      'link': './commonOrder.html#/platformWarehouseDelivery?platform=walmart',
      'dataItemNum': '0',
      'icon': 'icon-sousuowushuju',
      'id': 'walmart20',
      'pid': 'walmart1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'walmart',
      'id': 'walmart11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'walmart1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'walmart',
      'menuKey': 'walmart_importTask',
      'link': './commonOrder.html#/importTask?platform=walmart',
      'id': 'walmart12',
      'pid': 'walmart11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'walmart',
      'menuKey': 'walmart_exportTask',
      'link': './commonOrder.html#/exportTask?platform=walmart',
      'id': 'walmart13',
      'pid': 'walmart11'
    }
  ],
  jdyn: [
    {
      'mainTitle': 'jdyn',
      'platformType': 'jdyn',
      'link': './commonOrder.html#/messageToBeProcessed?platform=jdyn',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'jdyn1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=jdyn',
      'icon': 'icon-sousuowushuju',
      'id': 'jdyn10',
      'pid': 'jdyn1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=jdyn',
      'icon': 'iconjinggao',
      'id': 'jdyn7',
      'pid': 'jdyn1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=jdyn',
      'dataItemNum': '0',
      'id': 'jdyn6',
      'pid': 'jdyn2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_markShipments',
      'link': './commonOrder.html#/markShipments?platform=jdyn',
      'icon': 'icon-biaoji',
      'id': 'jdyn8',
      'pid': 'jdyn1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'jdyn',
      'id': 'jdyn2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'jdyn1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'jdyn',
      'menuKey': 'jdyn_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=jdyn',
      'dataItemNum': '0',
      'id': 'jdyn3',
      'pid': 'jdyn2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=jdyn',
      'dataItemNum': '0',
      'id': 'jdyn4',
      'pid': 'jdyn2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=jdyn',
      'dataItemNum': '0',
      'id': 'jdyn5',
      'pid': 'jdyn2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'jdyn',
      'id': 'jdyn9',
      'icon': 'icon-wuliu1',
      'pid': 'jdyn1',
      'link': './commonOrder.html#/matchTheLogistics?platform=jdyn',
      'menuKey': 'jdyn_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=jdyn',
      'icon': 'icon-shougong',
      'id': 'jdyn16',
      'pid': 'jdyn1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=jdyn',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'jdyn19',
      'pid': 'jdyn1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'jdyn',
      'id': 'jdyn11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'jdyn1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_importTask',
      'link': './commonOrder.html#/importTask?platform=jdyn',
      'id': 'jdyn12',
      'pid': 'jdyn11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'jdyn',
      'menuKey': 'jdyn_exportTask',
      'link': './commonOrder.html#/exportTask?platform=jdyn',
      'id': 'jdyn13',
      'pid': 'jdyn11'
    }
  ],
  ept: [
    {
      'mainTitle': 'ept',
      'platformType': 'ept',
      'link': './commonOrder.html#/messageToBeProcessed?platform=ept',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'ept1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'ept',
      'menuKey': 'ept_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=ept',
      'icon': 'icon-sousuowushuju',
      'id': 'ept10',
      'pid': 'ept1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'ept',
      'menuKey': 'ept_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=ept',
      'icon': 'iconjinggao',
      'id': 'ept7',
      'pid': 'ept1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'ept',
      'menuKey': 'ept_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=ept',
      'dataItemNum': '0',
      'id': 'ept6',
      'pid': 'ept2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'ept',
      'menuKey': 'ept_markShipments',
      'link': './commonOrder.html#/markShipments?platform=ept',
      'icon': 'icon-biaoji',
      'id': 'ept8',
      'pid': 'ept1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'ept',
      'id': 'ept2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'ept1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'ept',
      'menuKey': 'ept_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=ept',
      'dataItemNum': '0',
      'id': 'ept3',
      'pid': 'ept2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'ept',
      'menuKey': 'ept_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=ept',
      'dataItemNum': '0',
      'id': 'ept4',
      'pid': 'ept2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'ept',
      'menuKey': 'ept_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=ept',
      'dataItemNum': '0',
      'id': 'ept5',
      'pid': 'ept2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'ept',
      'id': 'ept9',
      'icon': 'icon-wuliu1',
      'pid': 'ept1',
      'link': './commonOrder.html#/matchTheLogistics?platform=ept',
      'menuKey': 'ept_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'ept',
      'menuKey': 'ept_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=ept',
      'icon': 'icon-shougong',
      'id': 'ept16',
      'pid': 'ept1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'ept',
      'menuKey': 'ept_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=ept',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'ept19',
      'pid': 'ept1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'ept',
      'id': 'ept11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'ept1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'ept',
      'menuKey': 'ept_importTask',
      'link': './commonOrder.html#/importTask?platform=ept',
      'id': 'ept12',
      'pid': 'ept11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'ept',
      'menuKey': 'ept_exportTask',
      'link': './commonOrder.html#/exportTask?platform=ept',
      'id': 'ept13',
      'pid': 'ept11'
    }
  ],
  alibaba: [
    {
      'mainTitle': 'alibaba',
      'platformType': 'alibaba',
      'link': './commonOrder.html#/messageToBeProcessed?platform=alibaba',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'alibaba1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=alibaba',
      'icon': 'icon-sousuowushuju',
      'id': 'alibaba10',
      'pid': 'alibaba1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=alibaba',
      'icon': 'iconjinggao',
      'id': 'alibaba7',
      'pid': 'alibaba1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=alibaba',
      'dataItemNum': '0',
      'id': 'alibaba6',
      'pid': 'alibaba2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_markShipments',
      'link': './commonOrder.html#/markShipments?platform=alibaba',
      'icon': 'icon-biaoji',
      'id': 'alibaba8',
      'pid': 'alibaba1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'alibaba',
      'id': 'alibaba2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'alibaba1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'alibaba',
      'menuKey': 'alibaba_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=alibaba',
      'dataItemNum': '0',
      'id': 'alibaba3',
      'pid': 'alibaba2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=alibaba',
      'dataItemNum': '0',
      'id': 'alibaba4',
      'pid': 'alibaba2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=alibaba',
      'dataItemNum': '0',
      'id': 'alibaba5',
      'pid': 'alibaba2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'alibaba',
      'id': 'alibaba9',
      'icon': 'icon-wuliu1',
      'pid': 'alibaba1',
      'link': './commonOrder.html#/matchTheLogistics?platform=alibaba',
      'menuKey': 'alibaba_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=alibaba',
      'icon': 'icon-shougong',
      'id': 'alibaba16',
      'pid': 'alibaba1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=alibaba',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'alibaba19',
      'pid': 'alibaba1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'alibaba',
      'id': 'alibaba11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'alibaba1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_importTask',
      'link': './commonOrder.html#/importTask?platform=alibaba',
      'id': 'alibaba12',
      'pid': 'alibaba11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'alibaba',
      'menuKey': 'alibaba_exportTask',
      'link': './commonOrder.html#/exportTask?platform=alibaba',
      'id': 'alibaba13',
      'pid': 'alibaba11'
    }
  ],
  wish: [
    {
      'mainTitle': 'wish',
      'platformType': 'wish',
      'link': './commonOrder.html#/messageToBeProcessed?platform=wish',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'wish1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'wish',
      'menuKey': 'wish_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=wish',
      'icon': 'icon-sousuowushuju',
      'id': 'wish10',
      'pid': 'wish1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'wish',
      'menuKey': 'wish_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=wish',
      'icon': 'iconjinggao',
      'id': 'wish7',
      'pid': 'wish1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'wish',
      'menuKey': 'wish_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=wish',
      'dataItemNum': '0',
      'id': 'wish6',
      'pid': 'wish2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'wish',
      'menuKey': 'wish_markShipments',
      'link': './commonOrder.html#/markShipments?platform=wish',
      'icon': 'icon-biaoji',
      'id': 'wish8',
      'pid': 'wish1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'wish',
      'id': 'wish2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'wish1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'wish',
      'menuKey': 'wish_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=wish',
      'dataItemNum': '0',
      'id': 'wish3',
      'pid': 'wish2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'wish',
      'menuKey': 'wish_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=wish',
      'dataItemNum': '0',
      'id': 'wish4',
      'pid': 'wish2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'wish',
      'menuKey': 'wish_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=wish',
      'dataItemNum': '0',
      'id': 'wish5',
      'pid': 'wish2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'wish',
      'id': 'wish9',
      'icon': 'icon-wuliu1',
      'pid': 'wish1',
      'link': './commonOrder.html#/matchTheLogistics?platform=wish',
      'menuKey': 'wish_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'wish',
      'menuKey': 'wish_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=wish',
      'icon': 'icon-shougong',
      'id': 'wish16',
      'pid': 'wish1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'wish',
      'menuKey': 'wish_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=wish',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'wish19',
      'pid': 'wish1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'wish',
      'id': 'wish11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'wish1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'wish',
      'menuKey': 'wish_importTask',
      'link': './commonOrder.html#/importTask?platform=wish',
      'id': 'wish12',
      'pid': 'wish11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'wish',
      'menuKey': 'wish_exportTask',
      'link': './commonOrder.html#/exportTask?platform=wish',
      'id': 'wish13',
      'pid': 'wish11'
    }
  ],
  cdiscount: [
    {
      'mainTitle': 'cdiscount',
      'platformType': 'cdiscount',
      'link': './commonOrder.html#/messageToBeProcessed?platform=cdiscount',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'cdiscount1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=cdiscount',
      'icon': 'icon-sousuowushuju',
      'id': 'cdiscount10',
      'pid': 'cdiscount1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=cdiscount',
      'icon': 'iconjinggao',
      'id': 'cdiscount7',
      'pid': 'cdiscount1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=cdiscount',
      'dataItemNum': '0',
      'id': 'cdiscount6',
      'pid': 'cdiscount2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_markShipments',
      'link': './commonOrder.html#/markShipments?platform=cdiscount',
      'icon': 'icon-biaoji',
      'id': 'cdiscount8',
      'pid': 'cdiscount1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'cdiscount',
      'id': 'cdiscount2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'cdiscount1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=cdiscount',
      'dataItemNum': '0',
      'id': 'cdiscount3',
      'pid': 'cdiscount2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=cdiscount',
      'dataItemNum': '0',
      'id': 'cdiscount4',
      'pid': 'cdiscount2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=cdiscount',
      'dataItemNum': '0',
      'id': 'cdiscount5',
      'pid': 'cdiscount2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'cdiscount',
      'id': 'cdiscount9',
      'icon': 'icon-wuliu1',
      'pid': 'cdiscount1',
      'link': './commonOrder.html#/matchTheLogistics?platform=cdiscount',
      'menuKey': 'cdiscount_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=cdiscount',
      'icon': 'icon-shougong',
      'id': 'cdiscount16',
      'pid': 'cdiscount1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=cdiscount',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'cdiscount19',
      'pid': 'cdiscount1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'cdiscount',
      'id': 'cdiscount11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'cdiscount1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_importTask',
      'link': './commonOrder.html#/importTask?platform=cdiscount',
      'id': 'cdiscount12',
      'pid': 'cdiscount11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'cdiscount',
      'menuKey': 'cdiscount_exportTask',
      'link': './commonOrder.html#/exportTask?platform=cdiscount',
      'id': 'cdiscount13',
      'pid': 'cdiscount11'
    }
  ],
  factorymarket: [
    {
      'mainTitle': 'factorymarket',
      'platformType': 'factorymarket',
      'link': './commonOrder.html#/messageToBeProcessed?platform=factorymarket',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'factorymarket1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=factorymarket',
      'icon': 'icon-sousuowushuju',
      'id': 'factorymarket10',
      'pid': 'factorymarket1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=factorymarket',
      'icon': 'iconjinggao',
      'id': 'factorymarket7',
      'pid': 'factorymarket1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=factorymarket',
      'dataItemNum': '0',
      'id': 'factorymarket6',
      'pid': 'factorymarket2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_markShipments',
      'link': './commonOrder.html#/markShipments?platform=factorymarket',
      'icon': 'icon-biaoji',
      'id': 'factorymarket8',
      'pid': 'factorymarket1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'factorymarket',
      'id': 'factorymarket2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'factorymarket1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=factorymarket',
      'dataItemNum': '0',
      'id': 'factorymarket3',
      'pid': 'factorymarket2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=factorymarket',
      'dataItemNum': '0',
      'id': 'factorymarket4',
      'pid': 'factorymarket2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=factorymarket',
      'dataItemNum': '0',
      'id': 'factorymarket5',
      'pid': 'factorymarket2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'factorymarket',
      'id': 'factorymarket9',
      'icon': 'icon-wuliu1',
      'pid': 'factorymarket1',
      'link': './commonOrder.html#/matchTheLogistics?platform=factorymarket',
      'menuKey': 'factorymarket_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=factorymarket',
      'icon': 'icon-shougong',
      'id': 'factorymarket16',
      'pid': 'factorymarket1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=factorymarket',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'factorymarket19',
      'pid': 'factorymarket1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'factorymarket',
      'id': 'factorymarket11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'factorymarket1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_importTask',
      'link': './commonOrder.html#/importTask?platform=factorymarket',
      'id': 'factorymarket12',
      'pid': 'factorymarket11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'factorymarket',
      'menuKey': 'factorymarket_exportTask',
      'link': './commonOrder.html#/exportTask?platform=factorymarket',
      'id': 'factorymarket13',
      'pid': 'factorymarket11'
    }
  ],
  mycom: [
    {
      'mainTitle': 'mycom',
      'platformType': 'mycom',
      'link': './commonOrder.html#/messageToBeProcessed?platform=mycom',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'mycom1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'mycom',
      'menuKey': 'mycom_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=mycom',
      'icon': 'icon-sousuowushuju',
      'id': 'mycom10',
      'pid': 'mycom1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'mycom',
      'menuKey': 'mycom_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=mycom',
      'icon': 'iconjinggao',
      'id': 'mycom7',
      'pid': 'mycom1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'mycom',
      'menuKey': 'mycom_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=mycom',
      'dataItemNum': '0',
      'id': 'mycom6',
      'pid': 'mycom2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'mycom',
      'menuKey': 'mycom_markShipments',
      'link': './commonOrder.html#/markShipments?platform=mycom',
      'icon': 'icon-biaoji',
      'id': 'mycom8',
      'pid': 'mycom1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'mycom',
      'id': 'mycom2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'mycom1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'mycom',
      'menuKey': 'mycom_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=mycom',
      'dataItemNum': '0',
      'id': 'mycom3',
      'pid': 'mycom2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'mycom',
      'menuKey': 'mycom_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=mycom',
      'dataItemNum': '0',
      'id': 'mycom4',
      'pid': 'mycom2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'mycom',
      'menuKey': 'mycom_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=mycom',
      'dataItemNum': '0',
      'id': 'mycom5',
      'pid': 'mycom2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'mycom',
      'id': 'mycom9',
      'icon': 'icon-wuliu1',
      'pid': 'mycom1',
      'link': './commonOrder.html#/matchTheLogistics?platform=mycom',
      'menuKey': 'mycom_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'mycom',
      'menuKey': 'mycom_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=mycom',
      'icon': 'icon-shougong',
      'id': 'mycom16',
      'pid': 'mycom1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'mycom',
      'menuKey': 'mycom_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=mycom',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'mycom19',
      'pid': 'mycom1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'mycom',
      'id': 'mycom11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'mycom1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'mycom',
      'menuKey': 'mycom_importTask',
      'link': './commonOrder.html#/importTask?platform=mycom',
      'id': 'mycom12',
      'pid': 'mycom11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'mycom',
      'menuKey': 'mycom_exportTask',
      'link': './commonOrder.html#/exportTask?platform=mycom',
      'id': 'mycom13',
      'pid': 'mycom11'
    }
  ],
  newegg: [
    {
      'mainTitle': 'newegg',
      'platformType': 'newegg',
      'link': './commonOrder.html#/messageToBeProcessed?platform=newegg',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'newegg1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'newegg',
      'menuKey': 'newegg_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=newegg',
      'icon': 'icon-sousuowushuju',
      'id': 'newegg10',
      'pid': 'newegg1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'newegg',
      'menuKey': 'newegg_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=newegg',
      'icon': 'iconjinggao',
      'id': 'newegg7',
      'pid': 'newegg1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'newegg',
      'menuKey': 'newegg_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=newegg',
      'dataItemNum': '0',
      'id': 'newegg6',
      'pid': 'newegg2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'newegg',
      'menuKey': 'newegg_markShipments',
      'link': './commonOrder.html#/markShipments?platform=newegg',
      'icon': 'icon-biaoji',
      'id': 'newegg8',
      'pid': 'newegg1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'newegg',
      'id': 'newegg2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'newegg1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'newegg',
      'menuKey': 'newegg_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=newegg',
      'dataItemNum': '0',
      'id': 'newegg3',
      'pid': 'newegg2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'newegg',
      'menuKey': 'newegg_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=newegg',
      'dataItemNum': '0',
      'id': 'newegg4',
      'pid': 'newegg2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'newegg',
      'menuKey': 'newegg_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=newegg',
      'dataItemNum': '0',
      'id': 'newegg5',
      'pid': 'newegg2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'newegg',
      'id': 'newegg9',
      'icon': 'icon-wuliu1',
      'pid': 'newegg1',
      'link': './commonOrder.html#/matchTheLogistics?platform=newegg',
      'menuKey': 'newegg_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'newegg',
      'menuKey': 'newegg_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=newegg',
      'icon': 'icon-shougong',
      'id': 'newegg16',
      'pid': 'newegg1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'newegg',
      'menuKey': 'newegg_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=newegg',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'newegg19',
      'pid': 'newegg1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'newegg',
      'id': 'newegg11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'newegg1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'newegg',
      'menuKey': 'newegg_importTask',
      'link': './commonOrder.html#/importTask?platform=newegg',
      'id': 'newegg12',
      'pid': 'newegg11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'newegg',
      'menuKey': 'newegg_exportTask',
      'link': './commonOrder.html#/exportTask?platform=newegg',
      'id': 'newegg13',
      'pid': 'newegg11'
    }
  ],
  priceminister: [
    {
      'mainTitle': 'priceminister',
      'platformType': 'priceminister',
      'link': './commonOrder.html#/messageToBeProcessed?platform=priceminister',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'priceminister1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=priceminister',
      'icon': 'icon-sousuowushuju',
      'id': 'priceminister10',
      'pid': 'priceminister1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=priceminister',
      'icon': 'iconjinggao',
      'id': 'priceminister7',
      'pid': 'priceminister1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=priceminister',
      'dataItemNum': '0',
      'id': 'priceminister6',
      'pid': 'priceminister2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_markShipments',
      'link': './commonOrder.html#/markShipments?platform=priceminister',
      'icon': 'icon-biaoji',
      'id': 'priceminister8',
      'pid': 'priceminister1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'priceminister',
      'id': 'priceminister2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'priceminister1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'priceminister',
      'menuKey': 'priceminister_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=priceminister',
      'dataItemNum': '0',
      'id': 'priceminister3',
      'pid': 'priceminister2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=priceminister',
      'dataItemNum': '0',
      'id': 'priceminister4',
      'pid': 'priceminister2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=priceminister',
      'dataItemNum': '0',
      'id': 'priceminister5',
      'pid': 'priceminister2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'priceminister',
      'id': 'priceminister9',
      'icon': 'icon-wuliu1',
      'pid': 'priceminister1',
      'link': './commonOrder.html#/matchTheLogistics?platform=priceminister',
      'menuKey': 'priceminister_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=priceminister',
      'icon': 'icon-shougong',
      'id': 'priceminister16',
      'pid': 'priceminister1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=priceminister',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'priceminister19',
      'pid': 'priceminister1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'priceminister',
      'id': 'priceminister11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'priceminister1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_importTask',
      'link': './commonOrder.html#/importTask?platform=priceminister',
      'id': 'priceminister12',
      'pid': 'priceminister11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'priceminister',
      'menuKey': 'priceminister_exportTask',
      'link': './commonOrder.html#/exportTask?platform=priceminister',
      'id': 'priceminister13',
      'pid': 'priceminister11'
    }
  ],
  tophatter: [
    {
      'mainTitle': 'tophatter',
      'platformType': 'tophatter',
      'link': './commonOrder.html#/messageToBeProcessed?platform=tophatter',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'tophatter1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=tophatter',
      'icon': 'icon-sousuowushuju',
      'id': 'tophatter10',
      'pid': 'tophatter1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=tophatter',
      'icon': 'iconjinggao',
      'id': 'tophatter7',
      'pid': 'tophatter1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=tophatter',
      'dataItemNum': '0',
      'id': 'tophatter6',
      'pid': 'tophatter2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_markShipments',
      'link': './commonOrder.html#/markShipments?platform=tophatter',
      'icon': 'icon-biaoji',
      'id': 'tophatter8',
      'pid': 'tophatter1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'tophatter',
      'id': 'tophatter2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'tophatter1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'tophatter',
      'menuKey': 'tophatter_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=tophatter',
      'dataItemNum': '0',
      'id': 'tophatter3',
      'pid': 'tophatter2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=tophatter',
      'dataItemNum': '0',
      'id': 'tophatter4',
      'pid': 'tophatter2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=tophatter',
      'dataItemNum': '0',
      'id': 'tophatter5',
      'pid': 'tophatter2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'tophatter',
      'id': 'tophatter9',
      'icon': 'icon-wuliu1',
      'pid': 'tophatter1',
      'link': './commonOrder.html#/matchTheLogistics?platform=tophatter',
      'menuKey': 'tophatter_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=tophatter',
      'icon': 'icon-shougong',
      'id': 'tophatter16',
      'pid': 'tophatter1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=tophatter',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'tophatter19',
      'pid': 'tophatter1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'tophatter',
      'id': 'tophatter11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'tophatter1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_importTask',
      'link': './commonOrder.html#/importTask?platform=tophatter',
      'id': 'tophatter12',
      'pid': 'tophatter11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'tophatter',
      'menuKey': 'tophatter_exportTask',
      'link': './commonOrder.html#/exportTask?platform=tophatter',
      'id': 'tophatter13',
      'pid': 'tophatter11'
    }
  ],
  vova: [
    {
      'mainTitle': 'vova',
      'platformType': 'vova',
      'link': './commonOrder.html#/messageToBeProcessed?platform=vova',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'vova1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'vova',
      'menuKey': 'vova_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=vova',
      'icon': 'icon-sousuowushuju',
      'id': 'vova10',
      'pid': 'vova1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'vova',
      'menuKey': 'vova_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=vova',
      'icon': 'iconjinggao',
      'id': 'vova7',
      'pid': 'vova1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'vova',
      'menuKey': 'vova_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=vova',
      'dataItemNum': '0',
      'id': 'vova6',
      'pid': 'vova2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'vova',
      'menuKey': 'vova_markShipments',
      'link': './commonOrder.html#/markShipments?platform=vova',
      'icon': 'icon-biaoji',
      'id': 'vova8',
      'pid': 'vova1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'vova',
      'id': 'vova2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'vova1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'vova',
      'menuKey': 'vova_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=vova',
      'dataItemNum': '0',
      'id': 'vova3',
      'pid': 'vova2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'vova',
      'menuKey': 'vova_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=vova',
      'dataItemNum': '0',
      'id': 'vova4',
      'pid': 'vova2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'vova',
      'menuKey': 'vova_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=vova',
      'dataItemNum': '0',
      'id': 'vova5',
      'pid': 'vova2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'vova',
      'id': 'vova9',
      'icon': 'icon-wuliu1',
      'pid': 'vova1',
      'link': './commonOrder.html#/matchTheLogistics?platform=vova',
      'menuKey': 'vova_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'vova',
      'menuKey': 'vova_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=vova',
      'icon': 'icon-shougong',
      'id': 'vova16',
      'pid': 'vova1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'vova',
      'menuKey': 'vova_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=vova',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'vova19',
      'pid': 'vova1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'vova',
      'id': 'vova11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'vova1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'vova',
      'menuKey': 'vova_importTask',
      'link': './commonOrder.html#/importTask?platform=vova',
      'id': 'vova12',
      'pid': 'vova11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'vova',
      'menuKey': 'vova_exportTask',
      'link': './commonOrder.html#/exportTask?platform=vova',
      'id': 'vova13',
      'pid': 'vova11'
    }
  ],
  mercadolibre: [
    {
      'mainTitle': 'mercadolibre',
      'platformType': 'mercadolibre',
      'link': './commonOrder.html#/messageToBeProcessed?platform=mercadolibre',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'mercadolibre1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=mercadolibre',
      'icon': 'icon-sousuowushuju',
      'id': 'mercadolibre10',
      'pid': 'mercadolibre1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=mercadolibre',
      'icon': 'iconjinggao',
      'id': 'mercadolibre7',
      'pid': 'mercadolibre1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=mercadolibre',
      'dataItemNum': '0',
      'id': 'mercadolibre6',
      'pid': 'mercadolibre2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_markShipments',
      'link': './commonOrder.html#/markShipments?platform=mercadolibre',
      'icon': 'icon-biaoji',
      'id': 'mercadolibre8',
      'pid': 'mercadolibre1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'mercadolibre',
      'id': 'mercadolibre2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'mercadolibre1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=mercadolibre',
      'dataItemNum': '0',
      'id': 'mercadolibre3',
      'pid': 'mercadolibre2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=mercadolibre',
      'dataItemNum': '0',
      'id': 'mercadolibre4',
      'pid': 'mercadolibre2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=mercadolibre',
      'dataItemNum': '0',
      'id': 'mercadolibre5',
      'pid': 'mercadolibre2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'mercadolibre',
      'id': 'mercadolibre9',
      'icon': 'icon-wuliu1',
      'pid': 'mercadolibre1',
      'link': './commonOrder.html#/matchTheLogistics?platform=mercadolibre',
      'menuKey': 'mercadolibre_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=mercadolibre',
      'icon': 'icon-shougong',
      'id': 'mercadolibre16',
      'pid': 'mercadolibre1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=mercadolibre',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'mercadolibre19',
      'pid': 'mercadolibre1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'mercadolibre',
      'id': 'mercadolibre11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'mercadolibre1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_importTask',
      'link': './commonOrder.html#/importTask?platform=mercadolibre',
      'id': 'mercadolibre12',
      'pid': 'mercadolibre11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'mercadolibre',
      'menuKey': 'mercadolibre_exportTask',
      'link': './commonOrder.html#/exportTask?platform=mercadolibre',
      'id': 'mercadolibre13',
      'pid': 'mercadolibre11'
    }
  ],
  real: [
    {
      'mainTitle': 'real',
      'platformType': 'real',
      'link': './commonOrder.html#/messageToBeProcessed?platform=real',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'real1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'real',
      'menuKey': 'real_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=real',
      'icon': 'icon-sousuowushuju',
      'id': 'real10',
      'pid': 'real1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'real',
      'menuKey': 'real_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=real',
      'icon': 'iconjinggao',
      'id': 'real7',
      'pid': 'real1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'real',
      'menuKey': 'real_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=real',
      'dataItemNum': '0',
      'id': 'real6',
      'pid': 'real2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'real',
      'menuKey': 'real_markShipments',
      'link': './commonOrder.html#/markShipments?platform=real',
      'icon': 'icon-biaoji',
      'id': 'real8',
      'pid': 'real1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'real',
      'id': 'real2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'real1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'real',
      'menuKey': 'real_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=real',
      'dataItemNum': '0',
      'id': 'real3',
      'pid': 'real2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'real',
      'menuKey': 'real_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=real',
      'dataItemNum': '0',
      'id': 'real4',
      'pid': 'real2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'real',
      'menuKey': 'real_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=real',
      'dataItemNum': '0',
      'id': 'real5',
      'pid': 'real2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'real',
      'id': 'real9',
      'icon': 'icon-wuliu1',
      'pid': 'real1',
      'link': './commonOrder.html#/matchTheLogistics?platform=real',
      'menuKey': 'real_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'real',
      'menuKey': 'real_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=real',
      'icon': 'icon-shougong',
      'id': 'real16',
      'pid': 'real1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'real',
      'menuKey': 'real_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=real',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'real19',
      'pid': 'real1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'real',
      'id': 'real11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'real1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'real',
      'menuKey': 'real_importTask',
      'link': './commonOrder.html#/importTask?platform=real',
      'id': 'real12',
      'pid': 'real11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'real',
      'menuKey': 'real_exportTask',
      'link': './commonOrder.html#/exportTask?platform=real',
      'id': 'real13',
      'pid': 'real11'
    }
  ],
  allegro: [
    {
      'mainTitle': 'allegro',
      'platformType': 'allegro',
      'link': './commonOrder.html#/messageToBeProcessed?platform=allegro',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'allegro1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'allegro',
      'menuKey': 'allegro_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=allegro',
      'icon': 'icon-sousuowushuju',
      'id': 'allegro10',
      'pid': 'allegro1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'allegro',
      'menuKey': 'allegro_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=allegro',
      'icon': 'iconjinggao',
      'id': 'allegro7',
      'pid': 'allegro1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'allegro',
      'menuKey': 'allegro_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=allegro',
      'dataItemNum': '0',
      'id': 'allegro6',
      'pid': 'allegro2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'allegro',
      'menuKey': 'allegro_markShipments',
      'link': './commonOrder.html#/markShipments?platform=allegro',
      'icon': 'icon-biaoji',
      'id': 'allegro8',
      'pid': 'allegro1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'allegro',
      'id': 'allegro2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'allegro1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'allegro',
      'menuKey': 'allegro_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=allegro',
      'dataItemNum': '0',
      'id': 'allegro3',
      'pid': 'allegro2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'allegro',
      'menuKey': 'allegro_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=allegro',
      'dataItemNum': '0',
      'id': 'allegro4',
      'pid': 'allegro2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'allegro',
      'menuKey': 'allegro_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=allegro',
      'dataItemNum': '0',
      'id': 'allegro5',
      'pid': 'allegro2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'allegro',
      'id': 'allegro9',
      'icon': 'icon-wuliu1',
      'pid': 'allegro1',
      'link': './commonOrder.html#/matchTheLogistics?platform=allegro',
      'menuKey': 'allegro_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'allegro',
      'menuKey': 'allegro_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=allegro',
      'icon': 'icon-shougong',
      'id': 'allegro16',
      'pid': 'allegro1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'allegro',
      'menuKey': 'allegro_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=allegro',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'allegro19',
      'pid': 'allegro1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'allegro',
      'id': 'allegro11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'allegro1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'allegro',
      'menuKey': 'allegro_importTask',
      'link': './commonOrder.html#/importTask?platform=allegro',
      'id': 'allegro12',
      'pid': 'allegro11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'allegro',
      'menuKey': 'allegro_exportTask',
      'link': './commonOrder.html#/exportTask?platform=allegro',
      'id': 'allegro13',
      'pid': 'allegro11'
    }
  ],
  otto: [
    {
      'mainTitle': 'otto',
      'platformType': 'otto',
      'link': './commonOrder.html#/messageToBeProcessed?platform=otto',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'otto1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'otto',
      'menuKey': 'otto_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=otto',
      'icon': 'icon-sousuowushuju',
      'id': 'otto10',
      'pid': 'otto1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'otto',
      'menuKey': 'otto_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=otto',
      'icon': 'iconjinggao',
      'id': 'otto7',
      'pid': 'otto1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'otto',
      'menuKey': 'otto_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=otto',
      'dataItemNum': '0',
      'id': 'otto6',
      'pid': 'otto2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'otto',
      'menuKey': 'otto_markShipments',
      'link': './commonOrder.html#/markShipments?platform=otto',
      'icon': 'icon-biaoji',
      'id': 'otto8',
      'pid': 'otto1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'otto',
      'id': 'otto2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'otto1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'otto',
      'menuKey': 'otto_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=otto',
      'dataItemNum': '0',
      'id': 'otto3',
      'pid': 'otto2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'otto',
      'menuKey': 'otto_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=otto',
      'dataItemNum': '0',
      'id': 'otto4',
      'pid': 'otto2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'otto',
      'menuKey': 'otto_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=otto',
      'dataItemNum': '0',
      'id': 'otto5',
      'pid': 'otto2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'otto',
      'id': 'otto9',
      'icon': 'icon-wuliu1',
      'pid': 'otto1',
      'link': './commonOrder.html#/matchTheLogistics?platform=otto',
      'menuKey': 'otto_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'otto',
      'menuKey': 'otto_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=otto',
      'icon': 'icon-shougong',
      'id': 'otto16',
      'pid': 'otto1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'otto',
      'menuKey': 'otto_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=otto',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'otto19',
      'pid': 'otto1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'otto',
      'id': 'otto11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'otto1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'otto',
      'menuKey': 'otto_importTask',
      'link': './commonOrder.html#/importTask?platform=otto',
      'id': 'otto12',
      'pid': 'otto11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'otto',
      'menuKey': 'otto_exportTask',
      'link': './commonOrder.html#/exportTask?platform=otto',
      'id': 'otto13',
      'pid': 'otto11'
    }, {
      'mainTitle': '退货包裹',
      'platformType': 'otto',
      'menuKey': 'otto_returnPackage',
      'link': './commonOrder.html#/returnPackage?platform=otto',
      'id': 'otto20',
      'pid': 'otto1'
    }, {
      'mainTitle': '退款申请',
      'platformType': 'otto',
      'menuKey': 'otto_refundProcess',
      'link': './commonOrder.html#/refundProcess?platform=otto',
      'id': 'otto20',
      'pid': 'otto1'
    }
  ],
  tiktok: [
    {
      'mainTitle': 'Tiktok',
      'platformType': 'tiktok',
      'menuKey': 'Group',
      'link': './commonOrder.html#/messageToBeProcessed?platform=tiktok',
      'type': 'Group', // 没有子菜单
      'alias': 'messageToBeProcessed',
      'id': 'tiktok1'
    },
    {
      'mainTitle': '订单检索',
      'platformType': 'tiktok',
      'menuKey': 'tiktok_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=tiktok',
      'icon': 'icon-sousuowushuju',
      'id': 'tiktok12',
      'pid': 'tiktok1'
    },
    {
      'mainTitle': '异常订单',
      'platformType': 'tiktok',
      'menuKey': 'tiktok_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=tiktok',
      'icon': 'iconjinggao',
      'id': 'tiktok7',
      'pid': 'tiktok1'
    },
    {
      'mainTitle': '截留订单',
      'platformType': 'tiktok',
      'menuKey': 'tiktok_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=tiktok',
      'dataItemNum': '0',
      'id': 'tiktok6',
      'pid': 'tiktok2'
    },
    {
      'mainTitle': '标发货',
      'platformType': 'tiktok',
      'menuKey': 'tiktok_markShipments',
      'link': './commonOrder.html#/markShipments?platform=tiktok',
      'icon': 'icon-biaoji',
      'id': 'tiktok8',
      'pid': 'tiktok1'
    },
    {
      'mainTitle': '订单审核', // 订单审核
      'platformType': 'tiktok',
      'id': 'tiktok2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'tiktok1'
    },
    {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'tiktok',
      'menuKey': 'tiktok_messageToBeProcessed', // menukey匹配菜单订单数
      'link': './commonOrder.html#/messageToBeProcessed?platform=tiktok',
      'dataItemNum': '0',
      'id': 'tiktok3',
      'pid': 'tiktok2'
    },
    {
      'mainTitle': '未匹配商品', // 未匹配商品
      'platformType': 'tiktok',
      'menuKey': 'tiktok_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=tiktok',
      'dataItemNum': '0',
      'id': 'tiktok4',
      'pid': 'tiktok2'
    },
    {
      'mainTitle': '可合并',
      'platformType': 'tiktok',
      'menuKey': 'tiktok_combineOrder',
      'link': './tiktok.html#/combineOrder',
      'dataItemNum': '0',
      'id': 'tiktok5',
      'pid': 'tiktok2'
    },
    // {
    //   'mainTitle': '未付款',
    //   'platformType': 'tiktok',
    //   'menuKey': 'tiktok_nonPayment',
    //   'link': './tiktok.html#/nonPayment',
    //   'icon': 'icon-fukuan',
    //   'id': 'tiktok9',
    //   'pid': 'tiktok1'
    // },
    {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'tiktok',
      'id': 'tiktok10',
      'icon': 'icon-wuliu1',
      'pid': 'tiktok1',
      'dataItemNum': '0',
      'link': './tiktok.html#/matchTheLogistics',
      'menuKey': 'tiktok_matchTheLogistics'
    },
    {
      'mainTitle': '已取消订单', // 已取消订单
      'platformType': 'tiktok',
      'menuKey': 'tiktok_cancelOrder',
      'link': './tiktok.html#/cancelOrder',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'tiktok11',
      'pid': 'tiktok1'
    },
    {
      'mainTitle': '手工订单',
      'platformType': 'tiktok',
      'menuKey': 'tiktok_manualOrder',
      'link': './tiktok.html#/manualOrder',
      'icon': 'icon-shougong',
      'id': 'tiktok16',
      'pid': 'tiktok1'
    },
    {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'tiktok',
      'id': 'tiktok13',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'tiktok1'
    },
    {
      'mainTitle': '导入查看',
      'platformType': 'tiktok',
      'menuKey': 'tiktok_importTask',
      'link': './tiktok.html#/importTask',
      'id': 'tiktok14',
      'pid': 'tiktok13'
    },
    {
      'mainTitle': '导出查看',
      'platformType': 'tiktok',
      'menuKey': 'tiktok_exportTask',
      'link': './tiktok.html#/exportTask',
      'id': 'tiktok15',
      'pid': 'tiktok13'
    }
  ],
  temux: [
    {
      'mainTitle': 'temux',
      'platformType': 'temux',
      'link': './commonOrder.html#/messageToBeProcessed?platform=temux',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'temux1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'temux',
      'menuKey': 'temux_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=temux',
      'icon': 'icon-sousuowushuju',
      'id': 'temux10',
      'pid': 'temux1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'temux',
      'menuKey': 'temux_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=temux',
      'icon': 'iconjinggao',
      'id': 'temux7',
      'pid': 'temux1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'temux',
      'menuKey': 'temux_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=temux',
      'dataItemNum': '0',
      'id': 'temux6',
      'pid': 'temux2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'temux',
      'menuKey': 'temux_markShipments',
      'link': './commonOrder.html#/markShipments?platform=temux',
      'icon': 'icon-biaoji',
      'id': 'temux8',
      'pid': 'temux1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'temux',
      'id': 'temux2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'temux1'
    },
    // {
    //   'mainTitle': '有留言', // 留言待处理
    //   'platformType': 'temux',
    //   'menuKey': 'temux_messageToBeProcessed',
    //   'link': './commonOrder.html#/messageToBeProcessed?platform=temux',
    //   'dataItemNum': '0',
    //   'id': 'temux3',
    //   'pid': 'temux2'
    // },
    {
      'mainTitle': '未匹配商品',
      'platformType': 'temux',
      'menuKey': 'temux_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=temux',
      'dataItemNum': '0',
      'id': 'temux4',
      'pid': 'temux2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'temux',
      'menuKey': 'temux_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=temux',
      'dataItemNum': '0',
      'id': 'temux5',
      'pid': 'temux2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'temux',
      'id': 'temux9',
      'icon': 'icon-wuliu1',
      'pid': 'temux1',
      'link': './commonOrder.html#/matchTheLogistics?platform=temux',
      'menuKey': 'temux_matchTheLogistics'
    },
    {
      'mainTitle': '已取消订单',
      'platformType': 'temux',
      'menuKey': 'temux_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=temux',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'temux19',
      'pid': 'temux1'
    },
    {
      'mainTitle': '手工订单',
      'platformType': 'temux',
      'menuKey': 'temux_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=temux',
      'icon': 'icon-shougong',
      'id': 'temux16',
      'pid': 'temux1'
    },
    {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'temux',
      'id': 'temux11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'temux1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'temux',
      'menuKey': 'temux_importTask',
      'link': './commonOrder.html#/importTask?platform=temux',
      'id': 'temux12',
      'pid': 'temux11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'temux',
      'menuKey': 'temux_exportTask',
      'link': './commonOrder.html#/exportTask?platform=temux',
      'id': 'temux13',
      'pid': 'temux11'
    }
  ],
  ozon: [
    {
      'mainTitle': 'OZON',
      'platformType': 'ozon',
      'menuKey': 'Group',
      'link': './commonOrder.html#/messageToBeProcessed?platform=ozon',
      'type': 'Group', // 没有子菜单
      'alias': 'messageToBeProcessed',
      'id': 'ozon1'
    },
    {
      'mainTitle': '订单检索',
      'platformType': 'ozon',
      'menuKey': 'ozon_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=ozon',
      'icon': 'icon-sousuowushuju',
      'id': 'ozon12',
      'pid': 'ozon1'
    },
    {
      'mainTitle': '异常订单',
      'platformType': 'ozon',
      'menuKey': 'ozon_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=ozon',
      'icon': 'iconjinggao',
      'id': 'ozon7',
      'pid': 'ozon1'
    },
    {
      'mainTitle': '截留订单',
      'platformType': 'ozon',
      'menuKey': 'ozon_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=ozon',
      'dataItemNum': '0',
      'id': 'ozon6',
      'pid': 'ozon2'
    },
    {
      'mainTitle': '标发货',
      'platformType': 'ozon',
      'menuKey': 'ozon_markShipments',
      'link': './commonOrder.html#/markShipments?platform=ozon',
      'icon': 'icon-biaoji',
      'id': 'ozon8',
      'pid': 'ozon1'
    },
    {
      'mainTitle': '平台仓订单',
      'platformType': 'ozon',
      'menuKey': 'ozon_platformShippedOrder',
      'link': './commonOrder.html#/platformShippedOrder?platform=ozon',
      'icon': 'icon-sousuowushuju',
      'id': 'ozon17',
      'pid': 'ozon1'
    },
    {
      'mainTitle': '订单审核', // 订单审核
      'platformType': 'ozon',
      'id': 'ozon2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'ozon1'
    },
    {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'ozon',
      'menuKey': 'ozon_messageToBeProcessed', // menukey匹配菜单订单数
      'link': './commonOrder.html#/messageToBeProcessed?platform=ozon',
      'dataItemNum': '0',
      'id': 'ozon3',
      'pid': 'ozon2'
    },
    {
      'mainTitle': '未匹配商品', // 未匹配商品
      'platformType': 'ozon',
      'menuKey': 'ozon_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=ozon',
      'dataItemNum': '0',
      'id': 'ozon4',
      'pid': 'ozon2'
    },
    {
      'mainTitle': '可合并',
      'platformType': 'ozon',
      'menuKey': 'ozon_combineOrder',
      'link': './ozon.html#/combineOrder',
      'dataItemNum': '0',
      'id': 'ozon5',
      'pid': 'ozon2'
    },
    // {
    //   'mainTitle': '未付款',
    //   'platformType': 'ozon',
    //   'menuKey': 'ozon_nonPayment',
    //   'link': './ozon.html#/nonPayment',
    //   'icon': 'icon-fukuan',
    //   'id': 'ozon9',
    //   'pid': 'ozon1'
    // },
    {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'ozon',
      'id': 'ozon10',
      'icon': 'icon-wuliu1',
      'pid': 'ozon1',
      'dataItemNum': '0',
      'link': './ozon.html#/matchTheLogistics',
      'menuKey': 'ozon_matchTheLogistics'
    },
    {
      'mainTitle': '已取消订单', // 已取消订单
      'platformType': 'ozon',
      'menuKey': 'ozon_cancelOrder',
      'link': './ozon.html#/cancelOrder',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'ozon11',
      'pid': 'ozon1'
    },
    {
      'mainTitle': '手工订单',
      'platformType': 'ozon',
      'menuKey': 'ozon_manualOrder',
      'link': './ozon.html#/manualOrder',
      'icon': 'icon-shougong',
      'id': 'ozon16',
      'pid': 'ozon1'
    },
    {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'ozon',
      'id': 'ozon13',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'ozon1'
    },
    {
      'mainTitle': '导入查看',
      'platformType': 'ozon',
      'menuKey': 'ozon_importTask',
      'link': './ozon.html#/importTask',
      'id': 'ozon14',
      'pid': 'ozon13'
    },
    {
      'mainTitle': '导出查看',
      'platformType': 'ozon',
      'menuKey': 'ozon_exportTask',
      'link': './ozon.html#/exportTask',
      'id': 'ozon15',
      'pid': 'ozon13'
    }
  ],
  // shein 半托管
  sheinx: [
    {
      'mainTitle': 'sheinx',
      'platformType': 'sheinx',
      'link': './commonOrder.html#/messageToBeProcessed?platform=sheinx',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'sheinx1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=sheinx',
      'icon': 'icon-sousuowushuju',
      'id': 'sheinx10',
      'pid': 'sheinx1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=sheinx',
      'icon': 'iconjinggao',
      'id': 'sheinx7',
      'pid': 'sheinx1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=sheinx',
      'dataItemNum': '0',
      'id': 'sheinx6',
      'pid': 'sheinx2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_markShipments',
      'link': './commonOrder.html#/markShipments?platform=sheinx',
      'icon': 'icon-biaoji',
      'id': 'sheinx8',
      'pid': 'sheinx1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'sheinx',
      'id': 'sheinx2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'sheinx1'
    },
    // {
    //   'mainTitle': '有留言', // 留言待处理
    //   'platformType': 'sheinx',
    //   'menuKey': 'sheinx_messageToBeProcessed',
    //   'link': './commonOrder.html#/messageToBeProcessed?platform=sheinx',
    //   'dataItemNum': '0',
    //   'id': 'sheinx3',
    //   'pid': 'sheinx2'
    // },
    {
      'mainTitle': '未匹配商品',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=sheinx',
      'dataItemNum': '0',
      'id': 'sheinx4',
      'pid': 'sheinx2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=sheinx',
      'dataItemNum': '0',
      'id': 'sheinx5',
      'pid': 'sheinx2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'sheinx',
      'id': 'sheinx9',
      'icon': 'icon-wuliu1',
      'pid': 'sheinx1',
      'link': './commonOrder.html#/matchTheLogistics?platform=sheinx',
      'menuKey': 'sheinx_matchTheLogistics'
    },
    {
      'mainTitle': '已取消订单',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=sheinx',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'sheinx19',
      'pid': 'sheinx1'
    },
    {
      'mainTitle': '手工订单',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=sheinx',
      'icon': 'icon-shougong',
      'id': 'sheinx16',
      'pid': 'sheinx1'
    },
    {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'sheinx',
      'id': 'sheinx11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'sheinx1'
    },
    {
      'mainTitle': '导入查看',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_importTask',
      'link': './commonOrder.html#/importTask?platform=sheinx',
      'id': 'sheinx12',
      'pid': 'sheinx11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'sheinx',
      'menuKey': 'sheinx_exportTask',
      'link': './commonOrder.html#/exportTask?platform=sheinx',
      'id': 'sheinx13',
      'pid': 'sheinx11'
    }
  ],
  miravia: [
    {
      'mainTitle': 'miravia',
      'platformType': 'miravia',
      'link': './commonOrder.html#/messageToBeProcessed?platform=miravia',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'miravia1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'miravia',
      'menuKey': 'miravia_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=miravia',
      'icon': 'icon-sousuowushuju',
      'id': 'miravia10',
      'pid': 'miravia1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'miravia',
      'menuKey': 'miravia_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=miravia',
      'icon': 'iconjinggao',
      'id': 'miravia7',
      'pid': 'miravia1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'miravia',
      'menuKey': 'miravia_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=miravia',
      'dataItemNum': '0',
      'id': 'miravia6',
      'pid': 'miravia2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'miravia',
      'menuKey': 'miravia_markShipments',
      'link': './commonOrder.html#/markShipments?platform=miravia',
      'icon': 'icon-biaoji',
      'id': 'miravia8',
      'pid': 'miravia1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'miravia',
      'id': 'miravia2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'miravia1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'miravia',
      'menuKey': 'miravia_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=miravia',
      'dataItemNum': '0',
      'id': 'miravia3',
      'pid': 'miravia2'
    }, {
      'mainTitle': '未匹配商品',
      'platformType': 'miravia',
      'menuKey': 'miravia_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=miravia',
      'dataItemNum': '0',
      'id': 'miravia4',
      'pid': 'miravia2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'miravia',
      'menuKey': 'miravia_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=miravia',
      'dataItemNum': '0',
      'id': 'miravia5',
      'pid': 'miravia2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'miravia',
      'id': 'miravia9',
      'icon': 'icon-wuliu1',
      'pid': 'miravia1',
      'link': './commonOrder.html#/matchTheLogistics?platform=miravia',
      'menuKey': 'miravia_matchTheLogistics'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'miravia',
      'menuKey': 'miravia_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=miravia',
      'icon': 'icon-shougong',
      'id': 'miravia16',
      'pid': 'miravia1'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'miravia',
      'menuKey': 'miravia_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=miravia',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'miravia19',
      'pid': 'miravia1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'miravia',
      'id': 'miravia11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'miravia1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'miravia',
      'menuKey': 'miravia_importTask',
      'link': './commonOrder.html#/importTask?platform=miravia',
      'id': 'miravia12',
      'pid': 'miravia11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'miravia',
      'menuKey': 'miravia_exportTask',
      'link': './commonOrder.html#/exportTask?platform=miravia',
      'id': 'miravia13',
      'pid': 'miravia11'
    }
  ],
  // WB平台对接
  wb: [
    {
      'mainTitle': 'wb',
      'platformType': 'wb',
      'link': './commonOrder.html#/messageToBeProcessed?platform=wb',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'wb1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'wb',
      'menuKey': 'wb_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=wb',
      'icon': 'icon-sousuowushuju',
      'id': 'wb10',
      'pid': 'wb1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'wb',
      'menuKey': 'wb_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=wb',
      'icon': 'iconjinggao',
      'id': 'wb7',
      'pid': 'wb1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'wb',
      'menuKey': 'wb_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=wb',
      'dataItemNum': '0',
      'id': 'wb6',
      'pid': 'wb2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'wb',
      'menuKey': 'wb_markShipments',
      'link': './commonOrder.html#/markShipments?platform=wb',
      'icon': 'icon-biaoji',
      'id': 'wb8',
      'pid': 'wb1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'wb',
      'id': 'wb2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'wb1'
    },
    // {
    //   'mainTitle': '有留言', // 留言待处理
    //   'platformType': 'wb',
    //   'menuKey': 'wb_messageToBeProcessed',
    //   'link': './commonOrder.html#/messageToBeProcessed?platform=wb',
    //   'dataItemNum': '0',
    //   'id': 'wb3',
    //   'pid': 'wb2'
    // },
    {
      'mainTitle': '未匹配商品',
      'platformType': 'wb',
      'menuKey': 'wb_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=wb',
      'dataItemNum': '0',
      'id': 'wb4',
      'pid': 'wb2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'wb',
      'menuKey': 'wb_combineOrder',
      'link': './commonOrder.html#/combineOrder?platform=wb',
      'dataItemNum': '0',
      'id': 'wb5',
      'pid': 'wb2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'wb',
      'id': 'wb9',
      'icon': 'icon-wuliu1',
      'pid': 'wb1',
      'link': './commonOrder.html#/matchTheLogistics?platform=wb',
      'menuKey': 'wb_matchTheLogistics'
    },
    {
      'mainTitle': '已取消订单',
      'platformType': 'wb',
      'menuKey': 'wb_cancelOrder',
      'link': './commonOrder.html#/cancelOrder?platform=wb',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'wb19',
      'pid': 'wb1'
    },
    {
      'mainTitle': '手工订单',
      'platformType': 'wb',
      'menuKey': 'wb_manualOrder',
      'link': './commonOrder.html#/manualOrder?platform=wb',
      'icon': 'icon-shougong',
      'id': 'wb16',
      'pid': 'wb1'
    },
    {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'wb',
      'id': 'wb11',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'wb1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'wb',
      'menuKey': 'wb_importTask',
      'link': './commonOrder.html#/importTask?platform=wb',
      'id': 'wb12',
      'pid': 'wb11'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'wb',
      'menuKey': 'wb_exportTask',
      'link': './commonOrder.html#/exportTask?platform=wb',
      'id': 'wb13',
      'pid': 'wb11'
    }
  ],
  orderCommon: [
    {
      'mainTitle': '订单详情', // 订单详情
      'platformType': 'orderCommon',
      'menuKey': 'orderCommon_fullTextSearch',
      'link': '/order.html#/fullTextSearch',
      'type': 'Group', // 没有子菜单
      'alias': 'messageToBeProcessed',
      'id': 'orderCommon1'
    },
    {
      'mainTitle': '订单号',
      'platformType': 'orderCommon',
      'menuKey': 'orderCommon_orderInfoSearch',
      'link': '/order.html#/fullTextSearch1',
      'type': 'Group', // 没有子菜单
      'alias': 'messageToBeProcessed',
      'id': 'orderCommon2'
    },
    {
      'mainTitle': '出库单号',
      'platformType': 'orderCommon',
      'menuKey': 'orderCommon_packageInfoSearch',
      'link': '/order.html#/fullTextSearch2',
      'type': 'Group', // 没有子菜单
      'alias': 'messageToBeProcessed',
      'id': 'orderCommon3'
    },
    {
      'mainTitle': '运单号',
      'platformType': 'orderCommon',
      'menuKey': 'orderCommon_trackingNumberSearch',
      'link': '/order.html#/fullTextSearch3',
      'type': 'Group', // 没有子菜单
      'alias': 'messageToBeProcessed',
      'id': 'orderCommon4'
    }
  ]
};
