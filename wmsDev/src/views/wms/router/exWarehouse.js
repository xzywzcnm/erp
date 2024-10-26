let exWarehouseRoutes = [
  {
    path: '/waitForDistribution', // 等待分配
    component: () => import('@/views/wms/components/exWarehouse/waitForDistribution')
  }, {
    path: '/issuedLogisticsProvider', // 等待下发物流
    component: () => import('@/views/wms/components/exWarehouse/issuedLogisticsProvider')
  }, {
    path: '/generateOrderList', // 生成拣货单
    component: () => import('@/views/wms/components/exWarehouse/generateOrderList')
  }, {
    path: '/pickList', // 拣货单列表
    component: () => import('@/views/wms/components/exWarehouse/pickList')
  }, {
    path: '/abnormalPicking', // 拣货单异常列表
    component: () => import('@/views/wms/components/exWarehouse/abnormalPicking')
  }, {
    path: '/print', // 打印面单
    component: () => import('@/views/wms/components/exWarehouse/print')
  }, {
    path: '/exwarehouse', // 出库
    component: () => import('@/views/wms/components/exWarehouse/exwarehouse')
  }, {
    path: '/sorting', // 多品分拣
    component: () => import('@/views/wms/components/exWarehouse/sorting')
  }, {
    path: '/packWorking', // 拣货复核
    component: () => import('@/views/wms/components/exWarehouse/packWorking')
  }, {
    path: '/packingManage', // 装箱/集包
    // component: () => import('@/views/wms/components/exWarehouse/packingManage')
    component: () => import('@/views/wms/packingManage/index')
  }, {
    path: '/searchPackage', // 出库单检索
    component: () => import('@/views/wms/components/exWarehouse/searchPackage')
  }, {
    path: '/prePrintSheet', // 重打面单
    component: () => import('@/views/wms/components/exWarehouse/prePrintSheet')
  }, {
    path: '/cancelPackage', // 作废出库单
    component: () => import('@/views/wms/components/exWarehouse/cancelPackage')
  }, {
    path: '/abnormalPackageStorage', // 异常包裹归库
    component: () => import('@/views/wms/components/exWarehouse/abnormalPackageStorage')
  }, {
    path: '/additionalWaybillNo', // 补录运单号
    component: () => import('@/views/wms/components/exWarehouse/additionalWaybillNo')
  }, {
    path: '/otherStockOut', // 其他出库
    component: () => import('@/views/wms/components/exWarehouse/otherStockOut')
  }, {
    path: '/directOtherStockOut', // 直发出库
    component: () => import('@/views/wms/stockOUt/fullyManage/index')
  }, {
    path: '/fbaStockOut', // FBA出库
    component: () => import('@/views/wms/stockOUt/otherStouck/fbaStockOut')
  }, {
    path: '/otherStockOutPickList', // 拣货单列表
    component: () => import('@/views/wms/components/exWarehouse/otherStockOutPickList')
  },
  // {
  //   path: '/logisticsTracking', // 物流跟踪
  //   component: () => import('@/views/wms/components/exWarehouse/logisticsTracking')
  // },
  {
    path: '/logisticsTrackingInquiry', // 物流追踪查询
    component: () => import('@/views/wms/components/exWarehouse/logisticsTrackingInquiry')
  },
  {
    path: '/valueAddedServices',
    component: () => import('@/views/wms/valueAddedServices/index')
  },
  {
    path: '/scanEx', // 扫描出库
    component: () => import('@/views/wms/components/exWarehouse/scanEx')
  }, {
    path: '/warehouseConfirm', // 入仓管理
    component: () => import('@/views/wms/toWarehouseManage/warehouseConfirm')
  }, {
    path: '/warehouseProduct', // 入仓商品管理
    component: () => import('@/views/wms/toWarehouseManage/warehouseProduct')
  }, {
    path: '/warehouseSearch', // 仓库单检索
    component: () => import('@/views/wms/warehouseSearch/index')
  },
  {
    path: '/lendSampleStock', // 借样出库单
    component: () => import('@/views/wms/stockOUt/otherStouck/lendSampleStock')
  },
];
export default exWarehouseRoutes;
