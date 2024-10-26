import dayjs from 'dayjs';
import store from '@/store/store';
import { getToken } from '@/utils/cookie';
import cookieConfig from '@/utils/cookieConfig';
// 用于读取 pdf 文件 需要安装依赖：yarn add vue-pdf
import pdf from 'vue-pdf';
import Cookies from 'js-cookie';
import axios from 'axios';

const tool = {
  conversion_getDPI () {
    let arrDPI = [];
    if (window.screen.deviceXDPI) {
      arrDPI[0] = window.screen.deviceXDPI;
      arrDPI[1] = window.screen.deviceYDPI;
    } else {
      let tmpNode = document.createElement("div");
      tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
      document.body.appendChild(tmpNode);
      arrDPI[0] = parseInt(tmpNode.offsetWidth);
      arrDPI[1] = parseInt(tmpNode.offsetHeight);
      tmpNode.parentNode.removeChild(tmpNode);
    }
    return arrDPI;
  },
  // base64 转换为 UintArr
  getUintArr (base64Data) {
    const isIncludesSign = (/^data:/.test(base64Data) && base64Data.includes(';base64,'));
    const arr = base64Data.split(',');
    const match = isIncludesSign ? arr[0].match(/:(.*?);/) : [];
    const newFileType = match && match.length > 1 ? match[1] : '';
    try {
      let bstr = window.atob(isIncludesSign ? arr[1] : arr[0]);
      let leng = bstr.length;
      let UintArr = new Uint8Array(leng);
      while (leng--) {
        UintArr[leng] = bstr.charCodeAt(leng);
      }
      return { type: newFileType, Uint8Array: UintArr }
    } catch (e) {
      console.warn('数据源格式有误, 可能会丢失部分数据:', e);
      return { type: newFileType, Uint8Array: base64Data }
    }
  },
  /**
 * 最多执行异步方法数量
 * @param concurrency 数据源
 * @param limit 并发最大数量, 默认 10
 * @returns
 */
  enqueuePromise (concurrency = [], { limit = 10, progress = (percent) => {} } = {}) {
    let index = 0;
    const ret = [];
    const executing = [];
    const poolLimit = limit > 0 ? limit : 10;
    const enqueue = () => {
      // 边界处理, concurrency 为空数组
      if (index === concurrency.length) {
        concurrency.length === 0 && progress(100);
        return Promise.resolve();
      }
      // 每调一次 enqueue, 初始化一个 promise
      let newPromise = concurrency[index++]();
      if (Object.prototype.toString.call(newPromise).slice(8, -1) !== 'Promise') {
        if (typeof newPromise === 'function') {
          newPromise = newPromise();
          if (Object.prototype.toString.call(newPromise).slice(8, -1) !== 'Promise') {
            newPromise = Promise.resolve(newPromise);
          }
        } else {
          newPromise = Promise.resolve(newPromise);
        }
      }
      progress(Number(((index / concurrency.length) * 100).toFixed(2)));
      // 放入 promises 数组
      ret.push(newPromise);
      // 将有返回值的 promise 从 executing 数组中删除, 并将下一个需要执行的放进 executing 数组中
      const perform = newPromise.then(() => {
        return executing.splice(executing.indexOf(perform), 1);
      }).catch(() => {
        return executing.splice(executing.indexOf(perform), 1);
      });
      // 插入 executing 数组, 表示正在执行的 promise
      executing.push(perform);
      // 使用 Promise.rece, 每当 executing 数组中 promise 数量低于 poolLimit, 就实例化新的 promise 并执行
      let result = Promise.resolve();
      if (executing.length >= poolLimit) {
        result = Promise.race(executing);
      }
      // 递归, 直到遍历完 concurrency
      return result.then(() => enqueue());
    };
    return enqueue().then(() => ret);
  }
}
/**
 * 返回本地时间与标准时间的时差(正数为东区，负数为西区)
 * @returns
 */
const getTimeDifference = () => {
  const nowDate = new Date();
  const dateISO = nowDate.toISOString().split(/[^0-9]/);
  const dateLocale = nowDate.toLocaleString().split(/[^0-9]/);
  return Number(dateLocale[3]) - Number(dateISO[3]);
}

const downLoadHand = (fileRes, fileName, timestamp = false, suffix = '') => {
  return new Promise((resolve, reject) => {
    try {
      //  如果支持微软的文件下载方式(ie10+浏览器)
      // @ts-ignore
      if (window.navigator.msSaveBlob) {
        // @ts-ignore
        window.navigator.msSaveBlob(fileRes, fileName + (timestamp ? `_${Date.now()}` : '') + (suffix ? `.${suffix}` : ''));
      } else {
        // 其他浏览器
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(fileRes);
        a.style.display = 'none';
        a.setAttribute('download', fileName + (timestamp ? `_${Date.now()}` : '') + (suffix ? `.${suffix}` : ''));
        setTimeout(() => {
          a.click();
          setTimeout(() => {
            a.remove();
            resolve(true);
            // 释放缓存
            window.URL.revokeObjectURL(a.href);
          }, 10)
        }, 0)
      }
    } catch (error) {
      console.error('浏览器不支持: ', error);
      reject(error);
    }
  })
}

