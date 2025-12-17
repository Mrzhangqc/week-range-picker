<template>
  <div id="app">
    <DateWeekRange
      v-model="test"
      :clearable="true"
      range-separator="-"
      :picker-options="pickerOptions"
      format="yyyy-MM-dd"
      value-format="yyyy-MM-dd"
    ></DateWeekRange>
  </div>
</template>

<script>

// 开发模式从源码导入，生产模式从构建产物导入
import { DateWeekRange } from '../../src/index.js'

export default {
  data() {
    return {
      // test: ['2023-01-01', '2023-01-07']
      test: ['2025-12-08', '2025-12-14'],
      pickerOptions: {
        firstDayOfWeek: 1,
        disabledDate: (date) => {
          return date.getTime() < new Date('2025-12-04').getTime();
        }
      }
    }
  },
  components: {
    DateWeekRange
  },
  watch: {
    test() {
      console.log(this.test)
    }
  }
}
</script>
