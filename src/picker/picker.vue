<template>
  <div
    class="el-date-editor el-range-editor el-input__inner"
    :class="[
      'el-date-editor--daterange',
      pickerSize ? `el-range-editor--${ pickerSize }` : '',
      pickerDisabled ? 'is-disabled' : '',
      pickerVisible ? 'is-active' : ''
    ]"
    @click="handleRangeClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="showClose = false"
    @keydown="handleKeydown"
    ref="reference"
    v-clickoutside="handleClose">
    <i :class="['el-input__icon', 'el-range__icon', triggerClass]"></i>
    <input
      autocomplete="off"
      :placeholder="startPlaceholder"
      :value="displayValue && displayValue[0]"
      :disabled="pickerDisabled"
      v-bind="firstInputId"
      :name="name && name[0]"
      readonly
      class="el-range-input">
    <slot name="range-separator">
      <span class="el-range-separator">{{ rangeSeparator }}</span>
    </slot>
    <input
      autocomplete="off"
      :placeholder="endPlaceholder"
      :value="displayValue && displayValue[1]"
      :disabled="pickerDisabled"
      v-bind="secondInputId"
      :name="name && name[1]"
      readonly
      class="el-range-input">
    <i
      @click="handleClickIcon"
      v-if="haveTrigger"
      :class="[showClose ? '' + clearIcon : '']"
      class="el-input__icon el-range__close-icon">
    </i>
  </div>
</template>

<script>
import Vue from 'vue';
import Clickoutside from 'element-ui/src/utils/clickoutside';
import { formatDate, isDateObject, getWeekNumber, parseDate } from 'element-ui/src/utils/date-util';
import Popper from 'element-ui/src/utils/vue-popper';
import Emitter from 'element-ui/src/mixins/emitter';
import merge from 'element-ui/src/utils/merge';

const NewPopper = {
  props: {
    appendToBody: Popper.props.appendToBody,
    offset: Popper.props.offset,
    boundariesPadding: Popper.props.boundariesPadding,
    arrowOffset: Popper.props.arrowOffset
  },
  methods: Popper.methods,
  data() {
    return merge({ visibleArrow: true, type: 'weekrange' }, Popper.data);
  },
  beforeDestroy: Popper.beforeDestroy
};

const DEFAULT_FORMATS = {
  weekrange: 'yyyy年WW周',
};

const DATE_PARSER = function(text, format) {
  if (format === 'timestamp') return new Date(Number(text));
  return parseDate(text, format);
};

const RANGE_PARSER = function(array, format) {
  if (array.length === 2) {
    const range1 = array[0];
    const range2 = array[1];

    return [DATE_PARSER(range1, format), DATE_PARSER(range2, format)];
  }
  return [];
};

