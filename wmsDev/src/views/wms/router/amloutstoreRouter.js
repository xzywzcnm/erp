export default [
  {
    path: '/amlProduct', // 商品
    component: () => import('@/views/wms/components/amloutstoreWarehouse/amlProduct')
  },
  {
    path: '/amlManage', // 库存管理
    component: () => import('@/views/wms/components/amloutstoreWarehouse/amlManage')
  },
  {
    path: '/amlOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/amloutstoreWarehouse/amlOutboundOrder')
  },
  {
    path: '/amlExport', // 导出
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  }
];
