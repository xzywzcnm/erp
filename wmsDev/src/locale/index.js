import Vue from 'vue';
import VueI18n from 'vue-i18n';
import customZhCn from './lang/zh-CN';
import customZhTw from './lang/zh-TW';
import customEnUs from './lang/en-US';

Vue.use(VueI18n);
// 自动根据浏览器系统语言设置语言
let lang = localStorage.getItem('lang');
if (lang === null) {
  // let language = navigator.browserLanguage ? navigator.browserLanguage : navigator.language;
  let language = 'zh-CN';
  localStorage.setItem('lang', language);
}
Vue.config.lang = lang;
Vue.locale('zh-CN', customZhCn);
Vue.locale('en-US', customEnUs);
Vue.locale('zh-TW', customZhTw);

// const i18n = new VueI18n({
//   locale: lang,
//   messages: {
//     'zh-CN': customZhCn,
//     'en-US': customEnUs,
//     'zh-TW': customZhTw
//   }
// });

// export default i18n;
