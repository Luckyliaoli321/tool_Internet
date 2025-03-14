const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const uploadMiddleware = require('../middleware/upload');

/**
 * @route GET /api/file/formats
 * @desc 获取支持的文件格式
 * @access Public
 */
router.get('/formats', fileController.getSupportedFormats);

/**
 * @route POST /api/file/convert
 * @desc 转换文件
 * @access Public
 */
router.post(
  '/convert',
  (req, res, next) => {
    uploadMiddleware.single('file')(req, res, (err) => {
      if (err) {
        return uploadMiddleware.handleError(err, req, res, next);
      }
      next();
    });
  },
  fileController.convertFile
);

/**
 * @route GET /api/file/download/:fileId
 * @desc 下载转换后的文件
 * @access Public
 */
router.get('/download/:fileId', fileController.downloadFile);

/**
 * @route POST /api/file/cancel/:fileId
 * @desc 取消文件转换
 * @access Public
 */
router.post('/cancel/:fileId', fileController.cancelConversion);

module.exports = router; 