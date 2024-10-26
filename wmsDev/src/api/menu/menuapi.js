// import locale from './menuLanguage';

export default {
  sysMenu: [
    {
      menuId: '99990',
      platformType: null,
      childMenu: 'menuOrder',
      prefix: {
        ebay: 'ebay_',
        aliexpress: 'aliexpress_',
        amazon: 'amazon_'
      },
      mainTitle: '订单处理系统',
      pid: null,
      icon: '',
      type: ['order'],
      platform: true, // If this menu has platform
      link: '/order-service/ebay.html#/messageToBeProcessed'
    }, {
      menuId: '99992',
      platformType: null,
      childMenu: 'menuSetting',
      prefix: 'generalSettings_',
      mainTitle: '设置中心',
      pid: null,
      icon: '',
      platform: false, // If this menu has platform
      type: ['generalSettings', 'logistics', 'orderSettings'],
      link: '/setting-service/generalSettings.html#/shop'
    }, {
      menuId: '99993',
      platformType: null,
      childMenu: 'menuWms',
      prefix: 'wms_',
      mainTitle: '仓储管理系统',
      pid: null,
      icon: '',
      type: ['wms'],
      link: '/wms-service/wms.html#/'
    }, {
      menuId: '99994',
      platformType: null,
      childMenu: 'menuProduct',
      prefix: 'product_',
      mainTitle: '商品管理系统',
      pid: null,
      icon: '',
      type: ['productCenter'],
      link: '/product-service/productCenter.html#/productGoods'
    }, {
      menuId: '99995',
      platformType: null,
      childMenu: 'menuCustomer',
      prefix: 'customer_',
      mainTitle: '客服处理系统',
      pid: null,
      icon: '',
      type: ['customer'],
      link: '/cs-service/customer.html#/ebayMail'
    }
  ]
};
