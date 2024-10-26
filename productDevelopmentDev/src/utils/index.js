import api from "@/api/api";
import axios from "axios";
import store from "@/store/store";
import { setToken } from "./cookie";
import $common from '@/utils/common';

var common = {
  /**
   * 重新获取token
   * */
  refreshToken () {
    // 重新获取token
    let date = new Date().getTime();
    let sessionTime = sessionStorage.getItem("refreshTime");
    let diffTime = date - Number(sessionTime);
    if (diffTime > api.token_time) {
      axios
        .get(api.refresh_token + sessionStorage.getItem("token"))
        .then((response) => {
          sessionStorage.setItem("refreshTime", date);
          setToken(response.datas.token);
          store.commit('erpRequestHeaders', { 'Authorization': response.datas.token });
          setTimeout(common.refreshToken, api.token_time);
        });
    } else {
      setTimeout(common.refreshToken, diffTime);
    }
  }
};

export const getQueryString = (name) => {
  // 获取url里面的参数
  let reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
  let r = window.location.href.match(reg);
  if (r !== null) {
    return decodeURI(r[2]);
  } else {
    return null;
  }
};

export default {
  getErpconfig () {
    return new Promise((resolve) => {
      if (store.state.erpConfig) {
        resolve(true);
      } else {
        axios.get(api.get_erpConfig).then((response) => {
          if (response.code === 0) {
            let resInfo = $common.copy(response.datas);
            resInfo.allYmsMerchantIds = null;
            if (!$common.isEmpty(resInfo.merchant)) {
              resInfo.merchant.isSupplier = 0;
              resInfo.merchant.isYmsCore = 0;
              resInfo.merchant.ymsCoreDomain = null;
              resInfo.merchant.ymsCoreStatus = 0;
              resInfo.merchant.ymsListingDatabaseId = null;
              resInfo.merchant.ymsListingDomain = null;
              resInfo.merchant.ymsListingStatus = null;
            }
            if (!$common.isEmpty(resInfo.userInfo)) {
              resInfo.userInfo.ymsCoreStatus = null;
            }
            console.warn(`接口：${api.get_erpConfig} 返回值已被修改后存入store，任务号：11062`);
            localStorage.setItem("ierpStatus", resInfo.merchant.ierpStatus);
            store.commit("ierpStatus", resInfo.merchant.ierpStatus);
            store.commit("erpConfig", resInfo);
            resolve(true);
          }
        });
      }
    });
  },
  /**
   * 获取host
   * */
  getHost (url = document.location.href) {
    if (url.indexOf("http://") !== -1 || url.indexOf("https://") !== -1) {
      let reg = new RegExp("^(http://|https://)(.*?)(/|$)");
      return url.match(reg)[0].slice(-1) === "/"
        ? url.match(reg)[0].slice(0, -1)
        : url.match(reg)[0];
    } else {
      return url.split("/")[0];
    }
  },
  /**
   *获取url地址参数 可获取中文
   *@param {string}
   *@return {string}
   * */
  getUrlParam (key) {
    var url = window.location.search;
    var reg = new RegExp("(^|&)" + key + "=(.*)?(&|$)");
    var result = url.substr(1).match(reg); // 去除?号
    return result ? decodeURIComponent(result[2]) : null;
  },
  getQueryString (name) {
    // 获取url里面的参数
    var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.href.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    } else {
      return null;
    }
  },
  getHostFront (url = window.location.href) {
    // var shopname = this.getShopName();
    // var urlArr = url.split(shopname);
    if (url.indexOf("http://localhost") !== -1) {
      return this.getHost();
    } else {
      return window.location.origin;
      // return urlArr[0] + shopname;
    }
  },
  getShopName (url = window.location.href) {
    if (
      url.indexOf("https://xin.quqiula.com") !== -1 ||
      url.indexOf("10.0.7.220") !== -1
    ) {
      return "xiaoyunstore"; // xcfstore
    } else if (url.indexOf("http://localhost") !== -1) {
      return "gan"; //
    }
    if (url.indexOf("https") >= 0) {
      url = url.split("https://")[1];
      url = url.split("/")[0];
      return url.split(".")[0];
    }
  },
  common
};
