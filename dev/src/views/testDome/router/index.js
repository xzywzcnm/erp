import Vue from 'vue';
import Router from 'vue-router';
// import axios from 'axios';

Vue.use(Router);

const routes = [
  {
    path: '/',
    component: () => import('@/views/testDome/components/domeTest')
  },
  // 演示页面
  {
    path: '/testDome',
    component: () => import('@/views/testDome/components/domeTest')
  },
  // 下拉
  {
    path: '/dytSelect',
    component: () => import('@/views/testDome/components/dyt-select')
  },
  // 列表页面搜索部分
  {
    path: '/dytFilter',
    component: () => import('@/views/testDome/components/dyt-filter')
  },
  // 上传组件
  {
    path: '/dytUpload',
    component: () => import('@/views/testDome/components/dyt-upload')
  }

];

const router = new Router({
  mode: 'hash',
  routes
});

export default router;
