import store from '@/store/store';
import { Message, Modal } from 'view-design';

export const setLeftMenuClickStatus = pathName => {
  // 左侧菜单高亮状态控制
  if (pathName !== store.state.pageName) {
    store.commit('clickStatus', true);
    store.commit('thisPage', pathName);
  } else {
    store.commit('clickStatus', false);
  }
};
export const getQueryString = name => {
  // 获取url里面的参数
  let reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i');
  let r = window.location.href.substr(1).match(reg);
  if (r !== null) {
    return unescape(r[2]);
  } else {
    return null;
  }
};
export const getLastPageName = () => {
  // 获取页面名
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
export const initCainiao = () => {
  // 判断当前浏览器是否支持WebSocket
  let websocket;
  if ('WebSocket' in window) {
    websocket = new WebSocket('ws://127.0.0.1:13528');
  } else {
    Message.info('当前浏览器 Not support websocket');
  }
  // 连接发生错误的回调方法
  websocket.onerror = function () {
    Modal.error({
      title: '连接菜鸟打印控件失败',
      content: '请确认是否安装或是否已启用菜鸟打印控件，点击“确认”打开下载菜鸟打印控件页面',
      loading: false,
      onOk: () => {
        window.open('https://page.cainiao.com/waybill/cloud_printing/home.html');
        Modal.remove();
      }
    });
  };
  return new Promise(resolve => {
    websocket.onopen = function () {
      resolve(websocket);
    };
  });
};
export const cainiaoPrint = (websocket, postID, cainiaoData) => {
  /**
   * 菜鸟打印
   * @param   postID  packageId
   * @param  cainiaoData 打印内容
   * */
  return new Promise(resolve => {
    websocket.onmessage = function (event) {
      var data = JSON.parse(event.data);
      var status = data['status'];
      if (typeof status !== 'undefined' && status === 'success') {
        resolve(data);
        // Message.success(t('common.printSuccess'));
      } else if (typeof status !== 'undefined') {
      }
    };
    let arr = cainiaoData.split('|');
    let contents = [];
    for (let i = 0; i < arr.length; i++) {
      contents.push(JSON.parse(arr[i]));
    }
    let content = {
      cmd: 'print',
      requestID: new Date().getTime() + '', // 随机数
      version: '1.0',
      task: {
        taskID: new Date().getTime() + '', // 随机数
        preview: false,
        documents: [
          {
            contents: contents,
            documentID: postID // postID
          }
        ]
      }
    };
    // 连接成功建立的回调方法
    websocket.send(JSON.stringify(content));
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
