export default [
  {
    path: '/shlProduct', // 商品
    component: () => import('@/views/wms/components/shl/product')
  },
  {
    path: '/shlInventoryManage', // 库存管理
    component: () => import('@/views/wms/components/shl/inventoryManage')
  },
  {
    path: '/shlOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/shl/outboundOrder')
  },
  {
    path: '/shlImport', // 导入
    component: () =>
            import('@/views/wms/components/importExportTask/importTask')
  },
  {
    path: '/shlExport', // 导出
    component: () =>
            import('@/views/wms/components/importExportTask/exportTask')
  }
];
