import axios from 'axios';
import api from '@/api/api';
import store from '@/store/store';
// import cookieConfig from '@/utils/cookieConfig';
import common from '@/utils/common';
import { Spin, Modal } from 'view-design';
// import { Spin, Message } from 'view-design';
import {
  setToken,
  getToken,
  setTokenTime,
  getTokenTime
} from './cookie';
import config from '@/config';
import bus from '@/utils/bus';
import connectAuth from '@/utils/connectAuth';
// import { getQueryString } from './index';
const notVerify = [];
const versionName = 'ERP_version';
function goError500 () {
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

function getVersion () {
  axios.get('./static/version.js?time=' + new Date().getTime()).then(data => {
    if (data && data.data.code === 0) {
      if (data.data.datas.version + '' !== localStorage.getItem(versionName) || !localStorage.getItem(versionName)) {
        localStorage.setItem(versionName, data.data.datas.version);
        window.location.reload(true);
      }
    }
  }).catch(() => {
    goError500();
  });
}
// 登录以及获取菜单
const getRoleData = (loginNameChange = false) => {
  return new Promise((resolve, reject) => {
    if (loginNameChange) {
      connectAuth.getTicket().then(ticket => {
        if (ticket) {
          axios.get(`${api.get_token}${ticket}`).then(response => {
            if (response.data.code === 0) {
              setTokenTime(config.token_time);
              setToken(response.data.datas.token);
              localStorage.setItem('systemAnnouncementNotice', JSON.stringify(true));
              store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
              // resolve(true);
              if (store.state.roleData && store.state.roleData.length > 0) {
                resolve();
                return store.state.roleData;
              } else {
                let inGroup = store.state.inGroup;// 读取所在业务
                let apiUrl = api.get_menuRole;
                if (inGroup === 'logistics' || inGroup === 'generalSettings' || inGroup === 'orderSettings') {
                  apiUrl = api.get_menuRole;
                } else {
                  apiUrl = api.get_menuRoleCommon;
                }
                axios.get(apiUrl).then(response => {
                  if (response.data.code === 0) {
                    let roleData = response.data.datas;
                    sessionStorage.setItem('roleData:', roleData);
                    store.commit('roleData', roleData);
                    resolve();
                  } else {
                    resolve();
                    goError500();
                  }
                }).catch(() => {
                  goError500();
                });
              }
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
          }).catch(() => {
            resolve();
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
      }).catch(() => {
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
      })
      return;
    }
    if (store.state.roleData && store.state.roleData.length > 0) {
      resolve();
      return store.state.roleData;
    }
    let inGroup = store.state.inGroup;// 读取所在业务
    const includesKeys = ['logistics', 'generalSettings', 'orderSettings'];
    const apiUrl = includesKeys.includes(inGroup) ? api.get_menuRole : api.get_menuRoleCommon;
    axios.get(apiUrl).then(response => {
      if (response.data.code === 0) {
        let roleData = response.data.datas;
        sessionStorage.setItem('roleData:', roleData);
        store.commit('roleData', roleData);
        resolve();
      } else {
        resolve();
        goError500();
      }
    }).catch(() => {
      resolve();
      goError500();
    })
  })
}
// 获取当前登录用户下有店铺权限的平台
const getUserPlatform = () => {
  return new Promise((resolve, reject) => {
    axios.post(api.queryUserPlatform).then(res => {
      if (!res || !res.data || res.data.code != 0) return;
      store.commit('userPlatformRoleData', res.data.datas || []);
    }).finally(() => {
      resolve({ state: 'finally' });
    })
  })
}

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
// 登录 erp (20秒内使用上一次结果)
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
            // 获取 ticket
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
            connectAuth.againLogin();
          }
        })
      })
    })
  });
};
// 刷新token
export const refreshToken = (curTime) => {
  // 以下为通途刷新 token
  const timeout = getTokenTime();
  if (timeout <= config.curTime) {
    axios.get(api.refresh_token + getToken()).then(response => {
      if (response.data.code === 0) {
        setTokenTime(config.token_time);
        setToken(response.data.datas.token);
        store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
        setTimeout(function () {
          refreshToken(config.curTime);
        }, config.curTime);
      }
    }).catch(() => {
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
export const getErpconfig = (prefix) => {
  if (!prefix) {
    prefix = '.';
  }
  return new Promise(resolve => {
    axios.get(prefix + api.get_erpConfig).then(response => {
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
        const _thirdAuth = resInfo.thirdAuthPlatform ? resInfo.thirdAuthPlatform.split(',') : [];
        store.commit('thirdAuthPlatform', _thirdAuth);
        store.commit('erpConfig', resInfo);
        store.commit('isAdmin', resInfo.userInfo.isAdmin === '1' || false);
        store.commit('thirdAuthPlatform', resInfo.thirdAuthPlatform || []);
        axios.get(api.get_menus).then(resMenus => {
          if (resMenus.data.code === 0) {
            store.commit('menuQuery', resMenus.data.datas);
            resolve(true);
          }
        }).catch(() => {
          goError500();
        });
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
      axios.get(api.get_userInfoCommon).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas !== null) store.commit('userInfoList', response.data.datas);
          resolve(true);
        }
      }).catch(() => {
        goError500();
      });
    } else {
      resolve(true);
    }
  });
};
export const getUserMesCommon = () => {
  return new Promise(resolve => {
    let userInfoList = store.state.userInfoList;
    if (userInfoList.length === 0) {
      axios.get(api.get_userInfoCommon).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas !== null) store.commit('userInfoList', response.data.datas);
          resolve(true);
        }
      }).catch(() => {
        goError500();
      });
    } else {
      resolve(true);
    }
  });
};
// 权限获取
export const getSinglePageRole = (menuKey, to) => {
  const verify = !common.isEmpty(to) && !common.isEmpty(to.meta) && common.isBoolean(to.meta.verify) ? to.meta.verify : true;
  getVersion();
  return new Promise((resolve, reject) => {
    if (!common.isEmpty(to) && notVerify.includes(to.path)) {
      return resolve(true);
    }
    if (menuKey.indexOf('noPersermission') > 0 || !verify) {
      resolve(true);
    } else {
      store.commit('setMenuKey', menuKey);
      axios.post(api.get_singlePageRoleCommon + menuKey).then(response => {
        if (response.data.code === 0) {
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
        }
      }).catch(() => {
        goError500();
        resolve(false);
      });
    }
  });
};
export const getSinglePageRoleCommon = (menuKey, to) => {
  const verify = !common.isEmpty(to) && !common.isEmpty(to.meta) && common.isBoolean(to.meta.verify) ? to.meta.verify : true;
  getVersion();
  return new Promise((resolve, reject) => {
    if (!common.isEmpty(to) && notVerify.includes(to.path)) {
      return resolve(true);
    }
    if (menuKey.indexOf('noPersermission') > 0 || !verify) {
      resolve(true);
    } else {
      store.commit('setMenuKey', menuKey);
      axios.post(api.get_singlePageRoleCommon + menuKey).then(response => {
        if (response.data.code === 0) {
          if (common.isEmpty(response.data.datas)) {
            return resolve(false);
          }
          let pos = {};
          (response.data.datas || []).forEach((n, i) => {
            let obj = { [n]: true };
            Object.assign(pos, obj);
          });
          store.commit('roleList', pos);
          resolve(true);
        }
      }).catch(() => {
        goError500();
      });
    }
  });
};

export const getQueryMenu = () => {
  // 获取菜单权限
  return new Promise((resolve, reject) => {
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
            getRoleData(res.userInfo.loginNameChange).then(() => {
              getUserPlatform().finally(() => {
                resolve();
              })
            });
          } else {
            // 验证不通过，返回登录
            connectAuth.goToLogin();
          }
        })
      })
    })
  });
};
