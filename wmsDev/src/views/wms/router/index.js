import Vue from 'vue';
import Router from 'vue-router';
// import '@/locale/index';
import store from '@/store/store';
import { getToken } from '@/utils/cookie';
import config from '@/config';
import exWarehouseRoutes from './exWarehouse';
import winit from './winit';
import px4 from './4px';
import barn from './barn';
import yuncang from './yuncang';
import fbaRouter from './fbaRouter';
import cneRouter from './cneRouter';
import directlyRouter from './directlyRouter';
import rinidRouter from './rinidRouter';
import novFireRouter from './novFireRouter';
import amloutstoreRouter from './amloutstoreRouter';
import pyl from './pyl';
import shl from './shl';
import ef from './ef';
import inventoryManage from './inventoryManage';
import { Spin } from 'view-design';
import {
  setLeftMenuClickStatus,
  getLastPageName
} from '@/utils';
import {
  getAccessToken,
  refreshToken,
  getErpconfig,
  getSinglePageRoleCommon,
  getTicketTokenHand,
  getAllWarehouse
} from '@/utils/user';
import { titleFun } from '@/assets/common.js';

Vue.use(Router);
store.commit('inGroup', 'warehouse');
// localStorage.setItem('sysSelect', 'menuWms');
let pageName = getLastPageName();
store.commit('thisPage', pageName);
let countTime = config.curTime;
const routes = [
  {
    path: '/',
    redirect: '/index',
    component: () => import('@/components/layout/main'), // 引入主文件
    children: [
      {
        path: '/index', // 首页
        meta: {
          verify: false
        },
        component: () => import('@/views/wms/components/index')
      }, {
        path: '/wareSetting', // 仓库设置
        component: () => import('@/views/wms/components/wms-wareManage/wareSetting')
      }, {
        path: '/wareArea', // 库区管理
        component: () => import('@/views/wms/components/wms-wareManage/wareArea')
      }, {
        path: '/wareLocate', // 库位管理
        component: () => import('@/views/wms/components/wms-wareManage/wareLocate')
      }, {
        path: '/receipt', // 收货
        component: () => import('@/views/wms/components/wms-inWareManage/receipt')
      }, {
        path: '/inWareManage', // 入库单管理
        component: () => import('@/views/wms/components/wms-inWareManage/inWareManage')
      }, {
        path: '/qualityManage', // 质检管理
        component: () => import('@/views/wms/qualityManage/index')
      }, {
        path: '/shelvesManage', // 上架管理
        component: () => import('@/views/wms/components/wms-inWareManage/shelvesManage')
      }, {
        path: '/problemPiece', // 问题件处理
        component: () => import('@/views/wms/problemPiece/index')
      },
      {
        path: '/returnManage', // 全托管退货管理
        component: () => import('@/views/wms/components/wms-inWareManage/returnManage/index')
      },
      ...exWarehouseRoutes,
      ...inventoryManage,
      ...winit,
      ...barn,
      ...px4,
      ...yuncang,
      ...fbaRouter,
      ...cneRouter,
      ...directlyRouter,
      ...rinidRouter,
      ...novFireRouter,
      ...amloutstoreRouter,
      ...pyl,
      ...shl,
      ...ef,
      {
        path: '/importTask', // 导入
        component: () => import('@/views/wms/components/importExportTask/importTask')
      }, {
        path: '/exportTask', // 导出
        component: () => import('@/views/wms/components/importExportTask/exportTask')
      }, {
        path: '/winitExport', // 导出
        component: () => import('@/views/wms/components/importExportTask/exportTask')
      }, {
        path: '/amazonOnlineProduct', // Amazon在线商品
        component: () => import(
          '@/views/wms/components/wms-amazonFBAManage/amazonOnlineProduct'
        )
      }, {
        path: '/fbaStockManage', // Amazon库存管理
        component: () => import('@/views/wms/components/wms-amazonFBAManage/fbaStockManage')
      }, {
        path: '/godownEntryManage', // Amazon入库单管理
        component: () => import(
          '@/views/wms/components/wms-amazonFBAManage/godownEntryManage'
        )
      }, {
        path: '/noPersermission', // 无权限
        component: () => import('@/components/common/noPersermission')
      }, {
        path: '/printGoodsShelves', // 打印货架标签
        component: () => import('@/views/wms/printLabel/printGoodsShelves')
      }
    ]
  }, {
    path: '/printPickList',
    component: resolve => {
      require(['@/views/wms/components/exWarehouse/printPickList.vue'], resolve);
    }
  }, {
    path: '/printPickListBatch',
    component: resolve => {
      require(['@/views/wms/components/exWarehouse/printPickListBatch.vue'], resolve);
    }
  }, {
    path: '/printPickUpList', // 打印补拣单
    component: () => import('@/views/wms/components/exWarehouse/printPickUpList')
  }, {
    path: '/printDistributionList', // 打印配货清单
    component: resolve => {
      require(['@/views/wms/components/exWarehouse/printDistributionList.vue'], resolve);
    }
  }, {
    path: '/stockForm',
    component: resolve => {
      require(['@/views/wms/components/exWarehouse/stockForm.vue'], resolve);
    }
  }, {
    path: '/test',
    component: () => import('@/views/test')
  }
];
const router = new Router({
  mode: 'hash',
  routes
});

