import WeekRange from './picker/week-picker.js'
import pkg from '../package.json';
import locale from 'element-ui/src/locale';

function install(Vue, opts = {}) {
  locale.use(opts.locale);
  locale.i18n(opts.i18n);

  Vue.component(WeekRange.name, WeekRange);
}

WeekRange.install = install
const version = WeekRange.version = pkg.version

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export const WeekRangePicker = WeekRange;

export {
  install,
  version,
  locale
}

export default WeekRangePicker;