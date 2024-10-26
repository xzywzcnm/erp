export default {
  menu: [
    {
      name: '商品',
      menuKey: 'wms_winitProduct',
      path: '/winitProduct'
    },
    {
      name: '库存管理',
      menuKey: 'wms_winitManage',
      path: '/winitManage'
    },
    {
      name: '出库单',
      menuKey: 'wms_winitOutboundOrder',
      path: '/winitOutboundOrder'
    },
    {
      name: '导入/导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_winitExport',
          path: '/winitExport'
        }
      ]
    }
  ]
};
