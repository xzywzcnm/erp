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
import { titleFun } from '@/assets/common.js';

Vue.use(Router);
store.commit('inGroup', 'customer');// 需AJAX向server请求菜单
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;
const routes = [
  {
    path: '/',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      /* {
       path: '/test',
       component: () => import('@/views/customerCenter/components/test') // ebay站内信
       }, */
      {
        path: '/ebayMail',
        component: () => import('@/views/customerCenter/components/customerCenter/ebayMail') // ebay站内信
      }, {
        path: '/ebayCancelOrder', // ebay纠纷取消交易
        component: () => import('@/views/customerCenter/components/ebayDisputesManager/ebayCancelOrder')
      }, {
        path: '/notReceivedTheGoodsInEbay', // ebay纠纷未收到货品
        component: () => import('@/views/customerCenter/components/ebayDisputesManager/notReceivedTheGoodsInEbay')
      }, {
        path: '/ebayRefundReturn', // ebay纠纷退货退款
        component: () => import('@/views/customerCenter/components/ebayDisputesManager/ebayRefundReturn')
      }, {
        path: '/paymentDispute', // 付款纠纷
        component: () => import('@/views/customerCenter/components/ebayDisputesManager/paymentDispute')
      },
      {
        path: '/walmartRefundManage', // Walmart退款管理
        component: () => import('@/views/customerCenter/components/ebayDisputesManager/walmartRefundManage')
      },
      {
        path: '/goodReputation', // 评价
        component: () => import('@/views/customerCenter/components/evaluate/goodReputation')
      }, {
        path: '/mediumReputaion', // 中评
        component: () => import('@/views/customerCenter/components/evaluate/mediumReputaion')
      }, {
        path: '/badReputation', // 差评
        component: () => import('@/views/customerCenter/components/evaluate/badReputation')
      }, {
        path: '/needEvauate', // 需留言评价
        component: () => import('@/views/customerCenter/components/evaluate/needEvauate')
      }, {
        path: '/waitBuyerEvauate', // 等待买家评价
        component: () => import('@/views/customerCenter/components/evaluate/waitBuyerEvauate')
      }, {
        path: '/postSaleTreatment', // 售后处理
        component: () => import('@/views/customerCenter/components/postSaleTreatment/postSaleTreatment')
      }, {
        path: '/postSaleReasonsTreatment', // 售后原因管理
        component: () => import('@/views/customerCenter/components/postSaleTreatment/postSaleReasonsTreatment')
      }, {
        path: '/importTask',
        component: () => import('@/views/customerCenter/components/export/importTask')// 导入查看
      }, {
        path: '/exportTask',
        component: () => import('@/components/common/exportTask')// 导出查看
        // component: () => import('@/views/customerCenter/components/export/exportTask')// 导出查看
      }, {
        path: '/autoCustomer',
        component: () => import('@/views/customerCenter/components/autoCustomer/autoCustomer')// 自动客服
      }, {
        path: '/noPersermission',
        component: () => import('@/components/common/noPersermission')
      }, {
        path: '/blacklistManage',
        component: () => import('@/views/customerCenter/components/blacklist/blacklist')// 黑名单
      }, {
        path: '/mailStatistics',
        component: () => import('@/views/customerCenter/components/mailStatistics/mailStatistics')// 客服统计
      }, {
        path: '/bestOffer', // 议价
        component: () => import('@/views/customerCenter/components/bargain/bestOffer')
      }
      /* {
       path: '/recurrentCustomers',
       component: () => import('@/views/customerCenter/components/returning/returningGuests')// 回头客户
       },
       {
       path: '/blacklist',
       component: () => import('@/views/customerCenter/components/blacklist/blacklist')// 回头客
       },
       {
       path: '/blacklist',
       component: () => import('@/views/customerCenter/components/blacklist/blacklist')// 回收站
       } */
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
  document.title = title ? title + '-客服管理' : '客服管理';

  let prefix = '';
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  let pathIndex = to.path.lastIndexOf('/');
  let pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = 'customer_' + pathName === 'customer_' ? 'customer_ebayMail' : 'customer_' + pathName;
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
