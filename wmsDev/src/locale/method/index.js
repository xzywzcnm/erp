// https://github.com/ElemeFE/element/blob/dev/src/locale/index.js
import Vue from 'vue';
import deepmerge from 'deepmerge';
import Format from './format';
import customZhCn from '../lang/zh-CN';
import customZhTw from '../lang/zh-TW';
import customEnUs from '../lang/en-US';
// 自动根据浏览器系统语言设置语言
let lang = localStorage.getItem('lang');
let langData;
if (lang === null || lang === 'zh-CN') {
  langData = customZhCn;
} else if (lang === 'en-US') {
  langData = customEnUs;
} else if (lang === 'zh-TW') {
  langData = customZhTw;
}
const format = Format(Vue);
let merged = false;
let i18nHandler = function () {
  const vuei18n = Object.getPrototypeOf(this || Vue).$t;
  if (typeof vuei18n === 'function') {
    if (!merged) {
      merged = true;
      Vue.locale(Vue.config.lang, deepmerge(langData, Vue.locale(Vue.config.lang) || {}, { clone: true }));
    }
    return vuei18n.apply(this, arguments);
  }
};
export const t = function (path, options) {
  let value = i18nHandler.apply(this, arguments);
  if (value !== null && value !== undefined) return value;
  const array = path.split('.');
  let current = langData;
  for (let i = 0, j = array.length; i < j; i++) {
    const property = array[i];
    value = current[property];
    if (i === j - 1) return format(value, options);
    if (!value) return '';
    current = value;
  }
  return '';
};
export const use = function (l) {
  langData = l || langData;
};
export const i18n = function (fn) {
  i18nHandler = fn || i18nHandler;
};
export default {
  use,
  t,
  i18n
};
