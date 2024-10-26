import zhLocale from '@/locale/lang/zh-CN';
import enLocale from '@/locale/lang/en-US';
import twLocale from '@/locale/lang/zh-TW';

let lang = localStorage.getItem('lang');
let locale;
if (lang === 'zh-CN' || lang === null) {
  locale = zhLocale;
} else if (lang === 'zh-TW') {
  locale = twLocale;
} else if (lang === 'en-US') {
  locale = enLocale;
}
export default locale;
