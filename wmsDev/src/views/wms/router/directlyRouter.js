export default [
  {
    path: '/trusteeshipOutOrder', // 全托管直发出库单
    component: () => import('@/views/wms/components/directly/trusteeshipOutOrder')
  },
  {
    path: '/inventorySurplus', // 供应商库存余量
    component: () => import('@/views/wms/components/directly/inventorySurplus')
  },
  {
    path: '/inventoryExport', // 导出查看
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  },
  {
    path: '/inventoryImport', // 导入查看
    component: () => import('@/views/wms/components/importExportTask/importTask')
  }
];
