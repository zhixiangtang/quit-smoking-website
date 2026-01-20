// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 移动端菜单切换
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      // 切换图标（汉堡/叉号）
      const icon = mobileMenuBtn.querySelector('i');
      if (icon.classList.contains('fa-bars')) {
        icon.classList.replace('fa-bars', 'fa-xmark');
      } else {
        icon.classList.replace('fa-xmark', 'fa-bars');
      }
    });
  }

  // 导航栏滚动效果
  window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
      nav.classList.add('py-2', 'shadow-lg');
      nav.classList.remove('py-3', 'shadow-md');
    } else {
      nav.classList.add('py-3', 'shadow-md');
      nav.classList.remove('py-2', 'shadow-lg');
    }
  });
});
