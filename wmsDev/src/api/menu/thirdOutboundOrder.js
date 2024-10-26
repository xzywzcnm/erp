let menu = [
  {
    name: '出库管理',
    children: [
      {
        name: '商品',
        menuKey: 'wms_thirdExport',
        path: '/thirdProduct'
      },
      {
        name: '库存管理',
        menuKey: 'wms_thirdOutboundOrder',
        path: '/fbaManage'
      },
      {
        name: '出库单',
        menuKey: 'wms_thirdOutboundOrder',
        path: '/thirdOutboundOrder'
      },
    ]
  },
  {
    name: '导出任务',
    icon: 'icon-daorudaochu',
    children: [
      {
        name: '导出查看',
        menuKey: 'wms_thirdExport',
        path: '/thirdExport'
      }
    ]
  }
]
export default {
  menu
};