router.beforeEach(function (to, from, next) {
  // 浏览器回退前进点击时菜单状态改变
  Spin.show();
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  const title = titleFun(to);
  document.title = title ? title + '-WMS仓储管理系统' : 'LAPA-WMS仓储管理系统';

  // 外包人员写的业务代码，不知道有什么用，留待查看
  store.commit('groupWorkShow', 'list');
  store.commit('adjustOrderShow', 'adjust');
  store.commit('freezeOrderShow', 'freeze');
  store.commit('moveOrderShow', 'move');
  store.commit('scanOrderShow', 'scan');
  store.commit('transferOrderShow', 'transfer');
  // End
  // 浏览器回退前进点击时菜单状态改变
  let pathName = to.path.replace(/\//g, '_').slice(1);
  if (pathName === 'scanEx') {
    // 扫描出库 特殊处理
    pathName = 'exwarehouse';
  }
  if (pathName === 'printDistributionList') {
    // 打印配货清单 特殊处理
    pathName = 'prePrintSheet';
  }

  // FBA出库单开发权限用的，后期开发完成配置权限要把这里删除
  if (pathName === 'fbaOtherStockOut') {
    pathName = 'otherStockOut';
  }

  let Yms_path = ['WaitForDistribution', 'IssuedLogisticsProvider'];
  let menuKey = 'wms_' + pathName === 'wms_' ? 'wms_index' : Yms_path.indexOf(pathName) > -1
    ? 'Yms_wms_' + pathName
    : 'wms_' + pathName;
  setLeftMenuClickStatus(pathName); // leftMenu click status
  const token = getToken();
  if (token) {
    refreshToken(countTime);
    getTicketTokenHand().then(() => {
      Promise.all([getErpconfig(''), getSinglePageRoleCommon(menuKey, to)]).then(result => {
        if (typeof result[1] == 'boolean' && !result[1]) {
          Spin.hide();
          next({ path: '/noPersermission' });
        } else if (result[0]) {
          getAllWarehouse().then(() => {
            Spin.hide();
            next();
          }).catch(() => {
            Spin.hide();
          });
        } else {
          Spin.hide();
        }
      }).catch(() => {
        Spin.hide();
      });
    }).catch(() => {
      Spin.hide();
    })
    // next();
  } else {
    getAccessToken(to.fullPath).then(result => {
      if (result) {
        setTimeout(function () {
          refreshToken(countTime);
        }, countTime);
        Promise.all([getErpconfig(''), getSinglePageRoleCommon(menuKey, to)]).then(result => {
          if (typeof result[1] == 'boolean' && !result[1]) {
            Spin.hide();
            next({ path: '/noPersermission' });
          } else if (result[0]) {
            getAllWarehouse().then(() => {
              Spin.hide();
              next();
            }).catch(() => {
              Spin.hide();
            });
          } else {
            Spin.hide();
          }
        }).catch(() => {
          Spin.hide();
        });
      } else {
        Spin.hide();
      }
    }).catch(() => {
      Spin.hide();
    });
  }
});
export default router;
