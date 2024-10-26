export default {
  menu: [
    {
      name: '出库管理',
      children: [
        {
          name: '商品',
          menuKey: 'wms_nfProduct',
          path: '/nfProduct'
        },
        {
          name: '库存管理',
          menuKey: 'wms_nfManage',
          path: '/nfManage'
        },
        {
          name: '出库单',
          menuKey: 'wms_nfOutboundOrder',
          path: '/nfOutboundOrder'
        },
      ]
    },
    {
      name: '导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_nfExport',
          path: '/nfExport'
        }
      ]
    }
  ]
};