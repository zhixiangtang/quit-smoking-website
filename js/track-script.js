// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 阶梯式激进鼓励语配置（核心新增）
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

  // 成就配置（核心新增）
  const achievementConfig = [
    { id: 7, name: "青铜戒烟者", color: "bronze", target: 7 },
    { id: 30, name: "白银戒烟者", color: "silver", target: 30 },
    { id: 100, name: "黄金戒烟者", color: "gold", target: 100 },
    { id: 365, name: "戒烟大师", color: "primary", target: 365 }
  ];

  // 从本地存储加载数据
  const loadSavedData = () => {
    const savedData = localStorage.getItem('quitSmokeData');
    return savedData ? JSON.parse(savedData) : {
      form: {},
      history: [],
      checkIn: {
        lastCheckInDate: '', // 最后打卡日期
        continuousDays: 0,   // 连续打卡天数
        totalCheckInDays: 0   // 总打卡天数
      }
    };
  };

  // 保存数据到本地存储
  const saveData = (data) => {
    localStorage.setItem('quitSmokeData', JSON.stringify(data));
    // 更新页面显示
    updateCheckInUI();
    updateAchievementUI();
    updateEncourageText();
    // 显示保存成功提示
    alert('进度保存成功！数据已存储在本地，不会丢失');
    // 加载历史记录
    loadHistory();
  };

  // 加载历史记录
  const loadHistory = () => {
    const savedData = loadSavedData();
    const historyList = document.getElementById('historyList');
    const historySection = document.getElementById('historySection');
    
    if (savedData && savedData.history && savedData.history.length > 0) {
      historySection.classList.remove('hidden');
      historyList.innerHTML = '';
      
      savedData.history.forEach((item, index) => {
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

  // 初始化表单（加载已保存的数据）
  const initForm = () => {
    const savedData = loadSavedData();
    if (savedData && savedData.form) {
      document.getElementById('startDate').value = savedData.form.startDate || '';
      document.getElementById('cigPerDay').value = savedData.form.cigPerDay || '';
      document.getElementById('pricePerPack').value = savedData.form.pricePerPack || '';
      document.getElementById('notes').value = savedData.form.notes || '';
      
      // 自动计算进度
      if (savedData.form.startDate) {
        calculateProgress(
          savedData.form.startDate, 
          savedData.form.cigPerDay, 
          savedData.form.pricePerPack
        );
      }
    }
    // 初始化打卡UI
    updateCheckInUI();
    // 初始化成就UI
    updateAchievementUI();
    // 初始化鼓励语
    updateEncourageText();
    // 加载历史记录
    loadHistory();
  };

  // 计算戒烟进度
  const calculateProgress = (startDateVal, cigPerDayVal, pricePerPackVal) => {
    // 解析参数
    const startDate = new Date(startDateVal);
    const cigPerDay = parseInt(cigPerDayVal);
    const pricePerPack = parseFloat(pricePerPackVal);
    
    // 计算无烟天数
    const today = new Date();
    const timeDiff = today - startDate;
    const daysQuit = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    
    // 计算节省的钱（按20支/包计算）
    const packsPerDay = cigPerDay / 20;
    const moneySaved = (packsPerDay * pricePerPack * daysQuit).toFixed(2);
    
    // 计算少抽的香烟数量
    const cigAvoided = cigPerDay * daysQuit;
    
    // 健康状态判断
    let healthStatus = '';
    if (daysQuit < 1) {
      healthStatus = '今天就开启你的戒烟之旅吧！';
    } else if (daysQuit < 7) {
      healthStatus = '尼古丁正在离开你的身体 - 做得很棒！';
    } else if (daysQuit < 30) {
      healthStatus = '你的肺功能正在改善，呼吸更顺畅了！';
    } else if (daysQuit < 90) {
      healthStatus = '恭喜！你已经度过最难熬的阶段，烟瘾基本消失。';
    } else if (daysQuit < 365) {
      healthStatus = '你的心脏病风险已降低一半，身体状态大幅提升！';
    } else {
      healthStatus = '太棒了！你的身体已完全恢复，远离吸烟的伤害。';
    }
    
    // 更新页面显示
    document.getElementById('daysQuit').textContent = daysQuit;
    document.getElementById('moneySaved').textContent = `¥${moneySaved}`;
    document.getElementById('cigAvoided').textContent = `${cigAvoided} 支`;
    document.getElementById('healthStatus').textContent = healthStatus;
    document.getElementById('totalDaysQuit').textContent = daysQuit;
    document.getElementById('totalMoneySaved').textContent = `¥${moneySaved}`;
    
    // 更新成就进度
    updateAchievementProgress(daysQuit);
    // 更新鼓励语
    updateEncourageText(daysQuit);
    
    // 显示结果区
    document.getElementById('progressResult').classList.remove('hidden');
  };

  // 新增：更新成就进度
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
        achievementCard.classList.add('border-' + achievement.color, 'bg-' + achievement.color + '/5');
        achievementCard.classList.remove('border-' + achievement.color + '/30');
      }
    });
  };

  // 新增：更新鼓励语（阶梯式激进）
  const updateEncourageText = (daysQuit = 0) => {
    const encourageText = document.getElementById('encourageText');
    if (!encourageText) return;
    
    // 找到匹配的鼓励语（取最大天数的配置）
    let matchedText = encourageConfig[0].text;
    for (let i = encourageConfig.length - 1; i >= 0; i--) {
      if (daysQuit >= encourageConfig[i].days) {
        matchedText = encourageConfig[i].text;
        break;
      }
    }
    
    encourageText.textContent = matchedText;
  };

  // 新增：打卡功能核心逻辑
  const handleCheckIn = () => {
    const savedData = loadSavedData();
    const today = new Date().toISOString().split('T')[0]; // 今日日期（YYYY-MM-DD）
    
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
      
      // 连续打卡
      if (lastDate === yesterdayStr) {
        savedData.checkIn.continuousDays += 1;
      } else {
        // 断签重置
        savedData.checkIn.continuousDays = 1;
      }
    } else {
      // 首次打卡
      savedData.checkIn.continuousDays = 1;
    }
    
    // 更新打卡数据
    savedData.checkIn.lastCheckInDate = today;
    savedData.checkIn.totalCheckInDays += 1;
    
    // 保存数据
    saveData(savedData);
    alert('打卡成功！今天也是战胜烟瘾的一天，牛逼！');
  };

  // 新增：更新打卡UI
  const updateCheckInUI = () => {
    const savedData = loadSavedData();
    const today = new Date().toISOString().split('T')[0];
    const checkInStatus = document.getElementById('checkInStatus');
    const continuousDays = document.getElementById('continuousDays');
    const checkInBtn = document.getElementById('checkInBtn');
    
    // 更新打卡状态
    if (savedData.checkIn.lastCheckInDate === today) {
      if (checkInStatus) checkInStatus.textContent = '已打卡 ✅';
      if (checkInBtn) checkInBtn.disabled = true;
      if (checkInBtn) checkInBtn.classList.add('bg-gray-400');
      if (checkInBtn) checkInBtn.classList.remove('bg-primary');
    } else {
      if (checkInStatus) checkInStatus.textContent = '未打卡';
      if (checkInBtn) checkInBtn.disabled = false;
      if (checkInBtn) checkInBtn.classList.remove('bg-gray-400');
      if (checkInBtn) checkInBtn.classList.add('bg-primary');
    }
    
    // 更新连续打卡天数
    if (continuousDays) continuousDays.textContent = `${savedData.checkIn.continuousDays} 天`;
  };

  // 表单提交事件
  document.getElementById('trackForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 获取表单值
    const startDate = document.getElementById('startDate').value;
    const cigPerDay = document.getElementById('cigPerDay').value;
    const pricePerPack = document.getElementById('pricePerPack').value;
    
    // 计算进度
    calculateProgress(startDate, cigPerDay, pricePerPack);
    
    // 保存表单数据
    const savedData = loadSavedData();
    savedData.form = {
      startDate,
      cigPerDay,
      pricePerPack,
      notes: document.getElementById('notes').value || ''
    };
    
    // 添加到历史记录
    savedData.history.unshift({
      date: new Date().toISOString(),
      daysQuit: document.getElementById('daysQuit').textContent,
      moneySaved: document.getElementById('moneySaved').textContent.replace('¥', ''),
      cigAvoided: document.getElementById('cigAvoided').textContent.replace(' 支', '')
    });
    
    // 只保留最近10条记录
    if (savedData.history.length > 10) {
      savedData.history = savedData.history.slice(0, 10);
    }
    
    // 保存数据
    saveData(savedData);
    
    // 滚动到结果区
    document.getElementById('progressResult').scrollIntoView({ behavior: 'smooth' });
  });

  // 保存进度按钮事件
  document.getElementById('saveProgress')?.addEventListener('click', function() {
    const savedData = loadSavedData();
    savedData.form = {
      startDate: document.getElementById('startDate').value,
      cigPerDay: document.getElementById('cigPerDay').value,
      pricePerPack: document.getElementById('pricePerPack').value,
      notes: document.getElementById('notes').value || ''
    };
    
    // 更新历史记录
    savedData.history.unshift({
      date: new Date().toISOString(),
      daysQuit: document.getElementById('daysQuit').textContent,
      moneySaved: document.getElementById('moneySaved').textContent.replace('¥', ''),
      cigAvoided: document.getElementById('cigAvoided').textContent.replace(' 支', '')
    });
    
    if (savedData.history.length > 10) {
      savedData.history = savedData.history.slice(0, 10);
    }
    
    saveData(savedData);
  });

  // 重置记录按钮事件
  document.getElementById('resetProgress')?.addEventListener('click', function() {
    if (confirm('确定要重置所有戒烟记录吗？此操作不可恢复！')) {
      localStorage.removeItem('quitSmokeData');
      document.getElementById('trackForm').reset();
      document.getElementById('progressResult').classList.add('hidden');
      document.getElementById('historySection').classList.add('hidden');
      
      // 重置UI
      document.getElementById('totalDaysQuit').textContent = '0 天';
      document.getElementById('totalMoneySaved').textContent = '¥0.00';
      document.getElementById('continuousDays').textContent = '0 天';
      document.getElementById('checkInStatus').textContent = '未打卡';
      updateAchievementProgress(0);
      updateEncourageText(0);
      
      alert('记录已重置！你可以重新开始记录戒烟旅程。');
    }
  });

  // 绑定打卡按钮事件
  document.getElementById('checkInBtn')?.addEventListener('click', handleCheckIn);

  // 初始化页面
  initForm();
});
