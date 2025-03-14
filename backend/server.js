const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 载入环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/file', require('./routes/fileRoutes'));
app.use('/api/image', require('./routes/imageRoutes'));

// 基础路由
app.get('/api', (req, res) => {
  res.json({ 
    message: '欢迎使用在线工具平台API',
    version: '1.0.0',
    endpoints: {
      files: '/api/file',
      images: '/api/image'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    message: '服务器发生错误',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 