import exWarehose from './EX-warehouse';
export default {
  menu: [
    {
      name: '控制台',
      icon: 'icon-kongzhitai',
      children: [
        {
          name: '首页',
          // menuKey: 'wms_index',
          path: '/index'
        }
      ]
    },
    {
      name: '入库管理',
      icon: 'icon-ccgl-diaoboruku-2',
      children: [
        {
          name: '入库单管理',
          menuKey: 'wms_inWareManage',
          path: '/inWareManage'
        }, {
          name: '收货',
          menuKey: 'wms_receipt',
          path: '/receipt'
        }, {
          name: '质检',
          menuKey: 'wms_qualityManage',
          path: '/qualityManage'
        }, {
          name: '上架',
          menuKey: 'wms_shelvesManage',
          path: '/shelvesManage'
        }, {
          name: '问题件处理',
          menuKey: 'wms_problemPiece',
          path: '/problemPiece'
        },
        {
          name: '全托管退货管理',
          menuKey: 'wms_returnManage',
          path: '/returnManage'
        },
        {
          name: '到货异常处理',
          menuKey: 'wms_productAbnormal',
          path: '/productAbnormal'
        },
      ]
    },
    {
      name: '库存管理',
      icon: 'icon-kucunguanli',
      children: [
        {
          name: '库存余量',
          menuKey: 'wms_inventoryLevels',
          path: '/inventoryLevels'
        }, {
          name: '库存移动',
          menuKey: 'wms_inventoryMove',
          path: '/inventoryMove'
        }, {
          name: '库存调整',
          menuKey: 'wms_inventoryAdjust',
          path: '/inventoryAdjust'
        }, {
          name: '库存冻结',
          menuKey: 'wms_inventoryFreeze',
          path: '/inventoryFreeze'
        }, {
          name: '库存盘点',
          menuKey: 'wms_inventoryScan',
          path: '/inventoryScan'
        }, {
          name: '库存调拨',
          menuKey: 'wms_inventoryTransfer',
          path: '/inventoryTransfer'
        }, {
          name: '商品组装加工',
          menuKey: 'wms_productProcessing',
          path: '/productProcessing'
        },

        {
          name: '入库出库申请',
          menuKey: 'wms_receivedProOutboundApply',
          path: '/receivedProOutboundApply',
        },
        {
          name: '寄出运费核对',
          menuKey: 'wms_checkAllShippingCosts',
          path: '/checkAllShippingCosts',
        },
      ]
    },
    ...exWarehose,

    {
      name: '导入/导出任务',
      icon: 'icon-daorudaochu',
      children: [
        {
          name: '导入查看',
          menuKey: 'wms_importTask',
          path: '/importTask'
        }, {
          name: '导出查看',
          menuKey: 'wms_exportTask',
          path: '/exportTask'
        }
      ]
    },
    {
      name: '打印货架标签',
      menuKey: 'wms_printGoodsShelves',
      path: '/printGoodsShelves'
    }
  ]
};
