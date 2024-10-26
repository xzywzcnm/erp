/* eslint-disable no-undef */
// order routes
import iview from 'view-design';
import 'view-design/dist/styles/iview.css';
import '@/assets/css/common.css'
import Vue from 'vue';
import '@/assets/css/listPage.css'
import '@/assets/spsIconfont/iconfont.css'
import Vuex from 'vuex';
import axios from 'axios';
import store from '@/store/store';
// import api from '@/api/api';
import regular from '@/utils/regular';
import '@/assets/http';
import msg from '@/components/common/message/message/index';
import '@/components/localComponents/';
import VueRouter from 'vue-router';
import menuSps from '@/api/spsMenu';

import {
  getSinglePageRoleCommon,
  getErpConfig,
  getAllUser,
  getBaseDataList
} from '@/utils/index';
import {
  // setToken,
  getToken,
  // setTokenTime,
  // getTokenTime
} from '@/utils/cookie';
import {
  getAccessToken,
  refreshToken,
  getBusinessDeptInfo,
  getQueryMenu
} from '@/utils/user';
// import config from '@/config';
// import zhLocale from '@/locale/lang/zh-CN';
import locale from '@/locale/method/locale';
// import '@/locale/index';

import { Spin } from 'view-design'
// 路由配置，定义路由
import '@/assets/common';

import main from '@/components/layout/main';

import Print from 'vue-print-nb';

Vue.use(Print);  //注册

Vue.prototype.$regular = regular;
Vue.prototype.axios = axios;
Vue.prototype.$msg = msg;
Vue.config.debug = true; // 开启debug模式
Vue.use(VueRouter);// 初始化自定义组件
Vue.use(iview);
Vue.use(Vuex);
Vue.mixin(locale);

// localStorage.setItem('sysSelect', 'menuSps');
store.commit('inGroup', 'sps');// 需AJAX向server请求菜单
var pageName = getLastPageName();
store.commit('thisPage', pageName);

let allMenuKeyObj = {};

// 监听路由变化--动态修改页面的title
let titleFun = (to) => {
  if (!to.path) return;
  let [list, isName] = [[], null];
  const getChild = (arrList) => {
    arrList.forEach(k => {
      list.push(k);
      if (k.children && k.children.length) {
        getChild(k.children);
      } else {
        if (k.menuKey && k.path && !allMenuKeyObj[k.menuKey]) {
          allMenuKeyObj[k.menuKey] = k;
        }
      }
    });
  }
  getChild(menuSps.menu || []);
  list.forEach(k => {
    if (!isName && (k.path && k.path.includes(to.path))) isName = k;
  });
  return isName && isName.name;
}

