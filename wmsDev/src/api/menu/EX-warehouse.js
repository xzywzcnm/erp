const exWarehose = [{
  // 出库管理
  name: '出库管理',
  icon: 'icon-chukuguanli',
  children: [
    { // 销售出库
      name: '销售出库',
      children: [
        {
          // 等待分配
          name: '等待分配',
          menuKey: 'wms_waitForDistribution',
          dataItemNum: '',
          path: '/waitForDistribution'
        },
        {
          // 等待下发物流
          name: '等待下发物流',
          menuKey: 'wms_issuedLogisticsProvider',
          dataItemNum: '',
          path: '/issuedLogisticsProvider'
        },
        {
          // 拣货
          name: '拣货',
          children: [{
            // 生成拣货单
            name: '生成拣货单',
            menuKey: 'wms_generateOrderList',
            dataItemNum: '',
            path: '/generateOrderList'
          },
          {
            // 拣货单列表
            name: '拣货单列表',
            menuKey: 'wms_pickList',
            dataItemNum: '',
            path: '/pickList'
          },
          {
            // 拣货单异常处理
            name: '拣货单异常处理',
            menuKey: 'wms_abnormalPicking',
            dataItemNum: '',
            path: '/abnormalPicking'
          }
          ]
        },
        {
          // 普通出单
          name: '普通出单',
          children: [{
            // 打印面单
            name: '打印面单',
            menuKey: 'wms_print',
            path: '/print',
            dataItemNum: ''
          }, {
            // 出库
            name: '出库',
            dataItemNum: '',
            path: '/exwarehouse',
            menuKey: 'wms_exwarehouse'
          }]
        },
        {
          // 拣货出单
          name: '拣货出单',
          children: [{
            // 多品分拣
            name: '多品分拣',
            menuKey: 'wms_sorting', // wms_sorting
            path: '/sorting'
          }, {
            // 拣货复核
            name: '拣货复核',
            dataItemNum: '',
            path: '/packWorking',
            menuKey: 'wms_packWorking'
          }]
        },
        {
          // 装箱/集包
          name: '装箱/集包',
          path: '/packingManage',
          menuKey: 'wms_packingManage'
        },
        {
          // 出库单检索
          name: '出库单检索',
          path: '/searchPackage',
          menuKey: 'wms_searchPackage'
        },
        {
          // 异常包裹
          name: '异常包裹', // 'menuKey': 'wms_abnormalPackage',
          children: [{
            // 重打面单
            name: '重打面单',
            menuKey: 'wms_prePrintSheet',
            path: '/prePrintSheet',
            dataItemNum: ''
          }, {
            // 作废出库单
            name: '作废出库单',
            dataItemNum: '',
            path: '/cancelPackage',
            menuKey: 'wms_cancelPackage'
          }, {
            // 异常包裹归库
            name: '异常包裹归库',
            dataItemNum: '',
            path: '/abnormalPackageStorage',
            menuKey: 'wms_abnormalPackageStorage'
          }, {
            // 补录运单号
            name: '补录运单号',
            dataItemNum: '',
            path: '/additionalWaybillNo',
            menuKey: 'wms_additionalWaybillNo'
          }]
        }
      ]
    },
    { // 其他出库
      name: '其他出库',
      path: '/otherStockOut',
      children: [
        {
          // 其他出库
          name: '其他出库单列表',
          dataItemNum: '',
          path: '/otherStockOut',
          menuKey: 'wms_otherStockOut'
        },
        {
          name: '借样出库单',
          menuKey: 'wms_lendSampleStock',
          dataItemNum: '',
          path: '/lendSampleStock'
        },
        {
          name: '全托管出库单',
          dataItemNum: '',
          path: '/directOtherStockOut',
          menuKey: 'wms_directOtherStockOut',
        },
        {
          // 其他出库
          name: '海外仓出库单',
          dataItemNum: '',
          path: '/fbaStockOut',
          menuKey: 'wms_fbaStockOut'
        },
        {
          // 拣货单列表
          name: '拣货单列表',
          menuKey: 'wms_otherStockOutPickList',
          dataItemNum: '',
          path: '/otherStockOutPickList'
        }
      ]
    },
    // { // 物流跟踪
    //   name: '物流跟踪',
    //   menuKey: 'wms_logisticsTracking',
    //   path: '/logisticsTracking'
    // },
    { // 物流追踪查询
      name: '物流追踪查询',
      menuKey: 'wms_logisticsTrackingInquiry',
      path: '/logisticsTrackingInquiry'
    },
    {
      name: '出库增值服务',
      menuKey: 'wms_valueAddedServices',
      path: '/valueAddedServices'
    }
  ]
}];
export default exWarehose;