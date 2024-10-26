export default [
  {
    path: '/gcProduct', // 商品
    component: () => import('@/views/wms/components/barn/product')
  },
  {
    path: '/gcManage', // 库存管理
    component: () => import('@/views/wms/components/barn/manage')
  },
  {
    path: '/gcOutboundOrder', // 出库单
    component: () => import('@/views/wms/components/barn/outboundOrder')
  },
  {
    path: '/gcExport', // 导出
    component: () => import('@/views/wms/components/importExportTask/exportTask')
  },
  // ========================
  {
    path: '/gcWarehousingOrder', // 海外入库下单
    component: () =>
      import('@/views/wms/components/barn/warehousingOrder')
  },
  {
    path: '/gcWarehouseEntryManagement', // 海外入库单管理
    component: () =>
      import('@/views/wms/components/barn/warehouseEntryManagement')
  },
  {
    path: '/gcDeliveryOrderManagement', // 海外出库单管理
    component: () =>
      import('@/views/wms/components/barn/deliveryOrderManagement')
  }
];
