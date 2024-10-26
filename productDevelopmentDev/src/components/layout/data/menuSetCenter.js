/**
 * Created by lihongxing on 2018/7/23.
 */
export default {
  menu: [
    {
      mainTitle: "首页",
      type: "Group",
      id: 1,
      display: true
    }, // 入库管理导航
    {
      mainTitle: "通用",
      type: "Group-title",
      id: 2,
      pid: 1
    },
    {
      mainTitle: "员工管理",
      link: "generalSettings.html#/management",
      menuKey: "generalSettings_management",
      type: "",
      id: 3,
      pid: 2,
      children: []
    } /*,     {
     'mainTitle': '平台店铺',
     "link": "generalSettings.html#/shop",
     "menuKey":"ebayAccount_list",
     'type': '',
     'id': 5,
     'pid': 2,
     'children': []
     } */
  ],
  menu1: [
    {
      name: "通用",
      children: [
        {
          name: "员工管理",
          path: "/management",
          menuKey: "generalSettings_management"
        }
      ]
    }
  ]
};
