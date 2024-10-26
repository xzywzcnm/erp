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
import { titleFun } from '@/assets/common.js';

Vue.use(Router);
store.commit('inGroup', 'generalSettings');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    // redirect: '/shop/ebay',
    redirect: '/shop',
    children: [
      {
        path: '/noPersermission',
        component: () => import('@/components/common/noPersermission')
      },
      {
        path: '/shop',
        // redirect: '/shop/ebay',
        beforeEnter(to, from, next) {
          store.dispatch('getplatformGroup').then(list => {
            let firstPlatform = {};
            for (let i in list) {
              if (list[i].type == 1 && list[i].status == 1) {
                firstPlatform = list[i];
                break
              }
            }
            let path = list.length ? firstPlatform.platformId : 'ebay';
            next('/shop/' + path);
          })
        }
      },
      {
        path: '/shop/:platform([ebay|aliexpress|shopify|lazada|wish|joom|tophatter|cdiscount|newegg|priceminister|walmart|dhgate|alibaba|yandex|mycom|shopee|factorymarket|mercadolibre|amazon|alibabagj|vova|real|allegro|ept|jdyn|otto|miravia|sheinx]+)',
        component: () => import('@/views/generalSettings/components/generalSettings/shop/commonShop')
      },
      {
        path: '/management',
        component: () => import('@/views/generalSettings/components/generalSettings/management') // 会员
      }, {
        path: '/businessRoleManage',
        component: () => import('@/views/generalSettings/components/generalSettings/businessRoleManage') // 业务角色管理
      }, {
        path: '/paypalAccountSetting',
        component: () => import('@/views/generalSettings/components/generalSettings/paypalAccountSetting') // palpay
      }, {
        path: '/exchangeRate',
        component: () => import('@/views/generalSettings/components/generalSettings/exchangeRate') // 汇率管理
      }, {
        path: '/monthlyAverageRate',
        component: () => import('@/views/generalSettings/components/generalSettings/monthlyAverageRate') // 月平均汇率管理
      },
      {
        path: '/ymsAccountManage',
        component: () => import('@/views/generalSettings/components/generalSettings/ymsAccountManage') // YMS 账号管理
      }
    ]
  },
  {
    path: '*',
    redirect: '/noPersermission',
    component: () => import('@/components/layout/main') // 引入主文件
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
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  const title = titleFun(to, { name: '/shop/', value: '/shop' });
  document.title = title ? title + '-设置中心' : '设置中心';
  let prefix = '';
  // let url = window.location.href;
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  if (to.path.includes('shop/')) {
    pathName = 'shop';
  }
  let menuKey = 'generalSettings_' + pathName === 'generalSettings_'
    ? 'generalSettings_shop'
    : 'generalSettings_' + pathName;
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
