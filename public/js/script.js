// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
  // 语言切换核心逻辑
  let currentLang = 'en'; // 默认英文

  // 安全获取语言值
  function getLangValue(key) {
    if (!window.lang || !window.lang[currentLang]) return key;
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
  }

  // 绑定语言切换按钮事件（健壮性处理）
  const langEnBtn = document.getElementById('langEn');
  const langZhBtn = document.getElementById('langZh');
  
  if (langEnBtn) {
    langEnBtn.addEventListener('click', () => {
      currentLang = 'en';
      initLang();
      // 记录语言选择到后端
      fetch(`/set-lang?lang=${currentLang}`).catch(err => console.log('记录语言失败：', err));
    });
  }

  if (langZhBtn) {
    langZhBtn.addEventListener('click', () => {
      currentLang = 'zh';
      initLang();
      // 记录语言选择到后端
      fetch(`/set-lang?lang=${currentLang}`).catch(err => console.log('记录语言失败：', err));
    });
  }

  // 移动端菜单切换
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      // 切换菜单后重新初始化语言
      initLang();
    });
  }

  // 页面加载时初始化语言
  initLang();
});
