export default [
  {
    path: '/cloudProduct', // 商品
    component: () => import('@/views/wms/components/yuncang/product')
  },
  {
    path: '/cloudManage', // 库存管理
    component: () => import('@/views/wms/components/yuncang/manage')
  },
  // {
  //   path: '/cloudWaitForDistribution', // 等待配货
  //   component: () =>
  //           import('@/views/wms/components/exWarehouse/waitForDistribution')
  // },
  {
    path: '/cloudIssuedLogisticsProvider', // 等待下发物流
    component: () =>
      import('@/views/wms/components/exWarehouse/issuedLogisticsProvider')
  },
  {
    path: '/cloudOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/yuncang/outboundOrder')
  },
  {
    path: '/cloudExport', // 导出
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  },
  {
    path: '/cloudImport', // 导入
    component: () => import('@/views/wms/components/importExportTask/importTask')
  }
];
