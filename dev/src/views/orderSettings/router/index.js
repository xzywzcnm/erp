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
store.commit('inGroup', 'orderSettings');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;
const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      {
        path: '/smartLogisticsRule',
        component: () => import('@/views/orderSettings/components/orderSettings/smartLogisticsRule') // 智能物流
      }, {
        path: '/orderReviewRule',
        component: () => import('@/views/orderSettings/components/orderSettings/orderReviewRule') // 订单审核规则
      }, {
        path: '/autoDistributionWarehouseRule', // 自动分仓规则
        component: () => import('@/views/orderSettings/components/orderSettings/autoDistributionWarehouseRule')
      }, {
        path: '/orderTagSetting', // 订单标签管理
        component: () => import('@/views/orderSettings/components/orderSettings/orderTagSetting')
      }, {
        path: '/skuMatchSetting', // SKU匹配设置
        component: () => import('@/views/orderSettings/components/orderSettings/skuMatchSetting')
      }, {
        path: '/noPersermission',
        component: () => import('@/components/common/noPersermission')
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
  let prefix = '';
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = 'orderSettings_' + pathName === 'orderSettings_'
                ? 'order_smartLogisticsRule'
                : 'orderSettings_' + pathName;
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
