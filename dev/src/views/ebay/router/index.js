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
store.commit('inGroup', 'ebay');// 需AJAX向server请求菜单
store.commit('platformType', 'ebay');// 需AJAX向server请求菜单
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
        component: () => import('@/views/ebay/components/ebay/combineOrder') // 可合并
      },
      {
        path: '/nonPayment',
        component: () => import('@/views/ebay/components/ebay/nonPayment')// 未付款
      }, {
        path: '/matchTheLogistics',
        component: () => import('@/views/ebay/components/ebay/matchTheLogistics')
      }, {
        path: '/cancelOrder',
        component: () => import('@/views/ebay/components/ebay/cancelOrder')// 取消订单
      }, {
        path: '/manualOrder',
        component: () => import('@/components/common/order/manualOrder')// 手工订单
      }, {
        path: '/noPersermission',
        component: () => import('@/components/common/noPersermission')
      }, {
        path: '/500',
        component: () => import('@/components/common/500')
      },
      {
        path: '/importTask',
        component: () => import('@/components/common/importTask')// 导入查看
      }, {
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
  document.title = title ? title + '-订单系统-Ebay' : '订单系统-Ebay';

  let prefix = '';
  // 浏览器回退前进点击时菜单状态改变
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = 'ebay_' + pathName === 'ebay_' ? 'ebay_messageToBeProcessed' : 'ebay_' + pathName;
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
