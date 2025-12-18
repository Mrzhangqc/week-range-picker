/**
 * 跨年周测试：专门测试跨年周使用 formatWeekRange 的结果是否正确
 * 
 * 跨年周是指一周跨越两个年份的情况，例如：
 * - 2023年12月最后一周可能包含2024年1月的日期
 * - 2024年1月第一周可能包含2023年12月的日期
 */

const { 
  formatWeekRange, 
  calculateWeekNumber, 
  calculateWeekYear,
  getFirstDayOfWeekDate,
  formatDate
} = require('./week-validation.js');

// 测试用例：跨年周
const crossYearWeekTestCases = [
  // 2023-2024 跨年周
  {
    name: '2023年末跨年周（12月最后一周）',
    minDate: new Date(2023, 11, 25), // 2023-12-25
    maxDate: new Date(2023, 11, 31), // 2023-12-31
    firstDayOfWeek: 1, // 周一
    expectedWeekYear: null, // 需要计算
    expectedWeek: null, // 需要计算
  },
  {
    name: '2024年初跨年周（1月第一周）',
    minDate: new Date(2024, 0, 1), // 2024-01-01
    maxDate: new Date(2024, 0, 7), // 2024-01-07
    firstDayOfWeek: 1, // 周一
    expectedWeekYear: null,
    expectedWeek: null,
  },
  // 2024-2025 跨年周
  {
    name: '2024年末跨年周（12月最后一周）',
    minDate: new Date(2024, 11, 23), // 2024-12-23
    maxDate: new Date(2024, 11, 29), // 2024-12-29
    firstDayOfWeek: 1, // 周一
    expectedWeekYear: null,
    expectedWeek: null,
  },
  {
    name: '2025年初跨年周（1月第一周）',
    minDate: new Date(2025, 0, 1), // 2025-01-01
    maxDate: new Date(2025, 0, 5), // 2025-01-05
    firstDayOfWeek: 1, // 周一
    expectedWeekYear: null,
    expectedWeek: null,
  },
  // 2022-2023 跨年周
  {
    name: '2022年末跨年周（12月最后一周）',
    minDate: new Date(2022, 11, 26), // 2022-12-26
    maxDate: new Date(2023, 0, 1), // 2023-01-01
    firstDayOfWeek: 1, // 周一
    expectedWeekYear: null,
    expectedWeek: null,
  },
  {
    name: '2023年初跨年周（1月第一周）',
    minDate: new Date(2023, 0, 2), // 2023-01-02
    maxDate: new Date(2023, 0, 8), // 2023-01-08
    firstDayOfWeek: 1, // 周一
    expectedWeekYear: null,
    expectedWeek: null,
  },
];

// 自动查找跨年周
function findCrossYearWeeks(startYear, endYear, firstDayOfWeek = 1) {
  const crossYearWeeks = [];
  
  for (let year = startYear; year <= endYear; year++) {
    // 查找年末的跨年周（12月最后一周）
    const dec31 = new Date(year, 11, 31);
    const lastWeekStart = getFirstDayOfWeekDate(dec31, firstDayOfWeek);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    lastWeekEnd.setHours(23, 59, 59, 999);
    
    // 检查是否是跨年周
    if (lastWeekEnd.getFullYear() > year || lastWeekStart.getFullYear() < year) {
      crossYearWeeks.push({
        name: `${year}年末跨年周`,
        minDate: new Date(lastWeekStart),
        maxDate: new Date(lastWeekEnd),
        firstDayOfWeek,
        year,
        type: 'year-end'
      });
    }
    
    // 查找年初的跨年周（1月第一周）
    const jan1 = new Date(year, 0, 1);
    const firstWeekStart = getFirstDayOfWeekDate(jan1, firstDayOfWeek);
    const firstWeekEnd = new Date(firstWeekStart);
    firstWeekEnd.setDate(firstWeekStart.getDate() + 6);
    firstWeekEnd.setHours(23, 59, 59, 999);
    
    // 检查是否是跨年周
    if (firstWeekStart.getFullYear() < year || firstWeekEnd.getFullYear() > year) {
      crossYearWeeks.push({
        name: `${year}年初跨年周`,
        minDate: new Date(firstWeekStart),
        maxDate: new Date(firstWeekEnd),
        firstDayOfWeek,
        year,
        type: 'year-start'
      });
    }
  }
  
  return crossYearWeeks;
}

