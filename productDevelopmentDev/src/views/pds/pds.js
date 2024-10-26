import Vue from "vue";
import "@/utils/index.js"; // 公共配置
import store from "@/store/store";
import axios from "axios";
import iview from "view-design";
import Axios from "@/utils/request";
import "view-design/dist/styles/iview.css?v=1.0.0";
import "@/utils/bus";
import "@/assets/css/common.less";
import "@/assets/css/alifont.css";
import "@/assets/css/init-iview.less";
// import "@/locale/index";
import locale from "@/locale/method/locale";
import regular from "@/utils/regular";
import router from "./router/"; // 路由
import "@/components/localComponents/"; // 本地组件
// import tbComponents from 'tongtool-components';
// import '@/assets/my-theme/index.less';
import '@/assets/css/layout.less';
import "@/directives";

store.commit("inGroup", "productDev");
Vue.use(iview);
Vue.prototype.axios = axios;
Vue.prototype.$axios = Axios;
Vue.prototype.$regular = regular;
Vue.config.productionTip = false;
Vue.mixin(locale);
new Vue({
  router: router,
  store: store
}).$mount("#app");
