import Picker from './picker.vue';
import WeekRangePanel from '../panel/week-range.vue';

const getPanel = function() {
  return WeekRangePanel;
};

export default {
  mixins: [Picker],

  name: 'WeekRangePicker',

  props: {
    timeArrowControl: Boolean
  },

  watch: {
    type(type) {
      if (this.picker) {
        this.unmountPicker();
        this.panel = getPanel(type);
        this.mountPicker();
      } else {
        this.panel = getPanel(type);
      }
    }
  },

  created() {
    this.panel = getPanel(this.type);
  }
};
