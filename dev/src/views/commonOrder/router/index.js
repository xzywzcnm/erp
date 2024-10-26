import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store/store';
import { getToken } from '@/utils/cookie';
import config from '@/config';
import common from '@/utils/common';
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
  // getSinglePageRole,
  // getUserMes
} from '@/utils/user';
import { getQueryString } from '@/utils/index';
import { titleFun } from '@/assets/common.js';

const platform = getQueryString('platform') || 'shopify';

const tabPaneTitle = {
  allplatform: '全平台'
};

Vue.use(Router);
store.commit('inGroup', platform);// 需AJAX向server请求菜单
store.commit('platformType', platform);// 需AJAX向server请求菜单
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
      }, {
        path: '/messageToBeProcessed',
        component: () => import('@/views/commonOrder/components/commonOrder/messageToBeProcessed')// 发货常用申报
      }, {
        path: '/unmatchProduct',
        component: () => import('@/views/commonOrder/components/commonOrder/unmatchProduct')// 未匹配商品
      }, {
        path: '/interceptOrder',
        component: () => import('@/views/commonOrder/components/commonOrder/interceptOrder')// 截留订单
      }, {
        path: '/combineOrder',
        component: () => import('@/views/commonOrder/components/commonOrder/combineOrder') // 可合并
      }, {
        path: '/markShipments',
        component: () => import('@/views/commonOrder/components/commonOrder/markShipments') // 标发货
      },
      {
        path: '/orderToRetrieve',
        component: () => import('@/views/commonOrder/components/commonOrder/orderToRetrieve')// 订单检索
      },
      {
        path: '/platformShippedOrder',
        component: () => import('@/views/commonOrder/components/commonOrder/platformShippedOrder')// 平台仓订单
      },
      {
        path: '/nonPayment',
        component: () => import('@/views/commonOrder/components/commonOrder/nonPayment')// 未付款
      }, {
        path: '/matchTheLogistics',
        component: () => import('@/views/commonOrder/components/commonOrder/matchTheLogistics')
      }, {
        path: '/cancelOrder',
        component: () => import('@/views/commonOrder/components/commonOrder/cancelOrder')// 取消订单
      }, {
        path: '/noPersermission',
        component: () => import('@/components/common/noPersermission')
      }, {
        path: '/manualOrder',
        component: () => import('@/components/common/order/manualOrder')// 手工订单
      },
      {
        path: '/platformWarehouseDelivery',
        component: () => import('@/views/commonOrder/components/commonOrder/platformShippedOrder')// 沃尔玛平台仓发货订单
      },
      {
        path: '/500',
        component: () => import('@/components/common/500')
      }, {
        path: '/stockoutOrder',
        component: () => import('@/views/commonOrder/components/commonOrder/stockoutOrder')
      }, {
        path: '/importTask',
        component: () => import('@/components/common/importTask')// 导入查看
      }, {
        path: '/exportTask',
        component: () => import('@/components/common/exportTask')// 导出查看
      }, {
        path: '/returnPackage',
        component: () => import('@/views/commonOrder/components/otto/returnPackage')// 退货包裹管理
      }, {
        path: '/refundProcess',
        component: () => import('@/views/commonOrder/components/otto/refundProcess')// 退款申请处理
      }
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
  const title = titleFun(to);
  const platform = getQueryString('platform');
  if (!common.isEmpty(platform) && store.state.inGroup != platform) {
    store.commit('inGroup', platform);// 需AJAX向server请求菜单
    store.commit('platformType', platform);// 需AJAX向server请求菜单
  }
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  let prefix = '';
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = platform + '_' + pathName === platform + '_' ? platform + '_messageToBeProcessed' : platform + '_' + pathName;
  const titleSuffix = common.isEmpty(tabPaneTitle[platform]) ? platform : tabPaneTitle[platform];
  window.document.title = title ? `${title}-订单系统-${titleSuffix}` : `订单系统-${titleSuffix}`;
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
