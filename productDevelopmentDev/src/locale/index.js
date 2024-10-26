import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zhLocale from './lang/zh-CN';
import enLocale from './lang/en-US';
import twLocale from './lang/zh-TW';

Vue.use(VueI18n);
var lang = localStorage.getItem('lang');
if (lang != null) {
  Vue.config.lang = lang;
} else {
  var language = navigator.browserLanguage
                 ? navigator.browserLanguage
                 : navigator.language;
  Vue.config.lang = language;
}
Vue.locale('zh-CN', zhLocale);
Vue.locale('en-US', enLocale);
Vue.locale('zh-TW', twLocale);
