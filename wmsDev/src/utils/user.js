import axios from 'axios';
import api from '@/api/api';
import store from '@/store/store';
import { setToken, getToken, setTokenTime, getTokenTime } from './cookie';
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
const notVerify = ['/printPickList', '/stockForm', '/printPickListBatch', '/printPickUpList'];

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
export const getTicketTokenHand = () => {
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
          const token = getToken();
          if (valid) {
            if (token) return resolve(true);
            // 获取 ticket
            connectAuth.getTicket().then(ticket => {
              // 获取通途 token
              if (ticket) {
                axios.get(`${api.get_token}${ticket}`).then(response => {
                  if (response.data.code === 0) {
                    setTokenTime(config.token_time);
                    setToken(response.data.datas.token);
                    localStorage.setItem(
                      'systemAnnouncementNotice',
                      JSON.stringify(true)
                    );
                    store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
                    resolve(true);
                  }
                }).catch(() => {
                  goError500();
                });
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
                });
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

export const getAccessToken = path => {
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
        }
        connectAuth.validationToken().then((valid) => {
          const token = getToken();
          if (valid) {
            if (token) return resolve(true);
            // 获取 ticket
            connectAuth.getTicket().then(ticket => {
              // 获取通途 token
              if (ticket) {
                axios.get(`${api.get_token}${ticket}`).then(response => {
                  if (response.data.code === 0) {
                    setTokenTime(config.token_time);
                    setToken(response.data.datas.token);
                    localStorage.setItem(
                      'systemAnnouncementNotice',
                      JSON.stringify(true)
                    );
                    store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
                    resolve(true);
                  }
                }).catch(() => {
                  goError500();
                });
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
                });
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
export const refreshToken = curTime => {
  const timeout = getTokenTime();
  if (timeout <= config.curTime) {
    axios
      .get(api.refresh_token + getToken())
      .then(response => {
        if (response.data.code === 0) {
          setTokenTime(config.token_time);
          setToken(response.data.datas.token);
          store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
          setTimeout(function () {
            refreshToken(config.curTime);
          }, config.curTime);
        }
      })
      .catch(() => {
        goError500();
      });
  } else {
    setTokenTime(timeout - curTime);
    setTimeout(function () {
      refreshToken(config.curTime);
    }, config.curTime);
  }
};
// 获取配置基本信息
export const getErpconfig = prefix => {
  if (!prefix) {
    prefix = '.';
  }
  // getVersion();
  return new Promise(resolve => {
    axios.get(prefix + api.get_erpConfig + '?time=' + new Date().getTime()).then(response => {
      if (response.data.code === 0) {
        let resInfo = common.copy(response.data.datas);
        resInfo.allYmsMerchantIds = null;
        if (!common.isEmpty(resInfo.merchant)) {
          resInfo.merchant.isSupplier = 0;
          resInfo.merchant.isYmsCore = 0;
          resInfo.merchant.ymsCoreDomain = null;
          resInfo.merchant.ymsCoreStatus = 0;
          resInfo.merchant.ymsListingDatabaseId = null;
          resInfo.merchant.ymsListingDomain = null;
          resInfo.merchant.ymsListingStatus = null;
        }
        if (!common.isEmpty(resInfo.userInfo)) {
          resInfo.userInfo.ymsCoreStatus = null;
        }
        console.warn(`接口：${api.get_erpConfig} 返回值已被修改后存入store，任务号：11062`);
        store.commit('erpConfig', resInfo);
        store.commit('isAdmin', resInfo.userInfo.isAdmin === '1' || false);
        resolve(true);
      }
    }).catch(() => {
      goError500();
    });
  });
};
// 获取所有用户信息
export const getUserMes = () => {
  return new Promise(resolve => {
    let userInfoList = store.state.userInfoList;
    if (userInfoList.length === 0) {
      axios
        .get(api.get_userInfo)
        .then(response => {
          if (response.data.code === 0) {
            if (response.data.datas !== null) {
              store.commit('userInfoList', response.data.datas);
            }
            resolve(true);
          }
        })
        .catch(() => {
          goError500();
        });
    } else {
      resolve(true);
    }
  });
};
// 权限获取
export const getSinglePageRole = (menuKey, to) => {
  return new Promise((resolve, reject) => {
    if (!common.isEmpty(to) && notVerify.includes(to.path)) {
      return resolve(true);
    }
    const verify = !common.isEmpty(to) && !common.isEmpty(to.meta) && common.isBoolean(to.meta.verify) ? to.meta.verify : true;
    if (menuKey.indexOf('noPersermission') > 0 || !verify) {
      return resolve(true);
    }
    axios.post(api.get_singlePageRole + menuKey).then(response => {
      if (response.data.code === 0) {
        let pos = {};
        let data = response.data.datas;
        if (data != null) {
          data.forEach((n, i) => {
            let obj = { [n]: true };
            Object.assign(pos, obj);
          });
        }
        store.commit('roleList', pos);
        resolve(true);
      } else {
        resolve(false);
      }
    }).catch(() => {
      resolve(false);
      goError500();
    });
  });
};
// 获取单页权限
export const getSinglePageRoleCommon = (menuKey, to) => {
  return new Promise((resolve, reject) => {
    if (!common.isEmpty(to) && notVerify.includes(to.path)) {
      return resolve(true);
    }
    const verify = !common.isEmpty(to) && !common.isEmpty(to.meta) && common.isBoolean(to.meta.verify) ? to.meta.verify : true;
    if (menuKey.indexOf('noPersermission') > 0 || !verify) {
      return resolve(true);
    }
    axios.post(api.get_singlePageRoleCommon + menuKey).then(response => {
      if (response && response.data && response.data.code === 0) {
        if (common.isEmpty(response.data.datas)) {
          console.error('无页面权限，本地开发忽略权限');
          return resolve(process.env.NODE_ENV == "development");
        }
        let pos = {};
        (response.data.datas || []).forEach((n, i) => {
          let obj = { [n]: true };
          Object.assign(pos, obj);
        });
        store.commit('roleList', pos);
        resolve(true);
      } else {
        resolve(false);
      }
    }).catch(() => {
      resolve(false);
      goError500();
    });
  });
};
// 获取所有仓库
export const getAllWarehouse = () => {
  return new Promise((resolve, reject) => {
    let userInfo = store.state.userInfo;
    let obj = {
      merchantId: userInfo.merchantId,
      userId: userInfo.userId,
      warehouseStatus: '0'
    };
    axios
      .post(api.queryAllwarehouse, JSON.stringify(obj))
      .then(response => {
        if (response.data.code === 0) {
          store.commit('warehouseList', response.data.datas);
          resolve(response.data.datas);
        }
      })
      .catch(() => {
        goError500();
      });
  });
};
// 获取菜单权限
export const getQueryMenu = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(api.carrierService + api.get_menuRole)
      .then(response => {
        if (response.data.code === 0) {
          let roleData = response.data.datas;
          store.commit('roleData', roleData);
          resolve();
        }
      })
      .catch(() => {
        goError500();
      });
  });
};
function goError500() {
  Spin.hide();
  /* document.getElementById('app').innerHTML = `<div class="error500">
    <div class="error500-body-con">
      <Card>
        <div class="error500-body-con-title">
          5<span class="error500-0-span"><Icon type="social-freebsd-devil"></Icon></span><span class="error500-0-span"><Icon
            type="social-freebsd-devil"></Icon></span>
        </div >
        <p class="error500-body-con-message">Oops! the server is wrong</p >
      </Card>
    </div>
  </div>`; */
}

// function getVersion() {
//     axios
//         .get("./static/version.js?time=" + new Date().getTime())
//         .then(data => {
//             if (data && data.data.code === 0) {
//                 if (
//                     data.data.datas.version + "" !==
//                         localStorage.getItem(versionName) ||
//                     !localStorage.getItem(versionName)
//                 ) {
//                     localStorage.setItem(versionName, data.data.datas.version);
//                     window.location.reload(true);
//                 }
//             }
//         })
//         .catch(() => {
//             goError500();
//         });
// }
