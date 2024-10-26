import axios from "axios";
import api from "@/api/api";
import store from "@/store/store";
import { setToken, getToken, setTokenTime, getTokenTime } from "./cookie";
import config from "@/config";
// import cookieConfig from '@/utils/cookieConfig';
import common from '@/utils/common';
// import { getQueryString } from "./index";
import { Spin, Modal } from 'view-design';
import bus from '@/utils/authBus';
import connectAuth from '@/utils/connectAuth';
const versionName = "PDS_version";
const notVerify = [];

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

const getRoleData = (loginNameChange) => {
  return new Promise((resolve, reject) => {
    if (loginNameChange) {
      connectAuth.getTicket().then(ticket => {
        if (ticket) {
          axios.get(`${api.get_token}${ticket}`).then(response => {
            if (response.code === 0) {
              setTokenTime(config.token_time);
              setToken(response.datas.token);
              localStorage.setItem('systemAnnouncementNotice', JSON.stringify(true));
              store.commit('erpRequestHeaders', { 'Authorization': response.datas.token });
              let userInfoList = store.state.userInfoList;
              if (userInfoList.length === 0) {
                axios.get(api.get_userInfoCommon).then((response) => {
                  if (response.code === 0) {
                    if (response.datas !== null) { store.commit("userInfoList", response.datas); }
                    resolve(true);
                  }
                }).catch(() => {
                  goError500();
                });
              } else {
                goError500();
              }
            } else {
              goError500();
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
      return;
    }
    let userInfoList = store.state.userInfoList;
    if (userInfoList.length === 0) {
      axios.get(api.get_userInfoCommon).then((response) => {
        if (response.code === 0) {
          if (response.datas !== null) { store.commit("userInfoList", response.datas); }
          resolve(true);
        }
      }).catch(() => {
        goError500();
      });
    } else {
      resolve(true);
    }
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
          if (response.code === 0) {
            setTokenTime(config.token_time);
            setToken(response.datas.token);
            localStorage.setItem('systemAnnouncementNotice', JSON.stringify(true));
            store.commit('erpRequestHeaders', { 'Authorization': response.datas.token });
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

export const getAccessToken = (path) => {
  return new Promise((resolve) => {
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
                  if (response.code === 0) {
                    setTokenTime(config.token_time);
                    setToken(response.datas.token);
                    localStorage.setItem('systemAnnouncementNotice', JSON.stringify(true));
                    store.commit('erpRequestHeaders', { 'Authorization': response.datas.token });
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
  return new Promise((resolve) => {
    const timeout = getTokenTime();
    if (timeout <= config.curTime) {
      axios.get(api.refresh_token + getToken()).then((response) => {
        if (response.code === 0) {
          setTokenTime(config.token_time);
          setToken(response.datas.token);
          store.commit('erpRequestHeaders', { 'Authorization': response.datas.token });
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
        if (response.code === 0) {
          let pos = {};
          let data = response.datas;
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
    }
  });
};

export const getUserMesCommon = () => {
  return new Promise((resolve) => {
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
        // 验证 token
        connectAuth.validationToken().then((valid) => {
          if (valid) {
            getRoleData(res.userInfo.loginNameChange).then(() => {
              resolve();
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

export const getErpConfig = () => {
  return new Promise((resolve) => {
    if (store.state.erpConfig) {
      resolve(true);
    } else {
      axios.get(api.get_erpConfig).then((response) => {
        if (response.code === 0) {
          let resInfo = common.copy(response.datas);
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
          localStorage.setItem("ierpStatus", resInfo.merchant.ierpStatus);
          store.commit("ierpStatus", resInfo.merchant.ierpStatus);
          store.commit("erpConfig", resInfo);
          resolve(true);
        }
      }).catch(() => {
        goError500();
      });
    }
  });
};

export const getVersion = () => {
  // 获取版本 清除缓存
  axios.get("./static/version.js?time=" + new Date().getTime()).then((data) => {
    if (data && data.code === 0) {
      if (data.datas.version + '' !== localStorage.getItem(versionName) || !localStorage.getItem(versionName)) {
        localStorage.setItem(versionName, data.datas.version);
        window.location.reload(true);
      }
    }
  }).catch(() => {
    goError500();
  });
};