// 测试单个跨年周
function testCrossYearWeek(testCase) {
  const { minDate, maxDate, firstDayOfWeek, name } = testCase;
  
  // 获取周的第一天
  const weekStart = getFirstDayOfWeekDate(minDate, firstDayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  // 计算周数和周年
  const week = calculateWeekNumber(weekStart, firstDayOfWeek);
  const weekYear = calculateWeekYear(weekStart, weekStart.getFullYear());
  
  // 使用 formatWeekRange 格式化
  const formatted = formatWeekRange(weekStart, weekEnd, 'yyyy-WW', firstDayOfWeek);
  
  // 验证结果
  const results = {
    name,
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    week,
    weekYear,
    formatted,
    isValid: true,
    issues: []
  };
  
  // 验证1: 格式化结果应该包含正确的周年
  const formattedStartYear = parseInt(formatted[0].split('-')[0]);
  const formattedEndYear = parseInt(formatted[1].split('-')[0]);
  
  if (formattedStartYear !== weekYear) {
    results.isValid = false;
    results.issues.push(`开始日期格式化周年不正确: 期望 ${weekYear}, 实际 ${formattedStartYear}`);
  }
  
  if (formattedEndYear !== weekYear) {
    results.isValid = false;
    results.issues.push(`结束日期格式化周年不正确: 期望 ${weekYear}, 实际 ${formattedEndYear}`);
  }
  
  // 验证2: 格式化结果应该包含正确的周数
  const weekStr = String(week).padStart(2, '0');
  if (!formatted[0].includes(`-W${weekStr}`) && !formatted[0].includes(`W${weekStr}`)) {
    results.isValid = false;
    results.issues.push(`开始日期格式化周数不正确: 期望包含 W${weekStr}, 实际 ${formatted[0]}`);
  }
  
  if (!formatted[1].includes(`-W${weekStr}`) && !formatted[1].includes(`W${weekStr}`)) {
    results.isValid = false;
    results.issues.push(`结束日期格式化周数不正确: 期望包含 W${weekStr}, 实际 ${formatted[1]}`);
  }
  
  // 验证3: 跨年周应该确实跨越两个年份
  const spansYears = weekStart.getFullYear() !== weekEnd.getFullYear();
  if (!spansYears && testCase.type) {
    // 如果是专门标记为跨年周的测试用例，应该确实跨年
    results.isValid = false;
    results.issues.push(`不是真正的跨年周: 开始年份 ${weekStart.getFullYear()}, 结束年份 ${weekEnd.getFullYear()}`);
  }
  
  // 验证4: 周年应该是一周内天数最多的年份
  const yearCounts = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const year = d.getFullYear();
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  
  let maxDays = 0;
  let yearWithMaxDays = null;
  for (const year in yearCounts) {
    if (yearCounts[year] > maxDays) {
      maxDays = yearCounts[year];
      yearWithMaxDays = parseInt(year);
    }
  }
  
  if (weekYear !== yearWithMaxDays && spansYears) {
    results.isValid = false;
    results.issues.push(`周年计算不正确: 期望 ${yearWithMaxDays} (有${maxDays}天), 实际 ${weekYear}`);
  }
  
  // 验证5: 开始和结束的格式化结果应该使用相同的周年和周数
  if (formattedStartYear !== formattedEndYear) {
    results.isValid = false;
    results.issues.push(`开始和结束日期使用了不同的周年: ${formattedStartYear} vs ${formattedEndYear}`);
  }
  
  return results;
}

// 主测试函数
function runCrossYearWeekTests() {
  console.log('='.repeat(80));
  console.log('跨年周 formatWeekRange 测试');
  console.log('='.repeat(80));
  console.log('');
  
  // 自动查找跨年周（2022-2025年）
  const autoFoundWeeks = findCrossYearWeeks(2022, 2025, 1);
  
  console.log(`自动找到 ${autoFoundWeeks.length} 个跨年周`);
  console.log('');
  
  // 合并手动测试用例和自动找到的跨年周
  const allTestCases = [...crossYearWeekTestCases, ...autoFoundWeeks];
  
  let passedTests = 0;
  let failedTests = 0;
  const testResults = [];
  
  // 运行所有测试
  for (const testCase of allTestCases) {
    const result = testCrossYearWeek(testCase);
    testResults.push(result);
    
    if (result.isValid) {
      passedTests++;
    } else {
      failedTests++;
    }
  }
  
  // 输出详细测试结果
  console.log('测试结果详情:');
  console.log('-'.repeat(80));
  
  for (const result of testResults) {
    console.log('');
    console.log(`测试: ${result.name}`);
    console.log(`  周范围: ${result.weekStart} 至 ${result.weekEnd}`);
    console.log(`  周数: ${result.week}, 周年: ${result.weekYear}`);
    console.log(`  格式化结果: ${result.formatted.join(' - ')}`);
    
    // 显示年份分布
    const yearCounts = {};
    const weekStartDate = new Date(result.weekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(weekStartDate.getDate() + i);
      const year = d.getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
    const yearDistribution = Object.entries(yearCounts)
      .map(([year, count]) => `${year}年(${count}天)`)
      .join(', ');
    console.log(`  年份分布: ${yearDistribution}`);
    
    if (result.isValid) {
      console.log(`  ✅ 通过`);
    } else {
      console.log(`  ❌ 失败`);
      result.issues.forEach(issue => {
        console.log(`    - ${issue}`);
      });
    }
  }
  
  // 输出汇总
  console.log('');
  console.log('='.repeat(80));
  console.log('测试结果汇总');
  console.log('='.repeat(80));
  console.log(`总测试数: ${testResults.length}`);
  console.log(`通过: ${passedTests}`);
  console.log(`失败: ${failedTests}`);
  
  if (failedTests === 0) {
    console.log('');
    console.log('✅ 所有跨年周测试通过！');
    console.log('');
    console.log('验证内容:');
    console.log('  ✓ 跨年周的周年计算正确');
    console.log('  ✓ 跨年周的周数计算正确');
    console.log('  ✓ formatWeekRange 格式化结果正确');
    console.log('  ✓ 开始和结束日期使用相同的周年和周数');
  } else {
    console.log('');
    console.log(`❌ 有 ${failedTests} 个测试失败，请检查上述详情`);
  }
  
  console.log('='.repeat(80));
  
  return {
    total: testResults.length,
    passed: passedTests,
    failed: failedTests,
    results: testResults
  };
}

// 运行测试
if (require.main === module) {
  runCrossYearWeekTests();
} else {
  module.exports = { runCrossYearWeekTests, findCrossYearWeeks, testCrossYearWeek };
}
