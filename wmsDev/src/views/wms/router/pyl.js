export default [
  {
    path: '/pylOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/pyl/outboundOrder')
  }, {
    path: '/pylExport', // 导出
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  }
];
