export default {
  definePlatform: [
    {
      'mainTitle': '自定义渠道', // 自定义渠道
      'platformType': 'definePlatform',
      'menuKey': 'Group',
      'link': './definePlatform.html#/orderToRetrieve',
      'type': 'Group', // 没有子菜单
      'alias': 'orderToRetrieve',
      'id': 'definePlatform1'
    },
    {
      'mainTitle': '订单检索',
      'platformType': 'definePlatform',
      'menuKey': 'definePlatform_orderToRetrieve',
      'link': './definePlatform.html#/orderToRetrieve',
      'icon': 'icon-sousuowushuju',
      'id': 'channel12',
      'pid': 'definePlatform1'
    },
    {
      'mainTitle': '异常订单',
      'platformType': 'definePlatform',
      'menuKey': 'definePlatform_stockoutOrder',
      'link': './definePlatform.html#/stockoutOrder',
      'icon': 'iconjinggao',
      'id': 'channel17',
      'pid': 'definePlatform1'
    },
    {
      'mainTitle': '截留订单',
      'platformType': 'definePlatform',
      'menuKey': 'definePlatform_interceptOrder',
      'link': './definePlatform.html#/interceptOrder',
      'dataItemNum': '0',
      'id': 'channel6',
      'pid': 'channel2'
    }, {
      'mainTitle': '异常订单处理', // 异常订单处理
      'platformType': 'definePlatform',
      'id': 'channel2',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'definePlatform1'
    }, {
      'mainTitle': '待匹配商品', // 待匹配商品
      'platformType': 'definePlatform',
      'menuKey': 'definePlatform_unmatchProduct',
      'link': './definePlatform.html#/unmatchProduct',
      'dataItemNum': '0',
      'id': 'channely4',
      'pid': 'channel2'
    }, {
      'mainTitle': '待匹配仓库物流',
      'platformType': 'definePlatform',
      'id': 'channel10',
      'pid': 'channel2',
      'dataItemNum': '0',
      'link': './definePlatform.html#/matchTheLogistics',
      'menuKey': 'definePlatform_matchTheLogistics'
    }, {
      'mainTitle': '已取消订单', // 已取消订单
      'platformType': 'definePlatform',
      'menuKey': 'definePlatform_cancelOrder',
      'link': './definePlatform.html#/cancelOrder',
      'dataItemNum': '0',
      'id': 'channel11',
      'pid': 'channel2'
    }, {
      'mainTitle': '导入/导出任务', // 导入导出任务
      'platformType': 'definePlatform',
      'id': 'channel13',
      'icon': 'icon-shenhe',
      'type': 'Group-title', // 分组
      'pid': 'definePlatform1'
    }, {
      'mainTitle': '导入查看',
      'platformType': 'definePlatform',
      'menuKey': 'definePlatform_importTask',
      'link': './definePlatform.html#/importTask',
      'id': 'channel14',
      'pid': 'channel13'
    }, {
      'mainTitle': '导出查看',
      'platformType': 'definePlatform',
      'menuKey': 'definePlatform_exportTask',
      'link': './definePlatform.html#/exportTask',
      'id': 'channel15',
      'pid': 'channel13'
    }
  ]
};
