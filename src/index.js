import WeekRange from './picker/week-picker.js'
import pkg from '../package.json';
import locale from 'element-ui/src/locale';

function install(Vue, opts = {}) {
  locale.use(opts.locale);
  locale.i18n(opts.i18n);

  Vue.component(WeekRange.name, WeekRange);
}

WeekRange.install = install
WeekRange.version = pkg.version

export default WeekRange;