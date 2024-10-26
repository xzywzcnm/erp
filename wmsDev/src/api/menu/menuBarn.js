export default {
  menu: [
    {
      name: '入库管理',
      icon: 'icon-jinlingyingcaiwangtubiao20',
      children: [
        {
          name: '海外入库下单',
          menuKey: 'wms_gcWarehousingOrder',
          path: '/gcWarehousingOrder'
        },
        {
          name: '海外入库单管理',
          menuKey: 'wms_gcWarehouseEntryManagement',
          path: '/gcWarehouseEntryManagement'
        }
      ],
    },
    {
      name: '库存管理',
      icon: 'icon-jinlingyingcaiwangtubiao20',
      children: [
        {
          name: '商品管理',
          menuKey: 'wms_gcProduct',
          path: '/gcProduct'
        },
        {
          name: '库存管理',
          menuKey: 'wms_gcManage',
          path: '/gcManage'
        }
      ],
    },
    {
      name: '出库管理',
      icon: 'icon-jinlingyingcaiwangtubiao20',
      children: [
        {
          name: '海外出库下单',
          menuKey: 'wms_gcOutboundOrder',
          path: '/gcOutboundOrder'
        },
        {
          name: '海外出库单管理',
          menuKey: 'wms_gcDeliveryOrderManagement',
          path: '/gcDeliveryOrderManagement'
        }
      ],
    },
    {
      name: '导入/导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_gcExport',
          path: '/gcExport'
        }
      ]
    }
  ]
};
