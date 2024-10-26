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
  getUserMes,
  getSinglePageRole,
  refreshToken,
  getQueryMenu
} from '@/utils/user';

Vue.use(Router);
store.commit('inGroup', 'delivery');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      {
        path: '/print', // 打印
        component: () => import('@/views/delivery/components/delivery/print')
      }, {
        path: '/issuedLogisticsProvider', // 下发物流商
        component: () => import('@/views/delivery/components/delivery/issuedLogisticsProvider')
      }, {
        path: '/exwarehouse', // 出库
        component: () => import('@/views/delivery/components/delivery/exwarehouse')
      }, {
        path: '/prePrintSheet', // 重打面单
        component: () => import('@/views/delivery/components/delivery/prePrintSheet')
      }, {
        path: '/cancelPackage', // 作废包裹
        component: () => import('@/views/delivery/components/delivery/cancelPackage')
      }, {
        path: '/searchPackage', // 包裹检索
        component: () => import('@/views/delivery/components/delivery/searchPackage')
      }, {
        path: '/scanEx', // 扫描出库
        component: () => import('@/views/delivery/components/delivery/scanEx')
      }, {
        path: '/sorting', // 多品分拣
        component: () => import('@/views/delivery/components/delivery/sorting')
      }, {
        path: '/packaging', // 包装作业
        component: () => import('@/views/delivery/components/delivery/packaging')
      }
    ]
  }
];

const router = new Router({
  mode: 'hash',
  routes
});

router.beforeEach(function (to, from, next) {
  let prefix = '';
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = 'delivery_' + pathName === 'delivery_' ? 'order_print' : 'delivery_' + pathName;
  setLeftMenuClickStatus(pathName);// leftMenu click status
  const token = getToken();
  if (token) {
    refreshToken(countTime);
    getQueryMenu().then(() => {
      Promise.all([
        getSinglePageRole(menuKey, to), getUserMes(), getErpconfig(prefix)
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
            getSinglePageRole(menuKey, to), getUserMes(), getErpconfig(prefix)
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
