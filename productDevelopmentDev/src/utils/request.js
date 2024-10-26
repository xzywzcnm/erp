import axios from "axios";
import api from "../api/api";
import Vue from "vue";
import { LoadingBar, Modal } from "view-design";
import locale from "../locale/lang/zh-CN";
import {
  showPurchaseModal
} from "./asist";
import common from '@/utils/common';
import { getEnvHost } from '@/utils/getAuthHost';
import bus from '@/utils/authBus';
import connectAuth from '@/utils/connectAuth';
import { erpLogin } from '@/utils/user';
import store from "@/store/store";
import qs from "qs";
// import { t } from "../locale/method";
import {
  // setToken,
  getToken,
  // setTokenTime,
  // getTokenTime,
  // removeToken
} from "@/utils/cookie";
import md5 from 'blueimp-md5';

var vue = new Vue();
// 系统错误提示框保留时间(s)
var sysErrorKeptSeconds = 5;

const erpExcept = {'/dyt-cloud-auth-admin/': 'auth', '/dyt-cloud-upms-admin/': 'upms'};
const envHost = getEnvHost();

const resultExceedTime = 1000 * 0.5; // 单位: 毫秒
const checkResTime = 10; // 单位: 毫秒
const removeRqueryKey = 1000 * 60 * 2; // 超时移除
let awaitTime = {};
let resultList = {};
// 用于存储信息
let signKey = {
  isStopRequest: false,
  againJson: {},
  countdown: {}
};
// 判断是否为 FormData
const isFormData = (data) => {
  if (common.isEmpty(data)) return false;
  return Object.prototype.toString.call(data) === '[object FormData]';
}
// 请求的 key
const getrequestKey = (config) => {
  let newParams = {};
  let newData = {};
  if (config) {
    if (common.isString(config.params) && !isFormData(config.params)) {
      try{
        newParams = JSON.parse(config.params || '{}');
      }catch(e){
        newParams = {keyParams: config.params}
      }
    } else if (!common.isEmpty(config.params)) {
      newParams = JSON.parse(JSON.stringify(config.params));
    }
    if (common.isString(config.data) && !isFormData(config.data)) {
      try{
        newData = JSON.parse(config.data || '{}');
      }catch(e){
        newData = {keyData: config.data}
      }
    } else if (!common.isEmpty(config.data)) {
      newData = JSON.parse(JSON.stringify(config.data));
    }
  }
  if (isFormData(newParams)) {
    let obj = {};
    newParams.forEach((item, key) => {
      obj[key] = common.isFile(item) ? {
        lastModified: item.lastModified,
        name: item.name,
        size: item.size,
        type: item.type,
      } : item;
    })
    newParams = obj;
  }
  if (isFormData(newData)) {
    let obj = {};
    newData.forEach((item, key) => {
      obj[key] = common.isFile(item) ? {
        lastModified: item.lastModified,
        name: item.name,
        size: item.size,
        type: item.type,
      } : item;
    })
    newData = obj;
  }

  // 排序, 将参数一样顺序不一样的情况处理成一样
  const params = qs.stringify(newParams, {
    sort: (a, b) => {
      return a.localeCompare(b);
    }
  });
  const dataParams = qs.stringify(newData, {
    sort: (a, b) => {
      return a.localeCompare(b);
    }
  });
  const responseType = config ? config.responseType || '' : '';
  const key = [(config ? config.method || '' : ''), responseType, (config ? config.url || '' : ''), params, dataParams].join('&');
  return `${md5(key)}${config ? `-${config.url}` || '' : ''}`;
}

// 移除请求
const removePending = (requestKey, isRemove) => {
  const pendingList = store.getters['getPendingList'];
  // 如果在 pending 中存在当前请求标识，取消当前请求，并且移除
  if (pendingList.has(requestKey)) {
    if (!isRemove) {
      store.commit('deletePending', requestKey);
      delete resultList[requestKey];
      delete awaitTime[requestKey];
      if (signKey.countdown[requestKey]) {
        clearTimeout(signKey.countdown[requestKey]);
        delete signKey.countdown[requestKey];
      }
    } else {
      setTimeout(() => {
        store.commit('deletePending', requestKey);
        delete resultList[requestKey];
        delete awaitTime[requestKey];
        if (signKey.countdown[requestKey]) {
          clearTimeout(signKey.countdown[requestKey]);
          delete signKey.countdown[requestKey];
        }
      }, 20);
    }
  }
}

