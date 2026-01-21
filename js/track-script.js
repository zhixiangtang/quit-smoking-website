// 全局常量定义
const STORAGE_KEY = 'quitSmokingUserData'; // 唯一存储键
const ENCOURAGE_TEXT_LIST = [
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

const ACHIEVEMENT_LIST = [
  { id: 7, color: "bronze", target: 7 },
  { id: 30, color: "silver", target: 30 },
  { id: 100, color: "gold", target: 100 },
  { id: 365, color: "primary", target: 365 }
];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化页面
  initPage();
  // 绑定事件
  bindAllEvents();
});

/**
 * 初始化页面：加载数据 + 渲染UI
 */
function initPage() {
  // 1. 加载本地存储数据（核心：确保数据永不丢失）
  const userData = loadUserData();
  
  // 2. 填充表单数据
  document.getElementById('startDate').value = userData.form.startDate || '';
  document.getElementById('cigPerDay').value = userData.form.cigPerDay || '';
  document.getElementById('pricePerPack').value = userData.form.pricePerPack || '';
  document.getElementById('notes').value = userData.form.notes || '';
  
  // 3. 锁定/解锁表单
  updateFormLockState(userData.isLocked);
  
  // 4. 如果有数据且已锁定，自动计算进度
  if (userData.isLocked && userData.form.startDate && userData.form.cigPerDay && userData.form.pricePerPack) {
    calculateProgress(
      userData.form.startDate,
      userData.form.cigPerDay,
      userData.form.pricePerPack,
      true // 静默计算，不重复锁定
    );
  }
}

/**
 * 加载用户数据（本地存储核心逻辑）
 * @returns {Object} 用户数据
 */
function loadUserData() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    // 默认数据结构（确保不会出现undefined）
    const defaultData = {
      form: {
        startDate: '',
        cigPerDay: '',
        pricePerPack: '',
        notes: ''
      },
      isLocked: false // 表单锁定状态
    };
    
    return rawData ? JSON.parse(rawData) : defaultData;
  } catch (error) {
    console.error('加载数据失败:', error);
    return {
      form: {},
      isLocked: false
    };
  }
}

/**
 * 保存用户数据（确保数据同步到本地存储）
 * @param {Object} newData 新数据
 */
function saveUserData(newData) {
  try {
    const oldData = loadUserData();
    const finalData = { ...oldData, ...newData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
    return true;
  } catch (error) {
    console.error('保存数据失败:', error);
    alert('数据保存失败，请检查浏览器存储权限！');
    return false;
  }
}

/**
 * 更新表单锁定状态
 * @param {boolean} isLocked 是否锁定
 */
function updateFormLockState(isLocked) {
  // 表单元素列表
  const formElements = [
    'startDate', 'cigPerDay', 'pricePerPack', 'notes', 'calculateBtn'
  ];
  
  formElements.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    
    el.disabled = isLocked;
    
    // 添加/移除样式
    if (isLocked) {
      el.classList.add('bg-gray-100', 'cursor-not-allowed');
      if (id === 'calculateBtn') {
        el.textContent = '已计算进度（不可修改）';
        el.classList.remove('bg-primary');
        el.classList.add('bg-gray-400');
      }
    } else {
      el.classList.remove('bg-gray-100', 'cursor-not-allowed');
      if (id === 'calculateBtn') {
        el.textContent = '计算我的戒烟进度';
        el.classList.add('bg-primary');
        el.classList.remove('bg-gray-400');
      }
    }
  });
}

/**
 * 计算戒烟进度
 * @param {string} startDate 开始日期
 * @param {string} cigPerDay 每日吸烟量
 * @param {string} pricePerPack 每包价格
 * @param {boolean} silent 是否静默计算（不提示、不锁定）
 */
