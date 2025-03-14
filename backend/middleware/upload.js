const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名，避免重名覆盖
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExt}`;
    
    // 保存原始文件名到请求对象，供后续处理使用
    req.originalFileName = file.originalname;
    
    cb(null, fileName);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  // 获取支持的文件类型
  const supportedTypes = [
    // 文档类型
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
    // 图片类型
    '.jpg', '.jpeg', '.png', '.gif', '.bmp',
    // 其他常用类型
    '.csv', '.json', '.xml'
  ];
  
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (supportedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${fileExt}`), false);
  }
};

// 限制文件大小 (50MB)
const limits = {
  fileSize: 50 * 1024 * 1024
};

// 创建multer实例
const upload = multer({
  storage,
  fileFilter,
  limits
});

// 导出上传中间件
module.exports = {
  /**
   * 单文件上传
   * @param {string} fieldName - 文件字段名
   * @returns {Function} 上传中间件
   */
  single: (fieldName) => upload.single(fieldName),
  
  /**
   * 错误处理中间件
   * @param {Error} err - 错误对象
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  handleError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      // Multer错误
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: `文件大小超过限制，最大支持${limits.fileSize / 1024 / 1024}MB` 
        });
      }
      return res.status(400).json({ message: `上传错误: ${err.message}` });
    } else if (err) {
      // 其他错误
      return res.status(400).json({ message: err.message });
    }
    next();
  }
}; 