import Qs from 'qs';
import axios from 'axios';
import api from '@/api/api';
import store from '@/store/store';
import { Modal, Message } from 'view-design';

class PrintTongtu {
  // html打印
  htmlPrint(htmlContent) {
    return new Promise((resolve, reject) => {
      let instance = axios.create({
        timeout: 3000,
        transformRequest: [
          function (data) {
            let ret = '';
            for (let it in data) {
              ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
            }
            return ret;
          }
        ],
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      // 看通途的代码，是面单id，但是总觉得是每一次打印带过去的标识 所以这里用了时间戳
      const postId = (new Date().getTime()).toString();
      instance.post('http://localhost:10099/print', {
        content: htmlContent,
        postId: postId
      }).then(response => {
        if (response.status === 200) {
          this.startPrintMonitor(postId).finally((e) => {
            resolve('打印完毕');
          })
        } else {
          this.downloadPrint();
          reject(new Error('请安装打印插件!'));
        }
      }).catch(e => {
        this.downloadPrint();
        reject(new Error('请安装打印插件!'));
      })
    })
  }
  // pdf打印
  pdfPrint(res, userQs = '') {
    const pdf = res.pdf || res.content;
    let postId = res.postId || 0;
    return new Promise((resolve, reject) => {
      if (!pdf) {
        Message.error('打印文件路径丢失，请检查~');
        reject(new Error('打印文件路径丢失，请检查~'));
        return;
      }
      let url = null;
      if (pdf.indexOf('http') >= 0) {
        url = pdf;
      } else {
        let prefix = 'filenode/s/';
        let path = pdf.indexOf(prefix) >= 0 ? pdf : prefix + pdf;
        url = window.location.origin + '/wms-service/' + path;
      }
      // 看通途的代码，是面单 id，但是总觉得是每一次打印带过去的标识 所以这里用了时间戳
      postId = `${postId ? postId.toString() : ''}` + (new Date().getTime()).toString();
      let jsonObj = {};
      if (res.pdf) {
        jsonObj.pdf = url;
        jsonObj.postId = postId;
      } else {
        jsonObj = res;
      }

      let instance = axios.create({
        timeout: 3000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
      });
      delete axios.defaults.headers.post['X-Requested-With'];
      instance.post('http://localhost:10099/print?', Qs.stringify(jsonObj)).then(response => {
        if (response.status === 200) {
          this.startPrintMonitor(userQs === 'userQs' ? jsonObj : postId, userQs).then(res => {
            resolve(true);
          }).catch(() => {
            resolve(false);
          })
        } else {
          this.downloadPrint();
          reject(new Error('请安装打印插件!'));
        }
      }).catch(() => {
        this.downloadPrint();
        reject(new Error('请安装打印插件!'));
      });
    })
  }
  // 查询打印状态
  startPrintMonitor(jsonObj, userQs) {
    return new Promise((resolve, reject) => {
      let stVal = {
        maxFrequency: 120,
        printNumber: 0, // 监听循环打印的次数
        clearTime: null // 一次性定时器存储值
      }
      const fun = (paramsObj) => {
        delete axios.defaults.headers.post['X-Requested-With'];
        if (userQs === 'userQs') {
          delete paramsObj.content;
          delete paramsObj.pdf;
        }
        const params = userQs === 'userQs' ? Qs.stringify(paramsObj) : `_=${Date.now()}&postId=${paramsObj}`;
        axios.jsonp('http://localhost:10099/printResult?' + params).then(response => {
        // axios.jsonp('http://localhost:10099/printResult?_=' + Date.now() + '&postId=' + postId).then(response => {
          if (response.data === '0') {
            if (stVal.printNumber > stVal.maxFrequency) {
              reject(new Error('打印超时!'));
              clearTimeout(this.clearTime);
              stVal.printNumber = 0;
              return;
            }
            stVal.clearTime = setTimeout(() => {
              // 查询打印状态
              fun(paramsObj);
            }, 1000);
            stVal.printNumber++;
          } else {
            clearTimeout(stVal.clearTime);
            stVal.printNumber = 0;

            if ([1, '1'].includes(response.data)) { // 完成打印
              resolve(true);
            } else {
              if (response.data === '2') {
                Message.error('打印失败');
              }
              reject(new Error('打印失败'));
            }
          }
        })
      }
      fun(jsonObj);
    })
  }
  // 打印控件下载
  downloadPrint() {
    let defaultUrl = '/wms-service/tool/TongtoolPrinter.exe';// 默认通途打印插件下载路径
    let tipPopup = (url) => {
      let path = store.state.erpConfig.filenodeViewTargetUrl + (url || defaultUrl);
      Modal.info({
        title: '提示',
        okText: '关闭',
        render: (h, params) => {
          return h('div', {
            class: 'normalTop20'
          }, [
            h('div', {
              class: 'flexBox flexBoxJustContent',
              style: {
                fontSize: '16px'
              }
            }, '该功能需使用打印控件，请下载安装'), h('a', {
              attrs: {
                href: path,
                target: '_blank'
              },
              class: 'flexBox flexBoxJustContent normalTop',
              style: {
                fontSize: '16px',
                fontWeigh: 'bold'
              }
            }, '点击下载'), h('div', {
              class: 'flexBox flexBoxJustContent normalTop',
              style: {
                fontSize: '16px'
              }
            }, '如果已安装，请开启打印控件')
          ]);
        }
      });
    }
    axios.get(api.get_downloadPrint).then(response => {
      let data = response.data || {};
      if (data.code === 0) {
        tipPopup(data.datas);
      } else {
        tipPopup();
      }
    }).catch(() => {
      tipPopup();
    })
  }
}

export default new PrintTongtu();
