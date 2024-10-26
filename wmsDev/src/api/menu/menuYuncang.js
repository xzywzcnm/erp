export default {
  menu: [
    { // 商品
      name: '商品',
      menuKey: 'wms_cloudProduct',
      path: '/cloudProduct'
    },
    { // 库存管理
      name: '库存管理',
      menuKey: 'wms_cloudManage',
      path: '/cloudManage'
    },
    // { // 等待配货
    //   name: '等待配货',
    //   menuKey: 'Yms_wms_waitForDistribution',
    //   path: '/WaitForDistribution'
    // },
    { // 等待下发物流
      name: '等待下发物流',
      menuKey: 'Yms_wms_issuedLogisticsProvider',
      dataItemNum: '',
      path: '/IssuedLogisticsProvider'
    },
    { // 出库单
      name: '出库单',
      menuKey: 'wms_cloudOutboundOrder',
      path: '/cloudOutboundOrder'
    },
    { // 导入、导出任务
      name: '导入/导出任务',
      icon: 'icon-daorudaochu',
      children: [
        { // 导出查看
          name: '导出查看',
          menuKey: 'wms_cloudExport',
          path: '/cloudExport'
        },
        { // 导入查看
          name: '导入查看',
          menuKey: 'wms_cloudImport',
          path: '/cloudImport'
        }
      ]
    }
  ]
};
