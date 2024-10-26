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
store.commit('inGroup', 'productCenter');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;

const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      {
        path: '/productGoods',
        alias: '/',
        component: () => import('@/views/productCenter/components/productCenter/newProductGoods')// 商品管理
      },
      {
        path: '/newProductGoods',
        alias: '/',
        component: () => import('@/views/productCenter/components/productCenter/productGoods')// 商品管理
      },
      {
        path: '/productCategory',
        component: () => import('@/views/productCenter/components/productCenter/productCategory')// 分类管理
      }, {
        path: '/productTag',
        component: () => import('@/views/productCenter/components/productCenter/productTag')// 标签管理
      }, {
        path: '/productBrand',
        component: () => import('@/views/productCenter/components/productCenter/productBrand')// 品牌管理
      }, {
        path: '/productSkuMapping',
        component: () => import('@/views/productCenter/components/productCenter/productSkuMapping')// SKU映射
      },
      {
        path: '/thirdpartyTagManage',
        component: () => import('@/views/productCenter/components/productCenter/thirdpartyTagManage')// 第三方标签管理
      },
      {
        path: '/importTask',
        component: () => import('@/components/common/importTask')// 导入查看
        // component: () => import('@/views/productCenter/components/productCenter/importTask')// 导入查看
      }, {
        path: '/exportTask',
        component: () => import('@/components/common/exportTask')// 导出查看
        // component: () => import('@/views/productCenter/components/productCenter/exportTask')// 导出查看
      }, {
        path: '/noPersermission',
        component: () => import('@/components/common/noPersermission')
      },
      {
        path: '/attributeManagement',
        component: () => import('@/views/productCenter/components/productCenter/attributeManagement')// 属性管理
      },
      {
        path: '/attributeClassification',
        component: () => import('@/views/productCenter/components/productCenter/attributeClassification')// 属性分类管理
      },
      {
        path: '/qualityProject',
        component: () => import('@/views/productCenter/components/productCenter/qualityProject')// 质检项目管理
      },
      {
        path: '/qualityClassification',
        component: () => import('@/views/productCenter/components/productCenter/qualityClassification')// 质检模块管理
      },
      // {
      //   path: '/classifyManagement',
      //   component: () => import('@/views/productCenter/components/productCenter/classifyManagement')// 分类管理
      // },
      {
        path: '/500',
        component: () => import('@/components/common/500')
      }
    ]
  },
  {
    path: '/sizePicture',
    meta: {
      verify: false,
    },
    component: () => import('@/views/productCenter/components/productCenter/sizeChart/createSizePicture')// 通用尺码图生成
  },
  {
    path: '/childSizePicture',
    meta: {
      verify: false,
    },
    component: () => import('@/views/productCenter/components/productCenter/sizeChart/createChildSizePicture')// 婴童(儿童)尺码图生成
  },
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
  document.title = title ? title + '-商品管理系统' : '商品管理系统';

  let prefix = '';
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = `productCenter_${pathName}` == 'productCenter_' ? 'productCenter_productGoods' : `productCenter_${pathName}`;
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
