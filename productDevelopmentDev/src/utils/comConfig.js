/**
 * 时间插件的配置
 */ 
export const timeOption = {
  shortcuts: [
    {
      text: '近一周',
      value () {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        return [start, end];
      }
    },
    {
      text: '近一个月',
      value () {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
        return [start, end];
      }
    },
    {
      text: '近三个月',
      value () {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
        return [start, end];
      }
    }
  ]
};

/**
 *下载文件资源
 */
export function downFile(blob, filename) {
  if(!blob) {
    this.$Message.error('无法下载，请联系管理员~');
    return;
  }
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    document.body.appendChild(link); 
    const URL = window.URL || window.webkitURL;
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'filename';
    link.click();
    window.URL.revokeObjectURL(link.href);
    setTimeout(function() {
      document.body.removeChild(link);
    }, 50);
  }
}

/**
 * 当前时间 年月日时分秒
 **/
export const time_now = ()=> {
  function a (val) {
    return val < 10 ? '0' + val : val;
  }
  const date = new Date();
  return date.getFullYear() + "-" + a(date.getMonth() + 1) + "-" + a(date.getDate()) + " " + a(date.getHours()) + ":" + a(date.getMinutes()) + ":" + a(date.getSeconds());
};