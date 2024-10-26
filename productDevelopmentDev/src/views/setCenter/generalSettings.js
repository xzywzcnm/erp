// order routes
import Vue from "vue";
import VueRouter from "vue-router";
import axios from "axios";
import "@/utils/common-init"; // 公共配置
// import "@/locale/index";
import locale from "@/locale/method/locale";
import store from "@/store/store";
import api from "../../api/api";
import shop from "./components/shop";
import "@/components/localComponents/"; // 本地组件
// 路由配置，定义路由
import main from "../../components/layout/main";
import management from "./components/management";
// import SliderModal from 'slider-modal'

import Vuex from "vuex";
Vue.use(Vuex);
Vue.prototype.axios = axios;
Vue.config.debug = true; // 开启debug模式

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter); // 初始化自定义组件
Vue.mixin(locale);
// 引入路由组件
store.commit("inGroup", "generalSettings"); // 需AJAX向server请求菜单
var pageName = getLastPageName();
store.commit("thisPage", pageName);
var routes = [
  {
    path: "/",
    component: main, // 引入主文件
    name: "设置中心",
    children: [
      {
        path: "/management",
        name: "员工管理",
        component: management // 员工管理
      },
      {
        path: "/shop",
        name: "平台店铺",
        component: shop // 员工管理
      },
      {
        path: "/401",
        component: () => import("@/components/common/401")
      }
    ]
  }
];
var router = new VueRouter({
  mode: "hash",
  history: false,
  routes: routes
});
// 全局导航钩子,token处理
router.beforeEach((to, from, next) => {
  store.commit('cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  var url = window.location.href;
  if (to.fullPath.indexOf("ticket") > 0) {
    var ticket = getQueryString("ticket");
    if (ticket != sessionStorage.getItem("ticket")) {
      sessionStorage.setItem("ticket", ticket);
      axios
        .get(api.get_token + ticket)
        .then(function (response) {
          if (response.code === 0) {
            sessionStorage.setItem("token", response.datas.token);
            var date = new Date().getTime();
            sessionStorage.setItem("refreshTime", date);
            setTimeout(refreshToken, api.token_time);
            axios
              .get(api.tokenToId + response.datas.token)
              .then((res) => {
                if (res.success) {
                  axios
                    .post(api.userInfo + res.datas.split(",")[1])
                    .then((res1) => {
                      sessionStorage.setItem(
                        "userInfoName",
                        res1.datas.userName
                      );
                      store.commit("userInfo", res1.datas);
                    });
                  sessionStorage.setItem("userName", res.datas);
                }
              })
              .catch((err) => {
                console.log(err);
                next();
              });
            next();
          } else {
            next();
          }
        })
        .catch(() => {
          next();
        });
    } else {
      setTimeout(function () {
        window.location.href = url.split("?ticket")[0];
      }, 1000);
      next();
    }
  } else {
    if (sessionStorage.getItem("token") != null) {
      var date = new Date().getTime();
      axios
        .get(api.refresh_token + sessionStorage.getItem("token"))
        .then(function (response) {
          sessionStorage.setItem("refreshTime", date);
          store.commit('erpRequestHeaders', { 'Authorization': response.datas.token });
          setTimeout(refreshToken, api.token_time);
        })
        .catch(function (err) {
          console.log(err);
        });
    }
    next();
  }
});
function getLastPageName () {
  var url = window.location.href,
    l;
  if (url.indexOf("?") > 0) {
    url = url.split("?")[0].split("/");
    l = url.length;
  } else {
    url = url.split("/");
    l = url.length;
  }
  return url[l - 1];
}
// function getUserMes () {
//   var userInfoList = store.state.userInfoList;
//   if (userInfoList.length === 0) {
//     axios.get(api.get_userInfo).then((response) => {
//       if (response.data.code === 0) {
//         if (response.data.datas !== null) { store.commit("userInfoList", response.data.datas); }
//       }
//     });
//   }
// }
// function getSinglePageRole (menuKey) {
//   // 权限获取
//   return new Promise((resolve, reject) => {
//     axios.post(api.get_singlePageRole + menuKey).then((response) => {
//       if (response.data.code === 0) {
//         let pos = {};
//         let data = response.data.datas;
//         if (data != null) {
//           data.forEach((n, i) => {
//             let obj = { [n]: true };
//             Object.assign(pos, obj);
//           });
//         }
//         resolve(pos);
//       }
//     });
//   });
// }
function refreshToken () {
  // 重新获取token
  let date = new Date().getTime();
  let sessionTime = sessionStorage.getItem("refreshTime");
  let diffTime = date - Number(sessionTime);
  if (diffTime > api.token_time) {
    axios
      .get(api.refresh_token + sessionStorage.getItem("token"))
      .then((response) => {
        sessionStorage.setItem("refreshTime", date);
        store.commit('erpRequestHeaders', { 'Authorization': response.datas.token });
        setTimeout(refreshToken, api.token_time);
      });
  } else {
    setTimeout(refreshToken, diffTime);
  }
}
function getQueryString (name) {
  // 获取url里面的参数
  var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.href.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  } else {
    return null;
  }
}
new Vue({
  router: router,
  store: store
}).$mount("#app");
