export default [
  {
    path: '/nfProduct', // 商品
    component: () => import('@/views/wms/components/novFire/nfProduct')
  },
  {
    path: '/nfManage', // 库存管理
    component: () => import('@/views/wms/components/novFire/nfManage')
  },
  {
    path: '/nfOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/novFire/nfOutboundOrder')
  },
  {
    path: '/nfExport', // 导出
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  }
];
