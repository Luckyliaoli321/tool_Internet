const fileService = require('../services/fileService');

/**
 * 文件控制器
 */
const fileController = {
  /**
   * 获取支持的文件格式
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  getSupportedFormats: async (req, res) => {
    try {
      const formats = fileService.getSupportedFormats();
      res.status(200).json(formats);
    } catch (error) {
      console.error('获取格式错误:', error);
      res.status(500).json({ message: '获取支持的文件格式失败' });
    }
  },

  /**
   * 转换文件
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  convertFile: async (req, res) => {
    try {
      // 检查是否有文件上传
      if (!req.file) {
        return res.status(400).json({ message: '没有上传文件' });
      }

      // 检查目标格式
      const { targetFormat } = req.body;
      if (!targetFormat) {
        return res.status(400).json({ message: '缺少目标格式' });
      }

      // 执行文件转换
      const result = await fileService.convertFile(
        req.file.path,
        targetFormat,
        req.originalFileName || req.file.originalname
      );

      res.status(200).json({
        message: '文件转换成功',
        fileId: result.fileId,
        originalName: result.originalName,
        extension: result.extension
      });
    } catch (error) {
      console.error('转换错误:', error);
      res.status(500).json({ message: `文件转换失败: ${error.message}` });
    }
  },

  /**
   * 下载转换后的文件
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  downloadFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      
      if (!fileId) {
        return res.status(400).json({ message: '缺少文件ID' });
      }

      // 获取转换后的文件
      const fileInfo = await fileService.getConvertedFile(fileId);
      
      // 设置响应头并发送文件
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename=${fileId}`);
      
      res.sendFile(fileInfo.filePath);
    } catch (error) {
      console.error('下载错误:', error);
      res.status(404).json({ message: `文件下载失败: ${error.message}` });
    }
  },

  /**
   * 取消文件转换
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  cancelConversion: async (req, res) => {
    try {
      const { fileId } = req.params;
      
      if (!fileId) {
        return res.status(400).json({ message: '缺少文件ID' });
      }

      const result = await fileService.cancelConversion(fileId);
      
      if (result) {
        res.status(200).json({ message: '文件转换已取消' });
      } else {
        res.status(404).json({ message: '未找到要取消的转换任务' });
      }
    } catch (error) {
      console.error('取消错误:', error);
      res.status(500).json({ message: `取消转换失败: ${error.message}` });
    }
  }
};

module.exports = fileController; 