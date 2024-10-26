export default [
  {
    path: '/winitProduct', // 商品
    component: () => import('@/views/wms/components/winit/product')
  },
  {
    path: '/winitManage', // 库存管理
    component: () => import('@/views/wms/components/winit/manage')
  },
  {
    path: '/winitOutboundOrder', // 入库单
    component: () => import('@/views/wms/components/winit/outboundOrder')
  }
];
