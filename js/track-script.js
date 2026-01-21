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
          lastCheckInDate: '',
          continuousDays: 0,
          totalCheckInDays: 0
        }
      };
      return savedData ? JSON.parse(savedData) : defaultData;
    } catch (e) {
      console.error('加载数据失败:', e);
      return {
        form: {},
        history: [],
        checkIn: {
          lastCheckInDate: '',
          continuousDays: 0,
          totalCheckInDays: 0
        }
      };
    }
  };

  // 保存数据到本地存储
  const saveData = (data) => {
    try {
      localStorage.setItem('quitSmokeData', JSON.stringify(data));
      updateCheckInUI();
      updateAchievementUI();
      updateEncourageText();
      loadHistory();
      alert('进度保存成功！数据已存储在本地，不会丢失');
    } catch (e) {
      console.error('保存数据失败:', e);
      alert('保存失败，请检查浏览器存储权限！');
    }
  };

  // 加载打卡历史
  const loadHistory = () => {
    const savedData = loadSavedData();
    const historyList = document.getElementById('historyList');
    const historySection = document.getElementById('historySection');
    
    if (!historyList || !historySection) return;

    if (savedData && savedData.history && savedData.history.length > 0) {
      historySection.classList.remove('hidden');
      historyList.innerHTML = '';
      
      savedData.history.forEach((item) => {
        const date = new Date(item.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
          <p class="font-medium">${formattedDate}</p>
          <p class="text-sm text-gray-600">无烟天数：${item.daysQuit}天 | 节省金额：¥${item.moneySaved} | 少抽香烟：${item.cigAvoided}支</p>
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
      
      // 如果有保存的表单数据，自动计算进度
      if (savedData.form.startDate && savedData.form.cigPerDay && savedData.form.pricePerPack) {
        calculateProgress(
          savedData.form.startDate, 
          savedData.form.cigPerDay, 
          savedData.form.pricePerPack
        );
      }
    }
    // 初始化UI
    updateCheckInUI();
    updateAchievementUI();
    updateEncourageText();
    loadHistory();
    
    // 绑定表单提交事件
    bindFormSubmit();
    // 绑定打卡按钮事件
    bindCheckInBtn();
    // 绑定保存/重置按钮事件
    bindSaveResetBtn();
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
    
    const packsPerDay = cigPerDay / 20; // 每包20支
    const moneySaved = (packsPerDay * pricePerPack * daysQuit).toFixed(2);
    const cigAvoided = cigPerDay * daysQuit;
    
    // 更新UI显示
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

    // 更新健康状态
    let healthStatus = '';
    if (daysQuit < 1) healthStatus = '今天就开启你的戒烟之旅吧！';
    else if (daysQuit < 7) healthStatus = '尼古丁正在离开你的身体 - 做得很棒！';
    else if (daysQuit < 30) healthStatus = '你的肺功能正在改善，呼吸更顺畅了！';
    else if (daysQuit < 90) healthStatus = '恭喜！你已经度过最难熬的阶段，烟瘾基本消失。';
    else if (daysQuit < 365) healthStatus = '你的心脏病风险已降低一半，身体状态大幅提升！';
    else healthStatus = '太棒了！你的身体已完全恢复，远离吸烟的伤害。';
    
    if (healthStatusEl) healthStatusEl.textContent = healthStatus;

    // 更新成就进度和鼓励语
    updateAchievementProgress(daysQuit);
    updateEncourageText(daysQuit);
    
    // 显示计算结果区域
    const progressResultEl = document.getElementById('progressResult');
    if (progressResultEl) progressResultEl.classList.remove('hidden');
    
    // 保存计算结果到历史记录
    const savedData = loadSavedData();
    savedData.history.push({
      date: new Date().toISOString().split('T')[0],
      daysQuit: daysQuit,
      moneySaved: moneySaved,
      cigAvoided: cigAvoided
    });
    // 只保留最近10条记录
    if (savedData.history.length > 10) {
      savedData.history = savedData.history.slice(-10);
    }
    // 保存表单数据
    savedData.form = {
      startDate: startDateVal,
      cigPerDay: cigPerDayVal,
      pricePerPack: pricePerPackVal,
      notes: document.getElementById('notes').value || ''
    };
    localStorage.setItem('quitSmokeData', JSON.stringify(savedData));
  };

  // 更新成就进度
  const updateAchievementProgress = (daysQuit) => {
    achievementConfig.forEach(achievement => {
      const progress = Math.min(100, (daysQuit / achievement.target) * 100);
      const progressBar = document.getElementById(`progress${achievement.id}`);
      const progressText = document.getElementById(`progressText${achievement.id}`);
      const achievementCard = document.getElementById(`achievement${achievement.id}`);
      
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progressText) progressText.textContent = `${daysQuit}/${achievement.target} 天`;
      
      // 成就达成样式
      if (daysQuit >= achievement.target && achievementCard) {
        achievementCard.classList.add(`border-${achievement.color}`, `bg-${achievement.color}/5`);
        achievementCard.classList.remove(`border-${achievement.color}/30`);
      }
    });
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

  // 处理打卡逻辑
  const handleCheckIn = () => {
    const savedData = loadSavedData();
    const today = new Date().toISOString().split('T')[0];
    
    // 检查是否已打卡
    if (savedData.checkIn.lastCheckInDate === today) {
      alert('今日已打卡！你超棒的，继续保持！');
      return;
    }
    
    // 计算连续打卡天数
    const lastDate = savedData.checkIn.lastCheckInDate;
    if (lastDate) {
      const lastCheckIn = new Date(lastDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastDate === yesterdayStr) {
        savedData.checkIn.continuousDays += 1;
      } else {
        savedData.checkIn.continuousDays = 1;
      }
    } else {
      savedData.checkIn.continuousDays = 1;
    }
    
    // 更新打卡信息
    savedData.checkIn.lastCheckInDate = today;
    savedData.checkIn.totalCheckInDays += 1;
    
    // 保存数据并更新UI
    saveData(savedData);
    alert('打卡成功！今天也是战胜烟瘾的一天，牛逼！');
  };

  // 更新打卡UI
  const updateCheckInUI = () => {
    const savedData = loadSavedData();
    const today = new Date().toISOString().split('T')[0];
    const checkInStatusEl = document.getElementById('checkInStatus');
    const continuousDaysEl = document.getElementById('continuousDays');
    const checkInBtnEl = document.getElementById('checkInBtn');
    
    // 更新打卡状态
    if (checkInStatusEl) {
      checkInStatusEl.textContent = savedData.checkIn.lastCheckInDate === today ? '已打卡 ✅' : '未打卡';
    }
    
    // 更新连续打卡天数
    if (continuousDaysEl) {
      continuousDaysEl.textContent = `${savedData.checkIn.continuousDays} 天`;
    }
    
    // 禁用已打卡的按钮
    if (checkInBtnEl) {
      if (savedData.checkIn.lastCheckInDate === today) {
        checkInBtnEl.disabled = true;
        checkInBtnEl.classList.add('bg-gray-400');
        checkInBtnEl.classList.remove('bg-primary');
      } else {
        checkInBtnEl.disabled = false;
        checkInBtnEl.classList.remove('bg-gray-400');
        checkInBtnEl.classList.add('bg-primary');
      }
    }
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

  // 绑定表单提交事件
  const bindFormSubmit = () => {
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
      trackForm.addEventListener('submit', function(e) {
        // 阻止表单默认提交（关键修复：防止页面刷新/清空）
        e.preventDefault();
        
        // 获取表单数据
        const startDate = document.getElementById('startDate').value;
        const cigPerDay = document.getElementById('cigPerDay').value;
        const pricePerPack = document.getElementById('pricePerPack').value;
        
        // 计算进度
        calculateProgress(startDate, cigPerDay, pricePerPack);
      });
    }
  };

  // 绑定打卡按钮事件
  const bindCheckInBtn = () => {
    const checkInBtn = document.getElementById('checkInBtn');
    if (checkInBtn) {
      checkInBtn.addEventListener('click', handleCheckIn);
    }
  };

  // 绑定保存/重置按钮事件
  const bindSaveResetBtn = () => {
    // 保存进度按钮
    const saveProgressBtn = document.getElementById('saveProgress');
    if (saveProgressBtn) {
      saveProgressBtn.addEventListener('click', function() {
        const savedData = loadSavedData();
        const startDate = document.getElementById('startDate').value;
        const cigPerDay = document.getElementById('cigPerDay').value;
        const pricePerPack = document.getElementById('pricePerPack').value;
        const notes = document.getElementById('notes').value;
        
        // 更新表单数据
        savedData.form = {
          startDate: startDate,
          cigPerDay: cigPerDay,
          pricePerPack: pricePerPack,
          notes: notes
        };
        
        saveData(savedData);
      });
    }
    
    // 重置记录按钮
    const resetProgressBtn = document.getElementById('resetProgress');
    if (resetProgressBtn) {
      resetProgressBtn.addEventListener('click', function() {
        if (confirm('确定要重置所有记录吗？此操作不可恢复！')) {
          localStorage.removeItem('quitSmokeData');
          // 重新初始化
          initForm();
          // 隐藏结果区域
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
