document.addEventListener('DOMContentLoaded', function() {
  // 鼓励语配置
  const encourageConfig = [
    { days: 0, text: "戒烟从今天开始，你已经迈出了最重要的一步！" },
    { days: 1, text: "坚持1天了！别回头，每一口放弃都是对自己的辜负！" },
    { days: 3, text: "3天！烟瘾正在退缩，你比它更强大！" },
    { days: 7, text: "7天封神！青铜戒烟者就是你，继续干翻烟瘾！" },
    { days: 14, text: "2周！尼古丁已经滚出你的身体，你就是意志力的神！" },
    { days: 30, text: "30天！白银段位到手！烟？配不上现在的你！" },
    { days: 60, text: "2个月！烟瘾早该跪了，你就是戒烟界的天花板！" },
    { days: 100, text: "100天！黄金戒烟者！从此香烟是路人，健康是王者！" },
    { days: 180, text: "半年！还有什么能难倒你？戒烟对你来说就是小菜一碟！" },
    { days: 365, text: "365天！戒烟大师！你已经彻底战胜烟瘾，牛逼格拉斯！" },
    { days: 500, text: "500天！戒烟已成习惯，健康才是终身财富，你赢麻了！" },
    { days: 730, text: "2年！香烟？那是什么垃圾？你早已站在健康之巅！" }
  ];

  // 成就配置
  const achievementConfig = [
    { id: 7, name: "青铜戒烟者", color: "bronze", target: 7 },
    { id: 30, name: "白银戒烟者", color: "silver", target: 30 },
    { id: 100, name: "黄金戒烟者", color: "gold", target: 100 },
    { id: 365, name: "戒烟大师", color: "primary", target: 365 }
  ];

  // 全局状态
  let currentDate = new Date();
  let checkInData = {
    records: {}, // 打卡记录：{ "2026-01-01": "checkIn", "2026-01-02": "miss", "2026-01-03": "makeUp" }
    continuousDays: 0,
    totalCheckInDays: 0,
    makeUpCount: 0, // 当月补卡次数
    maxMakeUpCount: 3 // 每月最大补卡次数
  };

  // 加载本地存储数据
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('quitSmokeData');
      const defaultData = {
        form: {
          startDate: '',
          cigPerDay: '',
          pricePerPack: '',
          notes: ''
        },
        history: [],
        checkIn: {
          records: {},
          continuousDays: 0,
          totalCheckInDays: 0,
          makeUpCount: 0,
          maxMakeUpCount: 3
        }
      };
      const data = savedData ? JSON.parse(savedData) : defaultData;
      // 初始化打卡数据
      checkInData = data.checkIn;
      return data;
    } catch (e) {
      console.error('加载数据失败:', e);
      return {
        form: {},
        history: [],
        checkIn: checkInData
      };
    }
  };

  // 保存数据到本地存储
  const saveData = (data = {}) => {
    try {
      const savedData = loadSavedData();
      const newData = { ...savedData, ...data, checkIn: checkInData };
      localStorage.setItem('quitSmokeData', JSON.stringify(newData));
      updateCheckInUI();
      renderCalendar();
      updateAchievementUI();
      updateEncourageText();
      loadHistory();
      return true;
    } catch (e) {
      console.error('保存数据失败:', e);
      alert('保存失败，请检查浏览器存储权限！');
      return false;
    }
  };

  // 加载打卡历史
  const loadHistory = () => {
    const savedData = loadSavedData();
    const historyList = document.getElementById('historyList');
    const historySection = document.getElementById('historySection');
    
    if (!historyList || !historySection) return;

    // 提取打卡记录并排序
    const checkInHistory = Object.entries(checkInData.records)
      .map(([date, type]) => ({
        date,
        type,
        typeText: type === 'checkIn' ? '正常打卡' : type === 'makeUp' ? '补卡' : '未打卡'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (checkInHistory.length > 0) {
      historySection.classList.remove('hidden');
      historyList.innerHTML = '';
      
      checkInHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
          <p class="font-medium">${item.date}</p>
          <p class="text-sm text-gray-600">打卡状态：<span class="${item.type === 'checkIn' ? 'text-checkIn' : item.type === 'makeUp' ? 'text-checkInMakeUp' : 'text-checkInMiss'}">${item.typeText}</span></p>
        `;
        historyList.appendChild(historyItem);
      });
    } else {
      historySection.classList.add('hidden');
    }
  };

  // 初始化表单数据
  const initForm = () => {
    const savedData = loadSavedData();
    const startDateEl = document.getElementById('startDate');
    const cigPerDayEl = document.getElementById('cigPerDay');
    const pricePerPackEl = document.getElementById('pricePerPack');
    const notesEl = document.getElementById('notes');

    if (savedData && savedData.form) {
      if (startDateEl) startDateEl.value = savedData.form.startDate || '';
      if (cigPerDayEl) cigPerDayEl.value = savedData.form.cigPerDay || '';
      if (pricePerPackEl) pricePerPackEl.value = savedData.form.pricePerPack || '';
      if (notesEl) notesEl.value = savedData.form.notes || '';
      
      if (savedData.form.startDate && savedData.form.cigPerDay && savedData.form.pricePerPack) {
        calculateProgress(
          savedData.form.startDate, 
          savedData.form.cigPerDay, 
          savedData.form.pricePerPack
        );
      }
    }

    // 初始化打卡相关
    updateCheckInUI();
    renderCalendar();
    updateAchievementUI();
    updateEncourageText();
    loadHistory();
    
    // 绑定事件
    bindEvents();
  };

  // 计算戒烟进度
  const calculateProgress = (startDateVal, cigPerDayVal, pricePerPackVal) => {
    if (!startDateVal || !cigPerDayVal || !pricePerPackVal) {
      alert('请填写完整的戒烟信息！');
      return;
    }

    const startDate = new Date(startDateVal);
    const cigPerDay = parseInt(cigPerDayVal);
    const pricePerPack = parseFloat(pricePerPackVal);
    
    if (isNaN(cigPerDay) || isNaN(pricePerPack) || cigPerDay < 1 || pricePerPack < 0.01) {
      alert('请输入有效的数值！每日吸烟量需≥1，香烟价格需≥0.01');
      return;
    }
    
    const today = new Date();
    const timeDiff = today - startDate;
    const daysQuit = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    
    const packsPerDay = cigPerDay / 20;
    const moneySaved = (packsPerDay * pricePerPack * daysQuit).toFixed(2);
    const cigAvoided = cigPerDay * daysQuit;
    
    // 更新UI
    const daysQuitEl = document.getElementById('daysQuit');
    const moneySavedEl = document.getElementById('moneySaved');
    const cigAvoidedEl = document.getElementById('cigAvoided');
    const healthStatusEl = document.getElementById('healthStatus');
    const totalDaysQuitEl = document.getElementById('totalDaysQuit');
    const totalMoneySavedEl = document.getElementById('totalMoneySaved');

    if (daysQuitEl) daysQuitEl.textContent = daysQuit;
    if (moneySavedEl) moneySavedEl.textContent = `¥${moneySaved}`;
    if (cigAvoidedEl) cigAvoidedEl.textContent = `${cigAvoided} 支`;
    if (totalDaysQuitEl) totalDaysQuitEl.textContent = daysQuit;
    if (totalMoneySavedEl) totalMoneySavedEl.textContent = `¥${moneySaved}`;

    // 健康状态
    let healthStatus = '';
    if (daysQuit < 1) healthStatus = '今天就开启你的戒烟之旅吧！';
    else if (daysQuit < 7) healthStatus = '尼古丁正在离开你的身体 - 做得很棒！';
    else if (daysQuit < 30) healthStatus = '你的肺功能正在改善，呼吸更顺畅了！';
    else if (daysQuit < 90) healthStatus = '恭喜！你已经度过最难熬的阶段，烟瘾基本消失。';
    else if (daysQuit < 365) healthStatus = '你的心脏病风险已降低一半，身体状态大幅提升！';
    else healthStatus = '太棒了！你的身体已完全恢复，远离吸烟的伤害。';
    
    if (healthStatusEl) healthStatusEl.textContent = healthStatus;

    updateAchievementProgress(daysQuit);
    updateEncourageText(daysQuit);
    
    const progressResultEl = document.getElementById('progressResult');
    if (progressResultEl) progressResultEl.classList.remove('hidden');
    
    // 保存数据
    const savedData = loadSavedData();
    savedData.history.push({
      date: new Date().toISOString().split('T')[0],
      daysQuit: daysQuit,
      moneySaved: moneySaved,
      cigAvoided: cigAvoided
    });
    if (savedData.history.length > 10) savedData.history = savedData.history.slice(-10);
    savedData.form = {
      startDate: startDateVal,
      cigPerDay: cigPerDayVal,
      pricePerPack: pricePerPackVal,
      notes: document.getElementById('notes').value || ''
    };
    saveData(savedData);
  };

  // 渲染日历
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthTitle = document.getElementById('currentMonthTitle');
    
    if (!calendarGrid || !currentMonthTitle) return;

    // 更新月份标题
    currentMonthTitle.textContent = `${year}年${month + 1}月`;

    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay(); // 0-6（日-六）
    const totalDays = lastDay.getDate();

    // 清空日历
    calendarGrid.innerHTML = '';

    // 填充上月剩余天数（灰色显示）
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1);
      const dayEl = document.createElement('div');
      dayEl.className = 'h-12 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded';
      dayEl.textContent = prevMonthDay.getDate();
      calendarGrid.appendChild(dayEl);
    }

    // 填充当月天数
    const today = new Date().toISOString().split('T')[0];
    const startDate = loadSavedData().form.startDate || '';
    const startDateObj = startDate ? new Date(startDate) : null;

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dateObj = new Date(year, month, day);
      const isToday = dateStr === today;
      const isBeforeStart = startDateObj && dateObj < startDateObj; // 戒烟开始前的日期不可打卡
      const checkInType = checkInData.records[dateStr] || 'none';

      const dayEl = document.createElement('div');
      dayEl.className = 'h-12 flex items-center justify-center rounded cursor-pointer transition-colors';
      
      // 基础样式
      if (isToday) dayEl.classList.add('border-2', 'border-primary/50');
      if (isBeforeStart) dayEl.classList.add('text-gray-300', 'bg-gray-50', 'cursor-not-allowed');
      
      // 打卡状态样式
      if (checkInType === 'checkIn') {
        dayEl.classList.add('bg-checkIn/20', 'text-checkIn', 'font-medium');
        dayEl.innerHTML = `<<i class="fa-solid fa-check"></</i>`;
      } else if (checkInType === 'makeUp') {
        dayEl.classList.add('bg-checkInMakeUp/20', 'text-checkInMakeUp', 'font-medium');
        dayEl.innerHTML = `<<i class="fa-solid fa-clock-rotate-left"></</i>`;
      } else if (checkInType === 'miss') {
        dayEl.classList.add('bg-checkInMiss/10', 'text-checkInMiss');
        dayEl.textContent = day;
      } else {
        dayEl.classList.add('hover:bg-gray-100');
        dayEl.textContent = day;
      }

      // 点击事件（仅当月、戒烟开始后、非今日未打卡可点击）
      if (!isBeforeStart && dateStr !== today && checkInType === 'none') {
        dayEl.addEventListener('click', () => handleDateClick(dateStr));
      }

      calendarGrid.appendChild(dayEl);
    }

    // 填充下月剩余天数（灰色显示）
    const totalCells = 42; // 6行×7列
    const filledCells = firstDayOfWeek + totalDays;
    for (let i = 0; i < totalCells - filledCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i + 1);
      const dayEl = document.createElement('div');
      dayEl.className = 'h-12 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded';
      dayEl.textContent = nextMonthDay.getDate();
      calendarGrid.appendChild(dayEl);
    }
  };

  // 处理日历日期点击
  const handleDateClick = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const dateObj = new Date(dateStr);
    const todayObj = new Date(today);
    const diffDays = Math.floor((todayObj - dateObj) / (1000 * 60 * 60 * 24));

    // 只能补7天内的日期
    if (diffDays > 7) {
      alert('只能补7天内未打卡的日期！');
      return;
    }

    // 检查补卡次数
    if (checkInData.makeUpCount >= checkInData.maxMakeUpCount) {
      alert(`本月补卡次数已用完（每月限${checkInData.maxMakeUpCount}次）！`);
      return;
    }

    // 确认补卡
    if (confirm(`确定要补${dateStr}的打卡吗？`)) {
      checkInData.records[dateStr] = 'makeUp';
      checkInData.makeUpCount += 1;
      checkInData.totalCheckInDays += 1;
      calculateContinuousDays();
      saveData();
      alert('补卡成功！');
    }
  };

  // 今日打卡
  const handleTodayCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    if (checkInData.records[today]) {
      alert('今日已打卡，无需重复打卡！');
      return;
    }

    checkInData.records[today] = 'checkIn';
    checkInData.totalCheckInDays += 1;
    calculateContinuousDays();
    saveData();
    alert('今日打卡成功！坚持就是胜利！');
  };

  // 计算连续打卡天数
  const calculateContinuousDays = () => {
    const today = new Date().toISOString().split('T')[0];
    let continuous = 0;
    let currentCheckDate = new Date(today);

    while (true) {
      const dateStr = currentCheckDate.toISOString().split('T')[0];
      const checkInType = checkInData.records[dateStr];
      
      if (checkInType === 'checkIn' || checkInType === 'makeUp') {
        continuous += 1;
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
      } else {
        break;
      }
    }

    checkInData.continuousDays = continuous;
  };

  // 补卡功能（弹窗选择日期）
  const handleMakeUpCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const startDate = loadSavedData().form.startDate || '';

    if (!startDate) {
      alert('请先填写戒烟开始日期！');
      return;
    }

    if (checkInData.makeUpCount >= checkInData.maxMakeUpCount) {
      alert(`本月补卡次数已用完（每月限${checkInData.maxMakeUpCount}次）！`);
      return;
    }

    // 生成7天内未打卡的日期列表
    const makeUpDates = [];
    let currentDate = new Date(sevenDaysAgo);
    const endDate = new Date(today);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dateObj = new Date(dateStr);
      const startDateObj = new Date(startDate);
      
      // 戒烟开始后、未打卡、非今日
      if (dateObj >= startDateObj && !checkInData.records[dateStr] && dateStr !== today) {
        makeUpDates.push(dateStr);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (makeUpDates.length === 0) {
      alert('暂无可补卡的日期！');
      return;
    }

    // 弹窗选择补卡日期
    const selectedDate = prompt(
      `请选择补卡日期（7天内，已用补卡次数：${checkInData.makeUpCount}/${checkInData.maxMakeUpCount}）：\n` +
      makeUpDates.join('\n'),
      makeUpDates[0]
    );

    if (!selectedDate || !makeUpDates.includes(selectedDate)) {
      alert('请选择有效的补卡日期！');
      return;
    }

    checkInData.records[selectedDate] = 'makeUp';
    checkInData.makeUpCount += 1;
    checkInData.totalCheckInDays += 1;
    calculateContinuousDays();
    saveData();
    alert(`补卡${selectedDate}成功！`);
  };

  // 更新打卡UI
  const updateCheckInUI = () => {
    const today = new Date().toISOString().split('T')[0];
    const checkInStatus = document.getElementById('checkInStatus');
    const continuousDaysEl = document.getElementById('continuousDays');
    const todayCheckInBtn = document.getElementById('todayCheckInBtn');
    const makeUpCheckInBtn = document.getElementById('makeUpCheckInBtn');

    if (checkInStatus) {
      checkInStatus.textContent = checkInData.records[today] ? '已打卡 ✅' : '未打卡';
    }

    if (continuousDaysEl) {
      continuousDaysEl.textContent = `${checkInData.continuousDays} 天`;
    }

    if (todayCheckInBtn) {
      if (checkInData.records[today]) {
        todayCheckInBtn.disabled = true;
        todayCheckInBtn.classList.add('bg-gray-400');
        todayCheckInBtn.classList.remove('bg-primary');
      } else {
        todayCheckInBtn.disabled = false;
        todayCheckInBtn.classList.remove('bg-gray-400');
        todayCheckInBtn.classList.add('bg-primary');
      }
    }

    if (makeUpCheckInBtn) {
      makeUpCheckInBtn.textContent = `补卡（7天内）- 剩余${checkInData.maxMakeUpCount - checkInData.makeUpCount}次`;
    }
  };

  // 更新成就进度
  const updateAchievementProgress = (daysQuit = 0) => {
    achievementConfig.forEach(achievement => {
      const progress = Math.min(100, (daysQuit / achievement.target) * 100);
      const progressBar = document.getElementById(`progress${achievement.id}`);
      const progressText = document.getElementById(`progressText${achievement.id}`);
      const achievementCard = document.getElementById(`achievement${achievement.id}`);
      
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progressText) progressText.textContent = `${daysQuit}/${achievement.target} 天`;
      
      if (daysQuit >= achievement.target && achievementCard) {
        achievementCard.classList.add(`border-${achievement.color}`, `bg-${achievement.color}/5`);
        achievementCard.classList.remove(`border-${achievement.color}/30`);
      }
    });
  };

  // 更新成就UI
  const updateAchievementUI = () => {
    const savedData = loadSavedData();
    if (savedData.form.startDate && savedData.form.cigPerDay && savedData.form.pricePerPack) {
      const startDate = new Date(savedData.form.startDate);
      const today = new Date();
      const daysQuit = Math.max(0, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)));
      updateAchievementProgress(daysQuit);
    }
  };

  // 更新鼓励语
  const updateEncourageText = (daysQuit = 0) => {
    const encourageTextEl = document.getElementById('encourageText');
    if (!encourageTextEl) return;
    
    let matchedText = encourageConfig[0].text;
    for (let i = encourageConfig.length - 1; i >= 0; i--) {
      if (daysQuit >= encourageConfig[i].days) {
        matchedText = encourageConfig[i].text;
        break;
      }
    }
    encourageTextEl.textContent = matchedText;
  };

  // 绑定所有事件
  const bindEvents = () => {
    // 今日打卡按钮
    const todayCheckInBtn = document.getElementById('todayCheckInBtn');
    if (todayCheckInBtn) {
      todayCheckInBtn.addEventListener('click', handleTodayCheckIn);
    }

    // 补卡按钮
    const makeUpCheckInBtn = document.getElementById('makeUpCheckInBtn');
    if (makeUpCheckInBtn) {
      makeUpCheckInBtn.addEventListener('click', handleMakeUpCheckIn);
    }

    // 上月/下月按钮
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
      });
    }
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        const today = new Date();
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        // 不能超过当前月
        if (nextMonth <= today) {
          currentDate.setMonth(currentDate.getMonth() + 1);
          renderCalendar();
        }
      });
    }

    // 表单提交
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
      trackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const cigPerDay = document.getElementById('cigPerDay').value;
        const pricePerPack = document.getElementById('pricePerPack').value;
        calculateProgress(startDate, cigPerDay, pricePerPack);
      });
    }

    // 保存进度按钮
    const saveProgressBtn = document.getElementById('saveProgress');
    if (saveProgressBtn) {
      saveProgressBtn.addEventListener('click', function() {
        const savedData = loadSavedData();
        const startDate = document.getElementById('startDate').value;
        const cigPerDay = document.getElementById('cigPerDay').value;
        const pricePerPack = document.getElementById('pricePerPack').value;
        const notes = document.getElementById('notes').value;
        
        savedData.form = {
          startDate: startDate,
          cigPerDay: cigPerDay,
          pricePerPack: pricePerPack,
          notes: notes
        };
        
        saveData(savedData);
        alert('进度保存成功！');
      });
    }

    // 重置按钮
    const resetProgressBtn = document.getElementById('resetProgress');
    if (resetProgressBtn) {
      resetProgressBtn.addEventListener('click', function() {
        if (confirm('确定要重置所有记录吗？此操作不可恢复！')) {
          localStorage.removeItem('quitSmokeData');
          // 重置状态
          checkInData = {
            records: {},
            continuousDays: 0,
            totalCheckInDays: 0,
            makeUpCount: 0,
            maxMakeUpCount: 3
          };
          initForm();
          const progressResultEl = document.getElementById('progressResult');
          const historySection = document.getElementById('historySection');
          if (progressResultEl) progressResultEl.classList.add('hidden');
          if (historySection) historySection.classList.add('hidden');
          alert('所有记录已重置！重新开始你的戒烟之旅吧！');
        }
      });
    }
  };

  // 初始化页面
  initForm();
});
