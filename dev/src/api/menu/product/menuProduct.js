export default {
  menu: [
    // {
    //   'mainTitle': '商品管理中心',
    //   'link': '/productCenter.html#/',
    //   'type': 'noGroup', // 没有子菜单
    //   'id': 'productCenter1'
    // },
    {
      'mainTitle': '商品管理中心',
      'menuKey': 'Group',
      'link': '/productCenter.html#/',
      'type': 'Group', // 没有子菜单
      'alias': 'productGoods',
      'id': 'productCenter1'
    }, {
      'mainTitle': '商品管理中心',
      'type': 'Group-title', // 没有子菜单
      'id': 'productCenter-title',
      'pid': 'productCenter1'
    },
    {
      'mainTitle': '商品管理',
      'id': 'productCenterProductGoods',
      'icon': 'icon-shangpinguanli',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productGoods',
      'menuKey': 'productCenter_productGoods'
    },
    /* {
      'mainTitle': '商品管理(旧)',
      'id': 'productCenter2',
      'icon': 'icon-shangpinguanli',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/newProductGoods',
      'menuKey': 'productCenter_newProductGoods'
    }, */
    {
      'mainTitle': '分类管理',
      'id': 'productCenter3',
      'icon': 'icon-fenlei',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productCategory',
      'menuKey': 'productCenter_productCategory'
    }, {
      'mainTitle': '标签管理',
      'id': 'productCenter4',
      'icon': 'icon-biaoqian1',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productTag',
      'menuKey': 'productCenter_productTag'
    }, {
      'mainTitle': '品牌管理',
      'id': 'productCenter5',
      'icon': 'icon-pinpaizhuanxiang',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productBrand',
      'menuKey': 'productCenter_productBrand'
    }, {
      'mainTitle': 'SKU映射',
      'id': 'productCenter6',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productSkuMapping',
      'menuKey': 'productCenter_productSkuMapping'
    },
    {
      'mainTitle': '第三方标签管理',
      'id': 'productCenter20',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/thirdpartyTagManage',
      'menuKey': 'productCenter_thirdpartyTagManage'
    },
    {
      'mainTitle': '导入/导出任务',
      'id': 'productCenter7',
      'pid': 'productCenter1',
      'type': 'Group-title', // 没有子菜单
      'link': './productCenter.html#/',
      'alias': 'productGoods'
    }, {
      'mainTitle': '导入查看',
      'id': 'productCenter8',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter7',
      'link': './productCenter.html#/importTask',
      'menuKey': 'productCenter_importTask',
      'display': ''
    }, {
      'mainTitle': '导出查看',
      'id': 'productCenter9',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter7',
      'link': './productCenter.html#/exportTask',
      'menuKey': 'productCenter_exportTask',
      'display': ''
    }, {
      'mainTitle': '属性分类管理',
      'id': 'productCenter10',
      'type': 'Group-title', // 没有子菜单
      'icon': 'icon-daorudaochu',
      'link': './productCenter.html#/',
      'alias': 'attributeManagement'
    },
    {
      'mainTitle': '属性管理',
      'id': 'productCenter12',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter10',
      'link': './productCenter.html#/attributeManagement',
      'menuKey': 'productCenter_attributeManagement',
      'display': ''
    },
    {
      'mainTitle': '分类管理',
      'id': 'productCenter13',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter10',
      'link': './productCenter.html#/attributeClassification',
      'menuKey': 'productCenter_attributeClassification',
      'display': ''
    },
    {
      'mainTitle': '质检项目管理',
      'id': 'productCenter14',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter10',
      'link': './productCenter.html#/qualityProject',
      'menuKey': 'productCenter_qualityProject',
      'display': ''
    },
    {
      'mainTitle': '质检模块管理',
      'id': 'productCenter15',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter10',
      'link': './productCenter.html#/qualityClassification',
      'menuKey': 'productCenter_qualityClassification',
      'display': ''
    }

  ],
  productCenter: [
    {
      'mainTitle': '',
      'link': './productCenter.html#/',
      'type': 'Group', // 没有子菜单
      'alias': 'productGoods',
      'id': 'productCenter1'
    }, {
      'mainTitle': '商品管理中心',
      'type': 'Group-title', // 没有子菜单
      'icon': 'icon-shangpinguanlizhongxin',
      'id': 'productCenter-title',
      'pid': 'productCenter1'
    },
    {
      'mainTitle': '商品管理',
      'id': 'productCenterProductGoods',
      'icon': 'icon-shangpinguanli',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productGoods',
      'menuKey': 'productCenter_productGoods'
    },
    /* {
      'mainTitle': '商品管理(旧)',
      'id': 'productCenter2',
      'icon': 'icon-shangpinguanli',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/newProductGoods',
      'menuKey': 'productCenter_newProductGoods'
    }, */
    {
      'mainTitle': '分类管理',
      'id': 'productCenter3',
      'icon': 'icon-fenlei',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productCategory',
      'menuKey': 'productCenter_productCategory'
    }, {
      'mainTitle': '标签管理',
      'id': 'productCenter4',
      'icon': 'icon-biaoqian1',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productTag',
      'menuKey': 'productCenter_productTag'
    }, {
      'mainTitle': '品牌管理',
      'id': 'productCenter5',
      'icon': 'icon-pinpaizhuanxiang',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productBrand',
      'menuKey': 'productCenter_productBrand'
    }, {
      'mainTitle': 'SKU映射',
      'id': 'productCenter6',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/productSkuMapping',
      'menuKey': 'productCenter_productSkuMapping'
    },
    {
      'mainTitle': '第三方标签管理',
      'id': 'productCenter20',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter-title',
      'link': './productCenter.html#/thirdpartyTagManage',
      'menuKey': 'productCenter_thirdpartyTagManage'
    },
    {
      'mainTitle': '导入/导出任务',
      'id': 'productCenter7',
      'pid': 'productCenter1',
      'type': 'Group-title', // 没有子菜单
      'icon': 'icon-daorudaochu',
      'link': './productCenter.html#/',
      'alias': 'productGoods'
    }, {
      'mainTitle': '导入查看',
      'id': 'productCenter8',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter7',
      'link': './productCenter.html#/importTask',
      'menuKey': 'productCenter_importTask',
      'display': ''
    }, {
      'mainTitle': '导出查看',
      'id': 'productCenter9',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter7',
      'link': './productCenter.html#/exportTask',
      'menuKey': 'productCenter_exportTask',
      'display': ''
    }, {
      'mainTitle': '属性分类管理',
      'id': 'productCenter10',
      'type': 'Group-title', // 没有子菜单
      'icon': 'icon-daorudaochu',
      'link': './productCenter.html#/',
      'alias': 'attributeManagement'
    },
    {
      'mainTitle': '属性管理',
      'id': 'productCenter12',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter10',
      'link': './productCenter.html#/attributeManagement',
      'menuKey': 'productCenter_attributeManagement',
      'display': ''
    },
    {
      'mainTitle': '分类管理',
      'id': 'productCenter13',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter10',
      'link': './productCenter.html#/attributeClassification',
      'menuKey': 'productCenter_attributeClassification',
      'display': ''
    },
    {
      'mainTitle': '质检项目管理',
      'id': 'productCenter14',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter10',
      'link': './productCenter.html#/qualityProject',
      'menuKey': 'productCenter_qualityProject',
      'display': ''
    },
    {
      'mainTitle': '质检模块管理',
      'id': 'productCenter15',
      'icon': 'icon-erji-dashujupingtai',
      'pid': 'productCenter10',
      'link': './productCenter.html#/qualityClassification',
      'menuKey': 'productCenter_qualityClassification',
      'display': ''
    }

  ]
};
