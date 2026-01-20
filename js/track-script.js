document.addEventListener('DOMContentLoaded', function() {
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

  const achievementConfig = [
    { id: 7, name: "青铜戒烟者", color: "bronze", target: 7 },
    { id: 30, name: "白银戒烟者", color: "silver", target: 30 },
    { id: 100, name: "黄金戒烟者", color: "gold", target: 100 },
    { id: 365, name: "戒烟大师", color: "primary", target: 365 }
  ];

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
    updateCheckInUI();
    updateAchievementUI();
    updateEncourageText();
    loadHistory();
  };

  const calculateProgress = (startDateVal, cigPerDayVal, pricePerPackVal) => {
    if (!startDateVal || !cigPerDayVal || !pricePerPackVal) {
      alert('请填写完整的戒烟信息！');
      return;
    }

    const startDate = new Date(startDateVal);
    const cigPerDay = parseInt(cigPerDayVal);
    const pricePerPack = parseFloat(pricePerPackVal);
    
    if (isNaN(cigPerDay) || isNaN(pricePerPack) || cigPerDay < 1 || pricePerPack < 0.01) {
      alert('请输入有效的数值！');
      return;
    }
    
    const today = new Date();
    const timeDiff = today - startDate;
    const daysQuit = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    
    const packsPerDay = cigPerDay / 20;
    const moneySaved = (packsPerDay * pricePerPack * daysQuit).toFixed(2);
    const cigAvoided = cigPerDay * daysQuit;
    
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
  };

  const updateAchievementProgress = (daysQuit) => {
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

  const handleCheckIn = () => {
    const savedData = loadSavedData();
    const today = new Date().toISOString().split('T')[0];
    
    if (savedData.checkIn.lastCheckInDate === today) {
      alert('今日已打卡！你超棒的，继续保持！');
      return;
    }
    
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
    
    savedData.checkIn.lastCheckInDate = today;
    savedData.checkIn.totalCheckInDays += 1;
    
    saveData(savedData);
    alert('打卡成功！今天也是战胜烟瘾的一天，牛逼！');
  };

  const updateCheckInUI = () => {
    const savedData = loadSavedData();
    const today = new Date().toISOString().split('T')[0];
    const checkInStatusEl = document.getElementById('checkInStatus');
    const continuousDaysEl = document.getElementById('continuousDays');
    const checkInBtnEl = document.getElementById('checkInBtn');
    
    if (checkInStatusEl) {
      checkInStatusEl.textContent = savedData.checkIn.lastCheckInDate === today ? '已打卡 ✅' : '未打卡';
    }
    
    if (continuousDaysEl) {
      continuousDaysEl.textContent = `${savedData.checkIn.continuousDays} 天`;
    }
    
    if (checkInBtnEl) {
      if (savedData.checkIn.lastCheckInDate === today) {
        checkInBtnEl.disabled = true;
        checkInBtnEl.classList.add('bg-gray-400');
        checkInBtnEl.classList.remove('bg-primary');
      } else {
        checkInBtnEl.disabled = false;
        checkInBtnEl.classList.remove
