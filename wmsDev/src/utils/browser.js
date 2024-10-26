/**
 * @Description: 浏览器/dom类型工具函数
 * @author gan
 * @date: 2020/10/16 10:55
 */

class Browser {
  copyText (value) {
    /**
     * @Description: 复制
     * @author gan
     * @date: 2020/10/16 11:02
     * @params: value 复制内容
     */
    return new Promise(resolve => {
      let oInput = document.createElement('input');
      oInput.value = value;
      document.body.appendChild(oInput);
      oInput.select();
      window.document.execCommand('Copy');
      oInput.remove();
      // this.$Message.success('复制成功');
      resolve();
    });
  }
}

const browserUtils = new Browser();
export default browserUtils;
