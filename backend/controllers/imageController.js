const path = require('path');
const fs = require('fs');
const imageService = require('../services/imageService');

/**
 * 图片控制器
 */
const imageController = {
  /**
   * 压缩图片
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  compressImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '没有上传图片' });
      }

      const { quality = 70, scale = 100 } = req.body;
      
      // 调用服务层进行压缩
      const result = await imageService.compressImage(
        req.file.path,
        {
          quality: parseInt(quality),
          scale: parseInt(scale)
        }
      );
      
      // 返回结果
      res.json({
        success: true,
        message: '图片压缩成功',
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        imageUrl: `/api/image/download/${result.imageId}`
      });
    } catch (error) {
      console.error('图片压缩错误:', error);
      res.status(500).json({ 
        success: false,
        message: '图片压缩失败', 
        error: error.message 
      });
    }
  },
  
  /**
   * 转换图片格式
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  convertImageFormat: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '没有上传图片' });
      }

      const { targetFormat } = req.body;
      if (!targetFormat) {
        return res.status(400).json({ message: '未指定目标格式' });
      }
      
      // 支持的格式
      const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff'];
      if (!supportedFormats.includes(targetFormat)) {
        return res.status(400).json({ message: '不支持的目标格式' });
      }
      
      // 调用服务层进行格式转换
      const result = await imageService.convertImageFormat(
        req.file.path,
        targetFormat
      );
      
      // 返回结果
      res.json({
        success: true,
        message: '图片格式转换成功',
        originalFormat: result.originalFormat,
        convertedFormat: result.convertedFormat,
        originalSize: result.originalSize,
        convertedSize: result.convertedSize,
        imageUrl: `/api/image/download/${result.imageId}`
      });
    } catch (error) {
      console.error('图片格式转换错误:', error);
      res.status(500).json({ 
        success: false,
        message: '图片格式转换失败', 
        error: error.message 
      });
    }
  },
  
  /**
   * 下载处理后的图片
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  downloadImage: async (req, res) => {
    try {
      const { imageId } = req.params;
      
      if (!imageId) {
        return res.status(400).json({ message: '缺少图片ID' });
      }
      
      // 获取图片路径
      const imagePath = path.join(__dirname, '../uploads', imageId);
      
      // 检查文件是否存在
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: '图片不存在' });
      }
      
      // 发送文件
      res.sendFile(imagePath);
    } catch (error) {
      console.error('下载图片错误:', error);
      res.status(500).json({ 
        success: false,
        message: '下载图片失败', 
        error: error.message 
      });
    }
  }
};

module.exports = imageController; 