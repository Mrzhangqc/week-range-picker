/**
 * 测试脚本：验证周的格式化和minDate/maxDate是否能匹配
 * firstDayOfWeek为1（周一作为一周的第一天）
 * 测试范围：2025年第一周至2026年第一周期间的每一周
 */

// 模拟 element-ui 的 getWeekNumber 函数（ISO 8601 标准）
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// 格式化日期为 yyyy-MM-dd
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取周的第一天（firstDayOfWeek = 1，即周一）
function getFirstDayOfWeekDate(date, firstDayOfWeek = 1) {
  const dayOfWeek = date.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六
  const firstDayJS = firstDayOfWeek === 7 ? 0 : firstDayOfWeek;
  
  // 计算到周的第一天的偏移量
  const offsetToFirstDay = dayOfWeek >= firstDayJS
    ? firstDayJS - dayOfWeek
    : firstDayJS - dayOfWeek - 7;
  
  const firstDayOfWeekDate = new Date(date);
  firstDayOfWeekDate.setDate(date.getDate() + offsetToFirstDay);
  firstDayOfWeekDate.setHours(0, 0, 0, 0);
  return firstDayOfWeekDate;
}

// 获取周的最后一天（周日的日期）
function getLastDayOfWeekDate(date, firstDayOfWeek = 1) {
  const firstDay = getFirstDayOfWeekDate(date, firstDayOfWeek);
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);
  return lastDay;
}

// 模拟 handleMinMaxDateWeek 逻辑
function handleMinMaxDateWeek(minDate, maxDate, firstDayOfWeek = 1) {
  if (!minDate || !maxDate) {
    return { minDate, maxDate };
  }

  // 确保 minDate <= maxDate
  if (minDate.getTime() > maxDate.getTime()) {
    const temp = minDate;
    minDate = maxDate;
    maxDate = temp;
  }

  // 计算周的第一天：将minDate调整到所在周的第一天
  const prevWeekDay = Math.abs(7 - firstDayOfWeek + minDate.getDay()) % 7;
  const adjustedMinDate = new Date(minDate.getTime() - prevWeekDay * 60 * 60 * 24 * 1000);
  adjustedMinDate.setHours(0, 0, 0, 0);

  // 计算周的最后一天：将maxDate调整到所在周的最后一天
  const weekendDay = (firstDayOfWeek + 6) % 7;
  const nextWeekDay = (7 + weekendDay - maxDate.getDay()) % 7;
  const adjustedMaxDate = new Date(maxDate.getTime() + nextWeekDay * 60 * 60 * 24 * 1000);
  adjustedMaxDate.setHours(23, 59, 59, 999);

  return { minDate: adjustedMinDate, maxDate: adjustedMaxDate };
}

// 计算周数（firstDayOfWeek = 1）
function calculateWeekNumber(firstDayOfWeekDate, firstDayOfWeek = 1) {
  if (firstDayOfWeek === 1) {
    return getWeekNumber(firstDayOfWeekDate);
  }
  // 对于非ISO标准，需要转换
  const middleDayOfWeek = new Date(firstDayOfWeekDate);
  middleDayOfWeek.setDate(firstDayOfWeekDate.getDate() + 3);
  const middleDayOfWeekDay = middleDayOfWeek.getDay();
  const isoFirstDay = 1;
  const offsetToIsoFirstDay = middleDayOfWeekDay >= isoFirstDay
    ? isoFirstDay - middleDayOfWeekDay
    : isoFirstDay - middleDayOfWeekDay - 7;
  const isoFirstDayDate = new Date(middleDayOfWeek);
  isoFirstDayDate.setDate(middleDayOfWeek.getDate() + offsetToIsoFirstDay);
  return getWeekNumber(isoFirstDayDate);
}