const TYPE_VALUE_RESOLVER_MAP = {
  default: {
    formatter(value) {
      if (!value) return '';
      return '' + value;
    },
    parser(text) {
      if (text === undefined || text === '') return null;
      return text;
    }
  },
  weekrange: {
    formatter(value, format, firstDayOfWeek = 7) {
      function getDate(value) {
        if(!value) {
          return;
        }

        const y = value.getFullYear();
        const month = value.getMonth();
        const trueDate = new Date(value);
        
        // 检查格式是否包含周数占位符
        const hasWeekPlaceholder = /W+/.test(format);
        
        // 只有当格式包含周数占位符时，才需要计算周年和调整日期
        if (!hasWeekPlaceholder) {
          return formatDate(trueDate, format);
        }

        // 计算周的第一天
        function getFirstDayOfWeekDate(date, firstDayOfWeek) {
          const dayOfWeek = date.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六
          const firstDayJS = firstDayOfWeek === 7 ? 0 : firstDayOfWeek;
          
          // 计算到周的第一天的偏移量
          const offsetToFirstDay = dayOfWeek >= firstDayJS
            ? firstDayJS - dayOfWeek
            : firstDayJS - dayOfWeek - 7;
          
          const firstDayOfWeekDate = new Date(date);
          firstDayOfWeekDate.setDate(date.getDate() + offsetToFirstDay);
          return { firstDayOfWeekDate, firstDayJS };
        }

        // 计算周数
        function calculateWeekNumber(firstDayOfWeekDate, firstDayOfWeek) {
          if (firstDayOfWeek === 1) {
            return getWeekNumber(firstDayOfWeekDate);
          }
          
          // 对于非ISO标准（周从周一开始），需要转换到ISO标准计算
          const middleDayOfWeek = new Date(firstDayOfWeekDate);
          middleDayOfWeek.setDate(firstDayOfWeekDate.getDate() + 3);
          
          const middleDayOfWeekDay = middleDayOfWeek.getDay();
          const isoFirstDay = 1; // ISO 8601 标准的周第一天是周一
          const offsetToIsoFirstDay = middleDayOfWeekDay >= isoFirstDay
            ? isoFirstDay - middleDayOfWeekDay
            : isoFirstDay - middleDayOfWeekDay - 7;
          
          const isoFirstDayDate = new Date(middleDayOfWeek);
          isoFirstDayDate.setDate(middleDayOfWeek.getDate() + offsetToIsoFirstDay);
          return getWeekNumber(isoFirstDayDate);
        }

        // 计算周年
        function calculateWeekYear(firstDayOfWeekDate, originalYear) {
          // 计算这一周有多少天在各个年份
          const yearCounts = {};
          const years = [];
          for(let i = 0; i < 7; i++) {
            const d = new Date(firstDayOfWeekDate);
            d.setDate(firstDayOfWeekDate.getDate() + i);
            const year = d.getFullYear();
            yearCounts[year] = (yearCounts[year] || 0) + 1;
            if (years.indexOf(year) === -1) {
              years.push(year);
            }
          }
          
          // 如果一周跨越了多个年份，优先显示为较大的年份（新年）
          if (years.length > 1) {
            return Math.max(...years);
          }
          
          // 根据ISO 8601标准：如果一周有4天或更多天在新年，这一周属于新年
          const nextYear = originalYear + 1;
          const prevYear = originalYear - 1;
          if (yearCounts[nextYear] && yearCounts[nextYear] >= 4) {
            return nextYear;
          }
          if (yearCounts[prevYear] && yearCounts[prevYear] >= 4) {
            return prevYear;
          }
          
          // 否则，选择天数最多的年份
          let maxDays = 0;
          let weekYear = originalYear;
          for (const year in yearCounts) {
            const days = yearCounts[year];
            if (days > maxDays || (days === maxDays && parseInt(year) > weekYear)) {
              maxDays = days;
              weekYear = parseInt(year);
            }
          }
          return weekYear;
        }

        // 处理12月第1周的特殊情况
        function handleDecemberFirstWeek(date, week, month, firstDayJS) {
          if (week === 1 && month === 11) {
            // 12月的第1周，属于下一年的第一周
            date.setHours(0, 0, 0, 0);
            const dayOffset = (date.getDay() - firstDayJS + 7) % 7;
            date.setDate(date.getDate() - dayOffset);
          }
        }

        // 格式化日期中的周数
        function formatWeekInDate(dateStr, week, originalYear, weekYear) {
          let date = dateStr;
          if (weekYear !== originalYear) {
            date = date.replace(new RegExp(originalYear, 'ig'), weekYear);
          }
          return /WW/.test(date)
            ? date.replace(/WW/, week < 10 ? '0' + week : week)
            : date.replace(/W/, week);
        }

        // 执行周数计算流程
        const { firstDayOfWeekDate, firstDayJS } = getFirstDayOfWeekDate(value, firstDayOfWeek);
        const week = calculateWeekNumber(firstDayOfWeekDate, firstDayOfWeek);
        const weekYear = calculateWeekYear(firstDayOfWeekDate, y);
        handleDecemberFirstWeek(trueDate, week, month, firstDayJS);
        
        const formattedDate = formatDate(trueDate, format);
        return formatWeekInDate(formattedDate, week, y, weekYear);
      }

      if(!Array.isArray(value)){
        return getDate(value);
      }

      const dateList = []
      for(const val of value) {
        dateList.push(getDate(val));
      }
      
      return dateList;
    },
    parser: RANGE_PARSER
  },
};
const PLACEMENT_MAP = {
  left: 'bottom-start',
  center: 'bottom',
  right: 'bottom-end'
};

const parseAsFormatAndType = (value, customFormat, type) => {
  if (!value) return null;
  const parser = (
    TYPE_VALUE_RESOLVER_MAP[type] ||
    TYPE_VALUE_RESOLVER_MAP['default']
  ).parser;
  const format = customFormat || DEFAULT_FORMATS[type];
  return parser(value, format);
};

const formatAsFormatAndType = (value, customFormat, type = 'weekrange', firstDayOfWeek = 7) => {
  if (!value) return null;
  const formatter = (
    TYPE_VALUE_RESOLVER_MAP[type] ||
    TYPE_VALUE_RESOLVER_MAP['default']
  ).formatter;
  const format = customFormat || DEFAULT_FORMATS[type];
  return formatter(value, format, firstDayOfWeek);
};

