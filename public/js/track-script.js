// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 语言切换逻辑
  let currentLang = 'en';

  function getLangValue(key) {
    if (!window.lang || !window.lang[currentLang]) return key;
    return key.split('.').reduce((obj, k) => obj && obj[k] ? obj[k] : key, window.lang[currentLang]);
  }

  function initLang() {
    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.getAttribute('data-lang');
      const value = getLangValue(key);
      if (value) el.textContent = value;
    });

    // 适配金额单位
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

  // 绑定语言切换按钮
  document.getElementById('langEn')?.addEventListener('click', () => {
    currentLang = 'en';
    initLang();
    fetch(`/set-lang?lang=${currentLang}`).catch(err => console.log('记录语言失败：', err));
  });

  document.getElementById('langZh')?.addEventListener('click', () => {
    currentLang = 'zh';
    initLang();
    fetch(`/set-lang?lang=${currentLang}`).catch(err => console.log('记录语言失败：', err));
  });

  // 表单提交逻辑
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
    
    // 计算节省的钱（20支/包）
    const packsPerDay = cigPerDay / 20;
    const moneySaved = (packsPerDay * pricePerPack * daysQuit).toFixed(2);
    
    // 计算少抽的香烟数量
    const cigAvoided = cigPerDay * daysQuit;
    
    // 健康状态多语言
    let healthStatusEn = '', healthStatusZh = '';
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
    
    // 更新结果
    document.getElementById('daysQuit').textContent = daysQuit;
    document.getElementById('moneySaved').textContent = currentLang === 'en' ? `$${moneySaved}` : `${moneySaved}元`;
    document.getElementById('cigAvoided').textContent = cigAvoided;
    document.getElementById('healthStatus').textContent = currentLang === 'en' ? healthStatusEn : healthStatusZh;
    
    // 显示结果区
    document.getElementById('progressResult').classList.remove('hidden');
    document.getElementById('progressResult').scrollIntoView({ behavior: 'smooth' });
  });

  // 保存进度按钮事件
  document.getElementById('saveProgress')?.addEventListener('click', function() {
    alert(currentLang === 'en' ? 'Progress saved successfully!' : '进度保存成功！');
  });

  // 初始化语言
  initLang();
});
