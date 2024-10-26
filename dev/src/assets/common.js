// // Function.prototype.bind
// if (!Function.prototype.bind) {
//   Function.prototype.bind = function (oThis) {
//     if (typeof this !== 'function') {
//       throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
//     }
//     var aArgs = Array.prototype.slice.call(arguments, 1);
//     var fToBind = this;
//     var fNOP = function () {};
//     var fBound = function () {
//       return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
//         aArgs.concat(Array.prototype.slice.call(arguments)));
//     };
//     fNOP.prototype = this.prototype;
//     fBound.prototype = new fNOP();
//     return fBound;
//   };
// }
// if (typeof Object.assign !== 'function') {
//   Object.assign = function (target) {
//     'use strict';
//     if (target === null) {
//       throw new TypeError('Cannot convert undefined or null to object');
//     }
//     target = Object(target);
//     for (var index = 1; index < arguments.length; index++) {
//       var source = arguments[index];
//       if (source !== null) {
//         for (var key in source) {
//           if (Object.prototype.hasOwnProperty.call(source, key)) {
//             target[key] = source[key];
//           }
//         }
//       }
//     }
//     return target;
//   };
// }

import store from '@/store/store';
import menuCommon from '@/api/menu/common/menuCommon';
import { getService } from '@/utils/getService';

// 监听路由变化--动态修改页面的title
let titleFun = (to, another) => {
  // 获取对应的路由标题
  const sysSelect = getService();
  let [arr, list, isName, arrList] = [[], [], null, ['menuProduct', 'menuCustomer']];

  if (arrList.includes(sysSelect)) {
    arr = menuCommon[sysSelect] || [];
  } else {
    arr = menuCommon[sysSelect] && menuCommon[sysSelect][store.state.inGroup] ? menuCommon[sysSelect][store.state.inGroup] : [];
  }

  if (!(to.path && sysSelect)) return;
  arr.forEach(k => {
    list.push(k);
    if (k.children && k.children.length) {
      list.push(...k.children);
    }
  });
  const path = another && to.path.includes(another.name) ? another.value : to.path;
  list.forEach(k => {
    if (!isName && (k.path && k.path.includes(path))) isName = k;
  });
  return isName && isName.name;
};
export { titleFun };
