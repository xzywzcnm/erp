export default {
  warehouseArrival: [
    {
      name: '入仓管理',
      icon: 'icon-ccgl-diaoboruku-2',
      children: [
        {
          name: '入仓管理',
          menuKey: 'wms_warehouseConfirm',
          path: '/warehouseConfirm'
        }, {
          name: '入仓商品管理',
          menuKey: 'wms_warehouseProduct',
          path: '/warehouseProduct'
        }
      ]
    }
  ]
};
