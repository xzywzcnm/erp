export default {
  menu: [
    {
      name: '直发管理',
      children: [
        {
          name: '全托管直发出库单',
          menuKey: 'wms_trusteeshipOutOrder',
          path: '/trusteeshipOutOrder'
        },
        {
          name: '供应商库存余量',
          menuKey: 'wms_inventorySurplus',
          path: '/inventorySurplus'
        }
      ]
    },
    {
      name: '导入(导出)任务查看',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导入查看',
          menuKey: 'wms_inventoryImport',
          path: '/inventoryImport'
        },
        {
          name: '导出查看',
          menuKey: 'wms_inventoryExport',
          path: '/inventoryExport'
        }
      ]
    }
  ]
};