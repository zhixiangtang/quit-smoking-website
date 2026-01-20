// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 从本地存储加载数据
  const loadSavedData = () => {
    const savedData = localStorage.getItem('quitSmokeData');
    return savedData ? JSON.parse(savedData) : null;
  };

  // 保存数据到本地存储
  const saveData = (data) => {
    localStorage.setItem('quitSmokeData', JSON.stringify(data));
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
      document.getElementById('startDate').value = savedData.form.startDate;
      document.getElementById('cigPerDay').value = savedData.form.cigPerDay;
      document.getElementById('pricePerPack').value = savedData.form.pricePerPack;
      document.getElementById('notes').value = savedData.form.notes || '';
      
      // 自动计算进度
      calculateProgress(savedData.form.startDate, savedData.form.cigPerDay, savedData.form.pricePerPack);
    }
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
    
    // 计算节省金额（按20支/包计算）
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
    
    // 显示结果区
    document.getElementById('progressResult').classList.remove('hidden');
  };

  // 表单提交事件
  document.getElementById('trackForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 获取表单值
    const startDate = document.getElementById('startDate').value;
    const cigPerDay = document.getElementById('cigPerDay').value;
    const pricePerPack = document.getElementById('pricePerPack').value;
    
    // 计算进度
    calculateProgress(startDate, cigPerDay, pricePerPack);
    
    // 滚动到结果区
    document.getElementById('progressResult').scrollIntoView({ behavior: 'smooth' });
  });

  // 保存进度按钮事件
  document.getElementById('saveProgress').addEventListener('click', function() {
    // 获取表单数据
    const formData = {
      startDate: document.getElementById('startDate').value,
      cigPerDay: document.getElementById('cigPerDay').value,
      pricePerPack: document.getElementById('pricePerPack').value,
      notes: document.getElementById('notes').value
    };
    
    // 获取当前进度数据
    const daysQuit = document.getElementById('daysQuit').textContent;
    const moneySaved = document.getElementById('moneySaved').textContent.replace('¥', '');
    const cigAvoided = document.getElementById('cigAvoided').textContent.replace(' 支', '');
    
    // 加载已有数据
    const savedData = loadSavedData() || { history: [] };
    savedData.form = formData;
    
    // 添加到历史记录
    savedData.history.unshift({
      date: new Date().toISOString(),
      daysQuit: daysQuit,
      moneySaved: moneySaved,
      cigAvoided: cigAvoided
    });
    
    // 只保留最近10条记录
    if (savedData.history.length > 10) {
      savedData.history = savedData.history.slice(0, 10);
    }
    
    // 保存数据
    saveData(savedData);
  });

  // 重置记录按钮事件
  document.getElementById('resetProgress').addEventListener('click', function() {
    if (confirm('确定要重置所有戒烟记录吗？此操作不可恢复！')) {
      localStorage.removeItem('quitSmokeData');
      document.getElementById('trackForm').reset();
      document.getElementById('progressResult').classList.add('hidden');
      document.getElementById('historySection').classList.add('hidden');
      alert('记录已重置！你可以重新开始记录戒烟旅程。');
    }
  });

  // 初始化页面
  initForm();
});