const routes = [
  {
    path: '/',
    component: main, // 引入主文件
    redirect: '/supplierManagement',
    children: [
      {
        path: '/noPersermission',
        component: (resolve) => {
          require(['@/components/common/noPersermission'], resolve);
        }
      },
      {
        path: '/supplierManagement', // 供应商管理
        component: (resolve) => {
          require(['./supplierManagement/components/supplierManagement'], resolve);
        }
      }, {
        path: '/productPrice', // 产品报价
        component: (resolve) => {
          require(['./supplierManagement/components/productPrice'], resolve);
        }
      }, {
        path: '/inquiryManagement', // 产品报价
        component: (resolve) => {
          require(['./supplierManagement/components/inquiryManagement.vue'], resolve);
        }
      }, {
        path: '/supplierProduct', // 供应商产品
        component: (resolve) => {
          require(['./supplierManagement/components/supplierProduct'], resolve);
        }
      }, /* {
       path: '/checkRule',
       component: checkRule // 供应商审核规则
       }, */
      {
        path: '/mainCategory', // 主营品类管理
        component: (resolve) => {
          require(['./supplierManagement/components/mainCategory'], resolve);
        }
      },
      {
        path: '/merchantSystem', // 商家系统管理
        component: (resolve) => {
          require(['./supplierManagement/merchantSystem'], resolve);
        }
      },
      {
        path: '/localWarehouse', // 自营仓备货建议
        component: (resolve) => {
          require(['./purchaseManagement/components/localWarehouse'], resolve);
        }
      }, {
        path: '/overseasWarehouse', // 海外仓备货建议
        component: (resolve) => {
          require(['./purchaseManagement/components/overseasWarehouse'], resolve);
        }
      }, {
        path: '/fbaStockingAdvice', // fba仓备货建议
        component: (resolve) => {
          require(['./purchaseManagement/components/fbaStockingAdvice'], resolve);
        }
      }, {
        path: '/createOrder', // 快速生成采购单
        component: (resolve) => {
          require(['./purchaseManagement/components/createOrder'], resolve);
        }
      },
      {
        path: '/stockingDemand', // 备货需求申请
        component: (resolve) => {
          require(['./purchaseManagement/components/stockingDemand'], resolve);
        }
      }, {
        path: '/stockingPlan', // 备货计划
        component: (resolve) => {
          require(['./purchaseManagement/components/stockingPlan'], resolve);
        }
      }, {
        path: '/purchaseRequirement', // 采购需求管理
        component: (resolve) => {
          require(['./purchaseManagement/components/purchaseRequirement'], resolve);
        }
      },
      {
        path: '/purchaseOrder', // 采购单管理
        component: (resolve) => {
          require(['./purchaseManagement/components/purchaseOrder'], resolve);
        }
      },
      {
        path: '/supplyOrder', // 供应商订单管理
        component: (resolve) => {
          require(['./purchaseManagement/supplyOrder'], resolve);
        }
      },
      {
        path: '/supplyOrdersend', // 供应商发货单列表
        component: (resolve) => {
          require(['./purchaseManagement/supplyOrdersend'], resolve);
        }
      },
      {
        path: '/qualityTest', // 质检单管理
        component: (resolve) => {
          require(['./purchaseManagement/components/qualityTest'], resolve);
        }
      },
      {
        path: '/qualityTestHandle', // 问题件处理
        component: (resolve) => {
          require(['./purchaseManagement/problemPiece/index'], resolve);
        }
      },
      {
        path: '/billPrepayment', // 供应商账单申请预付款
        component: (resolve) => {
          require(['./purchaseManagement/billPrepayment/index'], resolve)
        }
      },
      {
        path: '/receivedProOutboundApply', // 入库出库申请
        component: (resolve) => {
          require(['./purchaseManagement/receivedProOutboundApply/index'], resolve)
        }
      },
      {
        path: '/checkAllShippingCosts', // 寄出运费核对
        component: (resolve) => {
          require(['./purchaseManagement/checkAllShippingCosts/index'], resolve)
        }
      },
      {
        path: '/productAbnormal', // 产品到货异常处理(宜搭迁移到ERP)
        component: (resolve) => {
          require(['./purchaseManagement/productAbnormal/productAbnormal'], resolve)
        }
      },
      {
        path: '/strategySetting', // 备货策略设置
        component: (resolve) => {
          require(['./purchaseSetting/components/strategySetting'], resolve);
        }
      }, {
        path: '/basicSetting', // 采购基础设置
        component: (resolve) => {
          require(['./purchaseSetting/components/basicSetting'], resolve);
        }
      }, {
        path: '/auditRules', // 审核规则设置
        component: (resolve) => {
          require(['./purchaseSetting/components/auditRules'], resolve);
        }
      },
      {
        path: '/tag', // 标签管理
        component: (resolve) => {
          require(['./purchaseSetting/components/tag'], resolve);
        }
      },
      {
        path: '/warereceAddress', // 仓库收货地址
        component: (resolve) => {
          require(['./purchaseSetting/warereceAddress'], resolve);
        }
      },
      {
        path: '/accountSetting', // 仓库收货地址
        component: (resolve) => {
          require(['./purchaseSetting/accountSetting'], resolve);
        }
      },
      {
        path: '/safeDelivery', // 安全交期
        component: (resolve) => {
          require(['./purchaseSetting/components/safeDelivery'], resolve);
        }
      }, {
        path: '/paymentRequest', // 付款申请
        component: (resolve) => {
          require(['./supplierManagement/components/PaymentRequest'], resolve);
        }
      }, {
        path: '/refundRequest', // 退款申请
        component: (resolve) => {
          require(['./supplierManagement/components/refundRequest'], resolve);
        }
      },
      {
        path: '/fullCustodyReturnDataManagement', // 全托管退货管理
        component: (resolve) => {
          require(['./returnsManagment/fullCustodyReturnDataManagement'], resolve);
        }
      },
      {
        path: '/importTask', // 导入查看
        meta: {
          verify: false
        },
        component: (resolve) => {
          require(['@/components/common/importTask'], resolve);
        }
      }, {
        path: '/exportTask', // 导出查看
        meta: {
          verify: false
        },
        component: (resolve) => {
          require(['@/components/common/exportTask'], resolve);
        }
        // component: () => import('@/components/common/exportTask')
      }, {
        path: '/qualityTestPro', // 质检项目管理
        component: (resolve) => {
          require(['./qualityTest/components/qualityTestPro'], resolve);
        }
      },
      // {
      //   path: '/qualityTestClassify', // 质检分类管理
      //   component: (resolve) => {
      //     require(['./qualityTest/components/qualityTestClassify'], resolve);
      //   }
      // }, {
      //   path: '/commodityMatch', // 1688商品配对
      //   component: (resolve) => {
      //     require(['./1688admin/commodityMatch'], resolve);
      //   }
      // }
    ]
  }, {
    path: '/printSuggestionList', // 打印备货建议
    component: (resolve) => {
      require(['./purchaseManagement/components/common/printSuggestionList'], resolve);
    }
  }
];
var Router = new VueRouter({
  mode: 'hash',
  history: false,
  routes: routes
});
// 菜单权限处理
const handMenuKey = (path, roleData) => {
  const allMeunData = Object.values(allMenuKeyObj);
  let info = allMeunData.find(f => f.path == path);
  let newPath = '';
  if (info) {
    if (!roleData.includes(info.menuKey)) {
      info = allMeunData.find(f => roleData.includes(f.menuKey));
      if (info) {
        newPath = info.path;
      }
    }
  } else {
    info = allMeunData.find(f => roleData.includes(f.menuKey));
    if (info) {
      newPath = info.path;
    }
  }
  return newPath;
}

