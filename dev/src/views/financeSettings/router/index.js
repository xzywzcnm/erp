import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store/store';
import { getToken } from '@/utils/cookie';
import { Spin } from 'view-design';
import config from '@/config';
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
// 这里financeSettings可以让左边菜单正常跳转
store.commit('inGroup', 'financeSettings');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      {
        path: '/operateTemplate',
        component: () => import('@/views/financeSettings/components/operateTemplate') // 操作费用模版
      },
      {
        path: '/storageTemplate',
        component: () => import('@/views/financeSettings/components/storageTemplate') // 仓储费用模版
      },
      {
        path: '/deliverTemplate',
        component: () => import('@/views/financeSettings/components/deliverTemplate') // 出仓费用模版
      },
      {
        path: '/freightTemplate',
        component: () => import('@/views/financeSettings/components/freightTemplate') // 运费模版
      },
      {
        path: '/remoteAreaCostTemplate',
        component: () => import('@/views/financeSettings/components/otherFreightChargeTemplate') // 偏远地区费用模版
      },
    ]
  }
];

const router = new Router({
  mode: 'hash',
  routes,
  scrollBehavior(to, from, savedPosition) {
    return {
      x: 0,
      y: 0
    };
  }
});

router.beforeEach(function (to, from, next) {
  let prefix = '';
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = 'financeSettings' + pathName === 'financeSettings'
    ? 'financeSettings_operateTemplate'
    : 'financeSettings_' + pathName;
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
