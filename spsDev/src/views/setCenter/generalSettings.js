// order routes
import Vue from 'vue';
import VueRouter from 'vue-router';
import iview from 'view-design';
import Vuex from 'vuex';
import axios from 'axios';
import store from '@/store/store';
import api from '../../api/api';
import config from '@/config';
import {
  setToken,
  // getToken,
  setTokenTime
} from './cookie';
// import http from '../../assets/http';
import '@/components/localComponents/';
import msg from '@/components/common/message/message/index';
import locale from '@/locale/method/locale';
// import '@/locale/index';

// 路由配置，定义路由
import main from '@/components/layout/main';
import management from './setCenter/management';
// import SliderModal from 'slider-modal'

Vue.prototype.axios = axios;
Vue.prototype.$msg = msg;
Vue.config.debug = true; // 开启debug模式
Vue.use(VueRouter);// 初始化自定义组件
Vue.use(iview);
Vue.use(Vuex);
Vue.mixin(locale);

// 引入路由组件
store.commit('inGroup', 'generalSettings');// 需AJAX向server请求菜单
var pageName = getLastPageName();
store.commit('thisPage', pageName);

var routes = [
  {
    path: '/',
    component: main, // 引入主文件
    name: '设置中心',
    children: [
      {
        path: '/management',
        name: '员工管理',
        component: management// 员工管理
      }
    ]
  }
];
var router = new VueRouter({
  mode: 'hash',
  history: false,
  routes: routes
});
// 全局导航钩子,token处理
router.beforeEach(function (to, from, next) {
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  var url = window.location.href;
  // 浏览器回退前进点击时菜单状态改变
  var pathIndex = to.path.lastIndexOf('/');
  var pathName = to.path.slice(pathIndex + 1, to.path.length);
  if (pathName != store.state.thisPage) {
    store.commit('clickStatus', true);
    store.commit('thisPage', pathName);
  } else {
    store.commit('clickStatus', false);
  }
  if (to.fullPath.indexOf('ticket') > 0) {
    var ticket = getQueryString('ticket');
    if (ticket != sessionStorage.getItem('ticket')) {
      store.commit('pageShow', ticket);
      sessionStorage.setItem('ticket', ticket);
      axios.get(api.get_token + ticket).then(function (response) {
        setTokenTime(config.token_time);
        setToken(response.data.datas.token);
        localStorage.setItem('systemAnnouncementNotice', JSON.stringify(true));
        store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
        var date = new Date().getTime();
        sessionStorage.setItem('refreshTime', date);
        setTimeout(refreshToken, api.token_time);
        // 获取用户名
        axios.get(api.tokenToEmail + response.data.datas.token).then(res => {
          if (res.data.success) {
            let data = res.data.datas;
            axios.post(api.userInfoName + data.split(',')[1]).then(v => {
              if (v.data.code === 0) {
                // sessionStorage.setItem('userName', v.data.datas)
                let mail = v.data.datas;
                if (mail) {
                  sessionStorage.setItem('userName', mail.email ? mail.email : mail.userName ? mail.mobile : '');
                  store.commit('userName', mail.email ? mail.email : mail.userName ? mail.mobile : '');
                }
              }
            });
            // sessionStorage.setItem('userName', res.data.datas)
          }
        });
        next();
      }).catch(function (err) {
        console.log(JSON.stringify(err));
      });
    } else {
      store.commit('pageShow', sessionStorage.getItem('ticket'));
      setTimeout(function () {
        window.location.href = url.split('?ticket')[0];
      }, 1000);

      next();
    }
  } else {
    if (sessionStorage.getItem('token') != null) {
      var date = new Date().getTime();
      axios.get(api.refresh_token + sessionStorage.getItem('token')).then(function (response) {
        sessionStorage.setItem('refreshTime', date);
        store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
        setTimeout(refreshToken, api.token_time);
      }).catch(function (err) {
        console.log(err);
      });
    }
    store.commit('pageShow', sessionStorage.getItem('ticket'));
    next();
  }
});

function refreshToken () { // 重新获取token
  var date = new Date().getTime();
  var sessionTime = sessionStorage.getItem('refreshTime');
  var diffTime = date - Number(sessionTime);
  return new Promise(resolve => {
    if (diffTime > api.token_time) {
      axios.get(api.refresh_token + sessionStorage.getItem('token')).then(function (response) {
        sessionStorage.setItem('refreshTime', date);
        store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
        setTimeout(refreshToken, api.token_time);
        resolve();
      }).catch(function (err) {
        console.log(err);
      });
    } else {
      resolve();
      setTimeout(refreshToken, diffTime);
    }
  });
}
function getQueryString (name) { // 获取url里面的参数
  var reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.href.substr(1).match(reg);
  if (r != null) { return unescape(r[2]); } else { return null; }
}
function getLastPageName () {
  var url = window.location.href;
  var l;
  if (url.indexOf('?') > 0) {
    url = url.split('?')[0].split('/');
    l = url.length;
  } else {
    url = url.split('/');
    l = url.length;
  }
  return url[l - 1];
}
// 创建实例挂载到#app
new Vue({
  router: router,
  store: store// 引入store配置
}).$mount('#app');