// 全局导航钩子,token处理
Router.beforeEach(function (to, from, next) {
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  const title = titleFun(to);
  document.title = title ? title + '-采购管理系统' : 'LAPA-采购管理系统';
  var menuName = to.name;
  switch (menuName) {
    case 'supplierMenu':
      store.commit('inGroup', 'supplierMenu');// 需AJAX向server请求菜单
      break;
    case 'purchaseMenu':
      store.commit('inGroup', 'purchaseMenu');// 需AJAX向server请求菜单
      break;
    case 'settingMenu':
      store.commit('inGroup', 'settingMenu');// 需AJAX向server请求菜单
      break;
  }

  // 浏览器回退前进点击时菜单状态改变
  var pathIndex = to.path.lastIndexOf('/');
  var pathName = to.path.slice(pathIndex + 1, to.path.length);
  if (pathName === '') pathName = 'supplierManagement';
  let menuKey = 'supplierPurchase_' + pathName;
  if (pathName != store.state.thisPage) {
    store.commit('clickStatus', true);
    store.commit('thisPage', pathName);
  } else {
    store.commit('clickStatus', false);
  }
  const token = getToken();
  Spin.show();
  let newPath = '';
  if (token) {
    // 有token 刷新token
    refreshToken(new Date().getTime()).then(() => {
      getCommonInfo().then((result) => {
        // result ? next() : next({ path: '/noPersermission' });
        newPath = handMenuKey(to.path, store.state.roleData);
        Spin.hide();
        if (newPath) {
          if (window.location.href.includes('#/')) {
            window.location.href = window.location.href.replace(window.location.hash, `#${newPath}`);
            setTimeout(() => {
              window.location.reload();
            }, 20);
          } else {
            next({path: newPath});
          }
        } else {
          next();
        }
      }).catch(() => {
        Spin.hide();
      });
    }).catch(() => {
      Spin.hide();
    });
  } else {
    getAccessToken(to.fullPath).then(() => {
      getCommonInfo().then((result) => {
        // result ? next() : next({ path: '/noPersermission' });
        newPath = handMenuKey(to.path, store.state.roleData);
        Spin.hide();
        if (newPath) {
          if (window.location.href.includes('#/')) {
            window.location.href = window.location.href.replace(window.location.hash, `#${newPath}`);
            setTimeout(() => {
              window.location.reload();
            }, 20);
          } else {
            next({path: newPath});
          }
        } else {
          next();
        }
      }).catch(() => {
        Spin.hide();
      });
    }).catch(() => {
      Spin.hide();
    });
  }
  function getCommonInfo() {
    // 查询商户下所有用户
    return new Promise(resolve => {
      getErpConfig().then(() => {
        // 配置信息
        Promise.all([getBusinessDeptInfo(), getSinglePageRoleCommon(menuKey, to), getAllUser(), getBaseDataList(), getQueryMenu()]).then(() => {
          // resolve(!(typeof result[1] == 'boolean' && !result[1]));
          resolve(true);
        });
      })
    })
  }
});
function getLastPageName() {
  var url = window.location.href;
  var l;
  if (url.indexOf('?') > 0) {
    url = url.split('?')[0].split('/');
    l = url.length;
  } else {
    url = url.split('/');
    l = url.length;
  }
  return url[l - 1];
}
Vue.config.productionTip = false;
// 创建实例挂载到#app
new Vue({
  router: Router,
  store: store // 引入store配置
}).$mount('#app');
