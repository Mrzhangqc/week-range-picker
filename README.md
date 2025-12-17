# week-range-picker
vue2 element-ui week range component  
基于 element-ui 2.x 开发周范围选择组件


### 示例

[在线预览](https://codepen.io/)


### 注意
不会自动注入css，需手动引入，以避免出现样式覆盖情况
  
#### 安装

``` bash
npm install week-range-picker --save
yarn add week-range-picker --save
```

### 局部注册（vue2）

```javascript
<template>
  <WeekRangePicker v-model="range"></WeekRangePicker>
</template>

<script>
import { WeekRangePicker } from 'week-range-picker'

export default {
  data() {
    return {
      range: []
    }
  },
  components: {
    WeekRangePicker
  }
}
</script>
```

##### 浏览器使用

```html

<link type="text/css" href="https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/icon.css">
<link type="text/css" href="https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/date-picker.css">

<script src="https://unpkg.com/week-range-picker@next"></script>

<body>
  <div id="app">
    <week-range-picker v-model="test"></week-range-picker>
  </div>
</body>

<script>
const app = window.Vue.createApp({
  data() {
    return {
      test: ''
    }
  }
})
app.use(window.WeekRangePicker)
app.mount("#app")
</script>
```


### 文档

文档和 [el-date-picker组件](https://element.eleme.cn/2.15/#/zh-CN/component/date-picker) type="daterange" 一致。