// 添加请求
const addPending = (config) => {
  const requestKey = getrequestKey(config);
  const pendingList = store.getters['getPendingList'];
  // 取消所有请求
  if (signKey.isStopRequest) {
    delete signKey.againJson[requestKey];
    config.cancelToken = new axios.CancelToken(cancel => {
      return cancel('无法获取认证中心授权');
    });
    return;
  }
  if (pendingList.has(requestKey)) {
    if (resultList[requestKey]) {
      const thisTime = new Date().getTime();
      const isReject = resultList[requestKey].status === 'reject' || resultList[requestKey].remove;
      const requestCacheTime = (resultList[requestKey].resultTime || 0) + (config.cacheTime || resultExceedTime);
      // 过期或异常的移除缓存
      if (thisTime - requestCacheTime > 0 || isReject) {
        removePending(requestKey, isReject);
        // 移除之后再次添加进来
        config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
          store.commit('pushPending', { requestKey: requestKey, cancel: cancel });
        })
        return;
      }
    }
    // 如果 pending 中存在当前请求则取消后面的请求
    config.cancelToken = new axios.CancelToken(cancel => {
      return cancel(requestKey);
    });
    return;
  }
  // 移除 pendingList 中不存在对应的结果值
  resultList[requestKey] && delete resultList[requestKey];
  awaitTime[requestKey] && delete awaitTime[requestKey];
  if (signKey.countdown[requestKey]) {
    clearTimeout(signKey.countdown[requestKey]);
    delete signKey.countdown[requestKey];
  }
  // 如果 pending 中不存在当前请求，则添加进去
  config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
    store.commit('pushPending', { requestKey: requestKey, cancel: cancel });
  });
}

const handAuthorization = (config, info, key) => {
  delete config.headers['Authorization-DYT'];
  config.headers = { ...config.headers, 'Authorization': `${info.token.token_type} ${info.token.access_token}`, withCredentials: true };
  config.url = `${envHost[key]}${config.url}`;
  return config;
}
// 更改请求地址
const getSystem = (config, info) => {
  const key = Object.keys(erpExcept).find(f => { return config.url.includes(f) });
  if (common.isEmpty(key)) return config;
  return handAuthorization(config, info, erpExcept[key]);
}

const againRequest = (response, code, url, requestKey) => {
  return new Promise((resolve, reject) => {
    let config = response.config;
    const key = Object.keys(erpExcept).find(f => { return config.url.includes(f) });
    if ([991000, '991000'].includes(code)) {
      connectAuth.refreshToken(true).then((token) => {
        if (common.isEmpty(token)) {
          !getToken() ? connectAuth.goToLogin() : connectAuth.againLogin();
          return reject(response);
        }
        if (common.isEmpty(key)) {
          config.headers = { ...config.headers, 'Authorization-DYT': token.access_token };
        } else {
          config.headers = { ...config.headers, 'Authorization': `${token.token_type} ${token.access_token}` };
        }
        // 刷新token之后重新发起请求
        signKey.countdown[requestKey] = setTimeout(() => {
          resolve(axios(config));
        }, 500);
      });
    } else {
      erpLogin(url).then((response) => {
        if (!response || response.code !== 0) {
          connectAuth.goToLogin();
          return reject(new Error('登录失败'));
        }
        if (common.isEmpty(key)) {
          config.headers = { ...config.headers, 'Authorization': response.datas.token };
        }
        signKey.countdown[requestKey] = setTimeout(() => {
          resolve(axios(config));
        }, 500);
      }).catch(() => {
        Modal.error({
          title: 'erp 登录授权失败',
          content: '是否返回认证中心？',
          loading: false,
          onOk: () => {
            Modal.remove();
            connectAuth.backOauth();
          }
        });
        reject(response);
      })
    }
  })
}
const requestConfig = (config, info) => {
  LoadingBar.start();
  config.headers = { ...config.headers, ...common.requestHeaders() }
  config = getSystem(config, info);
  // 缓存请求值
  if (!common.isBoolean(config.isCache) || config.isCache) {
    addPending(config);
  }
  return config;
}

