export default {
  ebay: [
    {
      'mainTitle': 'Ebay',
      'platformType': 'ebay',
      'menuKey': 'Group',
      'link': './commonOrder.html#/messageToBeProcessed?platform=ebay',
      'type': 'Group', // 没有子菜单
      'alias': 'messageToBeProcessed',
      'id': 'ebay1'
    }, {
      'mainTitle': '订单检索',
      'platformType': 'ebay',
      'menuKey': 'ebay_orderToRetrieve',
      'link': './commonOrder.html#/orderToRetrieve?platform=ebay',
      'icon': 'icon-sousuowushuju',
      'id': 'ebay12',
      'pid': 'ebay1'
    }, {
      'mainTitle': '异常订单',
      'platformType': 'ebay',
      'menuKey': 'ebay_stockoutOrder',
      'link': './commonOrder.html#/stockoutOrder?platform=ebay',
      'icon': 'iconjinggao',
      'id': 'ebay7',
      'pid': 'ebay1'
    }, {
      'mainTitle': '截留订单',
      'platformType': 'ebay',
      'menuKey': 'ebay_interceptOrder',
      'link': './commonOrder.html#/interceptOrder?platform=ebay',
      'dataItemNum': '0',
      'id': 'ebay6',
      'pid': 'ebay2'
    }, {
      'mainTitle': '标发货',
      'platformType': 'ebay',
      'menuKey': 'ebay_markShipments',
      'link': './commonOrder.html#/markShipments?platform=ebay',
      'icon': 'icon-biaoji',
      'id': 'ebay8',
      'pid': 'ebay1'
    }, {
      mainTitle: '平台仓订单',
      platformType: 'ebay',
      menuKey: 'ebay_platformShippedOrder',
      link: './commonOrder.html#/platformShippedOrder?platform=ebay',
      icon: 'icon-sousuowushuju',
      'id': 'ebay17',
      'pid': 'ebay1'
    }, {
      'mainTitle': '订单审核', // 订单审核
      'platformType': 'ebay',
      'id': 'ebay2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'ebay1'
    }, {
      'mainTitle': '有留言', // 留言待处理
      'platformType': 'ebay',
      'menuKey': 'ebay_messageToBeProcessed', // menukey匹配菜单订单数
      'link': './commonOrder.html#/messageToBeProcessed?platform=ebay',
      'dataItemNum': '0',
      'id': 'ebay3',
      'pid': 'ebay2'
    }, {
      'mainTitle': '未匹配商品', // 未匹配商品
      'platformType': 'ebay',
      'menuKey': 'ebay_unmatchProduct',
      'link': './commonOrder.html#/unmatchProduct?platform=ebay',
      'dataItemNum': '0',
      'id': 'ebay4',
      'pid': 'ebay2'
    }, {
      'mainTitle': '可合并',
      'platformType': 'ebay',
      'menuKey': 'ebay_combineOrder',
      'link': './ebay.html#/combineOrder',
      'dataItemNum': '0',
      'id': 'ebay5',
      'pid': 'ebay2'
    }, {
      'mainTitle': '未付款',
      'platformType': 'ebay',
      'menuKey': 'ebay_nonPayment',
      'link': './ebay.html#/nonPayment',
      'icon': 'icon-fukuan',
      'id': 'ebay9',
      'pid': 'ebay1'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'ebay',
      'id': 'ebay10',
      'icon': 'icon-wuliu1',
      'pid': 'ebay1',
      'dataItemNum': '0',
      'link': './ebay.html#/matchTheLogistics',
      'menuKey': 'ebay_matchTheLogistics'
    }, {
      'mainTitle': '已取消订单', // 已取消订单
      'platformType': 'ebay',
      'menuKey': 'ebay_cancelOrder',
      'link': './ebay.html#/cancelOrder',
      'dataItemNum': '0',
      'icon': 'icon-iconfontzhizuobiaozhun0262',
      'id': 'ebay11',
      'pid': 'ebay1'
    }, {
      'mainTitle': '手工订单',
      'platformType': 'ebay',
      'menuKey': 'ebay_manualOrder',
      'link': './ebay.html#/manualOrder',
      'icon': 'icon-shougong',
      'id': 'ebay16',
      'pid': 'ebay1'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'ebay',
      'id': 'ebay13',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'ebay1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'ebay',
      'menuKey': 'ebay_importTask',
      'link': './ebay.html#/importTask',
      'id': 'ebay14',
      'pid': 'ebay13'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'ebay',
      'menuKey': 'ebay_exportTask',
      'link': './ebay.html#/exportTask',
      'id': 'ebay15',
      'pid': 'ebay13'
    }
  ]
};
