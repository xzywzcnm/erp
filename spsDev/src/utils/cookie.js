import Cookies from 'js-cookie';
import config from '@/config';

export const TOKEN_KEY = 'token';
export const TOKEN_TIME = 'token_time';

export const setToken = (token, key) => {
  if (key) {
    sessionStorage.setItem(key, token);
    Cookies.set(key, token);
  } else {
    let inFifteenMinutes = new Date(new Date().getTime() + (config.token_time + config.curTime));
    sessionStorage.setItem(TOKEN_KEY, token);
    Cookies.set(TOKEN_KEY, token, { expires: inFifteenMinutes });
  }
};

export const getToken = (key) => {
  const token = Cookies.get(key||TOKEN_KEY) ? Cookies.get(key||TOKEN_KEY) : sessionStorage.getItem(key||TOKEN_KEY);// hack 方案
  if (token) {
    return token;
  } else {
    return false;
  }
};

export const removeToken = (key) => {
  if (typeof key === 'string') {
    sessionStorage.removeItem(key || TOKEN_KEY);// hack 方案
    Cookies.remove(key || TOKEN_KEY);
  } if (Array.isArray(key)) {
    key.forEach(item => {
      removeToken(item);
    })
  }
};

export const setTokenTime = (time, key) => {
  let expireTime = new Date(new Date().getTime() + time);
  Cookies.set(key||TOKEN_TIME, time, expireTime);
};

export const getTokenTime = (key) => {
  return Cookies.get(key||TOKEN_TIME);
};
