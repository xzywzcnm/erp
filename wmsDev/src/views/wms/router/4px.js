export default [
  {
    path: '/fourPxProduct', // 商品
    component: () => import('@/views/wms/components/4px/product')
  },
  {
    path: '/fourPxManage', // 库存管理
    component: () => import('@/views/wms/components/4px/manage')
  },
  {
    path: '/fourPxOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/4px/outboundOrder')
  },
  {
    path: '/fourPxImport', // 导入
    component: () =>
            import('@/views/wms/components/importExportTask/importTask')
  },
  {
    path: '/fourPxExport', // 导出
    component: () =>
            import('@/views/wms/components/importExportTask/exportTask')
  }
];
