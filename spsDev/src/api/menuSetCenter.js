// import locale from './menuLanguage';

export default {
  menu: [
    {
      'mainTitle': '首页', // 首页
      'type': 'Group',
      'id': 0,
      'display': true
    }, {
      'mainTitle': '通用', // 通用
      'type': 'Group-title',
      'id': 1,
      'pid': 0
    }, {
      'mainTitle': '员工管理', // 员工管理
      'link': 'generalSettings.html#/management',
      'menuKey': 'generalSettings_management',
      'type': '',
      'id': 2,
      'pid': 1,
      'children': []
    }
  ]
};
