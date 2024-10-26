/**
 *判断是否空值
 */
export function isEmptyValue(v) {
  return v == null || v === "";
}

// 用法
// import math from '@/assets/scripts/math.js'
// 加 math.add(num1,num2)
// 减 math.sub(num1,num2)
// 乘 math.mul(num1,num2)
// 除 math.div(num1,num2)
import { Decimal } from "decimal.js";
const math = {};
["add", "sub", "mul", "div"].forEach(method => {
  math[method] = function(...numbers) {
    let nums = [];

    numbers.forEach(number => {
      if (isEmptyValue(number)) {
        return;
      }

      number = parseFloat(number);

      if (isNaN(number)) {
        return;
      }

      nums.push(number);
    });

    if (!nums.length) {
      return "";
    }

    let d = new Decimal(nums.shift());

    nums.forEach(num => {
      d = d[method](num);
    });

    return d.toString();
  };
});
export {math};

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

// 获取前七天时间(时间范围)
export const fun_date = (aa = 0)=> {
  function a (val) {
    return val < 10 ? '0' + val : val;
  }
  function b (date) {
    return date.getFullYear() + "-" + a(date.getMonth() + 1) + "-" + a(date.getDate()) + " " + a(date.getHours()) + ":" + a(date.getMinutes()) + ":" + a(date.getSeconds());
  }
  const date1 = new Date();
  const time1 = b(date1);// time1表示当前时间
  let date2 = new Date(date1);
  date2.setDate(date1.getDate() + aa);
  const time2 = b(date2); // 指定几天后的日期
  return [time2, time1];
};

/**
 * 复制功能
 * str: 复制的文本
 * vm：vue对象
 * */  
export const copy_clip = (str,vm)=> {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
    vm.$Message.info('已成功复制');
  }
};

/**
 * 日期加上天数得到新的日期
 * date: 日期
 * days: 天数
 * */ 
export const getNewData = (date, days)=> {
  if(!date) return;
  if(days === undefined || days === '' || days === null) days = 0;
  var newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  var month = newDate.getMonth() + 1;
  var day = newDate.getDate();
  var mm = "'" + month + "'";
  var dd = "'" + day + "'";
  //单位数前面加0
  if(mm.length == 3) {
    month = "0" + month;
  }
  if(dd.length == 3) {
    day = "0" + day;
  }
  var time = newDate.getFullYear() + "-" + month + "-" + day;
  return time;
};

/**
 * 日期截取到年月日时分
 * time: 日期
 * */ 
export const intercepTime = (time)=> {
  if(!time) return;
  time = time.slice(0,16);
  return time;
};
