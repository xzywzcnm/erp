export default {
  wish: [
    {
      'mainTitle': 'Wish',
      'platformType': 'wish',
      'menuKey': 'Group',
      'link': './commonOrder.html#/unmatchProduct?platform=wish',
      'type': 'Group', // 没有子菜单
      'alias': 'unmatchProduct',
      'id': 'wish1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'wish',
      'menuKey': 'wish_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=wish',
      'icon': 'icon-sousuowushuju',
      'id': 'wish12',
      'pid': 'wish1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'wish',
      'menuKey': 'wish_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=amazon',
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
      'mainTitle': '订单审核', // 订单审核
      'platformType': 'wish',
      'id': 'wish2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'wish1'
    }, /* {
     'mainTitle': '有留言', // 留言待处理
     'platformType': 'wish',
     'menuKey': 'wish_messageToBeProcessed', // menukey匹配菜单订单数
     'link': './wish.html#/messageToBeProcessed',
     'dataItemNum': '0',
     'id': 'wish3',
     'pid': 'wish2'
     }, */
    {
      'mainTitle': '未匹配商品', // 未匹配商品
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
      'link': './wish.html#/combineOrder',
      'dataItemNum': '0',
      'id': 'wish5',
      'pid': 'wish2'
    }, /* {
     'mainTitle': '未付款',
     'platformType': 'wish',
     'menuKey': 'wish_nonPayment',
     'link': './wish.html#/nonPayment',
     'icon': 'icon-fukuan',
     'id': 'wish9',
     'pid': 'wish1'
     }, */
    {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'wish',
      'id': 'wish10',
      'icon': 'icon-wuliu1',
      'pid': 'wish1',
      'dataItemNum': '0',
      'link': './wish.html#/matchTheLogistics',
      'menuKey': 'wish_matchTheLogistics'
    }, {
      'mainTitle': '已取消订单',
      'platformType': 'wish',
      'menuKey': 'wish_cancelOrder',
      'link': './wish.html#/cancelOrder',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'wish11',
      'pid': 'wish1'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'wish',
      'menuKey': 'wish_manualOrder',
      'link': './wish.html#/manualOrder',
      'icon': 'icon-shougong',
      'id': 'wish16',
      'pid': 'wish1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'wish',
      'id': 'wish13',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'wish1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'wish',
      'menuKey': 'wish_importTask',
      'link': './wish.html#/importTask',
      'id': 'wish14',
      'pid': 'wish13'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'wish',
      'menuKey': 'wish_exportTask',
      'link': './wish.html#/exportTask',
      'id': 'wish15',
      'pid': 'wish13'
    }
  ]
};
