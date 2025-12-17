<template>
  <div id="app">
    <DateWeekRange
      v-model="test"
      :clearable="true"
      range-separator="-"
      :picker-options="{
        firstDayOfWeek: 1
      }"
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
      test: ['2025-12-29', '2026-01-05']
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