// 计算周年
function calculateWeekYear(firstDayOfWeekDate, originalYear) {
  const yearCounts = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(firstDayOfWeekDate);
    d.setDate(firstDayOfWeekDate.getDate() + i);
    const year = d.getFullYear();
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  
  const nextYear = originalYear + 1;
  const prevYear = originalYear - 1;
  if (yearCounts[nextYear] && yearCounts[nextYear] >= 4) {
    return nextYear;
  }
  if (yearCounts[prevYear] && yearCounts[prevYear] >= 4) {
    return prevYear;
  }
  
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

// 格式化周范围（模拟 formatter）
function formatWeekRange(minDate, maxDate, format = 'yyyy-WW', firstDayOfWeek = 1) {
  function formatSingleDate(date) {
    if (!date || !(date instanceof Date)) {
      return '';
    }
    
    const y = date.getFullYear();
    const month = date.getMonth();
    const trueDate = new Date(date);
    
    const hasWeekPlaceholder = /W+/.test(format);
    if (!hasWeekPlaceholder) {
      return formatDate(trueDate);
    }

    const firstDayOfWeekDate = getFirstDayOfWeekDate(trueDate, firstDayOfWeek);
    const week = calculateWeekNumber(firstDayOfWeekDate, firstDayOfWeek);
    const weekYear = calculateWeekYear(firstDayOfWeekDate, y);
    
    // 如果格式是纯 yyyy-WW 格式，直接构建字符串
    if (/^yyyy-WW$/.test(format)) {
      const weekStr = week < 10 ? '0' + week : String(week);
      return `${weekYear}-W${weekStr}`;
    }
    
    // 处理12月第1周的特殊情况
    if (week === 1 && month === 11) {
      trueDate.setHours(0, 0, 0, 0);
      const firstDayJS = firstDayOfWeek === 7 ? 0 : firstDayOfWeek;
      const dayOffset = (trueDate.getDay() - firstDayJS + 7) % 7;
      trueDate.setDate(trueDate.getDate() - dayOffset);
    }
    
    // 构建包含周数的格式化字符串
    // 格式应该是 yyyy-WW 或类似格式
    let formattedDate = formatDate(trueDate);
    
    // 如果周年和原年份不同，需要替换年份
    if (weekYear !== y) {
      formattedDate = formattedDate.replace(new RegExp(y, 'ig'), weekYear);
    }
    
    // 替换周数占位符
    if (/WW/.test(format)) {
      // 格式为 yyyy-WW，需要替换为 yyyy-W01 这样的格式
      const weekStr = week < 10 ? '0' + week : String(week);
      formattedDate = formattedDate.replace(/WW/, weekStr);
      // 如果格式中没有WW，需要添加
      if (!formattedDate.includes('-W')) {
        formattedDate = formattedDate.replace(/-(\d{2})$/, `-W${weekStr}`);
      }
    } else if (/W/.test(format)) {
      formattedDate = formattedDate.replace(/W/, week);
      // 如果格式中没有W，需要添加
      if (!formattedDate.includes('-W')) {
        formattedDate = formattedDate.replace(/-(\d{2})$/, `-W${week}`);
      }
    }
    
    return formattedDate;
  }

  if (!minDate || !maxDate) {
    return ['', ''];
  }

  return [formatSingleDate(minDate), formatSingleDate(maxDate)];
}

// 查找指定年份第一周的开始日期
// firstDayOfWeek: 1=周一, 2=周二, ..., 7=周日
function findFirstWeekOfYear(year, firstDayOfWeek = 1) {
  // 从1月1日开始查找
  let date = new Date(year, 0, 1);
  date.setHours(0, 0, 0, 0);
  
  // 将 firstDayOfWeek 转换为 JavaScript 的 getDay() 值
  // firstDayOfWeek: 1=周一, 2=周二, ..., 7=周日
  // getDay(): 0=周日, 1=周一, ..., 6=周六
  const targetDay = firstDayOfWeek === 7 ? 0 : firstDayOfWeek;
  
  // 找到第一个目标周几的日期
  while (date.getDay() !== targetDay) {
    date.setDate(date.getDate() + 1);
  }
  
  // 验证这确实是第一周
  const weekNum = calculateWeekNumber(date, firstDayOfWeek);
  if (weekNum === 1) {
    return date;
  }
  
  // 如果不是第一周，向前找（向前7天，直到找到第一周）
  while (calculateWeekNumber(date, firstDayOfWeek) !== 1) {
    date.setDate(date.getDate() - 7);
  }
  
  return date;
}

// 导出所有函数供测试使用
module.exports = {
  getWeekNumber,
  formatDate,
  getFirstDayOfWeekDate,
  getLastDayOfWeekDate,
  handleMinMaxDateWeek,
  calculateWeekNumber,
  calculateWeekYear,
  formatWeekRange,
  findFirstWeekOfYear
};
