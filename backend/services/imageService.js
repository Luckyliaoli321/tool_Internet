const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// 处理中的图片任务跟踪
const imageProcessingTasks = new Map();

/**
 * 图片处理服务
 */
const imageService = {
  /**
   * 压缩图片
   * @param {string} inputPath - 输入图片路径
   * @param {Object} options - 压缩选项
   * @param {number} options.quality - 压缩质量 (1-100)
   * @param {number} options.scale - 缩放比例 (1-100)
   * @returns {Promise<Object>} 压缩结果
   */
  compressImage: async (inputPath, options = { quality: 70, scale: 100 }) => {
    try {
      // 验证文件存在
      if (!fs.existsSync(inputPath)) {
        throw new Error('图片文件不存在');
      }
      
      // 获取图片信息
      const imageInfo = await sharp(inputPath).metadata();
      
      // 生成输出文件名和路径
      const outputFileName = `${uuidv4()}.jpg`;
      const outputPath = path.join(path.dirname(inputPath), outputFileName);
      
      // 计算新尺寸
      const newWidth = Math.round((imageInfo.width * options.scale) / 100);
      
      // 使用sharp库处理图片
      let sharpInstance = sharp(inputPath);
      
      // 调整尺寸
      if (options.scale < 100) {
        sharpInstance = sharpInstance.resize(newWidth, null);
      }
      
      // 压缩质量
      await sharpInstance
        .jpeg({ quality: options.quality })
        .toFile(outputPath);
      
      // 获取原始文件和压缩后文件的大小
      const originalSize = fs.statSync(inputPath).size;
      const compressedSize = fs.statSync(outputPath).size;
      
      // 计算压缩率
      const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
      
      // 返回结果
      return {
        imageId: outputFileName,
        originalSize,
        compressedSize,
        compressionRatio
      };
    } catch (error) {
      console.error('图片压缩错误:', error);
      throw error;
    }
  },
  
  /**
   * 转换图片格式
   * @param {string} inputPath - 输入图片路径
   * @param {string} targetFormat - 目标格式
   * @returns {Promise<Object>} 转换结果
   */
  convertImageFormat: async (inputPath, targetFormat) => {
    try {
      // 验证文件存在
      if (!fs.existsSync(inputPath)) {
        throw new Error('图片文件不存在');
      }
      
      // 支持的格式
      const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff'];
      if (!supportedFormats.includes(targetFormat)) {
        throw new Error('不支持的目标格式');
      }
      
      // 获取原始格式
      const originalFormat = path.extname(inputPath).substring(1);
      
      // 生成输出文件名和路径
      const outputFileName = `${uuidv4()}.${targetFormat}`;
      const outputPath = path.join(path.dirname(inputPath), outputFileName);
      
      // 使用sharp库转换格式
      await sharp(inputPath)[targetFormat]().toFile(outputPath);
      
      // 获取原始文件和转换后文件的大小
      const originalSize = fs.statSync(inputPath).size;
      const convertedSize = fs.statSync(outputPath).size;
      
      // 返回结果
      return {
        imageId: outputFileName,
        originalFormat,
        convertedFormat: targetFormat,
        originalSize,
        convertedSize
      };
    } catch (error) {
      console.error('图片格式转换错误:', error);
      throw error;
    }
  }
};

module.exports = imageService; 