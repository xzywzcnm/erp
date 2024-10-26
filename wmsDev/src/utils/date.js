/**
 * @Description: 日期类函数
 * @author gan
 * @date: 2020/10/15 16:59
 */
class localDate {
  getDefaultTimezoom() { // 获取默认时区
    let timezoom = localStorage.getItem('timezoom');
    if (!isNaN(Number(timezoom)) && timezoom != null) {
      return Number(timezoom);
    }
    const nowDate = new Date();
    const dateISO = nowDate.toISOString().split(/[^0-9]/);
    const dateLocale = nowDate.toLocaleString().split(/[^0-9]/);
    timezoom = Number(dateLocale[3]) - Number(dateISO[3])
    localStorage.setItem('timezoom', timezoom);
    return timezoom;
  }
  getNowTime() {
    // 获取用户设置的时间
    let timezoom = this.getDefaultTimezoom();
    if (timezoom !== undefined) {
      let diffTime = Number(timezoom) * 60 * 60 * 1000;
      return new Date().getTime() - diffTime;
    } else {
      return new Date().getTime();
    }
  }
  getDateTime(date, type) {
    // 时间格式获取
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
    let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
    if (type === 'fulltime') {
      return (year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds);
    } else if (type === 'customTime') {
      return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
    } else {
      return year + '-' + month + '-' + day;
    }
  }
  getUniversalTime(date, type) {
    // UTC时间
    if (date === null) return;
    let d = new Date(date);
    let year = d.getUTCFullYear();
    let month = d.getUTCMonth() + 1 < 10 ? '0' + (d.getUTCMonth() + 1) : d.getUTCMonth() + 1;
    let day = d.getUTCDate() < 10 ? '0' + d.getUTCDate() : d.getUTCDate();
    let hours = d.getUTCHours() < 10 ? '0' + d.getUTCHours() : d.getUTCHours();
    let minutes = d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes();
    let seconds = d.getUTCSeconds() < 10 ? '0' + d.getUTCSeconds() : d.getUTCSeconds();
    if (type === 'fulltime') {
      return (year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds);
    } else {
      return year + '-' + month + '-' + day;
    }
  }
  getDataToLocalTime(date, type) {
    // 本地时间
    if (date === null) return null;
    let b = new Date(date).getTime() + this.getDefaultTimezoom() * 60 * 60 * 1000;
    let d = new Date(b);
    let year = d.getFullYear();
    let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
    let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
    if (type === 'fulltime') {
      return (year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds);
    } else {
      return year + '-' + month + '-' + day;
    }
  }
  dealTime(time) {
    if (!time) return '';
    // time为世界时间
    let gmtTimeMs = new Date(time).getTime();
    let localTime = gmtTimeMs + this.getDefaultTimezoom() * 60 * 60 * 1000;
    // 转时间格式
    let returnLocalTime = this.getDateTime(localTime, 'fulltime');
    return returnLocalTime;
  }
  reduceTime(time) {
    if (!time) return '';
    // time为世界时间
    let gmtTimeMs = new Date(time).getTime();
    let localTime = gmtTimeMs - (localStorage.getItem('timezoom') || 8) * 60 * 60 * 1000;
    // 转时间格式
    let returnLocalTime = this.getDateTime(localTime, 'fulltime');
    return returnLocalTime;
  }
  setTimeHandel(date) {
    /*
     *当天的显示 hh:mm
     本周内的显示
     本周外、今年内的显示
     今年之前的显示 */
    let v = this;
    if (date === null) return null;
    let newDate = new Date(date).getTime();
    let today = new Date(new Date(new Date().toLocaleDateString()).getTime());
    var day = new Date(today).getDay() || 7; // 本周天数
    var year = new Date(today).setMonth(0);
    year = new Date(year).setDate(1);
    if (newDate > new Date(today).getTime()) {
      // 今天
      return v.format('hh:mm', date);
    } else if (newDate > new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1 - day).getTime()) {
      // 本周
      return v.format('w hh:mm', date);
    } else if (newDate > new Date(year).getTime()) {
      // 本年
      return v.format('MM/dd hh:mm', date);
    } else {
      return v.format('yyyy/MM/dd hh:mm', date);
    }
  }
  format(format, date) {
    if (!date) {
      date = new Date();
    } else {
      date = new Date(date);
    }

    var Week = [
      '周日', '周一', '周二', '周三', '周四', '周五', '周六'
    ];
    // var Week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    var o = {
      'y+': date.getFullYear(), // year
      'M+': date.getMonth() + 1, // month
      'd+': date.getDate(), // day
      'h+': date.getHours(), // hour
      'H+': date.getHours(), // hour
      'm+': date.getMinutes(), // minute
      's+': date.getSeconds(), // second
      'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
      'S': date.getMilliseconds(), // millisecond
      'w': Week[date.getDay()]
    };
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
      }
    }
    return format;
  }
}

// eslint-disable-next-line new-cap
let uDate = new localDate();
export default uDate;
