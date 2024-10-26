export default [
  {
    path: '/cneProduct', // 商品
    component: () => import('@/views/wms/components/cne/cneProduct')
  },
  {
    path: '/cneManage', // 库存管理
    component: () => import('@/views/wms/components/cne/cneManage')
  },
  {
    path: '/cneOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/cne/cneOutboundOrder')
  },
  {
    path: '/cneExport', // 导出
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  }
];
