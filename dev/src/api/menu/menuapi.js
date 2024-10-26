export default {
  sysMenu: [
    {
      'menuId': '99990',
      'platformType': null,
      'childMenu': 'menuOrder',
      'prefix': {
        'ebay': 'ebay_',
        'aliexpress': 'aliexpress_',
        'amazon': 'amazon_',
        'shopify': 'shopify_',
        'lazada': 'lazada_',
        'dhgate': 'dhgate_',
        'shopee': 'shopee_',
        'joom': 'joom_',
        'yandex': 'yandex_',
        'walmart': 'walmart_',
        'jdyn': 'jdyn_',
        'ept': 'ept_',
        'alibaba': 'alibaba_',
        'definePlatform': 'definePlatform_',
        'orderCommon': 'orderCommon_',
        'real': 'real_'
      },
      'mainTitle': '订单处理系统',
      'pid': null,
      'icon': '',
      'type': ['order'],
      'platform': true, // If this menu has platform
      'link': './commonOrder.html#/messageToBeProcessed?platform=ebay'
    },
    {
      'menuId': '99992',
      'platformType': null,
      'childMenu': 'generalSettings',
      'prefix': 'generalSettings_',
      'mainTitle': '设置中心',
      'pid': null,
      'icon': '',
      'platform': false, // If this menu has platform
      'childSettingName': 'setting',
      'type': ['generalSettings'],
      'link': '/setting-service/generalSettings.html#/shop',
      'children': [
        // 这里加的就是设置子模块的菜单
        {
          'menuId': '99992',
          'platformType': null,
          'childMenu': 'generalSettings',
          'prefix': 'generalSettings_',
          'mainTitle': '设置中心',
          'pid': null,
          'icon': '',
          'platform': false, // If this menu has platform
          'childSettingName': 'setting',
          'type': ['generalSettings'],
          'link': '/setting-service/generalSettings.html#/shop'
        },
        {
          'menuId': '99996',
          'platformType': null,
          'childMenu': 'logistics',
          'prefix': 'logistics_',
          'mainTitle': '订单管理',
          'pid': null,
          'icon': '',
          'platform': false, // If this menu has platform
          'childSettingName': 'setting',
          'type': ['logistics'],
          'link': '/setting-service/logistics.html#/wareSetting'
        },
        {
          'menuId': '99997',
          'platformType': null,
          'childMenu': 'orderSettings',
          'prefix': 'orderSettings_',
          'mainTitle': '仓储管理',
          'pid': null,
          'icon': '',
          'platform': false, // If this menu has platform
          'childSettingName': 'setting',
          'type': ['orderSettings'],
          'link': '/setting-service/orderSettings.html#/autoDistributionWarehouseRule'
        },
        {
          'menuId': '99998',
          'platformType': null,
          'childMenu': 'customSettings',
          'prefix': 'customSettings_',
          'mainTitle': '客服管理', // 客服管理
          'pid': null,
          'icon': '',
          'platform': false, // If this menu has platform
          'childSettingName': 'setting',
          'type': ['customSettings'],
          'link': '/setting-service/customSettings.html#/mailFolder'
        },
        {
          'menuId': '99999',
          'platformType': null,
          'childMenu': 'pdsSettings',
          'prefix': 'pdsSettings_',
          'mainTitle': '新品开发管理', // 新品开发管理
          'pid': null,
          'icon': '',
          'platform': false, // If this menu has platform
          'childSettingName': 'setting',
          'type': ['pdsSettings']
        },
        {
          'menuId': '100000',
          'platformType': null,
          'childMenu': 'productSettings',
          'prefix': 'productSettings_',
          'mainTitle': '商品管理', // 商品管理
          'pid': null,
          'icon': '',
          'platform': false, // If this menu has platform
          'childSettingName': 'setting',
          'type': ['productSettings']
        },
        {
          'menuId': '100001',
          'platformType': null,
          'childMenu': 'spsSettings',
          'prefix': 'spsSettings_',
          'mainTitle': '供应商管理', // 供应商管理
          'pid': null,
          'icon': '',
          'platform': false, // If this menu has platform
          'childSettingName': 'setting',
          'type': ['spsSettings'],
          'link': '/setting-service/customSettings.html#/mailFolder'
        },
        {
          'menuId': '100002',
          'platformType': null,
          'childMenu': 'financeSettings',
          'prefix': 'financeSettings_',
          'mainTitle': '财务计费管理', // 财务计费管理
          'pid': null,
          'icon': '',
          'platform': false, // If this menu has platform
          'childSettingName': 'setting',
          'type': ['financeSettings'],
          // 'link': '/setting-service/customSettings.html#/mailFolder'
        }
      ]
    },
    {
      'menuId': '99993',
      'platformType': null,
      'childMenu': 'menuWms',
      'prefix': 'wms_',
      'mainTitle': '仓储管理系统',
      'pid': null,
      'icon': '',
      'type': ['wms'],
      'link': '/wms-service/wms.html#/'
    },
    {
      'menuId': '99994',
      'platformType': null,
      'childMenu': 'menuProduct',
      'prefix': 'productCenter_',
      'mainTitle': '商品管理系统',
      'pid': null,
      'icon': '',
      'type': ['productCenter'],
      'link': '/product-service/productCenter.html#/productGoods'
    },
    {
      'menuId': '99995',
      'platformType': null,
      'childMenu': 'menuCustomer',
      'prefix': 'customer_',
      'mainTitle': '客服管理系统',
      'pid': null,
      'icon': '',
      'type': ['customer'],
      'link': '/cs-service/customer.html#/ebayMail'
    },
    {
      'menuId': '99996',
      'platformType': null,
      'childMenu': 'menuSps',
      'prefix': 'supplierPurchase_',
      'mainTitle': '采购管理系统',
      'pid': null,
      'icon': '',
      'type': ['sps'],
      'link': '/sps-service/supplierPurchase.html#/supplierManagement'
    },
    {
      'menuId': '99999',
      'platformType': null,
      'childMenu': 'menuPds',
      'prefix': 'pds_',
      'mainTitle': '新品开发系统',
      'pid': null,
      'icon': '',
      'type': ['pds'],
      'link': '/pds-service/pds.html#/index'
    },
    // {
    //   'menuId': '99999',
    //   'platformType': null,
    //   'childMenu': 'menuFinance',
    //   'prefix': 'finance_',
    //   'mainTitle': '财务计费管理系统',
    //   'pid': null,
    //   'icon': '',
    //   'type': ['finance'],
    //   'link': ''
    // },

    {
      'menuId': '100000',
      'platformType': null,
      'childMenu': 'menuPDA',
      'prefix': 'pda_',
      'mainTitle': '移动端',
      'pid': null,
      'icon': '',
      'type': ['pda'],
      'link': ''
    }
  ]
};
