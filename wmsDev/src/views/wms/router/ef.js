export default [
  {
    path: '/efProduct', // 商品
    component: () => import('@/views/wms/components/ef/product')
  },
  {
    path: '/efManage', // 库存管理
    component: () => import('@/views/wms/components/ef/manage')
  },
  {
    path: '/efOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/ef/outboundOrder')
  },
  {
    path: '/efExport', // 导出
    component: () =>
            import('@/views/wms/components/importExportTask/exportTask')
  }
];
