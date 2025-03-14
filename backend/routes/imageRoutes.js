const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const uploadMiddleware = require('../middleware/upload');
const imageController = require('../controllers/imageController');

/**
 * @route   POST /api/image/compress
 * @desc    压缩图片
 * @access  Public
 */
router.post('/compress', (req, res, next) => {
  uploadMiddleware.single('image')(req, res, (err) => {
    if (err) {
      return uploadMiddleware.handleError(err, req, res, next);
    }
    next();
  });
}, imageController.compressImage);

/**
 * @route   POST /api/image/format-convert
 * @desc    转换图片格式
 * @access  Public
 */
router.post('/format-convert', (req, res, next) => {
  uploadMiddleware.single('image')(req, res, (err) => {
    if (err) {
      return uploadMiddleware.handleError(err, req, res, next);
    }
    next();
  });
}, imageController.convertImageFormat);

/**
 * @route GET /api/image/download/:imageId
 * @desc 下载处理后的图片
 * @access Public
 */
router.get('/download/:imageId', imageController.downloadImage);

module.exports = router; 