export default {
  menu: [
    {
      name: '商品',
      menuKey: 'wms_fourPxProduct',
      path: '/fourPxProduct'
    },
    {
      name: '库存管理',
      menuKey: 'wms_fourPxManage',
      path: '/fourPxManage'
    },
    {
      name: '出库单',
      menuKey: 'wms_fourPxOutboundOrder',
      path: '/fourPxOutboundOrder'
    },
    {
      name: '导入/导出任务',
      type: 'Group-title',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_fourPxExport',
          path: '/fourPxExport'
        }
      ]
    }
  ]
};
