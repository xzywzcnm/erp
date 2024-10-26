export default {
  menu: [
    {
      name: '出库管理',
      children: [
        {
          name: '商品',
          menuKey: 'wms_cneProduct',
          path: '/cneProduct'
        },
        {
          name: '库存管理',
          menuKey: 'wms_cneManage',
          path: '/cneManage'
        },
        {
          name: '出库单',
          menuKey: 'wms_cneOutboundOrder',
          path: '/cneOutboundOrder'
        },
      ]
    },
    {
      name: '导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_cneExport',
          path: '/cneExport'
        }
      ]
    }
  ]
};