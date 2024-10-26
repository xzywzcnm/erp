/**
 * Created by Dean on 2017/12/06.
 * http配置
 */
import axios from 'axios';
import Vue from 'vue';
import { LoadingBar, Modal } from 'view-design';
// import cookieConfig from '@/utils/cookieConfig';
import Message from '../components/localComponents/message/message/index';
import {
  getToken
  // removeToken
} from '@/utils/cookie';
import common from '@/utils/common';
import bus from '@/utils/bus';
import connectAuth from '@/utils/connectAuth';
import { erpLogin } from '@/utils/user';
import {
  showPurchaseModal,
  showNoAuth,
  // typeOf
} from '@/utils/asist';
// import { deleteTicket } from '@/utils/index';
import MSG from './message/message/index';
import locale from '@/locale/exceptionCode';
import { getEnvHost } from '@/utils/getAuthHost';
import qs from "qs";
import store from '@/store/store';
import md5 from 'blueimp-md5';
// import { t } from '@/locale/method/index';

const envHost = getEnvHost();

Vue.component('Message', Message);
let ErrorMessage = (text) => {
  Message.error({
    content: text,
    duration: 5,
    level: 1,
    closable: true
  });
};
const erpExcept = { '/dyt-cloud-auth-admin/': 'auth', '/dyt-cloud-upms-admin/': 'upms' };
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
      try {
        newParams = JSON.parse(config.params || '{}');
      } catch (e) {
        newParams = { keyParams: config.params }
      }
    } else if (!common.isEmpty(config.params)) {
      newParams = JSON.parse(JSON.stringify(config.params));
    }
    if (common.isString(config.data) && !isFormData(config.data)) {
      try {
        newData = JSON.parse(config.data || '{}');
      } catch (e) {
        newData = { keyData: config.data }
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
// 登录后重新发起请求
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
        if (!response || common.isEmpty(response.data) || common.isEmpty(response.data.datas) || common.isEmpty(response.data.datas.token)) {
          connectAuth.goToLogin();
          return reject(new Error('登录失败'));
        }
        if (common.isEmpty(key)) {
          config.headers = { ...config.headers, 'Authorization': response.data.datas.token };
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
  // 设置 请求头部
  config.headers = { ...config.headers, ...common.requestHeaders() }
  config = getSystem(config, info);
  // 缓存请求值
  if (!common.isBoolean(config.isCache) || config.isCache) {
    addPending(config);
  }
  return config;
}

// 异常编码提示的方法
let showHttpErrorMessage = function (code, message) {
  let keys = Object.keys(locale);
  let text = '操作失败';
  if (keys.indexOf(String(code)) > -1) {
    text = locale[code];
  } else if (!common.isEmpty(message) && common.isString(message)) {
    // 展示后台的message
    // let msg = message.split('\n')[0];
    // msg = msg.split(new RegExp(['ServiceException:', 'ServiceException：']));
    // msg = msg[1] || msg[0] || essage;
    let msg = message.match(/(ServiceException[：|:]\s*)(\S*\s*)\n/);
    text = msg ? msg[msg.length - 1] || message : message;
  }
  setTimeout(() => {
    MSG.error({
      content: text,
      duration: 5,
      level: 1,
      closable: true
    });
  }, 300);
};

// axios 配置
// axios.defaults.timeout = 180000;
// axios.defaults.baseURL = '';
// axios.defaults.responseType = 'json';
// // axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
// axios.defaults.headers.post['Accept'] = 'application/json;';
// axios.defaults.headers.post['Content-Type'] = 'application/json;';
// axios.defaults.headers.delete['X-Requested-With'] = 'XMLHttpRequest';
// axios.defaults.headers.delete['Accept'] = 'application/json;';
// axios.defaults.headers.delete['Content-Type'] = 'application/json;';
// axios.defaults.headers.put['Content-Type'] = 'application/json;';
// axios.defaults.headers.put['Accept'] = 'application/json; ';
// axios.defaults.headers.get['Content-Type'] = 'application/json;';
// axios.defaults.headers.get['Accept'] = 'application/json; ';

// axios 配置
const defaultsHeaders = {
  timeout: 180000,
  baseURL: '',
  responseType: 'json',
  post: {
    'Accept': 'application/json;',
    'Content-Type': 'application/json;'
  },
  delete: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json;',
    'Content-Type': 'application/json;'
  },
  put: {
    'Accept': 'application/json;',
    'Content-Type': 'application/json;'
  },
  get: {
    'Accept': 'application/json;',
    'Content-Type': 'application/json;'
  }
}
// http request 拦截器
axios.jsonp = url => {
  if (!url) {
    return;
  }
  return new Promise((resolve, reject) => {
    window.printHandler = result => {
      resolve({
        data: result
      });
    };
    var JSONP = document.createElement('script');
    JSONP.type = 'text/javascript';
    JSONP.src = `${url}&callback=printHandler`;
    document.getElementsByTagName('head')[0].appendChild(JSONP);
    setTimeout(() => {
      document.getElementsByTagName('head')[0].removeChild(JSONP);
    }, 500);
  });
};
// http request 拦截器
axios.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...defaultsHeaders };
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
  removePending(err.config, true);
  return Promise.reject(err);
});
// http response 拦截器
axios.interceptors.response.use((response) => {
  return new Promise((resolve, reject) => {
    const requestKey = getrequestKey(response.config);
    LoadingBar.finish();
    // let url = window.location.href;
    if ([999998, 991000].includes(response.data.code)) { // 未登录
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
    if (response.data.code === 403) { // 操作上没权限
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
      !response.config.hiddenError && ErrorMessage('没有权限');
      return reject(common.copy(response));
    }
    if (response.data.code === 999995) {
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
      showNoAuth(response.data.datas.token); // 没有权限
      return reject(common.copy(response));
    }
    if (response.config.url.includes('/merchantPlatform/queryByStatus') && window.location.href.includes('/setting-service/')) {
      // 设置中心 平台接口不报错
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), result: response };
      return resolve(common.copy(response));
    }
    if (response.data.code === 999999) { // 系统级错误
      resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: response };
      if (response.config.url.indexOf('/erpCommon/order-service/merchantPlatform/queryByStatus') > -1 && window.location.href.indexOf('generalSettings.html#/shop') > -1) {
        return reject(common.copy(response));
      }
      !response.config.hiddenError && ErrorMessage('System Error');
      return reject(new Error(`接口：${response.config.url} 报错了，请在控制台查看接口错误`));
    }
    if (response.data.code === 999994) {
      let others = response.data.others;
      if (others.hasOwnProperty('otherCode') && others.otherCode.indexOf('1') >= 0) { // 可购买
        showPurchaseModal('1', others.moduleName);
      } else if (others.hasOwnProperty('otherCode') && others.otherCode.indexOf('2') >= 0) { // 可试用
        showPurchaseModal('2', others.moduleName);
      }
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), result: response };
      return resolve(common.copy(response));
    }
    if (response.data.code === 999993) {
      // 展示后台的message
      if (response.data.message) {
        // let msg = response.data.message.split('\n')[0];
        // msg = msg.split(new RegExp(['ServiceException:', 'ServiceException：']));
        // msg = msg[1] || msg[0] || response.data.message;
        let msg = response.data.message.match(/(ServiceException[：|:]\s*)(\S*\s*)\n/);
        msg = msg ? msg[msg.length - 1] || response.data.message : response.data.message;
        !response.config.hiddenError && ErrorMessage(msg);
      }
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), result: response };
      return resolve(common.copy(response));
    }
    if (response.config.responseType === 'blob') {
      // 当返回数据是文件流时，不需要报错
      let dis = response.headers['content-disposition'];
      if (dis && dis.split(';')[1].split('=')[1]) {
        let filename = decodeURIComponent(dis.split(';')[1].split('=')[1]);
        resultList[requestKey] = {
          resultTime: new Date().getTime(),
          downLoadFile: true,
          result: { resData: response.data, filename }
        };
        return resolve({ resData: common.copy(response.data), filename });
      }
      resultList[requestKey] = {
        resultTime: new Date().getTime(),
        downLoadFile: true,
        result: { resData: response.data }
      };
      return resolve({ resData: common.copy(response.data) });
    }
    if (!response.config.hiddenError && !common.isEmpty(response.data.code) && response.data.code !== 0) {
      showHttpErrorMessage(response.data.code, response.data.message);
    }
    resultList[requestKey] = { resultTime: new Date().getTime(), result: response };
    return resolve(common.copy(response));
  })
}, (error) => {
  return new Promise((resolve, reject) => {
    const requestKey = getrequestKey(error.config);
    LoadingBar.finish();
    delete signKey.againJson[requestKey];
    if (error.response) {
      resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error.response };
      if (error.response.status === 500) {
        if (error.response.config.url.includes('/merchantPlatform/queryByStatus') && window.location.href.includes('/setting-service/')) {
          return reject(common.copy(error.response));
        }
        if (!error.response.config.hiddenError && error.response.data) {
          showHttpErrorMessage(error.response.data.code, error.response.data.message);
        } else {
          !error.response.config.hiddenError && ErrorMessage('System Error');
        }
        return reject(common.copy(error.response));
      }
      if (error.response.status === 404 && !error.response.config.hiddenError) {
        error.response.config && console.error(`接口不存在：${error.response.config.url}`);
        return reject(common.copy(error.response));
      }
      if (error.response.status === 504 && !error.response.config.hiddenError) {
        error.response.config && console.error(`接口请求超时：${error.response.config.url}`);
        MSG.error({
          content: '系统繁忙，请求超时，请稍后再试',
          duration: 5,
          level: 1,
          closable: true
        });
        return reject(common.copy(error.response));
      }
      error.response && !error.response.config.hiddenError && MSG.error({
        content: '系统繁忙，请稍后再试',
        duration: 5,
        level: 1,
        closable: true
      });
      error.response && error.response.config && console.error(`系统繁忙：${error.response.config.url}`);
      return reject(common.copy(error.response));
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
    resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error };
    if (common.isEmpty(error.message) || !error.message.includes('取消正在请求或还未请求的接口')) {
      (!error.config || !error.config.hiddenError) && MSG.error({
        content: '系统繁忙，请稍后再试',
        duration: 5,
        level: 1,
        closable: true
      });
      error.response && error.response.config && console.error(`系统繁忙：${error.response.config.url}`);
    }
    return reject(common.copy(error));
  })
});
