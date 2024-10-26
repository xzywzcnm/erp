export default {
  menu: [
    {
      name: '出库单',
      menuKey: 'wms_pylOutboundOrder',
      path: '/pylOutboundOrder'
    }, {
      name: '导入/导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导出查看',
          menuKey: 'wms_pylExport',
          path: '/pylExport'
        }
      ]
    }
  ]
};
