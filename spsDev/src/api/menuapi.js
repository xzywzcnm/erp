/*
 * @Author: w
 * @Date: 2021-05-29 10:21:42
 * @LastEditors: w
 * @LastEditTime: 2021-08-25 10:06:57
 */
// import locale from './menuLanguage';

export default {
  sysMenu: [
    {
      'menuId': '99990',
      'platformType': null,
      'childMenu': 'menuSps',
      'mainTitle': '采购管理系统',
      'pid': null,
      'icon': '',
      'type': ['menuSps'],
      'link': '/supplierPurchase.html#/supplierManagement'
    }, {
      'menuId': '99991',
      'platformType': null,
      'childMenu': 'menuSetting',
      'mainTitle': '设置中心',
      'pid': null,
      'icon': '',
      'type': ['setting'],
      'link': '/generalSettings.html#/management'
    }
  ]
};
