import Vue from "vue";
// import { t } from "@/locale/method";
import Router from "vue-router";
import Main from "@/components/layout/main";
import { getToken } from "@/utils/cookie";
import store from "@/store/store";
// import { Spin } from 'view-design'

import config from "@/config";
import {
  getAccessToken,
  refreshToken,
  getUserMesCommon,
  getErpConfig,
  getVersion,
  getSinglePageRole
} from "@/utils/user";

const roleKey = 'productDev_';
let countTime = config.curTime;

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router);
const routes = [
  {
    path: "/",
    name: "新品开发",
    component: Main,
    children: [
      // {
      //   path: "/demandList",
      //   name: "销售需求创建",
      //   component: () => import("@v/pds/stockUp/demandList") // 创建需求
      // },
      // {
      //   path: "/backlog",
      //   name: "待办任务",
      //   component: () => import("@v/pds/stockUp/backlog") // 待办任务
      // },
      // {
      //   path: "/haveDone",
      //   name: "已办任务",
      //   component: () => import("@v/pds/stockUp/haveDone") // 已办任务
      // },
      // {
      //   path: "/paymentList",
      //   name: "付款记录",
      //   component: () => import("@v/pds/stockUp/paymentList") // 付款记录
      // },
      // {
      //   path: "/perfect",
      //   name: "已询价商品管理",
      //   component: () => import("@v/pds/stockUp/perfect") // 完善产品资料
      // },
      // {
      //   path: "/samplePurchase",
      //   name: "我的样品采购",
      //   component: () => import("@v/pds/stockUp/samplePurchase") // 我的样品采购
      // },
      {
        path: "/index",
        name: "首页",
        alias: "/",
        component: () => import("@v/pds/stockUp/index") // 首页
      },
      // {
      //   path: "/calc",
      //   name: "新品计算器",
      //   alias: "/",
      //   component: () => import("@v/pds/stockUp/calc") // 新品计算器
      // },
      // {
      //   path: "/allList",
      //   name: "需求列表",
      //   component: () => import("@v/pds/Requirement/allList") // 需求列表
      // },
      // {
      //   path: "/manage",
      //   name: "样品采购管理",
      //   component: () => import("@v/pds/Purchase/manage") // 样品采购管理
      // },
      // {
      //   path: "/procedure",
      //   name: "流程配置",
      //   component: () => import("@v/pds/FlowConfig/manage") // 流程配置
      // },
      // {
      //   path: "/feeTemplate",
      //   name: "费用模板管理",
      //   component: () => import("@v/pds/FlowConfig/feeTemplate") // 费用模板管理
      // },
      // {
      //   path: "/headTransport",
      //   name: "头程运输",
      //   component: () => import("@v/pds/FlowConfig/headTransport") // 头程运输
      // },
      // {
      //   path: "/receivingAddress",
      //   name: "收货地址管理",
      //   component: () => import("@v/pds/stockUp/receivingAddress") // 收货地址管理
      // },
      {
        path: "/chooseStyle",
        name: "选款",
        component: () => import("@v/pds/chooseGood/chooseStyle") // 选款
      },
      // {
      //   path: "/basic",
      //   name: "组件管理",
      //   component: () => import("@v/pds/componentPage/basic") // 选款
      // },
    ]
  },
  {
    path: "/newpds",
    name: "newpds",
    component: Main,
    meta: { title: 'LAPA新品开发' },
    children: [
      {
        path: "/createRequire",
        name: "CreateRequire",
        alias: '/newpds',
        component: () => import("@v/pds/newProducts/developmentRequire/createRequire"),
        meta: { title: '现货创建需求' },
      },
      {
        path: "/plateMaking",
        name: "plateMaking",
        component: () => import("@v/pds/newProducts/developmentRequire/plateMaking"),
        meta: { title: '打版创建需求' },
      },
      {
        path: "/todoTask",
        name: "TodoTask",
        component: () => import("@v/pds/newProducts/todoTask/index"),
        meta: { title: '我的待办任务' },
      },
      {
        path: '/codingRules', // 商品编码自动编码规则
        component: () => import('@v/pdsSettings/components/codingRules')
      }, {
        path: '/upcGenerationRules', // 商品编码自动编码规则
        component: () => import('@v/pdsSettings/components/upcGenerationRules')
      },
      {
        path: '/skcColormanage', // SKC颜色管理
        component: () => import('@v/pdsSettings/components/skcColormanage')
      },
      {
        path: '/typeManage', // 分类类型管理
        component: () => import('@v/pdsSettings/components/typeManage')
      },
      // {
      //   path: '/sizeManage', // 尺码管理
      //   component: () => import('@v/pdsSettings/components/sizeManage')
      // },
      // {
      //   path: '/sizeTypeRelManage', // 尺码类型管理
      //   component: () => import('@v/pdsSettings/components/sizeTypeManage')
      // },
      {
        path: '/sizeManage', // 尺码管理和尺码类型管理
        component: () => import('@v/pdsSettings/components/sizeMergeTypeManage')
      },
      {
        path: '/approverSettings', // 审核人员设置
        component: () => import('@v/pdsSettings/components/approverSettings')
      },
      {
        path: '/materialManage',
        component: () => import('@v/pdsSettings/components/materialManage')// 物料管理
      },
      {
        path: '/craftManage',
        component: () => import('@v/pdsSettings/components/craftManage')// 工艺管理
      },
      {
        path: '/twiceCraftManage',
        component: () => import('@v/pdsSettings/components/twiceCraftManage')// 二次工艺管理
      },
      {
        path: '/workstageManage',
        component: () => import('@v/pdsSettings/components/workstageManage')// 工序管理
      },
      {
        path: '/importTask',
        component: () => import('@v/pds/importExportTask/importTask')// 导入查看
      },
      {
        path: '/exportTask',
        component: () => import('@v/pds/importExportTask/exportTask')// 导出查看
      },
    ]
  },
  {
    path: '/sizePicture',
    component: () => import('@v/pds/newProducts/components/createSizePicture')// 通用尺码图生成
  },
  {
    path: '/childSizePicture',
    component: () => import('@v/pds/newProducts/components/createChildSizePicture')// 婴童(儿童)尺码图生成
  },
  {
    path: "/addSupplier",
    name: "添加供应商",
    component: () => import("@v/pds/stockUp/addSupplier") // 添加供应商
  },
  {
    path: "/401",
    component: () => import("@/components/common/401")
  },
  {
    path: "/500",
    component: () => import("@/components/common/500")
  },
  {
    path: "*",
    component: () => import("@/components/common/404")
  }
];
const router = new Router({
  mode: "hash",
  history: false,
  routes
});

