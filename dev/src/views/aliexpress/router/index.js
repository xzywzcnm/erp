import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store/store';
import { getToken } from '@/utils/cookie';
import config from '@/config';
import { Spin } from 'view-design';
import {
  setLeftMenuClickStatus,
  getLastPageName
} from '@/utils';

import {
  getAccessToken,
  getErpconfig,
  getUserMesCommon,
  getSinglePageRoleCommon,
  refreshToken,
  getQueryMenu
} from '@/utils/user';
import { titleFun } from '@/assets/common.js';

Vue.use(Router);
store.commit('inGroup', 'aliexpress');// 需AJAX向server请求菜单
store.commit('platformType', 'aliexpress');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      {
        path: '/',
        redirect: '/messageToBeProcessed'
      },
      {
        path: '/combineOrder',
        component: () => import('@/views/aliexpress/components/aliexpress/combineOrder') // 可合并
      },
      {
        path: '/nonPayment',
        component: () => import('@/views/aliexpress/components/aliexpress/nonPayment')// 未付款
      },
      {
        path: '/cancelOrder',
        component: () => import('@/views/commonOrder/components/commonOrder/cancelOrder')// 取消订单
      },
      {
        path: '/matchTheLogistics',
        component: () => import('@/views/aliexpress/components/aliexpress/matchTheLogistics')
      },
      {
        path: '/manualOrder',
        component: () => import('@/components/common/order/manualOrder')// 手工订单
      },
      {
        path: '/riskOrder',
        component: () => import('@/views/aliexpress/components/aliexpress/riskOrder')// 风控订单
      },
      {
        path: '/waitingForReceivingConfirmation',
        component: () => import('@/views/aliexpress/components/aliexpress/waitingForReceivingConfirmation')// 待收货确认
      },
      {
        path: '/trusteeshipOrder',
        component: () => import('@/components/common/order/trusteeshipOrder') // 全托管订单
      },
      {
        path: '/certificationOrder',
        component: () => import('@/views/commonOrder/components/commonOrder/platformShippedOrder')// 菜鸟仓履约订单
      },
      {
        path: '/noPersermission',
        component: () => import('@/components/common/noPersermission')
      },
      {
        path: '/500',
        component: () => import('@/components/common/500')
      },
      {
        path: '/importTask',
        component: () => import('@/components/common/importTask')// 导入查看
      },
      {
        path: '/exportTask',
        component: () => import('@/components/common/exportTask')// 导出查看
      }
    ]
  }
];

const router = new Router({
  mode: 'hash',
  routes,
  scrollBehavior (to, from, savedPosition) {
    return {
      x: 0,
      y: 0
    };
  }
});

router.beforeEach(function (to, from, next) {
  const title = titleFun(to);
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  document.title = title ? title + '-订单系统-Aliexpress' : '订单系统-Aliexpress';

  let prefix = '';
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = 'aliexpress_' + pathName === 'aliexpress_'
                ? 'aliexpress_messageToBeProcessed'
                : 'aliexpress_' + pathName;
  setLeftMenuClickStatus(pathName);// leftMenu click status
  const token = getToken();
  if (token) {
    refreshToken(countTime);
    getQueryMenu().then(() => {
      Promise.all([
        getSinglePageRoleCommon(menuKey, to), getUserMesCommon(), getErpconfig(prefix)
      ]).then(result => {
        if (typeof result[0] == 'boolean' && !result[0]) {
          Spin.hide();
          next({ path: '/noPersermission' });
        } else if (result[0] && result[1] && result[2]) {
          Spin.hide();
          next();
        }
      });
    });
  } else {
    getAccessToken(to.fullPath).then(result => {
      if (result) {
        setTimeout(function () {
          refreshToken(countTime);
        }, countTime);
        getQueryMenu().then(() => {
          Promise.all([
            getSinglePageRoleCommon(menuKey, to), getUserMesCommon(), getErpconfig(prefix)
          ]).then(result => {
            if (typeof result[0] == 'boolean' && !result[0]) {
              Spin.hide();
              next({ path: '/noPersermission' });
            } else if (result[0] && result[1] && result[2]) {
              Spin.hide();
              next();
            }
          });
        });
      }
    });
  }
});

export default router;
