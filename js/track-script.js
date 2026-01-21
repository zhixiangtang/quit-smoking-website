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

  // 加载本地存储数据（核心修复：确保数据不丢失）
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
        isFormLocked: false // 表单锁定状态
      };
      const data = savedData ? JSON.parse(savedData) : defaultData;
      // 同步全局状态（关键：修复返回首页后状态丢失）
      isFormLocked = data.isFormLocked || false;
      return data;
    } catch (e) {
      console.error('加载数据失败:', e);
      return {
        form: {},
        isFormLocked: false
      };
    }
  };

  // 保存数据到本地存储（确保所有状态同步）
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

  // 初始化表单数据（核心修复：加载数据后自动计算进度）
  const initForm = () => {
    const savedData = loadSavedData();
    const startDateEl = document.getElementById('startDate');
    const cigPerDayEl = document.getElementById('cigPerDay');
    const pricePerPackEl = document.getElementById('pricePerPack');
    const notesEl = document.getElementById('notes');
    const calculateBtn = document.getElementById('calculateBtn');

    // 填充已保存的表单数据（关键：修复返回首页后数据丢失）
    if (savedData && savedData.form) {
      if (startDateEl) startDateEl.value = savedData.form.startDate || '';
      if (cigPerDayEl) cigPerDayEl.value = savedData.form.cigPerDay || '';
      if (pricePerPackEl) pricePerPackEl.value = savedData.form.pricePerPack || '';
      if (notesEl) notesEl.value = savedData.form.notes || '';
      
      // 有数据且表单已锁定 → 自动计算进度（无需手动点击）
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

  // 计算戒烟进度（移除成果展示相关逻辑）
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

      // 锁定表单
      isFormLocked = true;
      updateFormLockState();
    }

    const startDate = new Date(startDateVal);
    const cigPerDay = parseInt(cigPerDayVal);
    const pricePerPack = parseFloat(pricePerPackVal);
    const today = new Date();
    const timeDiff = today - startDate;
    const daysQuit = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    
    const packsPerDay = cigPerDay / 20;
    const moneySaved = (packsPerDay * pricePerPack * daysQuit).toFixed(2);
    
    // 仅更新顶部核心数据（移除成果展示区更新）
    const totalDaysQuitEl = document.getElementById('totalDaysQuit');
    const totalMoneySavedEl = document.getElementById('totalMoneySaved');

    if (totalDaysQuitEl) totalDaysQuitEl.textContent = daysQuit;
    if (totalMoneySavedEl) totalMoneySavedEl.textContent = `¥${moneySaved}`;

    // 更新成就进度和鼓励语
    updateAchievementProgress(daysQuit);
    updateEncourageText(daysQuit);
    
    if (!silent) {
      // 保存数据（关键：确保返回首页后数据不丢失）
      const savedData = loadSavedData();
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

  // 重置所有记录
  const resetAllData = () => {
    if (confirm('确定要重置所有记录吗？此操作不可恢复！')) {
      isFormLocked = false;
      localStorage.removeItem('quitSmokeData');
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
      
      // 重置顶部数据和成就
      const totalDaysQuitEl = document.getElementById('totalDaysQuit');
      const totalMoneySavedEl = document.getElementById('totalMoneySaved');
      if (totalDaysQuitEl) totalDaysQuitEl.textContent = '0 天';
      if (totalMoneySavedEl) totalMoneySavedEl.textContent = '¥0.00';
      
      achievementConfig.forEach(achievement => {
        const progressBar = document.getElementById(`progress${achievement.id}`);
        const progressText = document.getElementById(`progressText${achievement.id}`);
        if (progressBar) progressBar.style.width = '0%';
        if (progressText) progressText.textContent = `0/${achievement.target} 天`;
      });
      
      updateEncourageText(0);
      alert('所有记录已重置！你可以重新录入戒烟信息。');
    }
  };

  // 绑定事件
  const bindEvents = () => {
    // 表单提交事件
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
      trackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (isFormLocked) {
          alert('表单已锁定，如需修改请点击「重置记录」按钮！');
          return;
        }
        
        const startDate = document.getElementById('startDate').value;
        const cigPerDay = document.getElementById('cigPerDay').value;
        const pricePerPack = document.getElementById('pricePerPack').value;
        
        calculateProgress(startDate, cigPerDay, pricePerPack);
      });
    }

    // 重置按钮事件
    const resetProgressBtn = document.getElementById('resetProgress');
    if (resetProgressBtn) {
      resetProgressBtn.addEventListener('click', resetAllData);
    }
  };

  // 初始化页面（确保加载数据后自动计算）
  initForm();
});
