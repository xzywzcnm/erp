/**
 * Created by Dean on 2017/12/06.
 * http配置
 */
import axios from 'axios';
import { LoadingBar, Modal } from 'view-design';
import { getToken } from '@/utils/cookie';
import common from '@/utils/common';
import locale from '@/locale/exceptionCode';
import MSG from './message/message/index';
import bus from '@/utils/bus';
import connectAuth from '@/utils/connectAuth';
import { showPurchaseModal, showNoAuth } from '@/utils/asist';
import { erpLogin } from '@/utils/user';
import store from '@/store/store';
import qs from "qs";
import { getEnvHost } from '@/utils/getAuthHost';
import md5 from 'blueimp-md5';

const envHost = getEnvHost();

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

// 文件流的成功和报错处理(后端架构更改，导出改接收文件流方式)
let blobError = (response) => {
  const resData = response.data;
  if (resData.type === 'application/json') {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      const jsonData = JSON.parse(fileReader.result);
      MSG.error(locale[jsonData.code] || '异常错误');
    }
    fileReader.readAsText(resData);
    return new Error('接口报错了，请在控制台查看接口错误');
  } else {
    let dis = response.headers['content-disposition'];
    if (dis && dis.split(';')[1].split('=')[1]) {
      let filename = decodeURIComponent(dis.split(';')[1].split('=')[1]);
      return { resData, filename };
    }
    return { resData };
  }
}

const requestConfig = (config, info) => {
  LoadingBar.start();
  config.headers = { ...config.headers, ...common.requestHeaders() };
  config = getSystem(config, info);
  // 缓存请求值
  if (!common.isBoolean(config.isCache) || config.isCache) {
    addPending(config);
  }
  return config;
}

axios.defaults.timeout = 180000;
axios.defaults.baseURL = '';
axios.defaults.responseType = 'json';
const ajaxType = ['post', 'delete', 'put', 'get'];
ajaxType.forEach(k => {
  axios.defaults.headers[k]['Content-Type'] = 'application/json;';
  axios.defaults.headers[k]['Accept'] = 'application/json; ';
});
axios.defaults.headers.delete['X-Requested-With'] = 'XMLHttpRequest';

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
    // let url = window.location.href;
    LoadingBar.finish();
    // 如果是blob, 说明是下载文件流
    if (response.config.responseType === 'blob') {
      resultList[requestKey] = { resultTime: new Date().getTime(), downLoadFile: true, result: response };
      delete signKey.againJson[requestKey];
      return resolve(blobError(common.copy(response)));
    }
    if (response.config.responseType === 'arraybuffer') {
      resultList[requestKey] = { resultTime: new Date().getTime(), result: response };
      return resolve(common.copy(response));
    }
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
      // 999998 没有权限  999996 用户尚未登录
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
    if (response.config.url.indexOf('/erpCommon/order-service/merchantPlatform/queryEnablePlatform') > -1 || response.config.url.indexOf('/erpCommon/order-service/merchantPlatform/queryByStatus') > -1) {
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), result: response };
      return resolve(common.copy(response));
    }
    if (response.data.code === 403) {
      // 操作上没权限
      !response.config.hiddenError && MSG.error(locale[response.data.code]);
      // return response;
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
      return resolve(common.copy(response));
    }
    if (response.data.code === 999995) {
      showNoAuth(response.data.datas.token);
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
      return resolve(common.copy(response));
    }
    if (response.data.code === 999993) {
      // 展示后台的message
      if (response.data.message && !response.config.hiddenError) {
        // let msg = response.data.message.split('\n')[0];
        // msg = msg.split(new RegExp(['ServiceException:', 'ServiceException：']));
        // msg = msg[1] || msg[0] || response.data.message;
        let msg = response.data.message.match(/(ServiceException[：|:]\s*)(\S*\s*)\n/);
        msg = msg ? msg[msg.length - 1] || response.data.message : response.data.message;
        MSG.error(msg);
      }
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
      return resolve(common.copy(response));
      // 展示后台的message
    }
    if (response.data.code === 999999) {
      // 系统级错误
      !response.config.hiddenError && MSG.error(locale[response.data.code]);
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
      return reject(new Error('接口报错了，请在控制台查看接口错误'));
    }
    if (response.data.code === 999994) {
      let others = response.data.others;
      if (others.hasOwnProperty('otherCode') && others.otherCode.indexOf('1') >= 0) {
        // 可购买
        showPurchaseModal('1', others.moduleName);
      } else if (others.hasOwnProperty('otherCode') && others.otherCode.indexOf('2') >= 0) {
        // 可试用
        showPurchaseModal('2', others.moduleName);
      }
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
      return resolve(common.copy(response));
    }
    if (response.data.code === 0 || (response.data.status === 200 && common.isEmpty(response.data.code)) || response.data.msg === '成功') {
      resultList[requestKey] = { resultTime: new Date().getTime(), result: response };
      return resolve(common.copy(response));
    }
    if (response.data.code === -1 || response.data.code === -2 || response.data.code === -3 || response.data.code === -4 || response.data.code === -5 || response.data.code === -6 || response.data.code === -7 || response.data.code === -8 || response.data.code === -9 || response.data.code === -10 || response.data.code === 1111 || response.data.code === -999 || response.data.code === 116112 || // '116112': '没有正在扫描的包装作业,请扫描',
      response.data.code === 1) {
      // 错误码 (-1.*,-10) 错误走之前流程
      resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
      return resolve(common.copy(response));
    }
    // 异常码处理
    let keys = Object.keys(locale);
    let text = '操作失败';
    if (keys.indexOf(String(response.data.code)) > -1) {
      text = locale[response.data.code];
    }
    setTimeout(() => {
      !response.config.hiddenError && MSG.error({
        content: text,
        duration: 7,
        level: 1,
        closable: true
      });
    }, 300);
    resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), status: 'reject', result: response };
    return resolve(common.copy(response));
  })
}, (error) => {
  return new Promise((resolve, reject) => {
    const requestKey = getrequestKey(error.config);
    LoadingBar.finish();
    delete signKey.againJson[requestKey];
    if (error.response) {
      // 如果是blob, 说明是下载文件流
      if (error.response.config.responseType === 'blob') {
        resultList[requestKey] = { remove: true, resultTime: new Date().getTime(), downLoadFile: true, result: error.response };
        return resolve(blobError(common.copy(error.response)));
      } else if (error.response.status === 500) {
        let keys = Object.keys(locale);
        let text = '操作失败';
        if (error.response.data && typeof error.response.data.code !== 'undefined' && keys.indexOf(String(error.response.data.code)) > -1) {
          text = locale[error.response.data.code];
        }
        setTimeout(() => {
          !error.response.config.hiddenError && MSG.error({
            content: text,
            duration: 7,
            level: 1,
            closable: true
          });
        }, 300);
      } else if (error.response.status === 404) {
        console.error('接口不存在');
      }
      resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error.response };
      return reject(common.copy(error.response));
    } else if (error.message.includes('timeout')) {
      !error.response.config.hiddenError && MSG.error({
        content: '请求超时',
        duration: 7,
        level: 1,
        closable: true
      });
      resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error };
      return reject(common.copy(error));
    } else if (error.request) {
      console.error(error.request);
      resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error };
      return reject(common.copy(error));
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
            resultObj.downLoadFile ? resolve(blobError(common.copy(resultObj.result))) : resolve(common.copy(resultObj.result));
          } else {
            reject(common.copy(resultObj.result));
          }
        }
      }, checkResTime)
      return;
    }
    console.error('Error', error.message);
    resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error };
    return reject(common.copy(error))
  })
});
