import axios from 'axios';
import Vue from 'vue';
import {
  // getToken,
  removeToken
} from '@/utils/cookie';
import api from '@/api/api';
import {
  Message,
  Modal
} from 'view-design';
import { t } from '@/locale/method/index';

Vue.component('Message', Message);
Vue.component('Modal', Modal);

export const showPurchaseModal = (value, moduleName) => {
  // 1 可购买 2 可试用
  if (value === '1') {
    Modal.confirm({
      title: '提示',
      transfer: true,
      'z-index': 1000,
      content: '该内容需要购买，点击购买按钮进行购买',
      'ok-text': '购买',
      onOk: () => {
        axios.get('/merchant/buyModule?flag=1' + '&moduleName=' + moduleName).then(response => {
          if (response.data.code === 0) {
            Message.success(t('购买成功'));
          }
        });
      }
    });
  } else {
    Modal.confirm({
      title: '提示',
      transfer: true,
      'z-index': 1000,
      content: '本功能试用期为60天，试用期结束后将自动停止此功能的试用权限，如需开通殿时再进行购买',
      'ok-text': '开通试用',
      onOk: () => {
        axios.get('/merchant/buyModule?flag=2' + '&moduleName=' + moduleName).then(response => {
          if (response.data.code === 0) {
            Message.success(t('操作成功,现在可以开始试用该产品了'));
          }
        });
      }
    });
  }
};
export const showNoAuth = token => {
  document.getElementById('app').innerHTML = '';
  Modal.warning({
    title: '没有权限访问该系统',
    transfer: true,
    'z-index': 1000,
    content: '<p>' + '亲爱的LAPA用户，您没有权限访问该系统!' + '</p><p>' + '请联系，系统管理员！' + '</p>',
    okText: '退出', // '退出',
    'cancel-text': '',
    onOk: () => {
      axios.get(api.logout + token).then(response => {
        if (response.data.code === 0) {
          removeToken();
          window.location.href = response.data.others.logOutUrl + encodeURIComponent(window.location.href);
        }
      });
    }
  });
};
