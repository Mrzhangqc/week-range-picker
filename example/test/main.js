const { 
  findFirstWeekOfYear, 
  formatDate, 
  handleMinMaxDateWeek, 
  formatWeekRange, 
  calculateWeekNumber, 
  calculateWeekYear,
  getWeekNumber
} = require('./week-validation.js');

// 主测试函数
function runTests() {
  const firstDayOfWeek = 1; // 周几作为一周的第一天
  const startYear = 2023;
  const endYear = 2025;
  const testWeekCount = (endYear - startYear + 1) * 53;
  
  // 周几名称映射
  const dayNames = {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日'
  };
  
  console.log('='.repeat(80));
  console.log('周格式化和minDate/maxDate匹配测试');
  console.log(`firstDayOfWeek: ${firstDayOfWeek} (${dayNames[firstDayOfWeek] || '未知'})`);
  console.log(`测试范围: ${startYear}年第一周 至 ${endYear}年第一周`);
  console.log('='.repeat(80));
  console.log('');
  
  // 找到指定年份第一周的开始日期
  const startWeekDate = findFirstWeekOfYear(startYear, firstDayOfWeek);
  console.log(`${startYear}年第一周开始日期: ${formatDate(startWeekDate)}`);
  
  // 找到结束年份第一周的开始日期
  const endWeekDate = findFirstWeekOfYear(endYear, firstDayOfWeek);
  console.log(`${endYear}年第一周开始日期: ${formatDate(endWeekDate)}`);
  console.log('');
  
  let currentWeekStart = new Date(startWeekDate);
  let weekIndex = 0;
  let passedTests = 0;
  let failedTests = 0;
  const errors = [];
  let totalWeeks = 0;
  
  // 先计算总周数
  let tempDate = new Date(startWeekDate);
  while (tempDate.getTime() <= endWeekDate.getTime()) {
    totalWeeks++;
    tempDate.setDate(tempDate.getDate() + 7);
  }
  
  console.log(`预计测试周数: ${totalWeeks}`);
  console.log('');
  
  // 遍历每一周
  while (currentWeekStart.getTime() <= endWeekDate.getTime()) {
    weekIndex++;
    
    // 计算这一周的范围
    const weekMinDate = new Date(currentWeekStart);
    weekMinDate.setHours(0, 0, 0, 0);
    
    const weekMaxDate = new Date(currentWeekStart);
    weekMaxDate.setDate(weekMinDate.getDate() + 6);
    weekMaxDate.setHours(23, 59, 59, 999);
    
    // 测试1: 验证 handleMinMaxDateWeek 是否正确对齐
    const { minDate: adjustedMin, maxDate: adjustedMax } = handleMinMaxDateWeek(
      new Date(weekMinDate),
      new Date(weekMaxDate),
      firstDayOfWeek
    );
    
    // 验证调整后的日期是否匹配
    const minMatches = adjustedMin.getTime() === weekMinDate.getTime();
    const maxMatches = adjustedMax.getTime() === weekMaxDate.getTime();
    
    // 验证调整后的日期是否确实是周的第一天和最后一天
    const adjustedMinDay = adjustedMin.getDay();
    const adjustedMaxDay = adjustedMax.getDay();
    const expectedMinDay = firstDayOfWeek === 7 ? 0 : firstDayOfWeek;
    const expectedMaxDay = (firstDayOfWeek + 6) % 7;
    
    const minDayMatches = adjustedMinDay === expectedMinDay;
    const maxDayMatches = adjustedMaxDay === expectedMaxDay;
    
    // 测试2: 验证格式化
    const formatted = formatWeekRange(weekMinDate, weekMaxDate, 'yyyy-WW', firstDayOfWeek);
    const weekNum = calculateWeekNumber(weekMinDate, firstDayOfWeek);
    const weekYear = calculateWeekYear(weekMinDate, weekMinDate.getFullYear());
    
    // 验证格式化结果 - 应该包含周数，格式类似 "2025-W01" 或 "2025-01-W01"
    const weekStr = String(weekNum).padStart(2, '0');
    const formatValid = (formatted[0].includes(`-W${weekStr}`) || formatted[0].includes(`W${weekStr}`)) &&
                       (formatted[1].includes(`-W${weekStr}`) || formatted[1].includes(`W${weekStr}`));
    
    // 汇总测试结果
    const allTestsPassed = minMatches && maxMatches && minDayMatches && maxDayMatches && formatValid;
    
    if (allTestsPassed) {
      passedTests++;
    } else {
      failedTests++;
      errors.push({
        weekIndex,
        weekStart: formatDate(weekMinDate),
        weekEnd: formatDate(weekMaxDate),
        issues: []
      });
      
      if (!minMatches) {
        errors[errors.length - 1].issues.push(`minDate不匹配: 期望 ${formatDate(weekMinDate)}, 实际 ${formatDate(adjustedMin)}`);
      }
      if (!maxMatches) {
        errors[errors.length - 1].issues.push(`maxDate不匹配: 期望 ${formatDate(weekMaxDate)}, 实际 ${formatDate(adjustedMax)}`);
      }
      if (!minDayMatches) {
        errors[errors.length - 1].issues.push(`minDate不是周的第一天: 期望星期${expectedMinDay}, 实际星期${adjustedMinDay}`);
      }
      if (!maxDayMatches) {
        errors[errors.length - 1].issues.push(`maxDate不是周的最后一天: 期望星期${expectedMaxDay}, 实际星期${adjustedMaxDay}`);
      }
      if (!formatValid) {
        errors[errors.length - 1].issues.push(`格式化失败: ${formatted.join(' - ')}`);
      }
    }
    
    // 每10周输出一次进度
    if (weekIndex % 10 === 0) {
      console.log('');
      console.log('-'.repeat(40));
      console.log(`已测试 ${weekIndex}/${totalWeeks} 周...`);
      console.log('-'.repeat(40));
    }
    
    // 输出两年的详细信息作为示例
    if (weekIndex <= testWeekCount) {
      const formatted = formatWeekRange(weekMinDate, weekMaxDate, 'yyyy-WW', firstDayOfWeek);
      console.log(`第${weekIndex}周: ${formatDate(weekMinDate)} 至 ${formatDate(weekMaxDate)} -> ${formatted.join(' - ')}`);
    }
    
    // 移动到下一周
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  // 输出测试结果
  console.log('');
  console.log('='.repeat(80));
  console.log('测试结果汇总');
  console.log('='.repeat(80));
  console.log(`总周数: ${weekIndex}`);
  console.log(`通过: ${passedTests}`);
  console.log(`失败: ${failedTests}`);
  console.log('');
  
  if (failedTests > 0) {
    console.log('失败的测试详情:');
    console.log('-'.repeat(80));
    errors.forEach((error, index) => {
      console.log(`\n第 ${error.weekIndex} 周 (${error.weekStart} 至 ${error.weekEnd}):`);
      error.issues.forEach(issue => {
        console.log(`  ❌ ${issue}`);
      });
    });
  } else {
    console.log('✅ 所有测试通过！');
    console.log('');
    console.log('验证内容:');
    console.log('  ✓ minDate和maxDate能正确对齐到周的第一天和最后一天');
    console.log('  ✓ 周的格式化正确');
    console.log(`  ✓ firstDayOfWeek=${firstDayOfWeek}（${dayNames[firstDayOfWeek] || '未知'}）的逻辑正确`);
  }
  
  console.log('='.repeat(80));
  
  return { total: weekIndex, passed: passedTests, failed: failedTests, errors };
}

// 运行测试
if (require.main === module) {
  // 直接运行脚本时执行测试
  runTests();
} else {
  // 作为模块导入时导出函数
  module.exports = { runTests };
}
