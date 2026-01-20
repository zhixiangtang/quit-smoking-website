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
const logFormat = ':remote-addr :date[iso] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :country :device :lang';

// 将日志写入文件（同时输出到控制台）
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' } // 追加模式
);

// 扩展morgan：添加设备/国家/语言信息
morgan.token('device', (req) => {
  const agent = useragent.parse(req.headers['user-agent']);
  return `${agent.os.family} | ${agent.device.family || 'Desktop'}`;
});

morgan.token('country', (req) => {
  // 生产环境可替换为 ipapi.co / maxmind 等获取真实国家
  return 'Unknown (Global)'; 
});

morgan.token('lang', (req) => {
  // 获取用户语言（优先从set-lang接口获取，其次从请求头）
  return req.query.lang || req.headers['accept-language']?.split(',')[0] || 'unknown';
});

// 中间件配置
app.use(cors()); // 允许跨域（全球访问）
app.use(express.static(path.join(__dirname, 'public'))); // 静态文件服务
app.use(morgan(logFormat, { stream: accessLogStream })); // 日志记录到文件
app.use(morgan(logFormat)); // 控制台输出日志

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quit Smoking Website is running!' });
});

// 记录用户语言选择的接口
app.get('/set-lang', (req, res) => {
  const userLang = req.query.lang || 'unknown';
  // 自定义日志行，追加到access.log
  const logLine = `${new Date().toISOString()} | LANG | ${req.ip} | ${userLang} | ${req.headers['user-agent']}\n`;
  fs.appendFileSync(path.join(logsDir, 'access.log'), logLine);
  res.json({ status: 'ok', lang: userLang });
});

// 404处理
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Server error, please try again later.' });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access logs are saved to: ${path.join(logsDir, 'access.log')}`);
});
