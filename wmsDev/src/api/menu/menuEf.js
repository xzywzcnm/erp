export default {
  menu: [
    {
      name: '商品',
      menuKey: 'wms_efProduct',
      path: '/efProduct'
    },
    {
      name: '库存管理',
      menuKey: 'wms_efManage',
      path: '/efManage'
    },
    {
      name: '出库单',
      menuKey: 'wms_efOutboundOrder',
      path: '/efOutboundOrder'
    },
    {
      name: '仓库单检索',
      menuKey: 'wms_warehouseSearch',
      path: '/warehouseSearch'
    },
    {
      name: '导入/导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_efExport',
          path: '/efExport'
        }
      ]
    }
  ]
};
