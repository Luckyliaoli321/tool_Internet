/**
 * 项目配置文件
 */
module.exports = {
  // 文件上传配置
  upload: {
    // 最大文件大小 (10MB)
    maxFileSize: 10 * 1024 * 1024,
    
    // 允许的文件类型
    allowedFileTypes: {
      // 文档类型
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ],
      
      // 图片类型
      images: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/svg+xml'
      ]
    }
  },
  
  // API路径配置
  api: {
    prefix: '/api',
    version: 'v1'
  }
}; 