import axios from 'axios';
import api from '@/api/api';
import store from '@/store/store';
import {
  setToken,
  getToken,
  setTokenTime,
  getTokenTime
} from './cookie';
import config from '@/config';
// import { getQueryString } from './index';
import bus from '@/utils/bus';
import connectAuth from '@/utils/connectAuth';
// import cookieConfig from '@/utils/cookieConfig';
import common from '@/utils/common';
import { Spin, Modal } from 'view-design';

let awaitList = [];
let isLoading = false;
let result = { resolve: null, reject: null };
const restLogin = () => {
  awaitList = [];
  setTimeout(() => {
    result = { resolve: null, reject: null };
    isLoading = false;
  }, 1000 * 10);
}
// 登录 erp
export const erpLogin = (url) => {
  return new Promise((resolve, reject) => {
    if (url.includes(api.get_token)) {
      return reject(new Error('获取 ticket 失败'));
    }
    if (!common.isEmpty(result.resolve)) return resolve(result.resolve);
    if (!common.isEmpty(result.reject)) return reject(result.reject);
    awaitList.push({ resolve: resolve, reject: reject });
    if (isLoading) return;
    isLoading = true;
    connectAuth.getTicket().then(ticket => {
      if (ticket) {
        axios.get(`${api.get_token}${ticket}`).then(response => {
          if (response.data.code === 0) {
            setTokenTime(config.token_time);
            setToken(response.data.datas.token);
            localStorage.setItem('systemAnnouncementNotice', JSON.stringify(true));
            store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
            awaitList.forEach(item => {
              item.resolve(response);
            });
            result.resolve = response;
          } else {
            result.reject = new Error('获取 ticket 失败');
            awaitList.forEach(item => {
              item.reject(result.reject);
            });
          }
          restLogin();
        }).catch((err) => {
          awaitList.forEach(item => {
            item.reject(err);
          });
          result.reject = err;
          restLogin();
        })
      } else {
        result.reject = new Error('获取 ticket 失败');
        awaitList.forEach(item => {
          item.reject(result.reject);
        });
        restLogin();
      }
    })
  })
}

// 获取token
export const getAccessToken = (path) => {
  return new Promise(resolve => {
    // 从认证中心获取 token
    bus.authReadyComplete().then(() => {
      const awaitList = [
        { dataOrigin: connectAuth.getToken(), key: 'token' },
        { dataOrigin: connectAuth.getUserInfo(), key: 'userInfo' }
      ];
      connectAuth.customGetInfo(awaitList).then(res => {
        if (!res.token) {
          connectAuth.goToLogin();
          return
        }
        connectAuth.validationToken().then((valid) => {
          if (valid) {
            connectAuth.getTicket().then(ticket => {
              // 获取通途 token
              if (ticket) {
                axios.get(`${api.get_token}${ticket}`).then(response => {
                  if (response.data.code === 0) {
                    setTokenTime(config.token_time);
                    setToken(response.data.datas.token);
                    localStorage.setItem('systemAnnouncementNotice', JSON.stringify(true));
                    store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
                    resolve(true);
                  }
                }).catch(() => {
                  goError500();
                })
              } else {
                Spin.hide();
                Modal.error({
                  title: 'erp 登录授权失败',
                  content: '是否返回认证中心？',
                  loading: false,
                  onOk: () => {
                    Modal.remove();
                    connectAuth.backOauth();
                  }
                })
              }
            })
          } else {
            // 验证不通过，返回登录
            connectAuth.goToLogin();
          }
        })
      })
    })
  });
};
// 刷新token
export const refreshToken = (curTime) => {
  const timeout = getTokenTime();
  return new Promise(resolve => {
    if (timeout <= config.curTime) {
      axios.get(api.refresh_token + getToken()).then(response => {
        if (response.data.code === 0) {
          setTokenTime(config.token_time);
          setToken(response.data.datas.token);
          store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
          setTimeout(function () {
            refreshToken(config.curTime);
          }, config.curTime);
          resolve();
        }
      }).catch(() => {
        goError500();
      });
    } else {
      setTokenTime(timeout - curTime);
      setTimeout(function () {
        refreshToken(config.curTime);
      }, config.curTime);
      resolve();
    }
  });
};

// 获取菜单权限
export const getQueryMenu = () => {
  return new Promise((resolve, reject) => {
    axios.get(api.get_menuRole).then(response => {
      if (response.data.code === 0) {
        let roleData = response.data.datas;
        store.commit('roleData', roleData);
        resolve();
      } else {
        resolve();
      }
    }).catch((err) => {
      console.error(err);
      goError500();
      resolve();
    });
  });
};
// 获取事业部
export const getBusinessDeptInfo = () => {
  axios.post("/sps-service/sps/common/businessDeptInfo").then((res) => {
    if (!res.data || res.data.code !== 0) {
      store.commit('businessDeptList', []);
      return;
    }
    store.commit('businessDeptList', (res.data.datas || []));
  })
};

function goError500 () {
  Spin.hide();
  /*document.getElementById('app').innerHTML = `<div class="error500">
    <div class="error500-body-con">
      <Card>
        <div class="error500-body-con-title">
          5<span class="error500-0-span"><Icon type="social-freebsd-devil"></Icon></span><span class="error500-0-span"><Icon
            type="social-freebsd-devil"></Icon></span>
        </div >
        <p class="error500-body-con-message">Oops! the server is wrong</p >
      </Card>
    </div>
  </div>`;*/
}