/*
 * Considers:
 *   1. Date object
 *   2. date string
 *   3. array of 1 or 2
 */
const valueEquals = function(a, b) {
  // considers Date object and string
  const dateEquals = function(a, b) {
    const aIsDate = a instanceof Date;
    const bIsDate = b instanceof Date;
    if (aIsDate && bIsDate) {
      return a.getTime() === b.getTime();
    }
    if (!aIsDate && !bIsDate) {
      return a === b;
    }
    return false;
  };

  const aIsArray = a instanceof Array;
  const bIsArray = b instanceof Array;
  if (aIsArray && bIsArray) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => dateEquals(item, b[index]));
  }
  if (!aIsArray && !bIsArray) {
    return dateEquals(a, b);
  }
  return false;
};

const isString = function(val) {
  return typeof val === 'string' || val instanceof String;
};

const validator = function(val) {
  // either: String, Array of String, null / undefined
  return (
    val === null ||
    val === undefined ||
    isString(val) ||
    (Array.isArray(val) && val.length === 2 && val.every(isString))
  );
};

export default {
  mixins: [Emitter, NewPopper],

  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },

  props: {
    size: String,
    format: String,
    valueFormat: String,
    readonly: Boolean,
    startPlaceholder: String,
    endPlaceholder: String,
    prefixIcon: String,
    clearIcon: {
      type: String,
      default: 'el-icon-circle-close'
    },
    name: {
      default: '',
      validator
    },
    disabled: Boolean,
    clearable: {
      type: Boolean,
      default: true
    },
    id: {
      default: '',
      validator
    },
    popperClass: String,
    editable: {
      type: Boolean,
      default: true
    },
    align: {
      type: String,
      default: 'left'
    },
    value: {},
    defaultValue: {},
    defaultTime: {},
    rangeSeparator: {
      default: '-'
    },
    pickerOptions: {},
    unlinkPanels: Boolean,
    validateEvent: {
      type: Boolean,
      default: true
    }
  },

  directives: { Clickoutside },

  data() {
    return {
      pickerVisible: false,
      showClose: false,
      userInput: null,
      valueOnOpen: null, // value when picker opens, used to determine whether to emit change
      unwatchPickerOptions: null,
      dateList: []
    };
  },

  watch: {
    pickerVisible(val) {
      if (this.readonly || this.pickerDisabled) return;
      if (val) {
        this.showPicker();
        this.valueOnOpen = Array.isArray(this.value) ? [...this.value] : this.value;
      } else {
        this.hidePicker();
        this.emitChange(this.value);
        this.userInput = null;
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.blur');
        }
        this.$emit('blur', this);
        this.blur();
      }
    },
    parsedValue: {
      immediate: true,
      handler(val) {
        if (this.picker) {
          this.picker.value = val;
        }
      }
    },
    defaultValue(val) {
      // NOTE: should eventually move to jsx style picker + panel ?
      if (this.picker) {
        this.picker.defaultValue = val;
      }
    },
    value(val, oldVal) {
      if (!valueEquals(val, oldVal) && !this.pickerVisible && this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.change', val);
      }
    }
  },

  computed: {
    reference() {
      const reference = this.$refs.reference;
      return reference.$el || reference;
    },

    refInput() {
      if (this.reference) {
        return [].slice.call(this.reference.querySelectorAll('input'));
      }
      return [];
    },

    valueIsEmpty() {
      const val = this.value;
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length; i < len; i++) {
          if (val[i]) {
            return false;
          }
        }
      } else {
        if (val) {
          return false;
        }
      }
      return true;
    },

    triggerClass() {
      return this.prefixIcon || 'el-icon-date';
    },

    haveTrigger() {
      if (typeof this.showTrigger !== 'undefined') {
        return this.showTrigger;
      }
      return true;
    },

    displayValue() {
      // 从 pickerOptions 获取 firstDayOfWeek，默认为 7（周日）
      const firstDayOfWeek = (this.pickerOptions && this.pickerOptions.firstDayOfWeek) || 7;
      const formattedValue = formatAsFormatAndType(this.parsedValue, this.format, 'weekrange', firstDayOfWeek);

      if (Array.isArray(this.userInput)) {
        return [
          this.userInput[0] || (formattedValue && formattedValue[0]) || '',
          this.userInput[1] || (formattedValue && formattedValue[1]) || ''
        ];
      } else if (this.userInput !== null) {
        return this.userInput;
      } else if (formattedValue && !Array.isArray(formattedValue) || Array.isArray(formattedValue) && formattedValue.length >= 2) {
        return formattedValue;
      } else {
        return '';
      }
    },

    parsedValue() {
      if (!this.value) return this.value; // component value is not set

      const valueIsDateObject = isDateObject(this.value) || (Array.isArray(this.value) && this.value.every(isDateObject));
      if (valueIsDateObject) {
        return this.value;
      }
      if (this.valueFormat) {
        if(this.dateList?.length) {
          return this.dateList;
        } else {
          if(Array.isArray(this.value)) {
            this.value.forEach(v => {
              this.dateList.push(new Date(v))
            })
          } else {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.dateList = this.value || [];
          }

          return this.dateList;
        }
      }

      // NOTE: deal with common but incorrect usage, should remove in next major version
      // user might provide string / timestamp without value-format, coerce them into date (or array of date)
      return Array.isArray(this.value) ? this.value.map(val => new Date(val)) : new Date(this.value);
    },

    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },

    pickerSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },

    pickerDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },

    firstInputId() {
      const obj = {};
      const id = this.id && this.id[0];
      
      if (id) obj.id = id;
      return obj;
    },

    secondInputId() {
      const obj = {};
      const id  = this.id && this.id[1];
      
      if (id) obj.id = id;
      return obj;
    }
  },

  created() {
    // vue-popper
    this.popperOptions = {
      boundariesPadding: 0,
      gpuAcceleration: false
    };
    this.placement = PLACEMENT_MAP[this.align] || PLACEMENT_MAP.left;

    this.$on('fieldReset', this.handleFieldReset);
  },

  methods: {
    focus() {
      this.handleFocus();
    },

    blur() {
      this.refInput.forEach(input => input.blur());
    },

    // {parse, formatTo} Value deals maps component value with internal Date
    parseValue(value) {
      const isParsed = isDateObject(value) || (Array.isArray(value) && value.every(isDateObject));
      if (this.valueFormat && !isParsed) {
        return parseAsFormatAndType(value, this.valueFormat, this.type) || value;
      } else {
        return value;
      }
    },

    formatToValue(date) {
      const isFormattable = isDateObject(date) || (Array.isArray(date) && date.every(isDateObject));
      if (this.valueFormat && isFormattable) {
        return formatAsFormatAndType(date, this.valueFormat);
      } else {
        return date;
      }
    },

    // {parse, formatTo} String deals with user input
    parseString(value) {
      return parseAsFormatAndType(value, this.format, this.type);
    },

    formatToString(value) {
      return formatAsFormatAndType(value, this.format);
    },

    handleMouseEnter() {
      if (this.readonly || this.pickerDisabled) return;
      if (!this.valueIsEmpty && this.clearable) {
        this.showClose = true;
      }
    },

    handleChange() {
      if (this.userInput) {
        const value = this.parseString(this.displayValue);
        if (value) {
          this.picker.value = value;
          if (this.isValidValue(value)) {
            this.emitInput(value);
            this.userInput = null;
          }
        }
      }
      if (this.userInput === '') {
        this.emitInput(null);
        this.emitChange(null);
        this.userInput = null;
      }
    },

    handleClickIcon(event) {
      if (this.readonly || this.pickerDisabled) return;
      if (this.showClose) {
        this.valueOnOpen = this.value;
        event.stopPropagation();
        this.emitInput(null);
        this.emitChange(null);
        this.showClose = false;
        if (this.picker && typeof this.picker.handleClear === 'function') {
          this.picker.handleClear();
        }
      } else {
        this.pickerVisible = !this.pickerVisible;
      }
    },

    handleClose() {
      if (!this.pickerVisible) return;
      this.pickerVisible = false;
    },

    handleFieldReset(initialValue) {
      this.userInput = initialValue === '' ? null : initialValue;
    },

    handleFocus() {
      if (!this.pickerVisible) {
        this.pickerVisible = true;
      }
      this.$emit('focus', this);
    },

    handleKeydown(event) {
      const keyCode = event.keyCode;

      // ESC
      if (keyCode === 27) {
        this.pickerVisible = false;
        event.stopPropagation();
        return;
      }

      // Tab
      if (keyCode === 9) {
        // user may change focus between two input
        setTimeout(() => {
          if (this.refInput.indexOf(document.activeElement) === -1) {
            this.pickerVisible = false;
            this.blur();
            event.stopPropagation();
          }
        }, 0);
        return;
      }

      // Enter
      if (keyCode === 13) {
        if (this.userInput === '' || this.isValidValue(this.parseString(this.displayValue))) {
          this.handleChange();
          this.pickerVisible = this.picker.visible = false;
          this.blur();
        }
        event.stopPropagation();
        return;
      }

      // if user is typing, do not let picker handle key input
      if (this.userInput) {
        event.stopPropagation();
        return;
      }

      // delegate other keys to panel
      if (this.picker && this.picker.handleKeydown) {
        this.picker.handleKeydown(event);
      }
    },

    handleRangeClick() {
      if (!this.pickerVisible) {
        this.pickerVisible = true;
      }
      this.$emit('focus', this);
    },

    hidePicker() {
      if (this.picker) {
        setTimeout(() => {
          this.picker.resetView && this.picker.resetView();
        }, 100)
        this.pickerVisible = this.picker.visible = false;
        this.destroyPopper();
      }
    },

    showPicker() {
      if (this.$isServer) return;
      if (!this.picker) {
        this.mountPicker();
      }
      this.pickerVisible = this.picker.visible = true;

      this.updatePopper();

      this.picker.value = this.parsedValue;
      this.picker.resetView && this.picker.resetView();

      this.$nextTick(() => {
        this.picker.adjustSpinners && this.picker.adjustSpinners();
      });
    },

    mountPicker() {
      this.picker = new Vue(this.panel).$mount();
      this.picker.defaultValue = this.defaultValue;
      this.picker.defaultTime = this.defaultTime;
      this.picker.popperClass = this.popperClass;
      this.popperElm = this.picker.$el;
      this.picker.width = this.reference.getBoundingClientRect().width;
      this.picker.showTime = false;
      this.picker.unlinkPanels = this.unlinkPanels;
      this.picker.arrowControl = this.arrowControl || this.timeArrowControl || false;
      this.$watch('format', (format) => {
        this.picker.format = format;
      });

      const updateOptions = () => {
        const options = this.pickerOptions;

        if (options && options.selectableRange) {
          let ranges = options.selectableRange;
          const parser = TYPE_VALUE_RESOLVER_MAP.datetimerange.parser;
          const format = DEFAULT_FORMATS.timerange;

          ranges = Array.isArray(ranges) ? ranges : [ranges];
          this.picker.selectableRange = ranges.map(range => parser(range, format, this.rangeSeparator));
        }

        for (const option in options) {
          if (Object.hasOwnProperty.call(options, option) &&
              // 忽略 time-picker 的该配置项
              option !== 'selectableRange') {
            this.picker[option] = options[option];
          }
        }

        // main format must prevail over undocumented pickerOptions.format
        if (this.format) {
          this.picker.format = this.format;
        }
      };
      updateOptions();
      this.unwatchPickerOptions = this.$watch('pickerOptions', () => updateOptions(), { deep: true });
      this.$el.appendChild(this.picker.$el);
      this.picker.resetView && this.picker.resetView();

      this.picker.$on('dodestroy', this.doDestroy);
      this.picker.$on('pick', (date = '', visible = false) => {
        this.userInput = null;
        this.pickerVisible = this.picker.visible = visible;

        this.emitInput(date);
        this.picker.resetView && this.picker.resetView();
      });

      this.picker.$on('select-range', (start, end, pos) => {
        if (this.refInput.length === 0) return;
        if (!pos || pos === 'min') {
          this.refInput[0].setSelectionRange(start, end);
          this.refInput[0].focus();
        } else if (pos === 'max') {
          this.refInput[1].setSelectionRange(start, end);
          this.refInput[1].focus();
        }
      });
    },

    unmountPicker() {
      if (this.picker) {
        this.picker.$destroy();
        this.picker.$off();
        if (typeof this.unwatchPickerOptions === 'function') {
          this.unwatchPickerOptions();
        }
        this.picker.$el.parentNode.removeChild(this.picker.$el);
      }
    },

    emitChange(val) {
      // determine user real change only
      if (!valueEquals(val, this.valueOnOpen)) {
        this.$emit('change', val);
        this.valueOnOpen = val;
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.change', val);
        }
      }
    },

    emitInput(val) {
      this.dateList = val;
      const formatted = this.formatToValue(val);
      if (!valueEquals(this.value, formatted)) {
        this.$emit('input', formatted);
      }
    },

    isValidValue(value) {
      if (!this.picker) {
        this.mountPicker();
      }
      if (this.picker.isValidValue) {
        return value && this.picker.isValidValue(value);
      } else {
        return true;
      }
    }
  }
};
</script>