function calculateProgress(startDate, cigPerDay, pricePerPack, silent = false) {
  // 非静默计算时验证输入
  if (!silent) {
    if (!startDate || !cigPerDay || !pricePerPack) {
      alert('请填写完整的戒烟信息！');
      return;
    }
    
    const cigNum = parseInt(cigPerDay);
    const priceNum = parseFloat(pricePerPack);
    
    if (isNaN(cigNum) || cigNum < 1 || isNaN(priceNum) || priceNum < 0.01) {
      alert('输入错误：每日吸烟量≥1，香烟价格≥0.01！');
      return;
    }
  }
  
  // 计算核心数据
  const start = new Date(startDate);
  const today = new Date();
  const timeDiff = today - start;
  const daysQuit = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  const packsPerDay = parseInt(cigPerDay) / 20;
  const moneySaved = (packsPerDay * parseFloat(pricePerPack) * daysQuit).toFixed(2);
  
  // 更新UI
  document.getElementById('totalDaysQuit').textContent = `${daysQuit} 天`;
  document.getElementById('totalMoneySaved').textContent = `¥${moneySaved}`;
  
  // 更新成就进度
  updateAchievementProgress(daysQuit);
  
  // 更新鼓励语
  updateEncourageText(daysQuit);
  
  // 非静默计算：锁定表单 + 保存数据
  if (!silent) {
    // 锁定表单
    updateFormLockState(true);
    // 保存数据
    saveUserData({
      form: {
        startDate: startDate,
        cigPerDay: cigPerDay,
        pricePerPack: pricePerPack,
        notes: document.getElementById('notes').value || ''
      },
      isLocked: true
    });
    
    alert('戒烟进度计算完成！表单已锁定，如需修改请点击「重置记录」。');
  }
}

/**
 * 更新成就进度
 * @param {number} daysQuit 无烟天数
 */
function updateAchievementProgress(daysQuit) {
  ACHIEVEMENT_LIST.forEach(item => {
    const progress = Math.min(100, (daysQuit / item.target) * 100);
    // 更新进度条
    const progressBar = document.getElementById(`progress${item.id}`);
    if (progressBar) progressBar.style.width = `${progress}%`;
    // 更新进度文本
    const progressText = document.getElementById(`progressText${item.id}`);
    if (progressText) progressText.textContent = `${daysQuit}/${item.target} 天`;
    // 更新成就卡片样式
    const achievementCard = document.getElementById(`achievement${item.id}`);
    if (achievementCard && daysQuit >= item.target) {
      achievementCard.classList.add(`border-${item.color}`, `bg-${item.color}/5`);
      achievementCard.classList.remove(`border-${item.color}/30`);
    }
  });
}

/**
 * 更新鼓励语
 * @param {number} daysQuit 无烟天数
 */
function updateEncourageText(daysQuit) {
  const encourageEl = document.getElementById('encourageText');
  if (!encourageEl) return;
  
  let text = ENCOURAGE_TEXT_LIST[0].text;
  for (let i = ENCOURAGE_TEXT_LIST.length - 1; i >= 0; i--) {
    if (daysQuit >= ENCOURAGE_TEXT_LIST[i].days) {
      text = ENCOURAGE_TEXT_LIST[i].text;
      break;
    }
  }
  
  encourageEl.textContent = text;
}

/**
 * 重置所有记录
 */
function resetAllData() {
  if (!confirm('确定要重置所有记录吗？此操作不可恢复！')) {
    return;
  }
  
  // 1. 清空本地存储
  localStorage.removeItem(STORAGE_KEY);
  
  // 2. 清空表单
  document.getElementById('trackForm').reset();
  
  // 3. 解锁表单
  updateFormLockState(false);
  
  // 4. 重置UI
  document.getElementById('totalDaysQuit').textContent = '0 天';
  document.getElementById('totalMoneySaved').textContent = '¥0.00';
  updateAchievementProgress(0);
  updateEncourageText(0);
  
  alert('所有记录已重置！你可以重新录入戒烟信息。');
}

/**
 * 绑定所有页面事件
 */
function bindAllEvents() {
  // 1. 表单提交事件
  document.getElementById('trackForm').addEventListener('submit', function(e) {
    e.preventDefault(); // 阻止默认提交
    
    // 检查表单是否已锁定
    const userData = loadUserData();
    if (userData.isLocked) {
      alert('表单已锁定，如需修改请点击「重置记录」按钮！');
      return;
    }
    
    // 获取表单数据
    const startDate = document.getElementById('startDate').value;
    const cigPerDay = document.getElementById('cigPerDay').value;
    const pricePerPack = document.getElementById('pricePerPack').value;
    
    // 计算进度
    calculateProgress(startDate, cigPerDay, pricePerPack);
  });
  
  // 2. 重置按钮点击事件
  document.getElementById('resetBtn').addEventListener('click', resetAllData);
}
