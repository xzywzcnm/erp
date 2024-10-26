import enLocale from '@/locale/lang/en-US';
import twLocale from '@/locale/lang/zh-CN';

var lang = localStorage.getItem('lang');
var locale;
if (lang == 'zh-CN' || lang == null) {
  locale = twLocale;
} else if (lang == 'en-US') {
  locale = enLocale;
}

export default locale;