import menuWishCustomer from '@/components/layout/data/menuDate';
// 监听路由变化--动态修改页面的title
let titleFun = (to) => {
  if (!to.path) return;
  let arr = menuWishCustomer.menu || [];
  let [list, isName] = [[], null];
  arr.forEach(k => {
    list.push(k);
    if (k.children && k.children.length) {
      list.push(...k.children);
    }
  })
  list.forEach(k => {
    if (!isName && (k.path && k.path.includes(to.path))) isName = k;
  })
  // console.log(list);
  // console.log(isName);
  return isName && isName.name;
}

// 全局导航钩子,token处理
router.beforeEach((to, from, next) => {
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  const title = titleFun(to);
  document.title = title ? title + '-新品开发' : 'LAPA-新品开发';
  const pathIndex = to.path.lastIndexOf('/');
  const pathName = to.path.slice(pathIndex + 1, to.path.length);
  let menuKey = `${roleKey}${pathName || ''}` === roleKey ? `${roleKey}baseDelcaration` : `${roleKey}${pathName || ''}`;
  const token = getToken();
  getVersion();
  getSinglePageRole(menuKey, to).finally(() => {
    if (token) {
      // 有token 刷新token
      refreshToken(new Date().getTime()).then(() => {
        getCommonInfo().then(() => {
          next();
        });
      });
    } else {
      getAccessToken(to.fullPath).then(() => {
        setTimeout(function () {
          refreshToken(countTime);
        }, countTime);
        getCommonInfo().then(() => {
          next();
        });
      });
    }
  })
  
  function getCommonInfo () {
    // 查询商户下所有用户
    // 配置信息
    return new Promise(resolve => {
      getUserMesCommon().then(() => {
        Promise.all([getErpConfig()]).then(() => {
          resolve(true);
        })
      })
    })
    // return Promise.all([getUserMesCommon(), getErpConfig()]);
  }
});
/* router.afterEach(() => {
  let el = document.querySelector('.loading-box');
  el.parentElement.removeChild(el);
}); */
export default router;
