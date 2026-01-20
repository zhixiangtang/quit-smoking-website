// 语言切换核心逻辑
let currentLang = 'en'; // 默认英文

// 根据语言路径获取对应文本
function getLangValue(key) {
  return key.split('.').reduce((obj, k) => obj && obj[k] ? obj[k] : key, window.lang[currentLang]);
}

// 初始化/切换页面语言
function initLang() {
  // 更新所有带data-lang属性的元素文本
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    const value = getLangValue(key);
    if (value) el.textContent = value;
  });
  
  // 适配金额显示（中文显示 元，英文显示 $）
  const priceLabel = document.querySelector('[data-lang="track.form3"]');
  const moneySaved = document.getElementById('moneySaved');
  
  if (priceLabel) {
    const baseLabel = getLangValue('track.form3');
    priceLabel.textContent = currentLang === 'en' ? `${baseLabel} ($)` : `${baseLabel}（元）`;
  }
  
  if (moneySaved && moneySaved.textContent) {
    const amount = moneySaved.textContent.replace(/[$|元]/g, '').trim();
    if (!isNaN(parseFloat(amount))) {
      moneySaved.textContent = currentLang === 'en' ? `$${amount}` : `${amount}元`;
    }
  }
}

// 绑定语言切换按钮事件
document.getElementById('langEn')?.addEventListener('click', () => {
  currentLang = 'en';
  initLang();
  // 记录用户语言选择到后端
  fetch(`/set-lang?lang=${currentLang}`).catch(err => console.log('记录语言失败：', err));
});

document.getElementById('langZh')?.addEventListener('click', () => {
  currentLang = 'zh';
  initLang();
  // 记录用户语言选择到后端
  fetch(`/set-lang?lang=${currentLang}`).catch(err => console.log('记录语言失败：', err));
});

// 表单提交处理 - 计算戒烟进度
document.getElementById('trackForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // 获取表单值
  const startDate = new Date(document.getElementById('startDate').value);
  const cigPerDay = parseInt(document.getElementById('cigPerDay').value);
  const pricePerPack = parseFloat(document.getElementById('pricePerPack').value);
  
  // 计算天数差
  const today = new Date();
  const timeDiff = today - startDate;
  const daysQuit = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  
  // 计算节省的钱（假设一包20支）
  const packsPerDay = cigPerDay / 20;
  const moneySaved = (packsPerDay * pricePerPack * daysQuit).toFixed(2);
  
  // 健康状态提示（多语言适配）
  let healthStatusEn = '';
  let healthStatusZh = '';
  
  if (daysQuit < 1) {
    healthStatusEn = 'Start your quit journey today!';
    healthStatusZh = '今天就开启你的戒烟之旅吧！';
  } else if (daysQuit < 7) {
    healthStatusEn = 'Nicotine is leaving your body - great job!';
    healthStatusZh = '尼古丁正在离开你的身体 - 做得很棒！';
  } else if (daysQuit < 30) {
    healthStatusEn = 'Your lung function is improving!';
    healthStatusZh = '你的肺功能正在改善！';
  } else if (daysQuit < 365) {
    healthStatusEn = 'Your risk of heart attack is much lower now!';
    healthStatusZh = '你患心脏病的风险已经大大降低！';
  } else {
    healthStatusEn = 'Amazing! Your body has fully recovered from smoking damage.';
    healthStatusZh = '太棒了！你的身体已经从吸烟的伤害中完全恢复。';
  }
  
  // 设置健康状态文本
  const healthStatus = currentLang === 'en' ? healthStatusEn : healthStatusZh;
  document.getElementById('healthStatus').textContent = healthStatus;
  
  // 显示结果
  document.getElementById('daysQuit').textContent = daysQuit;
  document.getElementById('moneySaved').textContent = currentLang === 'en' ? `$${moneySaved}` : `${moneySaved}元`;
  document.getElementById('progressResult').classList.remove('hidden');
  
  // 滚动到结果区
  document.getElementById('progressResult').scrollIntoView({ behavior: 'smooth' });
});

// 移动端导航菜单切换
document.querySelector('.fa-bars')?.addEventListener('click', function() {
  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('active');
  }
});

// 页面加载初始化
window.addEventListener('load', function() {
  initLang(); // 初始化语言
  document.body.classList.add('loaded');
});
