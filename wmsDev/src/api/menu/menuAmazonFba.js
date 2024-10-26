export default {
  menu: [
    {
      name: 'Amazon在线商品',
      menuKey: 'wms_amazonOnlineProduct',
      path: '/amazonOnlineProduct'
    }, {
      name: 'FBA库存管理',
      menuKey: 'wms_fbaStockManage',
      path: '/fbaStockManage'
    }, {
      name: '入库管理',
      type: 'Group-title',
      icon: 'icon-ccgl-diaoboruku-2',
      children: [
        {
          name: '入库单管理',
          menuKey: 'wms_godownEntryManage',
          path: '/godownEntryManage'
        }
      ]
    }
  ]
};
