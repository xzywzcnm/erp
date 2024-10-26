export default [
  {
    path: '/rinidProduct', // 商品
    component: () => import('@/views/wms/components/rinid/rinidProduct')
  },
  {
    path: '/rinidManage', // 库存管理
    component: () => import('@/views/wms/components/rinid/rinidManage')
  },
  {
    path: '/rinidOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/rinid/rinidOutboundOrder')
  },
  {
    path: '/rinidExport', // 导出
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  }
];
