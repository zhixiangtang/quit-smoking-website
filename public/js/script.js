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
  const daysQuit = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // 计算节省的钱（假设一包20支）
  const packsPerDay = cigPerDay / 20;
  const moneySaved = (packsPerDay * pricePerPack * daysQuit).toFixed(2);
  
  // 健康状态提示
  let healthStatus = '';
  if (daysQuit < 1) {
    healthStatus = 'Start your quit journey today!';
  } else if (daysQuit < 7) {
    healthStatus = 'Nicotine is leaving your body - great job!';
  } else if (daysQuit < 30) {
    healthStatus = 'Your lung function is improving!';
  } else if (daysQuit < 365) {
    healthStatus = 'Your risk of heart attack is much lower now!';
  } else {
    healthStatus = 'Amazing! Your body has fully recovered from smoking damage.';
  }
  
  // 显示结果
  document.getElementById('daysQuit').textContent = daysQuit;
  document.getElementById('moneySaved').textContent = `$${moneySaved}`;
  document.getElementById('healthStatus').textContent = healthStatus;
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

// 页面加载动画
window.addEventListener('load', function() {
  document.body.classList.add('loaded');
});
