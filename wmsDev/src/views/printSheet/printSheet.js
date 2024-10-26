import Vue from 'vue';
import { Message } from 'view-design';
import '@/components/localComponents/'; // 本地组件
import '@/assets/css/iview';

Vue.component('Message', Message);
let printData = JSON.parse(localStorage.getItem('prinSheetData'));
let columns = [];
let printSheetData = [];
let url = window.location.href;
let type;
if (url.indexOf('type') > 0) {
  type = url.split('type=')[1];
} else {
  Message.error('没有相关数据');
}
function countryName (code) {
  if (localStorage.getItem('area') !== null) {
    // 匹配国家名字
    let area = JSON.parse(localStorage.getItem('area'));
    for (var i = 0; i < area.length; i++) {
      if (area[i].twoCode === code) {
        return area[i].enName;
      }
    }
  }
}
if (printData && printData !== null) {
  if (type === '3') {
    columns = [
      {
        title: '货号',
        key: 'sku'
      }, {
        title: '配货名称',
        key: 'title'
      }, {
        title: '规格', // '规格',
        key: 'variations'
      }, {
        title: '数量',
        width: 100,
        key: 'quantity'
      }, {
        title: '备注',
        key: 'remark'
      }
    ];
  } else if (type === '1') {
    columns = [
      {
        title: '货号(SKU)', // '货号(SKU)',
        key: 'sku'
      }, {
        title: '配货名称', // '配货名称',
        key: 'title'
      }, {
        title: '规格',
        key: 'variations'
      }, {
        title: '数量',
        width: 100,
        key: 'quantity'
      }
    ];
  } else if (type === '2') {
    columns = [
      {
        title: '包裹号', // '包裹号',
        key: 'packageCode',
        combine: true,
        render: (h, params) => {
          const len = params.row.len;
          if (len) {
            const obj = {
              childrens: [
                [
                  'div', {
                    class: 'combiePackageCode'
                  }, params.row.packageCode
                ]
              ],
              props: {
                rowSpan: len
              }
            };
            return obj;
          } else {
            return '';
          }
        }
      }, {
        title: '目的地', // '目的地',
        key: 'buyerCountryCode',
        combine: true,
        render: (h, params) => {
          const len = params.row.len;
          if (len) {
            const obj = {
              childrens: [
                [
                  'div', {
                    class: 'combiePackageCode'
                  }, countryName(params.row.buyerCountryCode)
                ]
              ],
              props: {
                rowSpan: len
              }
            };
            return obj;
          } else {
            return '';
          }
        }
      }, {
        title: '货号（SKU）/配货名称', // '货号(sku)/配货名称',
        key: 'title',
        render: (h, params) => {
          return h('div', [h('div', params.row.sku), h('div', params.row.title)]);
        }
      }, {
        title: '规格', // '规格',
        key: 'variations'
      }, {
        title: '数量',
        key: 'quantity',
        width: 100
      }
    ];
  }
  printSheetData = makeNewData(printData);
} else {
  Message.error('没有相关数据');
}
function makeNewData (data) {
  let newArr = [];
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    for (let t = 0; t < item.packageGoods.length; t++) {
      let newItem = deepCopy(item);
      delete newItem.packageGoods;
      let childItem = item.packageGoods[t];
      if (t === 0) {
        childItem.len = item.packageGoods.length;
      }
      newArr.push(Object.assign(newItem, childItem));
    }
    if (i === data.length - 1) {
      return newArr;
    }
  }
}
function deepCopy (data) {
  let t = typeOf(data);
  let o;
  if (t === 'array') {
    o = [];
  } else if (t === 'object') {
    o = {};
  } else {
    return data;
  }
  if (t === 'array') {
    for (let i = 0; i < data.length; i++) {
      o.push(deepCopy(data[i]));
    }
  } else if (t === 'object') {
    for (let i in data) {
      o[i] = deepCopy(data[i]);
    }
  }
  return o;
}
function typeOf (obj) {
  let toString = Object.prototype.toString;
  let map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };
  return map[toString.call(obj)];
}
new Vue({
  data () {
    return {
      printSheetData: printSheetData,
      printSheetColumns: columns
    };
  }
}).$mount('#app');
