export default {
  menu: [
    {
      name: '出库管理',
      children: [
        {
          name: '商品',
          menuKey: 'wms_amlProduct',
          path: '/amlProduct'
        },
        {
          name: '库存管理',
          menuKey: 'wms_amlManage',
          path: '/amlManage'
        },
        {
          name: '出库单',
          menuKey: 'wms_amlOutboundOrder',
          path: '/amlOutboundOrder'
        },
      ]
    },
    {
      name: '导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_amlExport',
          path: '/amlExport'
        }
      ]
    }
  ]
};