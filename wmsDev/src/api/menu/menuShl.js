export default {
  menu: [
    {
      name: '商品',
      menuKey: 'wms_shlProduct',
      path: '/shlProduct'
    },
    {
      name: '库存管理',
      menuKey: 'wms_shlProduct',
      // menuKey: 'wms_shlInventoryManage',
      path: '/shlInventoryManage'
    },
    {
      name: '出库单',
      menuKey: 'wms_shlOutboundOrder',
      path: '/shlOutboundOrder'
    },
    {
      name: '导入/导出任务',
      type: 'Group-title',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_shlExport',
          path: '/shlExport'
        }
      ]
    }
  ]
};
