const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const useragent = require('useragent');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 创建日志目录（如果不存在）
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 自定义日志格式：记录详细的用户访问信息
const logFormat = ':remote-addr :date[iso] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :country :device';

// 将日志写入文件（同时输出到控制台）
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' } // 追加模式
);

// 扩展morgan：添加设备/国家信息（简化版，生产环境可集成IP库）
morgan.token('device', (req) => {
  const agent = useragent.parse(req.headers['user-agent']);
  return `${agent.os.family} | ${agent.device.family || 'Desktop'}`;
});

morgan.token('country', (req) => {
  // 简化版：生产环境可使用 ipapi.co / maxmind 等获取真实国家
  return 'Unknown (Global)'; 
});

// 中间件配置
app.use(cors()); // 允许跨域（全球访问）
app.use(express.static(path.join(__dirname, 'public'))); // 静态文件服务
app.use(morgan(logFormat, { stream: accessLogStream })); // 日志记录
app.use(morgan(logFormat)); // 控制台输出

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quit Smoking Website is running!' });
});

// 404处理
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access logs are saved to: ${path.join(logsDir, 'access.log')}`);
});