const common = {
  // 深拷贝
  copy: (obj) => {
    if (common.isDate(obj)) return new Date(obj.getTime());
    if (common.isJson(obj) || common.isArray(obj)) {
      let newObj = common.isJson(obj) ? {} : [];
      const keys = Object.keys(obj);
      for (let i = 0, len = keys.length; i < len; i++) {
        newObj[keys[i]] = common.copy(obj[keys[i]]);
      }
      return newObj;
    } else if (common.isObject(obj) && obj !== null) { // 当参数为 object 类型并且不是 json 和数组时
      let newObj = {};
      for (let key in obj) {
        newObj[key] = common.copy(obj[key]);
      }
      return newObj;
    }
    return obj;
  },
  /**
   * 是否文件类型
   * @param value
   * @returns
   */
  isFile (value) {
    return Object.prototype.toString.call(value).slice(8, -1) === 'File';
  },
  // 是否数组
  isArray: (arr) => {
    if (typeof arr === 'undefined') return false;
    if (Array.isArray) return Array.isArray(arr);
    return Object.prototype.toString.call(arr).slice(8, -1) === 'Array';
  },
  // 是否对象, 包含数组和json
  isObject: (obj) => {
    if (common.isArray(obj)) return true;
    return Object.prototype.toString.call(obj).slice(8, -1) === 'Object';
  },
  fileBase: '/filenode/s',
  // 是json
  isJson: (obj) => {
    return Object.prototype.toString.call(obj).slice(8, -1) === 'Object';
  },
  // 是否数字类型
  isNumber: (num) => {
    return Object.prototype.toString.call(num).slice(8, -1) === 'Number';
  },
  // 是否字符串
  isString: (str) => {
    return Object.prototype.toString.call(str).slice(8, -1) === 'String';
  },
  // 判断当前值是否为空，，数组(对象)中嵌套空值或空格都不为空
  valEmpty: (value) => {
    if (common.isDate(value)) return isNaN(value.getTime());
    if (common.isString(value)) return value === '';
    if (common.isNumber(value)) return isNaN(value);
    if (common.isJson(value) || common.isArray(value)) return (Object.values(value)).length <= 0;
    return value === null || common.isUndefined(value);
  },
  /**
   * 判断是否为空, 可以支持判断 空数组、空对象、null、空字符串、undefined、NaN
   * @param value 需要验证的数据
   * @param isTrim 字符串多个空格或数组、对象所有末级值为空(包括多个空格)是否视父级为空
   * @param type 多个空格的字符串或数组、对象所有末级值为空(不包括多个空格)是否视父级为空(当 isTrim 设置为 true 时，type 强制为 true)
   * @returns
   */
  isEmpty: (value, isTrim = false, type = false) => {
    if (isTrim || type) {
      if (common.isString(value) && (isTrim || type)) return value.trim() === '';
      if (common.isJson(value) || common.isArray(value)) {
        return Object.keys(common.removeEmpty(Object.values(value), [], true, isTrim)).length <= 0;
      }
    }
    return common.valEmpty(value);
  },
  // 是否未定义
  isUndefined: (val) => {
    return typeof val === 'undefined';
  },
  // 是否boolean
  isBoolean: (val) => {
    return Object.prototype.toString.call(val).slice(8, -1) === 'Boolean';
  },
  // 是否函数
  isFunction: (fun) => {
    return Object.prototype.toString.call(fun).slice(8, -1) === 'Function'
  },
  // 是否时间
  isDate: (val) => {
    return Object.prototype.toString.call(val).slice(8, -1) === 'Date'
  },
  // 是否正则
  isRegExp: (val) => {
    return Object.prototype.toString.call(val).slice(8, -1) === 'RegExp'
  },
  isSymbol: (val) => { // 是否Symbol函数
    return Object.prototype.toString.call(val).slice(8, -1) === 'Symbol'
  },
  // 是否Promise对象
  isPromise: (val) => {
    return Object.prototype.toString.call(val).slice(8, -1) === 'Promise'
  },
  // 是否Set对象
  isSet: (val) => {
    return Object.prototype.toString.call(val).slice(8, -1) === 'Set'
  },
  // 是否 html
  isHtml (str) {
    return /<[a-z]+\d?(\s+[\w-]+=("[^"]*"|'[^']*'))*\s*\/?>|&#?\w+;/i.test(str);
  },
  // 是 url
  isUrl (str) {
    // const pattern = new RegExp(
    //   '^(https?:\\/\\/)?' + // protocol
    //     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    //     '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    //     '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    //     '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    //     '(\\#[-a-z\\d_]*)?$',
    //   'i'
    // );
    // return !!pattern.test(str) || str.includes('http://localhost');
    return str.substring(0, 7) === 'http://' || str.substring(0, 8) === 'https://';
  },
  // 获取权限
  // roleKey 支持字符串和数组以及json
  getPermission (roleKey) {
    const isAdmin = store.state.isAdmin;
    const roleList = store.state.roleList;
    if (common.isString(roleKey)) return !!(isAdmin || roleList[roleKey]);
    let permission = {};
    const keys = common.isJson(roleKey) ? Object.keys(roleKey) : common.isArray(roleKey) ? roleKey : [];
    let key = '';
    for (let i = 0, len = keys.length; i < len; i++) {
      key = common.isJson(roleKey) ? roleKey[keys[i]] : keys[i];
      if (common.isString(keys[i]) && (isAdmin || roleList[key])) {
        permission[keys[i]] = true;
      } else {
        permission[keys[i]] = false;
      }
    }
    return permission;
  },
  // 数组去重
  arrRemoveRepeat: (arr) => {
    return Array.from(new Set(arr));
  },
  // 移除对象中所有值的 2 端空格
  trim: (obj, exceptionKey) => {
    const exception = common.isString(exceptionKey) ? [exceptionKey] : exceptionKey || [];
    if ((common.isString(obj) && obj === '') || common.isEmpty(obj)) return;
    if (common.isString(obj)) {
      return obj.trim();
    }
    if (common.isArray(obj)) {
      obj.forEach((item, index) => {
        if (common.isObject(item)) {
          common.trim(item, exception);
        } else if (common.isString(item)) {
          obj[index] = item.trim();
        }
      })
    } else if (common.isJson(obj)) {
      Object.keys(obj).forEach(key => {
        if (common.isObject(obj[key])) {
          common.trim(obj[key], exception);
        } else if (common.isString(obj[key]) && !exception.includes(key)) {
          obj[key] = obj[key].trim();
        }
      })
    }
    return obj;
  },
  getParams: (obj) => {
    if (common.isEmpty(obj)) return '';
    if (common.isJson(obj)) {
      const keys = Object.keys(obj);
      let params = '';
      keys.forEach(key => {
        params += params.includes('=') ? `&${key}=${obj[key]}` : `${key}=${obj[key]}`;
      })
      return params;
    }
    return ''
  },
  /* 获取全部url参数,并转换成json对象 */
  getUrlParams (config, key) {
    const newUrl = decodeURIComponent((this.isString(config) ? config : config ? config.url : window.location.href) || window.location.href);
    if (newUrl.indexOf('?') === -1) return {};
    const urlOption = newUrl.substring(newUrl.indexOf('?') + 1);
    const urlList = this.split(urlOption, ['&']);
    let urlJson = {};
    const keysList = !this.isEmpty(key) ? key : this.isObject(config) && !this.isEmpty(config.keys) ? config.keys : null;
    for (let i = 0, len = urlList.length; i < len; i++) {
      const pos = urlList[i].indexOf('=');
      urlJson[urlList[i].substring(0, pos)] = urlList[i].substring(pos + 1);
    }
    if (this.isString(keysList)) {
      return urlJson[keysList];
    } else if (this.isArray(keysList)) {
      let newVal = {};
      for (let index = 0, klen = keysList.length; index < klen; index++) {
        newVal[keysList[index]] = urlJson[keysList[index]];
      }
      return newVal;
    }
    return urlJson;
  },
  /**
   * 将字符串分割成数组
   * @param str 需要分割的字符串
   * @param sign 分割符号，支持字符串、数组、RegExp; (注意：正则特殊符号不要放到数组中，请使用字符串)
   * @param removeEmpty 是否移除空值以及空格
   * @returns
   */
  split (str, sign, removeEmpty) {
    if (this.isEmpty(str) || !this.isString(str)) return [];
    if (this.isRegExp(sign)) return str.split(sign);
    if (this.isEmpty(sign) || (!this.isString(sign) && !this.isArray(sign))) return [str];
    const isRemove = typeof removeEmpty === 'boolean' && removeEmpty;
    if (this.isString(sign)) {
      if (isRemove) return str.split(sign).filter(f => !this.isEmpty(f, true));
      return str.split(sign);
    }
    let strArr = [];
    let newArr = [];
    for (let si = 0, slen = sign.length; si < slen; si++) {
      if (si === 0) {
        strArr = isRemove ? str.split(sign[si]).filter(f => !this.isEmpty(f, true)) : str.split(sign[si]);
      } else {
        newArr = [];
        for (let i = 0, len = strArr.length; i < len; i++) {
          newArr.push(isRemove ? strArr[i].split(sign[si]).filter(f => !this.isEmpty(f, true)) : strArr[i].split(sign[si]));
        }
        strArr = this.flat(newArr);
      }
    }
    return strArr;
  },
  /**
   * 多维数组扁平化
   * @param arr 转换目标数组
   * @returns
   */
  flat (arr, level = Infinity) {
    if (!common.isArray(arr)) return arr;
    return arr.flat(level);
  },
  // px 转换为 mm
  pxToMm (value, type) {
    const inch = value / tool.conversion_getDPI()[0];
    // 0.8857142857142857 为通途打印转换时的系数
    if (type === 'tongTu') return (inch * 25.4) / 0.8857142857142857;
    return inch * 25.4;
  },
  // mm 转换为 px
  mmToPx: (value, type) => {
    const inch = value / 25.4;
    // 0.8857142857142857 为通途打印转换时的系数
    if (type === 'tongTu') return inch * tool.conversion_getDPI()[0] * 0.8857142857142857;
    return inch * tool.conversion_getDPI()[0];
  },
  // 获取cookie, 支持数组和json
  getCookie (keys) {
    if (common.isObject(keys)) {
      let newVal = {};
      if (common.isJson(keys)) {
        Object.keys(keys).forEach(key => {
          newVal[key] = Cookies.get(keys[key]) || '';
        })
      }
      if (common.isArray(keys)) {
        keys.forEach(key => {
          newVal[key] = Cookies.get(key) || '';
        })
      }
      return newVal;
    }
    return common.isString(keys) ? (Cookies.get(keys) || '') : '';
  },
  /**
   * 插入cookie，支持数组和json
   * @param key 插入cookie 的key，此处可以是数组，json
   * @param val cookie 的值(当 key 为数据或对象时，此参数会被忽略)
   * @param expires cookie 的过期时间和以前设置(当 key 为数据或对象时，此参数会被忽略)
   * @returns
   */
  setCookie (key, val, expires) {
    if (this.isEmpty(key)) return;
    if (this.isJson(key)) {
      const keys = Object.keys(key);
      for (let i = 0, len = keys.length; i < len; i++) {
        if (!this.isEmpty(key[keys[i]].key) && !this.isEmpty(key[keys[i]].value)) {
          Cookies.set(key[keys[i]].key, key[keys[i]].value, key[keys[i]].expires || {});
        }
      }
    } else if (this.isArray(key)) {
      for (let i = 0, len = key.length; i < len; i++) {
        if (!this.isEmpty(key[i].key) && !this.isEmpty(key[i].value)) {
          Cookies.set(key[i].key, key[i].value, key[i].expires || {});
        }
      }
    } else if (this.isString(key) && !this.isUndefined(val)) {
      Cookies.set(key, val, expires || {});
    }
  },
  /**
   * 移除,支持数组
   * @param keys 需要移除 cookie 的 key
   * @returns
   */
  delCookie (keys) {
    if (this.isEmpty(keys)) return;
    if (this.isString(keys)) {
      Cookies.remove(keys);
    } else if (this.isArray(keys)) {
      for (let i = 0, len = keys.length; i < len; i++) {
        this.delCookie(keys[i]);
      }
    }
  },
  // 获取请求头部信息
  requestHeaders () {
    const token = getToken();
    const DYTtoken = common.getCookie(cookieConfig.DYTtoken);
    if (token === DYTtoken) {
      return {
        'Authorization': token
      }
    }
    return {
      'Authorization': token,
      'Authorization-DYT': DYTtoken
    }
  },
  copyToClip (content) {
    let copyTxt = content;
    if (common.isObject(copyTxt)) {
      copyTxt = JSON.stringify(copyTxt);
    }
    return new Promise(resolve => {
      // execCommand 方法有可能弃用，，
      if (document.execCommand) {
        let staging = document.createElement('textarea');
        // const dome = document.querySelector('body')
        // staging.setAttribute('value', copyTxt);
        staging.innerHTML = copyTxt;
        document.body.appendChild(staging);
        staging.style.position = 'absolute';
        staging.style.maxHeight = '30vh';
        staging.style.maxWidth = '30vw';
        staging.style.top = '-1000vh';
        staging.style.left = '1000vw';
        staging.select();
        document.execCommand('copy');
        document.body.removeChild(staging);
        resolve(true);
      } else {
        console.error('浏览器不支持该操作');
        resolve(false);
      }
    })
  },
  // 按需求返回用户信息
  getUser: (match, field) => {
    const userList = store.state.userInfoList;
    if (common.isEmpty(match.trim())) return userList;
    if (common.isEmpty(userList)) return match;
    const tool = {
      user: (mat) => {
        const info = userList[mat];
        if (common.isString(field)) return info[field];
        if (common.isArray(field)) {
          let newUser = {};
          field.forEach(key => {
            newUser[key] = info[key]
          })
          return newUser;
        }
        return info;
      },
      getList: () => {
        let list = [];
        match.forEach(item => {
          list.push(tool.user(item))
        })
        return list;
      }
    }
    if (common.isString(match)) return tool.user(match);
    if (common.isArray(match)) return tool.getList(match);
    return match;
  },
  // 当前时区时间（右上角选中的时区有关）
  getDateTime: (time = common.getUniversalTime(), format = 'YYYY-MM-DD HH:mm:ss', timeDifference) => {
    return common.toLocaleDate(time, format, (common.isEmpty(timeDifference) ? null : timeDifference));
  },
  // 世界标准时间
  getUniversalTime: (time = new Date(), format = 'YYYY-MM-DD HH:mm:ss') => {
    return common.toISODate(time, format);
  },
  /**
   * 将指定日期转为指定时差的时间
   * @param date 需要转换的时间
   * @param format 返回格式, 例: YYYY/MM/DD HH:mm:ss 默认Date 对象; https://day.js.org/docs/en/display/format
   * @param timeDifference 时差(需要转换的时间与国际时间的时差, 默认为本地时间与国际时间的时差)
   */
  toLocaleDate (date, format, timeDifference) {
    if (common.isEmpty(date)) return date;
    const dateObj = common.isDate(date) ? date : new Date(common.isString(date) ? date.replace(/-/g, '/') : date);
    const timeDif = Number(common.isEmpty(timeDifference) ? common.getDefaultTimezoom() : timeDifference);
    let nformat = format;
    if (!common.isEmpty(nformat) && ['fulltime'].includes(nformat.toLocaleLowerCase())) {
      nformat = 'YYYY-MM-DD HH:mm:ss';
    }
    const newDate = dayjs(dateObj).add((common.isEmpty(timeDif) ? getTimeDifference() : timeDif), 'hour');
    return !common.isEmpty(nformat) ? newDate.format(nformat) : new Date(newDate.format('YYYY/MM/DD HH:mm:ss'));
  },
  // 获取默认时区
  getDefaultTimezoom () {
    let timezoom = localStorage.getItem('timezoom');
    if (!isNaN(Number(timezoom)) && timezoom != null) {
      return Number(timezoom);
    }
    timezoom = getTimeDifference();
    localStorage.setItem('timezoom', timezoom);
    return timezoom;
  },
  /**
   * 将指定日期通过时差转为国际标准时间
   * @param date 需要转换的时间
   * @param format 返回格式, 例: YYYY/MM/DD HH:mm:ss 默认Date 对象; https://day.js.org/docs/en/display/format
   * @param timeDifference 时差(需要转换的时间与国际时间的时差, 默认为本地时间与国际时间的时差)
   */
  toISODate (date, format, timeDifference) {
    if (common.isEmpty(date)) return date;
    const dateObj = common.isDate(date) ? date : new Date(common.isString(date) ? date.replace(/-/g, '/') : date);
    const timeDif = Number(common.isEmpty(timeDifference) ? common.getDefaultTimezoom() : timeDifference);
    let nformat = format;
    if (!common.isEmpty(nformat) && ['fulltime'].includes(nformat.toLocaleLowerCase())) {
      nformat = 'YYYY-MM-DD HH:mm:ss';
    }
    const newDate = dayjs(dateObj).add(-(common.isEmpty(timeDif) ? getTimeDifference() : timeDif), 'hour');
    return !common.isEmpty(nformat) ? newDate.format(nformat) : new Date(newDate.format('YYYY/MM/DD HH:mm:ss'));
  },
  // 返回 Date 对象或 按照 format 格式返回
  dateTransform (value, format) {
    let newVal = new Date();
    let nformat = format;
    if (common.isDate(value)) {
      newVal = value;
    } else if (common.isNumber(value)) {
      newVal = new Date(value);
    } else if (!common.isEmpty(value, true) && common.isString(value)) {
      newVal = new Date(value.replace(/-/g, '/'));
    }
    if (['fulltime'].includes(format)) {
      nformat = 'YYYY-MM-DD HH:mm:ss';
    }
    return !common.isEmpty(nformat, true) && common.isString(nformat) ? dayjs(newVal).format(nformat) : newVal;
  },
  /**
   * 文件格式转为 base64
   * @param file
   * @returns
   */
  fileToBase64 (file) {
    return new Promise((resolve, reject) => {
      let oFileReader = new FileReader();
      oFileReader.onloadend = (e) => {
        if (this.isEmpty(e.target)) return reject(e);
        resolve(e.target.result);
      };
      oFileReader.readAsDataURL(file);
    })
  },
  // base64 转为文件格式
  base64ToFile (base64Data, fileName = '') {
    const arr = base64Data.split(',');
    const fileType = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let leng = bstr.length;
    let UintArr = new Uint8Array(leng);
    while (leng--) {
      UintArr[leng] = bstr.charCodeAt(leng);
    }
    const newFile = new File([UintArr], fileName, {
      type: fileType
    })
    return newFile;
  },
  // 读取 pdf 并且转为图片
  getPdfRes ({ pdfUrl = '', pageNumber = null, scale = 10 } = {}) {
    return new Promise((resolve) => {
      if (common.isEmpty(pdfUrl)) return resolve(null);
      pdf.createLoadingTask({
        url: pdfUrl,
        // cMapUrl: '/sps-service/static/pdf/web/cmaps/',
        cMapPacked: true
      }).promise.then(pdfFile => {
        const numPages = pdfFile.numPages;
        if (common.isEmpty(pageNumber)) {
          const allPageList = Array.from({ length: numPages }, (v, k) => k);
          common.promiseAll(allPageList.map((index) => {
            return () => common.getPdfPage(pdfFile, index + 1, scale)
          })).then(pdfArr => {
            resolve(pdfArr);
          })
        } else if (pageNumber > 0 && pageNumber <= numPages) {
          common.getPdfPage(pdfFile, pageNumber, scale).then(res => {
            resolve(res);
          })
        } else {
          resolve(null);
        }
      }).catch((err) => {
        console.error(err);
        resolve(null);
      })
    })
  },
  // 将对应页码的 pdf 文件转为图片
  getPdfPage (pdfFile, pageNumber, scale = 10) {
    return new Promise((resolve) => {
      pdfFile.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        page.render({ canvasContext: context, viewport: viewport }).promise.then((pdf) => {
          resolve(canvas.toDataURL('image/JPEG'));
          setTimeout(() => {
            canvas.remove();
          }, 500)
        })
      })
    })
  },
  // 验证数字
  validatorMaxNumber (rule, value, callback) {
    // setTimeout(() => {
    let required = common.isEmpty(rule.required) ? rule.getRequired : rule.required;
    if (common.isFunction(required)) {
      required = required(rule, value);
    }
    if (!common.isEmpty(required) && required && common.isEmpty(value)) {
      return callback(new Error(rule.msg || '必填项不能为空'));
    }
    const point = Number(rule.point);
    const max = Number(rule.max);
    const min = Number(rule.min);
    const notIncludes = rule.notIncludes || [];
    if (!common.isEmpty(value)) {
      const newVal = Number(value);
      const decimals = (value.toString()).split('.');
      if (common.isEmpty(newVal) || (decimals.length > 1 && common.isEmpty(decimals[0]))) {
        return callback(new Error('请输入数字'));
      }
      if (!common.isEmpty(max) && newVal >= max) {
        if (notIncludes.includes('max') && newVal >= max) {
          if (!common.isEmpty(point)) {
            if (point == 0) return callback(new Error(`请输入小于${max}的整数`));
            if (!common.isEmpty(decimals[1]) && decimals[1].length > point) return callback(new Error(`请输入小于${max}且最多${point}位小数的数字`));
          }
          return callback(new Error(`请输入小于${max}的数字`));
        }
        if (newVal > max) {
          if (!common.isEmpty(point)) {
            if (point == 0) return callback(new Error(`请输入不大于${max}的整数`));
            if (!common.isEmpty(decimals[1]) && decimals[1].length > point) return callback(new Error(`请输入不大于${max}且最多${point}位小数的数字`));
          }
          return callback(new Error(`请输入不大于${max}的数字`));
        }
      }
      if (!common.isEmpty(min) && min >= newVal) {
        if (notIncludes.includes('min') && min >= newVal) {
          if (!common.isEmpty(point)) {
            if (point == 0) return callback(new Error(`请输入大于${min}的整数`));
            if (!common.isEmpty(decimals[1]) && decimals[1].length > point) return callback(new Error(`请输入大于${min}且最多${point}位小数的数字`));
          }
          return callback(new Error(`请输入大于${min}的数字`));
        }
        if (min > newVal) {
          if (!common.isEmpty(point)) {
            if (point == 0) return callback(new Error(`请输入不小于${min}的整数`));
            if (!common.isEmpty(decimals[1]) && decimals[1].length > point) return callback(new Error(`请输入不小于${min}且最多${point}位小数的数字`));
          }
          return callback(new Error(`请输入不小于${min}的数字`));
        }
      }
      if (!common.isEmpty(point)) {
        if (!common.isEmpty(decimals[1]) && decimals[1].length > point) {
          if (point == 0) return callback(new Error(`请输入整数`));
          return callback(new Error(`请输入最多为${point}的位小数`));
        }
      }
      if (rule.trigger == 'blur' && !common.isUndefined(decimals[1]) && decimals[1].length == 0) {
        return callback(new Error(`请输入正确的数字格式`));
      }
    }
    callback();
    // }, 200)
  },
  // 字符长度验证
  strMaxVerify (rule, value, callback) {
    const maxLength = Number(rule.maxLength);
    const minLength = Number(rule.minLength);
    let required = common.isEmpty(rule.required) ? rule.getRequired : rule.required;
    if (common.isFunction(required)) {
      required = required(rule, value);
    }
    if (!common.isEmpty(required) && required && common.isEmpty(value)) {
      return callback(new Error(rule.msg || '必填项不能为空'));
    }
    if (!common.isEmpty(maxLength) && !common.isEmpty(value) && value.length > maxLength) {
      return callback(new Error(`最多可输入 ${maxLength} 字符长度`));
    }
    if (!common.isEmpty(minLength) && !common.isEmpty(value) && minLength > value.length) {
      return callback(new Error(`最少需要输入 ${minLength} 字符长度`));
    }
    callback();
  },
  // 表单必填验证
  formItemVerify (rule, value, callback) {
    let required = common.isEmpty(rule.required) ? rule.getRequired : rule.required;
    if (common.isFunction(required)) {
      required = required(rule, value);
    }
    if (!common.isEmpty(required) && required && common.isEmpty(value)) {
      return callback(new Error(rule.msg || '必填项不能为空'));
    }
    callback();
  },
  // 表单验证错误定位焦点
  inputFocus (formClass) {
    if (common.isEmpty(formClass)) return;
    setTimeout(() => {
      const newClass = formClass.substring(0, 1) == '.' ? formClass : `.${formClass}`;
      const errorDemo = document.querySelector(`${newClass} .ivu-form-item-error`);
      if (!errorDemo) return;
      let inputDemo = errorDemo.querySelector('.ivu-select-input') || errorDemo.querySelector('.vue-treeselect__value-container .vue-treeselect__input');
      if (inputDemo) {
        inputDemo.focus();
        inputDemo.click();
        return;
      }
      inputDemo = errorDemo.querySelector('input');
      if (!inputDemo) return;
      inputDemo.focus();
    }, 300);
  },
  dayjs: dayjs,
  /**
   * 移除对象空值
   * @param target 需要处理的目标对象
   * @param ruleOut 不处理的键名, 包括所在的所有子级, 可以指定对象数据链，如果是数组: a.b.c[3].d.g[2].key, 数组下所有元素则用 * 号代替数字: a.b.c[\*].d.g[\*].key
   * @param emptyAllClean 当子级为空时，递归清空父级, 默认为 false; 当 ruleOut 为布尔值时, ruleOut 代替 emptyAllClean
   * @param stringTrim
   * @returns
   */
  removeEmpty (target, ruleOut, emptyAllClean, stringTrim) {
    let outKey = [];
    if (!this.valEmpty(ruleOut) && (typeof ruleOut == 'string' || this.isArray(ruleOut))) {
      outKey = typeof ruleOut == 'string' ? [ruleOut] : ruleOut;
    } else if (typeof ruleOut == 'boolean') {
      emptyAllClean = ruleOut;
    }
    const hand = (option, clean, stackPointerLike) => {
      if (this.isArray(option)) {
        let newObj = [];
        for (let i = 0, len = option.length; i < len; i++) {
          let currentLikeKey = `${this.valEmpty(stackPointerLike) ? '' : stackPointerLike}[*]`;
          const otherLikeKey = `${this.valEmpty(stackPointerLike) ? '' : stackPointerLike}[${i}]`;
          for (let oi = 0, olen = outKey.length; oi < olen; oi++) {
            if (outKey[oi].includes(otherLikeKey)) {
              const newStr = outKey[oi].substring(0, otherLikeKey.length);
              newStr === otherLikeKey && (currentLikeKey = newStr);
            }
          }
          if (!outKey.includes(currentLikeKey)) {
            if (!this.valEmpty(option[i])) {
              if (this.isObject(option[i])) {
                const newVal = hand(option[i], false, currentLikeKey);
                if (!emptyAllClean && !clean) {
                  this.valEmpty(newVal) && this.isJson(option[i]) ? newObj.push(option[i]) : newObj.push(newVal);
                } else {
                  !this.valEmpty(newVal) && newObj.push(newVal);
                }
              } else if (!this.valEmpty(option[i])) {
                if (stringTrim && this.isString(option[i])) {
                  !this.valEmpty(option[i].trim()) && newObj.push(option[i]);
                } else {
                  newObj.push(option[i]);
                }
              }
            }
          } else if (!this.valEmpty(option[i])) {
            if (stringTrim && this.isString(option[i])) {
              !this.valEmpty(option[i].trim()) && newObj.push(option[i]);
            } else {
              newObj.push(option[i]);
            }
          }
        }
        return newObj;
      }
      if (this.isJson(option)) {
        let newObj = {};
        const objKeys = Object.keys(option);
        for (let i = 0, len = objKeys.length; i < len; i++) {
          const currentLikeKey = `${this.valEmpty(stackPointerLike) ? '' : `${stackPointerLike}.`}${objKeys[i]}`;
          if (!outKey.includes(objKeys[i]) && !outKey.includes(currentLikeKey)) {
            if (!this.valEmpty(option[objKeys[i]]) && option[objKeys[i]] !== 'web-null') {
              if (this.isObject(option[objKeys[i]])) {
                const newVal = hand(option[objKeys[i]], false, currentLikeKey);
                if (!emptyAllClean && !clean) {
                  newObj[objKeys[i]] = newVal;
                } else {
                  !this.valEmpty(newVal) && (newObj[objKeys[i]] = newVal);
                }
              } else if (!this.valEmpty(option[objKeys[i]])) {
                if (stringTrim && this.isString(option[objKeys[i]])) {
                  !this.valEmpty(option[objKeys[i]].trim()) && (newObj[objKeys[i]] = option[objKeys[i]]);
                } else {
                  newObj[objKeys[i]] = option[objKeys[i]];
                }
              }
            }
          } else if (!this.valEmpty(option[objKeys[i]])) {
            if (stringTrim && this.isString(option[objKeys[i]])) {
              !this.valEmpty(option[objKeys[i]].trim()) && (newObj[objKeys[i]] = option[objKeys[i]]);
            } else {
              newObj[objKeys[i]] = option[objKeys[i]];
            }
          }
        }
        return newObj;
      }
      return option;
    }
    return hand(this.copy(target), true);
  },
  /**
   * Promise.allSettled 并发请求限制
   * @param concurrency 数据源
   * @param {object} options 其他配置
   * @param options.limit 并发最大数量, 默认 10
   * @param options.progress 执行进度，每次完成一个请求时回调一次，返回当前进度的百分比
   * @returns
  */
  allSettled (concurrency = [], { limit = 10, progress = (percent) => {} } = {}) {
    return new Promise((resolve) => {
      tool.enqueuePromise(concurrency, { limit: limit, progress: progress }).then(ret => {
        if (this.isFunction(Promise.allSettled)) {
          resolve(Promise.allSettled(ret));
        } else {
          Promise.all(ret).then(res => {
            let obj = [];
            for (let i = 0, len = res.length; i < len; i++) {
              obj.push({ status: 'fulfilled', value: res[i] });
            }
            resolve(obj);
          }).catch((error) => {
            let obj = [];
            for (let i = 0, len = ret.length; i < len; i++) {
              obj.push({ status: 'rejected', reason: error });
            }
            resolve(obj);
          });
        }
      })
    })
  },
  /**
   * Promise.all 并发请求限制
   * @param concurrency 数据源
   * @param {object} options 其他配置
   * @param options.limit 并发最大数量, 默认 10
   * @param options.progress 执行进度，每次完成一个请求时回调一次，返回当前进度的百分比
   * @returns
  */
  promiseAll (concurrency = [], { limit = 10, progress = (percent) => {} } = {}) {
    return new Promise((resolve) => {
      tool.enqueuePromise(concurrency, { limit: limit, progress: progress }).then(ret => {
        resolve(Promise.all(ret))
      })
    })
  },
  // 获取对应父级节点
  parents (element, key) {
    let current = typeof element === 'string' ? document.querySelector(element) : element;
    const target = document.querySelectorAll(key);
    if (!current) return target[0] || null;
    if (!target) return null;
    // 添加标记
    target.forEach((dome) => {
      dome.setAttribute('get-target-parents', 'get-target-parents')
    });
    while (!common.isEmpty(current.getAttribute) && current.getAttribute('get-target-parents') !== 'get-target-parents') {
      current = current.parentNode;
    }
    // 移除标记
    target.forEach((dome) => {
      dome.removeAttribute('get-target-parents');
    });
    return current;
  },
  /**
   * 滚动到指定元素位置
   * @param element 目标元素
   */
  smoothScroll (element) {
    const newElement = this.isString(element) ? document.querySelector(element) : element;
    if (this.isEmpty(newElement)) return;
    newElement.scrollIntoView({
      behavior: 'smooth'
    });
  },
  /**
   * 获取元素所在被滚动距离
   * @param element 目标节点或节点标识id,class等标识
   * @returns
   */
  getElementScrollTop (element) {
    const newElement = this.isString(element) ? document.querySelector(element) : element;
    if (!newElement) return 0;
    let top = 0;
    let current = newElement.parentNode;
    while (current !== null) {
      top += current.scrollTop || 0;
      current = current.parentNode;
    }
    return top;
  },
  /**
   * 获取元素距离另外一个元素的距离(必须是属于子父级元素)
   * @param element 目标节点或节点标识id,class等标识
   * @param endElement 父级或顶级元素，默认为 document
   * @returns
   */
  getElementOffset (element, endElement) {
    const newElement = this.isString(element) ? document.querySelector(element) : element;
    const eElement = this.isString(endElement) ? document.querySelector(endElement) : endElement || null;
    let offset = { x: 0, y: 0 }
    if (this.isEmpty(newElement)) return offset;
    let current = newElement.offsetParent;
    offset.x += newElement.offsetLeft;
    offset.y += newElement.offsetTop;
    while (current !== null && [current].indexOf(eElement) < 0) {
      offset.x += current.offsetLeft || 0;
      offset.y += current.offsetTop || 0;
      current = current.offsetParent;
    }
    return offset;
  },
  /**
   * 判断是否 Blob 类型
   * @param val 数据源
   * @returns
   */
  isBlob  (val) {
    return Object.prototype.toString.call(val).slice(8, -1) === 'Blob'
  },
  /**
 * base64 转为 Blob
 * @param base64Data 数据源
 * @returns
 */
  // base64ToBlob (base64Data) {
  //   const arr = base64Data.split(',');
  //   const match = arr[0].match(/:(.*?);/);
  //   let bstr = atob(arr[1]);
  //   let leng = bstr.length
  //   let UintArr = new Uint8Array(leng);
  //   while (leng--) {
  //     UintArr[leng] = bstr.charCodeAt(leng);
  //   }
  //   return new Blob([UintArr], { type: match && match[1] ? match[1] : 'text/plain' });
  // },
  /**
   * base64 转为 Blob
   * @param base64Data 数据源
   * @returns
   */
  base64ToBlob (base64Data, fileType) {
    const uintArr = tool.getUintArr(base64Data);
    return new Blob([uintArr.Uint8Array], { type: fileType || uintArr.type || 'text/plain' });
  },
  // 数组多个优先级排序, sortconfig 中sortKey 字段为排序字段；
  // sortconfig 中 sortType 字段值为 desc 就是倒序， asc 就是升序， 为空或其他值则不排序, 目前只针对数字类型排序，其他不支持
  listPrioritySort (sortData = [], sortconfig = []) {
    let sortBy = 0;
    let index = 0;
    let sortsLength = sortconfig.length;
    let newType = 0;
    const data = this.copy(sortData);
    return data.sort((a, b) => {
      sortBy = 0;
      for (index = 0; index < sortsLength; index++) {
        if (a[sortconfig[index].sortKey] !== b[sortconfig[index].sortKey]) {
          newType = 0;
          if (['asc', 'desc'].includes(sortconfig[index].sortType)) {
            newType = sortconfig[index].sortType == 'asc' ? 1 : -1;
          }
          if (this.isEmpty(Number(a[sortconfig[index].sortKey])) || this.isEmpty(a[sortconfig[index].sortKey], true)) {
            sortBy = -1 * newType;
            break;
          }
          if (this.isEmpty(Number(b[sortconfig[index].sortKey])) || this.isEmpty(b[sortconfig[index].sortKey], true)) {
            sortBy = newType;
            break;
          }
          sortBy = (a[sortconfig[index].sortKey] - b[sortconfig[index].sortKey]) * newType;
          break;
        }
      }
      return sortBy;
    });
  },
  // 新窗口预览 Bold (只支持 pdf 和 图片类型)
  previewFile (blobData) {
    return new Promise((resolve) => {
      if (this.isObject(blobData)) {
        if (!this.isEmpty(blobData.url)) {
          const previewWindow = window.open('');
          let postfix = this.isEmpty(blobData.type) ? (blobData.url.substring(blobData.url.lastIndexOf('.') + 1, blobData.url.length)) : blobData.type;
          if (this.isEmpty(postfix)) {
            previewWindow.location.href = blobData.url;
            return resolve(previewWindow);
          }
          postfix = postfix.toLocaleLowerCase();
          // 数据源为地址时
          axios.get(blobData.url, { responseType: 'blob' }).then(res => {
            if (this.isEmpty(res.data) && this.isEmpty(res.resData)) {
              previewWindow.close();
              return resolve(null);
            }
            this.blobToBase64(res.data || res.resData).then(data => {
              const fileBold = this.base64ToBlob(data, postfix === 'pdf' ? 'application/pdf' : 'image/png');
              const previewUrl = window.URL.createObjectURL(fileBold);
              previewWindow.location.href = previewUrl;
              const newWindowIsClosedTime = setInterval(() => {
                if (this.isEmpty(previewWindow) || this.isEmpty(previewWindow.closed) || previewWindow.closed) {
                  window.URL.revokeObjectURL(previewUrl);
                  clearInterval(newWindowIsClosedTime);
                }
              }, 500)
              resolve(previewWindow);
            }).catch((error) => {
              console.error(error);
              previewWindow.close();
              resolve(null);
            })
          }).catch((error) => {
            console.error(error);
            previewWindow.close();
            resolve(null);
          })
        }
        return;
      }
      const previewUrl = window.URL.createObjectURL(blobData);
      const previewWindow = window.open(previewUrl);
      const newWindowIsClosedTime = setInterval(() => {
        if (common.isEmpty(previewWindow) || common.isEmpty(previewWindow.closed) || previewWindow.closed) {
          window.URL.revokeObjectURL(previewUrl);
          clearInterval(newWindowIsClosedTime);
        }
      }, 500)
      resolve(previewWindow);
    })
  },
  /**
   * blob 转为 Base64
   * @param blob 数据源
   * @returns
   */
  blobToBase64 (blob, isType = false) {
    return new Promise((resolve, reject) => {
      if (this.isEmpty(blob)) return reject(new Error({ message: '数据源不可为空' }));
      if (!this.isBlob(blob)) {
        return reject(new Error({
          message: '数据源格式有误，请传递 blob 格式的数据源'
        }));
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isType) {
          resolve(reader.result);
        } else {
          resolve(reader.result.slice(reader.result.indexOf(',') + 1));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })
  },

  /**
 * @param {string|Blob|Array} data 数据源, 可以是文件的地址、base64、File等, 必传
 * @param {object} options
 * @param {string} options.fileName 文件名
 * @param {string} options.suffix 文件名后缀
 * @param {string} options.type MIME类型，尽量传入正确的类型
 * @param {string} options.encode 字符编码类型
 * @param {boolean} options.timestamp 是否在文件名后追加时间戳
 */
  downloadFile (data, { name = '', suffix = '', type = '', encode = '', timestamp = false } = {}) {
    return new Promise((resolve, reject) => {
      if (!data) {
        console.error(`数据源不能为空！`);
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('数据源不能为空！');
        return;
      }
      if (common.isString(data) && /^https?|ftp|data:/.test(data)) {
        // 数据源为 base64 数据源时
        if (/^data:/.test(data)) {
          downLoadHand(common.base64ToBlob(data), name, timestamp, suffix).then(() => {
            resolve(true);
          }).catch((error) => {
            reject(error);
          })
          return;
        }
        // 数据源为地址时
        axios.get(data, {
          responseType: 'blob',
          // headers: {
          //   withCredentials: true
          // }
        }).then(res => {
          let newName = decodeURI(data.substring(data.indexOf('=') + 1, data.lastIndexOf('.')));
          newName = newName.substring(newName.lastIndexOf('/') + 1, newName.length);
          const newSuffix = data.substring(data.lastIndexOf('.') + 1, data.length);
          this.downloadFile(res.data || res.resData, {
            name: name || newName,
            suffix: suffix || (!this.isEmpty(newSuffix) && newSuffix.length > 4 ? '' : newSuffix),
            timestamp: timestamp,
            encode: encode,
            type: type
          }).then((result) => {
            resolve(result);
          }).catch((error) => {
            reject(error);
          })
        }).catch((error) => {
          console.error(`无法获取文件内容，请检查本地网络或文件地址: ${decodeURI(data)} 是否能正常打开`);
          reject(error);
        })
        return;
      }
      const isFile = common.isFile(data);
      // 数据源为file格式或文件流时
      let blob = (this.isBlob(data) || isFile) ? data : new Blob(this.isArray(data) ? data : [data]);
      if (!common.isEmpty(type) || !common.isEmpty(encode)) {
        const options = {
          type: (type || 'text/plain') + (encode ? ';charset=' + encode : 'utf-8')
        }
        blob = common.isBlob(data) ? data : new Blob(common.isArray(data) ? data : [data], options);
      }
      downLoadHand(blob, isFile ? name || data.name : name, timestamp, suffix).then(() => {
        resolve(true);
      }).catch((error) => {
        reject(error);
      })
    })
  },
  dateOptions () {
    return {
      shortcuts: [
        {
          text: '最近一周',
          value: () => {
            return common.getRangeTime(null, -7, 'day');
          }
        },
        {
          text: '最近一个月',
          value: () => {
            return common.getRangeTime(null, -1, 'month');
          }
        },
        {
          text: '最近三个月',
          value: () => {
            return common.getRangeTime(null, -3, 'month');
          }
        }
      ]
    }
  },
  /**
   * 以当前传入时间为基点，返回前或后的时间范围
   * @param { time } time  时间
   * @param { number } val 差值
   * @param {'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'} unit 减少或增加的时间单位
   * @param { format } format 返回格式(格式规范：YYYY-MM-DD HH:mm:ss)，默认时间对象
   * @returns
   */
  // 以当前传入时间为基点，返回前或后的时间范围
  getRangeTime (time, number, type, format) {
    let baseTime = common.isEmpty(time) ? new Date() : common.isDate(time) ? time : new Date(time);
    let difference = number;
    let unit = type;
    const nuitList = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];
    if (!common.isNumber(difference) || common.isEmpty(difference)) {
      difference = 0;
    }
    if (!common.isString(difference) || common.isEmpty(unit)) {
      unit = 'day';
    }
    if (!nuitList.includes(type)) {
      console.error(`方法 getRangDate 调用入参不正确，${type}应传入${nuitList.join('、')}中的一个`);
      return [];
    }
    let otherTime = new Date(common.dayjs(baseTime).add(difference, type).format('YYYY/MM/DD HH:mm:ss'));
    if (!common.isEmpty(format)) {
      baseTime = common.dayjs(baseTime).format(format);
      otherTime = common.dayjs(otherTime).format(format);
    }
    if (difference >= 0) {
      return [baseTime, otherTime];
    }
    return [otherTime, baseTime];
  },
  getDataToLocalTime (date, type, timeDifference) { // 本地时间
    if (common.isEmpty(date)) return date;
    return this.toLocaleDate(date, type === 'fulltime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD', timeDifference);
  }
}
export default common;
