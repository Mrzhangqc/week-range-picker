# week-range-picker
vue2 element-ui week range component  
基于 element-ui 2.x 开发周范围选择组件


### 示例

[在线预览](https://codepen.io/Mr-Zhang-the-selector/pen/RNazBYR)


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

##### 浏览器使用（Vue 2）

```html
<!DOCTYPE html>
<html>
<head>
  <link type="text/css" href="https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/icon.css">
  <link type="text/css" href="https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/date-picker.css">
</head>
<body>
  <div id="app">
    <week-range-picker v-model="test"></week-range-picker>
  </div>

  <!-- 先引入 Vue 2 -->
  <script src="https://unpkg.com/vue@2/dist/vue.js"></script>
  <!-- 再引入组件 -->
  <script src="https://unpkg.com/week-range-picker@next"></script>
  
  <script>
    // 使用 Vue.use() 注册组件（window.WeekRangePicker 直接指向组件本身）
    Vue.use(window.WeekRangePicker);
    
    // 或者直接调用 install 方法
    // window.WeekRangePicker.install(Vue);
    
    // 如果 Vue 在组件加载时已存在，组件会自动注册
    
    new Vue({
      el: '#app',
      data() {
        return {
          test: []
        }
      }
    });
  </script>
</body>
</html>
```


### 文档

文档和 [el-date-picker组件](https://element.eleme.cn/2.15/#/zh-CN/component/date-picker) type="daterange" 一致。