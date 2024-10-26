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
store.commit('inGroup', 'customSettings');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;
const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      {
        path: '/mailFolder',
        component: () => import('@/views/customSettings/components/customSettings/mailFolder') // 站内信文件夹
      }, {
        path: '/mailPriority',
        component: () => import('@/views/customSettings/components/customSettings/mailPriority') // 站内信文件夹
      }, {
        path: '/mailRecoveryTemp',
        component: () => import('@/views/customSettings/components/customSettings/mailRecoveryTemp') // 站内信文件夹
      }, {
        path: '/mailAutoRule',
        component: () => import('@/views/customSettings/components/customSettings/mailAutoRule') // 站内信自动规则
      }, {
        path: '/automaticSendingMessageRulesOfStation',
        component: () => import('@/views/customSettings/components/customSettings/automaticSendingMessageRulesOfStation') // 站内信自动发送规则
      },
      {
        path: '/evaluateSettings',
        component: () => import('@/views/customSettings/components/customSettings/evaluateSettings') // 评价模板
      },
      {
        path: '/autoSendEmail',
        component: () => import('@/views/customSettings/components/customSettings/autoSendEmail') // 站内信自动发送邮件
      },
      {
        path: '/automaticRefund',
        component: () => import('@/views/customSettings/components/customSettings/automaticRefund') // 自动退款
      }, {
        path: '/automaticEvaluation',
        component: () => import('@/views/customSettings/components/customSettings/automaticEvaluation') // 自动评价
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
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = 'customSettings_' + pathName === 'customSettings_' ? 'customSettings_mailFolder' : 'customSettings_' + pathName;
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