// axios 配置
axios.defaults.timeout = 120000;
axios.defaults.baseURL = "";
axios.defaults.responseType = "json";
axios.defaults.headers.post["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.post["Accept"] = "application/json; ";
axios.defaults.headers.post["Content-Type"] = "application/json;";
axios.defaults.headers.delete["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.delete["Accept"] = "application/json;";
axios.defaults.headers.delete["Content-Type"] = "application/json;";
axios.defaults.headers.put["Content-Type"] = "application/json;";
axios.defaults.headers.put["Accept"] = "application/json; ";
axios.defaults.headers.get["Content-Type"] = "application/json;";
axios.defaults.headers.get["Accept"] = "application/json; ";
/* axios.defaults.headers.delete['Content-Type'] = 'application/json;'; */
// http request 拦截器
let url = window.location.href;
let index = url.indexOf("?");
index = index > 0 ? index : url.indexOf("?");
if (index > 0) url = url.substring(0, index);
if (url.indexOf("pds.html#/") === -1 && url.indexOf("pds.html%23%2F") === -1) {
  url = url.replace("pds.html", "pds.html#/");
}
let timer = "";
axios.interceptors.request.use((config) => {
  return new Promise((resolve, reject) => {
    if (common.isEmpty(config.url)) return reject(new Error('请求地址不能为空'));
    bus.authReadyComplete().then(() => {
      // 需要加载的信息
      const awaitList = [
        { dataOrigin: connectAuth.getToken(), key: 'token' }
      ];
      connectAuth.customGetInfo(awaitList).then(info => {
        // 当认证中心不存在token时，跳转登录
        if (common.isEmpty(info.token)) {
          connectAuth.goToLogin();
          return;
        }
        resolve(requestConfig(config, info));
      })
    })
  });
}, (err) => {
  removePending(err.config);
  return Promise.reject(err, true);
});
// http response 拦截器
axios.interceptors.response.use((response) => {
  return new Promise((resolve, reject) => {
    const requestKey = getrequestKey(response.config);
    LoadingBar.finish();
    if (response.data.code === 0 || (response.data.status === 200 && common.isEmpty(response.data.code)) || response.data.msg === '成功') {
      resultList[requestKey] = { resultTime: new Date().getTime(), result: response.data };
      delete signKey.againJson[requestKey];
      return resolve(common.copy(response.data));
    }
    if (response.config.responseType === "blob") {
      delete signKey.againJson[requestKey];
      // 当返回数据是文件流时，不需要报错
      let dis = response.headers["content-disposition"];
      if (dis && dis.split(";")[1].split("=")[1]) {
        let filename = decodeURIComponent(dis.split(";")[1].split("=")[1]);
        resultList[requestKey] = { resultTime: new Date().getTime(), downLoadFile: true, result: { resData: response.data, filename } };
        return resolve({ resData: common.copy(response.data), filename });
      }
      resultList[requestKey] = { resultTime: new Date().getTime(), downLoadFile: true, result: { resData: response.data } };
      return resolve({ resData: common.copy(response.data) });
    }
    if ([991000, 999998, 999997].includes(response.data.code)) {
      // 999998 是token 过期
      removePending(requestKey, true);
      signKey.againJson[requestKey] = common.isEmpty(signKey.againJson[requestKey]) ? 0 : signKey.againJson[requestKey] + 1;
      const maxFrequency = Object.values(signKey.againJson).find(f => f > 50);
      if (!common.isEmpty(maxFrequency)) {
        signKey.isStopRequest = true;
        signKey.againJson = {};
        Modal.error({
          title: '无法获取认证中心授权信息',
          content: '是否返回认证中心？',
          loading: false,
          onOk: () => {
            signKey.isStopRequest = false;
            Modal.remove();
            connectAuth.backOauth();
          }
        });
        return reject(common.copy(response));
      }
      // 重新登录
      againRequest(response, response.data.code, response.config.url, requestKey).then((res) => {
        resultList[requestKey] = { resultTime: new Date().getTime(), result: res };
        signKey.againJson = {};
        resolve(common.copy(res));
      }).catch((err) => {
        resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: err };
        reject(common.copy(err));
      })
      return;
    }
    delete signKey.againJson[requestKey];
    if (response.data.code === 999994) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        let others = response.data.others;
        if (others.otherCode[0] === "1") {
          axios .get(api.suiteId + "?moduleName=" + others.moduleName) .then((res) => {
            if (res.code === 0) {
              if (res.datas[0].suiteStatus === "1") {
                showPurchaseModal(
                  "1",
                  others.moduleName,
                  res.datas[0].suiteId
                ); // 购买
              } else if (res.datas[0].suiteStatus === "2") {
                showPurchaseModal(
                  "2",
                  others.moduleName,
                  res.datas[0].suiteId
                ); // 试用
              }
            }
          });
        } else if (others.otherCode[0] === "2") {
          showPurchaseModal("3", others.moduleName, "", others.memberPayUrl); // 支付与页面跳转
        }
      }, 50);
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), result: response.data };
      return resolve(common.copy(response.data));
    }
    if (response.data.code === 999995) {
      // 账号已被停用
      showHttpErrorMessage(response.data.code, response);
      setTimeout(() => {
        logOut(url);
      }, 500);
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), result: response.data };
      return resolve(common.copy(response.data));
    }
    if (response.data.code === 999993) {
      !response.config.hiddenError && vue.$msg.error({
        content: response.data.message,
        duration: sysErrorKeptSeconds,
        closable: true,
        level: 1,
        onClose: () => {}
      });
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), result: response.data };
      return resolve(common.copy(response.data));
    }
    showHttpErrorMessage(response.data.code, response);
    resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), result: response.data };
    return resolve(common.copy(response.data));
  })
}, (error) => {
  return new Promise((resolve, reject) => {
    const requestKey = getrequestKey(error.config);
    delete signKey.againJson[requestKey];
    if (error.response) {
      resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error.response };
      if (error.response.status === 500) {
        // 状态为500
        showHttpErrorMessage(error.response.data.code, error.response);
        return reject(common.copy(error.response));
      } 
      if (error.response.status === 404) {
        console.error('接口不存在');
        return reject(common.copy(error.response));
      }
    }
    const pendingList = store.getters['getPendingList'];
    if (error.message && pendingList.has(error.message) && common.isEmpty(error.config)) {
      // 使用定时器获取接口返回值
      const thisRequest = setInterval(() => {
        awaitTime[error.message] = common.isEmpty(awaitTime[error.message]) ? 0 : awaitTime[error.message] + checkResTime;
        if (!pendingList.has(error.message) || awaitTime[error.message] > removeRqueryKey) {
          clearInterval(thisRequest);
          removePending(error.message, true);
          return reject(common.copy(error));
        }
        if (!common.isEmpty(resultList[error.message])) {
          clearInterval(thisRequest);
          const resultObj = resultList[error.message];
          if (!['reject'].includes(resultObj.status)) {
            resolve(common.copy(resultObj.result));
          } else {
            reject(common.copy(resultObj.result));
          }
        }
      }, checkResTime)
      return;
    }
    resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error.response };
    return reject(common.copy(error.response));
  })
}
);
let showHttpErrorMessage = function (code, response) {
  if (response.config.hiddenError) return;
  let keys = Object.keys(locale);
  let message = "操作失败"; // 操作失败

  if (typeof code !== 'undefined' && keys.indexOf(String(code)) > -1) {
    message = locale[code];
  }
  vue.$msg.error({
    content: message,
    duration: sysErrorKeptSeconds,
    closable: true,
    level: 1,
    onClose: () => {}
  });
};

function logOut(url) {
  let token = getToken();
  axios.get(api.logOut + token).then((response) => {
    sessionStorage.clear();
    window.location.href = response.others.loginUrl + encodeURIComponent(url);
  });
  sessionStorage.clear();
  localStorage.clear();
}
export default axios;