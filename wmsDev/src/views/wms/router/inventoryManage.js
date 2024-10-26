let inventoryRoutes = [
  {
    path: '/inventoryLevels', // 库存余量
    component: () => import('@/views/wms/components/wms-inStock/inventoryLevels')
  }, {
    path: '/inventoryMove', // 库存移动
    component: () => import('@/views/wms/components/wms-inStock/inventoryMove')
  }, {
    path: '/inventoryAdjust', // 库存调整
    component: () => import('@/views/wms/components/wms-inStock/inventoryAdjust')
  }, {
    path: '/inventoryFreeze', // 库存冻结
    component: () => import('@/views/wms/components/wms-inStock/inventoryFreeze')
  }, {
    path: '/inventoryScan', // 库存盘点
    component: () => import('@/views/wms/components/wms-inStock/inventoryScan')
  }, {
    path: '/inventoryTransfer', // 库存调拨
    component: () => import('@/views/wms/components/wms-inStock/inventoryTransfer')
  }, {
    path: '/productProcessing', // 商品组装加工
    component: () => import('@/views/wms/components/wms-inStock/productProcessing')
  }, {
    path: '/productAbnormal', // 产品到货异常处理(宜搭迁移到ERP)
    component: () => import('@/views/wms/components/wms-inStock/productAbnormal/productAbnormal')
  }, {
    path: '/receivedProOutboundApply', // 已入库产品出库申请
    component: () => import('@/views/wms/components/wms-inStock/receivedProOutboundApply')
  }, {
    path: '/checkAllShippingCosts', // 寄出运费核对
    component: () => import('@/views/wms/components/wms-inStock/checkAllShippingCosts')
  }
];
export default inventoryRoutes;
