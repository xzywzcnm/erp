export default [
  {
    'mainTitle': 'wms',
    'type': 'Group',
    'id': 17,
    'display': true
  },
  {
    'mainTitle': '控制台',
    'type': 'Group-title',
    'id': 8000,
    'display': true
  },
  // {
  //   'mainTitle': '首页',
  //   'menuKey': 'wms_index',
  //   'link': './wms.html#/index',
  //   'id': 8001,
  //   'pid': 8000,
  //   'display': true
  // },
  {
    'mainTitle': '入库管理',
    'type': 'Group-title',
    'id': 18,
    'pid': 17
  },
  {
    'mainTitle': '入库单管理',
    'menuKey': 'wms_inWareManage',
    'link': './wms.html#/inWareManage',
    'id': 19,
    'pid': 18
  },
  {
    'mainTitle': '收货',
    'menuKey': 'wms_receipt',
    'link': './wms.html#/receipt',
    'id': 57,
    'pid': 18
  },
  {
    'mainTitle': '质检',
    'menuKey': 'wms_qualityManage',
    'link': './wms.html#/qualityManage',
    'id': 20,
    'pid': 18
  },
  {
    'mainTitle': '上架',
    'menuKey': 'wms_shelvesManage',
    'link': './wms.html#/shelvesManage',
    'id': 21,
    'pid': 18
  },
  {
    'mainTitle': '问题件处理',
    'menuKey': 'wms_problemPiece',
    'link': './wms.html#/problemPiece',
    'id': 22,
    'pid': 18
  },
  {
    'mainTitle': '全托管退货管理',
    'menuKey': 'wms_returnManage',
    'link': './wms.html#/returnManage',
    'id': 30,
    'pid': 18
  },
  {
    'mainTitle': '库存管理',
    'type': 'Group-title',
    'id': 22,
    'pid': 17
  },
  {
    'mainTitle': '库存余量',
    'menuKey': 'wms_inventoryLevels',
    'link': './wms.html#/inventoryLevels',
    'id': 23,
    'pid': 22
  },
  {
    'mainTitle': '库存移动',
    'menuKey': 'wms_inventoryMove',
    'link': './wms.html#/inventoryMove',
    'id': 24,
    'pid': 22
  },
  {
    'mainTitle': '库存调整',
    'menuKey': 'wms_inventoryAdjust',
    'link': './wms.html#/inventoryAdjust',
    'id': 25,
    'pid': 22
  },
  {
    'mainTitle': '库存冻结',
    'menuKey': 'wms_inventoryFreeze',
    'link': './wms.html#/inventoryFreeze',
    'id': 26,
    'pid': 22
  },
  {
    'mainTitle': '库存盘点',
    'menuKey': 'wms_inventoryScan',
    'link': './wms.html#/inventoryScan',
    'id': 27,
    'pid': 22
  },
  {
    'mainTitle': '库存调拨',
    'menuKey': 'wms_inventoryTransfer',
    'link': './wms.html#/inventoryTransfer',
    'id': 28,
    'pid': 22
  },
  {
    'mainTitle': '商品组装加工',
    'menuKey': 'wms_productProcessing',
    'link': './wms.html#/productProcessing',
    'id': 29,
    'pid': 22
  },
  {
    'mainTitle': '到货异常处理',
    'menuKey': 'wms_productAbnormal',
    'link': './wms.html#/productAbnormal',
    'id': 31,
    'pid': 22
  },
  {
    'mainTitle': '入库出库申请',
    'menuKey': 'wms_receivedProOutboundApply',
    'link': './wms.html#/receivedProOutboundApply',
    'id': 32,
    'pid': 22
  },
  {
    'mainTitle': '寄出运费核对',
    'link': './wms.html#/checkAllShippingCosts',
    'menuKey': 'wms_checkAllShippingCosts',
    'id': 33,
    'pid': 22
  },
  { // 出库管理
    'mainTitle': '出库管理',
    'type': 'Group-title',
    'id': 80001,
    'pid': 17
  },
  { // 销售出库
    'mainTitle': '销售出库',
    'level': 3, // 'type': 'Group-title',
    'menuKey': 'wms_salesStockOut',
    'id': 31,
    'pid': 80001
  },
  { // 等待分配
    'mainTitle': '等待分配',
    'menuKey': 'wms_waitForDistribution',
    'dataItemNum': '',
    'link': './wms.html#/waitForDistribution',
    'pid': 31,
    'id': 45
  },
  { // 等待下发物流
    'mainTitle': '等待下发物流',
    'menuKey': 'wms_issuedLogisticsProvider',
    'dataItemNum': '',
    'link': './wms.html#/issuedLogisticsProvider',
    'pid': 31,
    'id': 46
  },
  { // 生成拣货单
    'mainTitle': '生成拣货单',
    'menuKey': 'wms_generateOrderList',
    'dataItemNum': '',
    'link': './wms.html#/generateOrderList',
    'id': 44,
    'pid': 31
  },
  {
    'mainTitle': '拣货单列表',
    'menuKey': 'wms_pickList',
    'dataItemNum': '',
    'link': './wms.html#/pickList',
    'id': 33,
    'pid': 31
  },
  { // 拣货单异常处理
    'mainTitle': '拣货单异常处理',
    'menuKey': 'wms_abnormalPicking',
    'dataItemNum': '',
    'link': './wms.html#/abnormalPicking',
    'id': 34,
    'pid': 31
  },
  { // 普通出单
    'mainTitle': '普通出单', // 'menuKey': 'wms_fourLevelMenu',
    'level': 4,
    'pid': 31,
    'id': 88889
  },
  { // 打印面单
    'mainTitle': '打印面单',
    'menuKey': 'wms_print',
    'link': './wms.html#/print',
    'dataItemNum': '',
    'pid': 88889,
    'id': 888893
  },
  { // 出库
    'mainTitle': '出库',
    'id': 888892,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88889,
    'dataItemNum': '',
    'link': './wms.html#/exwarehouse',
    'menuKey': 'wms_exwarehouse'
  },
  { // 见货出单
    'mainTitle': '见货出单', // 'menuKey': 'wms_issuingWithCatch',
    'level': 4,
    'pid': 31,
    'id': 88890
  },
  { // 多品分拣
    'mainTitle': '多品分拣',
    'menuKey': 'wms_sorting',
    'link': './wms.html#/sorting',
    'pid': 88890,
    'id': 888894
  },
  { // 拣货复核
    'mainTitle': '拣货复核',
    'id': 888895,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88890,
    'dataItemNum': '',
    'link': './wms.html#/packWorking',
    'menuKey': 'wms_packWorking'
  },
  {
    // 装箱/集包
    'mainTitle': '装箱/集包',
    'id': 888903,
    'pid': 31,
    'link': './wms.html#/packingManage',
    menuKey: 'wms_packingManage'
  },
  { // 出库单检索
    'mainTitle': '出库单检索',
    'id': 888896,
    'icon': 'icon-baoguochaxun',
    'pid': 31,
    'link': './wms.html#/searchPackage',
    'menuKey': 'wms_searchPackage'
  },
  { // 异常包裹
    'mainTitle': '异常包裹', // 'menuKey': 'wms_abnormalPackage',
    'level': 4,
    'pid': 31,
    'id': 88891
  },
  { // 重打面单
    'mainTitle': '重打面单',
    'menuKey': 'wms_prePrintSheet',
    'link': './wms.html#/prePrintSheet',
    'dataItemNum': '',
    'pid': 88891,
    'id': 888897
  },
  { // 作废出库单
    'mainTitle': '作废出库单',
    'id': 888898,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88891,
    'dataItemNum': '',
    'link': './wms.html#/cancelPackage',
    'menuKey': 'wms_cancelPackage'
  },
  {
    // 异常包裹归库
    'mainTitle': '异常包裹归库',
    'id': 888901,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88891,
    'dataItemNum': '',
    'link': './wms.html#/abnormalPackageStorage',
    'menuKey': 'wms_abnormalPackageStorage'
  },
  { // 其他出库
    'mainTitle': '其他出库',
    'level': 3, // 'menuKey': 'wms_otherStockOut',
    'link': './wms.html#/otherStockOut',
    'id': 88892,
    'pid': 80001
  },
  { // 补录运单号
    mainTitle: '补录运单号',
    id: 888900,
    icon: 'icon-ccgl-chukucaozuo-6',
    pid: 88891,
    dataItemNum: '',
    link: './wms.html#/additionalWaybillNo',
    menuKey: 'wms_additionalWaybillNo'
  },
  { // 其他出库
    'mainTitle': '其他出库单列表',
    'id': 888899,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88892,
    'dataItemNum': '',
    'link': './wms.html#/otherStockOut',
    'menuKey': 'wms_otherStockOut'
  },
  { // 全托管出库单
    'mainTitle': '全托管出库单列表',
    'id': 888904,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88892,
    'dataItemNum': '',
    'link': './wms.html#/directOtherStockOut',
    'menuKey': 'wms_directOtherStockOut'
  },
  { // 海外仓出库单
    'mainTitle': '海外仓出库单列表',
    'id': 888905,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88892,
    'dataItemNum': '',
    'link': './wms.html#/fbaStockOut',
    'menuKey': 'wms_fbaStockOut'
  },
  // { // 物流跟踪
  //   'mainTitle': '物流跟踪',
  //   'id': 8888005,
  //   'icon': 'icon-ccgl-chukucaozuo-6',
  //   'pid': 88892,
  //   'dataItemNum': '',
  //   'link': './wms.html#/logisticsTracking',
  //   'menuKey': 'wms_logisticsTracking'
  // },
  { // 物流追踪查询
    'mainTitle': '物流追踪查询',
    'id': 8888006,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88892,
    'dataItemNum': '',
    'link': './wms.html#/logisticsTrackingInquiry',
    'menuKey': 'wms_logisticsTrackingInquiry'
  },
  {
    'mainTitle': '拣货单列表_其他出库',
    'menuKey': 'wms_otherStockOutPickList',
    'dataItemNum': '',
    'link': './wms.html#/otherStockOutPickList',
    'id': 8888000,
    'pid': 88892
  },
  {
    'mainTitle': '借样出库单',
    'menuKey': 'wms_lendSampleStock',
    'dataItemNum': '',
    'link': './wms.html#/lendSampleStock',
    'id': 8888001,
    'pid': 88892
  },
  {
    mainTitle: '打印货架标签',
    menuKey: 'wms_printGoodsShelves',
    link: './wms.html#/printGoodsShelves',
    id: 57,
    pid: 17
  },
  {
    'mainTitle': '导入/导出任务',
    'type': 'Group-title',
    'id': 50,
    'pid': 17
  },
  {
    'mainTitle': '导入查看',
    'menuKey': 'wms_importTask',
    'link': './wms.html#/importTask',
    'id': 51,
    'pid': 50
  },
  {
    'mainTitle': '导出查看',
    'menuKey': 'wms_exportTask',
    'link': './wms.html#/exportTask',
    'id': 52,
    'pid': 50
  },
  { // 出库增值服务
    'mainTitle': '出库增值服务',
    'id': 8888007,
    'icon': 'icon-ccgl-chukucaozuo-6',
    'pid': 88892,
    'dataItemNum': '',
    'link': './wms.html#/valueAddedServices',
    'menuKey': 'wms_valueAddedServices'
  },
];
