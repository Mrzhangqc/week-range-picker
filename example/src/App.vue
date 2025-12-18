<template>
  <div id="app">
    <WeekRangePicker
      size="small"
      v-model="weekRange"
      :clearable="true"
      range-separator="-"
      :picker-options="pickerOptions"
      value-format="yyyy-MM-dd"
    ></WeekRangePicker>
  </div>
</template>

<script>

// 开发模式从源码导入，生产模式从构建产物导入
import { WeekRangePicker } from '../../src/index.js'

export default {
  data() {
    return {
      // weekRange: ['2023-01-01', '2023-01-07'],
      weekRange: ['2025-12-08', '2026-01-04'],
      pickerOptions: {
        firstDayOfWeek: 1,
        disabledDate: (date) => {
          return date.getTime() < new Date('2025-12-04').getTime();
        }
      }
    }
  },
  components: {
    WeekRangePicker
  },
  watch: {
    weekRange(val) {
      console.log(val)
    }
  }
}
</script>
