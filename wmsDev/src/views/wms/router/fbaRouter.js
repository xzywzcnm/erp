export default [
  {
    path: '/thirdProduct', // 商品
    component: () => import('@/views/wms/components/fba/fbaProduct')
  },
  {
    path: '/fbaManage', // 库存管理
    component: () => import('@/views/wms/components/fba/fbaManage')
  },
  {
    path: '/thirdOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/fba/fbaOutboundOrder')
  },
  {
    path: '/thirdExport', // 导出
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  }
];
