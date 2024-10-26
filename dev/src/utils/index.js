import store from '@/store/store';

export const setLeftMenuClickStatus = (pathName) => { // 左侧菜单高亮状态控制
  if (pathName !== store.state.pageName) {
    store.commit('clickStatus', true);
    store.commit('thisPage', pathName);
  } else {
    store.commit('clickStatus', false);
  }
};

export const getQueryString = (name) => { // 获取url里面的参数
  let reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i');
  let r = window.location.href.substr(1).match(reg);
  if (r !== null) {
    return unescape(r[2]);
  } else {
    return null;
  }
};

export const getLastPageName = () => { // 获取页面名
  let url = window.location.href;
  let l;
  if (url.indexOf('?') > 0) {
    url = url.split('?')[0].split('/');
    l = url.length;
  } else {
    url = url.split('/');
    l = url.length;
  }
  return url[l - 1];
};

export const setLocalStorage = (key, value) => {
  value = JSON.stringify(value);
  return localStorage.setItem(key, value);
};

export const getLocalStorage = key => {
  return JSON.parse(localStorage.getItem(key));
};

export const setSessionStorage = (key, value) => {
  value = JSON.stringify(value);
  return sessionStorage.setItem(key, value);
};

export const getSessionStorage = key => {
  return JSON.parse(sessionStorage.getItem(key));
};

export const clearStorage = (key, value) => {
  clearStorage();
};

export const removeStorage = key => {
  return localStorage.removeItem(key);
};

export const deleteTicket = (url) => {
  /**
   * @Description: 删除ticket参数
   * @author gan
   * @date: 2020/9/27 11:21
   * @params: url
   */
  if (url.includes('ticket')) {
    let arr = url.split('?');
    let params = arr[1].split('&');
    let paramsR = params.filter(i => !i.includes('ticket'));
    return arr[0] + '?' + paramsR.join('');
  } else {
    return url;
  }
};
