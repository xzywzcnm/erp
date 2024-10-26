import axios from 'axios';
import api from '@/api/api';
import store from '@/store/store';
import bus from '@/utils/bus';
import connectAuth from '@/utils/connectAuth';
import config from '@/config';
import common from '@/utils/common';
import { Spin, Modal } from 'view-design';
import {
  setToken,
  // getToken,
  setTokenTime
} from './cookie';

const versionName = 'SPS_version';
const notVerify = ['/printSuggestionList'];

function goError500 () {
  Spin.hide();
}

function getVersion () {
  // 获取版本 清除缓存
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
const getRoleData = (loginNameChange = false) => {
  return new Promise((resolve, reject) => {
    if (loginNameChange) {
      connectAuth.getTicket().then(ticket => {
        // 获取通途 token
        if (ticket) {
          axios.get(`${api.get_token}${ticket}`).then(response => {
            if (response.data.code === 0) {
              setTokenTime(config.token_time);
              setToken(response.data.datas.token);
              localStorage.setItem('systemAnnouncementNotice', JSON.stringify(true));
              store.commit('erpRequestHeaders', { 'Authorization': response.data.datas.token });
              axios.get(api.loadConfig).then(res => {
                if (res.data.code == 0) {
                  let resInfo = common.copy(res.data.datas);
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

                  store.commit('isAdmin', resInfo.userInfo.isAdmin === '1' || false);
                  store.commit('imgUrl', resInfo.filenodeViewTargetUrl);
                  store.commit('userInfo', resInfo.userInfo);
                  store.commit('ierpDomain', resInfo.merchant.ierpDomain);
                  sessionStorage.setItem('userName', resInfo.userInfo.userName);
                  store.commit('userName', resInfo.userInfo.userName);
                  sessionStorage.setItem('userId', resInfo.userInfo.userId);
                  store.commit('userId', resInfo.userInfo.userId);
                  resolve(true);
                } else {
                  goError500();
                }
              }).catch(() => {
                goError500();
              });
            } else {
              goError500();
            }
          }).catch(e => {
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
      axios.get(api.loadConfig).then(res => {
        if (res.data.code == 0) {
          let resInfo = common.copy(res.data.datas);
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

          store.commit('isAdmin', resInfo.userInfo.isAdmin === '1' || false);
          store.commit('imgUrl', resInfo.filenodeViewTargetUrl);
          store.commit('userInfo', resInfo.userInfo);
          store.commit('ierpDomain', resInfo.merchant.ierpDomain);
          sessionStorage.setItem('userName', resInfo.userInfo.userName);
          store.commit('userName', resInfo.userInfo.userName);
          sessionStorage.setItem('userId', resInfo.userInfo.userId);
          store.commit('userId', resInfo.userInfo.userId);
          resolve(true);
        } else {
          goError500();
        }
      }).catch(() => {
        goError500();
      });
    }
  })
}

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
          if (!response.data.datas) {
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
      });
    }
  });
};

export const getErpConfig = () => {
  // 获取配置
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

export const getAllUser = () => {
  // 获取所有用户
  return new Promise(resolve => {
    axios.get(api.userList).then(res => {
      if (res.data.code === 0) {
        store.commit('allUser', res.data.datas);
        resolve(true);
      }
    }).catch(() => {
      goError500();
    });
  });
};

export const getQueryString = (name) => { // 获取url里面的参数
  let reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i');
  let r = window.location.href.match(reg);
  if (r !== null) { return unescape(r[2]); } else { return null; }
};

export const getBaseDataList = () => {
  // 存储用户选择的采购模式
  axios.get(api.baseDataList + '?dataType=purchaseBaseSetting').then(response => {
    if (response.data.code == 0 && response.data.datas) {
      let arr = response.data.datas;
      arr.forEach((n, i) => {
        if (n.dataCode == 'purchaseModalSetting') {
          sessionStorage.setItem('purchaseMode', n.dataValue);
          store.commit('purchaseMode', n.dataValue);
        }
      });
    }
  }).catch(() => {
    goError500();
  });
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

