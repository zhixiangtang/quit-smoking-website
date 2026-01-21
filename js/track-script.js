document.addEventListener('DOMContentLoaded', function() {
  // 全局状态：标记表单是否已锁定
  let isFormLocked = false;
  
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
        isFormLocked: false // 新增：表单锁定状态
      };
      const data = savedData ? JSON.parse(savedData) : defaultData;
      // 同步全局锁定状态
      isFormLocked = data.isFormLocked || false;
      return data;
    } catch (e) {
      console.error('加载数据失败:', e);
      return {
        form: {},
        history: [],
        isFormLocked: false
      };
    }
  };

  // 保存数据到本地存储
  const saveData = (data = {}) => {
    try {
      const savedData = loadSavedData();
      const newData = { ...savedData, ...data, isFormLocked: isFormLocked };
      localStorage.setItem('quitSmokeData', JSON.stringify(newData));
      updateAchievementUI();
      updateEncourageText();
      return true;
    } catch (e) {
      console.error('保存数据失败:', e);
      alert('保存失败，请检查浏览器存储权限！');
      return false;
    }
  };

  // 初始化表单数据
  const initForm = () => {
    const savedData = loadSavedData();
    const startDateEl = document.getElementById('startDate');
    const cigPerDayEl = document.getElementById('cigPerDay');
    const pricePerPackEl = document.getElementById('pricePerPack');
    const notesEl = document.getElementById('notes');
    const calculateBtn = document.getElementById('calculateBtn');

    // 填充已保存的表单数据
    if (savedData && savedData.form) {
      if (startDateEl) startDateEl.value = savedData.form.startDate || '';
      if (cigPerDayEl) cigPerDayEl.value = savedData.form.cigPerDay || '';
      if (pricePerPackEl) pricePerPackEl.value = savedData.form.pricePerPack || '';
      if (notesEl) notesEl.value = savedData.form.notes || '';
      
      // 如果有保存的表单数据且表单已锁定，直接计算进度
      if (savedData.form.startDate && savedData.form.cigPerDay && savedData.form.pricePerPack && isFormLocked) {
        calculateProgress(
          savedData.form.startDate, 
          savedData.form.cigPerDay, 
          savedData.form.pricePerPack,
          true // 静默计算，不重复锁定
        );
      }
    }

    // 根据锁定状态更新表单UI
    updateFormLockState();
    
    // 初始化其他UI
    updateAchievementUI();
    updateEncourageText();
    
    // 绑定事件
    bindEvents();
  };

  // 锁定/解锁表单
  const updateFormLockState = () => {
    const formElements = [
      document.getElementById('startDate'),
      document.getElementById('cigPerDay'),
      document.getElementById('pricePerPack'),
      document.getElementById('notes'),
      document.getElementById('calculateBtn')
    ];

    formElements.forEach(el => {
      if (el) {
        // 锁定状态：禁用输入框和计算按钮
        el.disabled = isFormLocked;
        if (isFormLocked) {
          el.classList.add('bg-gray-100', 'cursor-not-allowed');
          if (el.tagName === 'BUTTON') {
            el.textContent = '已计算进度（不可修改）';
            el.classList.remove('bg-primary');
            el.classList.add('bg-gray-400');
          }
        } else {
          el.classList.remove('bg-gray-100', 'cursor-not-allowed');
          if (el.tagName === 'BUTTON') {
            el.textContent = '计算我的戒烟进度';
            el.classList.add('bg-primary');
            el.classList.remove('bg-gray-400');
          }
        }
      }
    });
  };

  // 计算戒烟进度
  const calculateProgress = (startDateVal, cigPerDayVal, pricePerPackVal, silent = false) => {
    if (!silent) {
      // 非静默计算：验证输入
      if (!startDateVal || !cigPerDayVal || !pricePerPackVal) {
        alert('请填写完整的戒烟信息！');
        return;
      }

      const cigPerDay = parseInt(cigPerDayVal);
      const pricePerPack = parseFloat(pricePerPackVal);
      
      if (isNaN(cigPerDay) || isNaN(pricePerPack) || cigPerDay < 1 || pricePerPack < 0.01) {
        alert('请输入有效的数值！每日吸烟量需≥1，香烟价格需≥0.01');
        return;
      }

      // 锁定表单（核心逻辑）
      isFormLocked = true;
      updateFormLockState();
    }

    const startDate = new Date(startDateVal);
    const cigPerDay = parseInt(cigPerDayVal);
    const pricePerPack = parseFloat(pricePerPackVal);
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
    
    if (!silent) {
      // 保存表单数据和锁定状态
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
      savedData.isFormLocked = isFormLocked;
      saveData(savedData);
      
      alert('戒烟进度计算完成！表单已锁定，如需修改请点击「重置记录」按钮。');
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

  // 重置所有记录（解锁表单）
  const resetAllData = () => {
    if (confirm('确定要重置所有记录吗？此操作不可恢复！')) {
      // 重置全局状态
      isFormLocked = false;
      // 清空本地存储
      localStorage.removeItem('quitSmokeData');
      // 重置表单UI
      updateFormLockState();
      // 清空表单值
      const formElements = [
        document.getElementById('startDate'),
        document.getElementById('cigPerDay'),
        document.getElementById('pricePerPack'),
        document.getElementById('notes')
      ];
      formElements.forEach(el => {
        if (el) el.value = '';
      });
      // 隐藏结果区域
      const progressResultEl = document.getElementById('progressResult');
      if (progressResultEl) progressResultEl.classList.add('hidden');
      // 重置成就进度
      achievementConfig.forEach(achievement => {
        const progressBar = document.getElementById(`progress${achievement.id}`);
        const progressText = document.getElementById(`progressText${achievement.id}`);
        if (progressBar) progressBar.style.width = '0%';
        if (progressText) progressText.textContent = `0/${achievement.target} 天`;
      });
      // 重置鼓励语
      updateEncourageText(0);
      // 重置顶部数据
      const totalDaysQuitEl = document.getElementById('totalDaysQuit');
      const totalMoneySavedEl = document.getElementById('totalMoneySaved');
      if (totalDaysQuitEl) totalDaysQuitEl.textContent = '0 天';
      if (totalMoneySavedEl) totalMoneySavedEl.textContent = '¥0.00';
      
      alert('所有记录已重置！你可以重新录入戒烟信息。');
    }
  };

  // 绑定所有事件
  const bindEvents = () => {
    // 表单提交事件
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
      trackForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止默认提交
        
        // 如果表单已锁定，直接返回
        if (isFormLocked) {
          alert('表单已锁定，如需修改请点击「重置记录」按钮！');
          return;
        }
        
        // 获取表单数据
        const startDate = document.getElementById('startDate').value;
        const cigPerDay = document.getElementById('cigPerDay').value;
        const pricePerPack = document.getElementById('pricePerPack').value;
        
        // 计算进度（自动锁定表单）
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
        
        // 更新表单数据
        savedData.form = {
          startDate: startDate,
          cigPerDay: cigPerDay,
          pricePerPack: pricePerPack,
          notes: notes
        };
        savedData.isFormLocked = isFormLocked;
        
        saveData(savedData);
        alert('进度保存成功！');
      });
    }

    // 重置记录按钮（核心：解锁表单）
    const resetProgressBtn = document.getElementById('resetProgress');
    if (resetProgressBtn) {
      resetProgressBtn.addEventListener('click', resetAllData);
    }
  };

  // 初始化页面
  initForm();
});
