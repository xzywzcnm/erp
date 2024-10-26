export default {
  aliexpress: [
    {
      'mainTitle': 'Aliexpress',
      'platformType': 'aliexpress',
      'link': './commonOrder.html#/messageToBeProcessed?platform=aliexpress',
      'alias': 'messageToBeProcessed',
      'type': 'Group', // 分组菜单
      'id': 'aliexpress1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=aliexpress',
      'icon': 'icon-sousuowushuju',
      'id': 'aliexpress13',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '异常订单',
      'menuKey': 'aliexpress_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=aliexpress',
      'icon': 'iconjinggao',
      'id': 'aliexpress9',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=aliexpress',
      'dataItemNum': '0',
      'id': 'aliexpress7',
      'pid': 'aliexpress2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_markShipments',
      'link': './commonOrder.html#/markShipments?platform=aliexpress',
      'icon': 'icon-biaoji',
      'id': 'aliexpress10',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '风控中的订单',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_riskOrder',
      'link': './aliexpress.html#/riskOrder',
      'icon': 'icon-risk',
      'id': 'aliexpress3',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '订单审核',
      'platformType': 'aliexpress',
      'id': 'aliexpress2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_messageToBeProcessed',
      'link': './commonOrder.html#/messageToBeProcessed?platform=aliexpress',
      'dataItemNum': '0',
      'id': 'aliexpress5',
      'pid': 'aliexpress2'
    }, {
      'mainTitle': '未匹配商品', // 未匹配商品
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=aliexpress',
      'dataItemNum': '0',
      'id': 'aliexpress14',
      'pid': 'aliexpress2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_combineOrder',
      'link': './aliexpress.html#/combineOrder',
      'dataItemNum': '0',
      'id': 'aliexpress6',
      'pid': 'aliexpress2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'aliexpress',
      'id': 'aliexpress8',
      'icon': 'icon-wuliu1',
      'pid': 'aliexpress1',
      'dataItemNum': '0',
      'link': './aliexpress.html#/matchTheLogistics',
      'menuKey': 'aliexpress_matchTheLogistics'
    }, {
      'mainTitle': '未付款',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_nonPayment',
      'link': './aliexpress.html#/nonPayment',
      'icon': 'icon-fukuan',
      'id': 'aliexpress11',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '待收货确认',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_waitingForReceivingConfirmation',
      'link': './aliexpress.html#/waitingForReceivingConfirmation',
      'icon': 'icon-dengdaiqueren',
      'id': 'aliexpress12',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '已取消订单', // 已取消订单
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_cancelOrder',
      'link': './aliexpress.html#/cancelOrder',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'aliexpress19',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'ebay',
      'menuKey': 'aliexpress_manualOrder',
      'link': './aliexpress.html#/manualOrder',
      'icon': 'icon-shougong',
      'id': 'aliexpress18',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '全托管订单',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_trusteeshipOrder',
      'link': './aliexpress.html#/trusteeshipOrder?platform=aliexpress',
      'id': 'aliexpress22',
      'icon': 'icon-sousuowushuju',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '菜鸟仓履约订单',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_certificationOrder',
      'link': './aliexpress.html#/certificationOrder?platform=aliexpress',
      'id': 'aliexpress21',
      'icon': 'icon-sousuowushuju',
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'aliexpress',
      'id': 'aliexpress17',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'aliexpress1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_importTask',
      'link': './aliexpress.html#/importTask',
      'id': 'aliexpress15',
      'pid': 'aliexpress17'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'aliexpress',
      'menuKey': 'aliexpress_exportTask',
      'link': './aliexpress.html#/exportTask',
      'id': 'aliexpress16',
      'pid': 'aliexpress17'
    }
  ]
};
