// 睿邑达 仓库路由
export default {
  menu: [
    {
      name: '出库管理',
      children: [
        {
          name: '商品',
          menuKey: 'wms_rinidProduct',
          path: '/rinidProduct'
        },
        {
          name: '库存管理',
          menuKey: 'wms_rinidManage',
          path: '/rinidManage'
        },
        {
          name: '出库单',
          menuKey: 'wms_rinidOutboundOrder',
          path: '/rinidOutboundOrder'
        },
      ]
    },
    {
      name: '导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_rinidExport',
          path: '/rinidExport'
        }
      ]
    }
  ]
};