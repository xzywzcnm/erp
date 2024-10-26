import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store/store';
import { getToken } from '@/utils/cookie';
import { Spin } from 'view-design';
import axios from 'axios';
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
store.commit('inGroup', 'logistics');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      {
        path: '/noPersermission',
        component: () => import('@/components/common/noPersermission')
      }, {
        path: '/baseDelcaration',
        component: () => import('@/views/logistics/components/logistics/baseDelcaration')
      }, {
        path: '/logisticsSettings', // 物流设置
        component: () => import('@/views/logistics/components/logistics/logisticsSettings')
      }, {
        path: '/sortOrderSetting', // 见货出单设置
        component: () => import('@/views/logistics/components/logistics/sortOrderSetting')
      }, {
        path: '/wrapperManage', // 包材管理
        component: () => import('@/views/logistics/components/logistics/wrapperManage')
      }, {
        path: '/wareSetting', // 仓库设置
        component: () => import('@/views/logistics/components/warehouse/wareSettingSecond')
      }, {
        path: '/wareArea', // 库区设置
        component: () => import('@/views/logistics/components/warehouse/wareArea')
      }, {
        path: '/wareLocate', // 库位设置
        component: () => import('@/views/logistics/components/warehouse/wareLocate')
      }, {
        path: '/allotRule', // 分配规则
        component: () => import('@/views/logistics/components/logistics/allotRule')
      }, {
        path: '/issueLogisticsRule', // 下发物流商规则
        component: () => import('@/views/logistics/components/logistics/issueLogisticsRule')
      }, {
        path: '/zoningScheme', // 分区方案
        component: () => import('@/views/logistics/components/logistics/zoningScheme')
      }, {
        path: '/declarationRules', // 申报规则
        component: () => import('@/views/logistics/components/logistics/declarationRules')
      },
      {
        path: '/carrierGoodsBattery', // 带电资质
        component: () => import('@/views/logistics/components/logistics/carrierGoodsBattery')
      },
      {
        path: '/boxVolumnAuthority', // 货箱体积设置
        component: () => import('@/views/logistics/components/logistics/containerVolumeSetting')
      },
      {
        path: '/storageSettings', // 仓库费用设置
        component: () => import('@/views/logistics/components/logistics/storageSettings')
      }
    ]
  }
];

const router = new Router({
  mode: 'hash',
  routes
});

router.beforeEach(function (to, from, next) {
  // let prefix = '';
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = 'logistics_' + pathName === 'logistics_' ? 'logistics_baseDelcaration' : 'logistics_' + pathName;
  if (pathName === 'logisticsSettings') {
    // 物流设置 需要添加特殊头部
    axios.defaults.headers['PlatformId'] = 'wms_carrier_0';
  } else {
    delete axios.defaults.headers['PlatformId'];
  }
  setLeftMenuClickStatus(pathName);// leftMenu click status
  const token = getToken();
  if (token) {
    refreshToken(countTime);
    getQueryMenu().then(() => {
      Promise.all([
        getSinglePageRole(menuKey, to), getUserMes(), getErpconfig('/wms-service')
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
            getSinglePageRole(menuKey, to), getUserMes(), getErpconfig('/wms-service')
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
