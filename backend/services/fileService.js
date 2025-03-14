const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const fileUtils = require('../utils/fileUtils');
const { execFile } = require('child_process');
const execFilePromise = promisify(execFile);
const PDFDocument = require('pdfkit-table');
const iconv = require('iconv-lite');
const puppeteer = require('puppeteer');

// 转换中的文件跟踪
const conversionTasks = new Map();

/**
 * 文件转换服务
 */
const fileService = {
  /**
   * 获取支持的文件格式
   * @returns {Object} 支持的文件格式列表
   */
  getSupportedFormats: () => {
    return fileUtils.getSupportedFormats();
  },

  /**
   * 转换文件
   * @param {string} filePath - 源文件路径
   * @param {string} targetFormat - 目标格式
   * @param {string} originalFileName - 原始文件名
   * @returns {Promise<Object>} 转换结果
   */
  convertFile: async (filePath, targetFormat, originalFileName) => {
    try {
      // 验证文件存在
      if (!await fileUtils.fileExists(filePath)) {
        throw new Error('文件不存在');
      }

      // 获取文件扩展名和文件名（不含扩展名）
      const sourceExt = fileUtils.getExtension(filePath);
      const fileNameWithoutExt = fileUtils.getBasename(originalFileName);
      
      // 生成转换后的文件路径
      const outputFileName = fileUtils.generateUniqueFileName(`.${targetFormat}`);
      const outputPath = path.join(path.dirname(filePath), outputFileName);
      
      // 创建任务ID
      const taskId = path.basename(outputFileName, `.${targetFormat}`);
      
      // 记录转换任务
      conversionTasks.set(taskId, {
        sourcePath: filePath,
        outputPath,
        status: 'processing'
      });

      // 根据文件类型和目标格式选择不同的转换策略
      await fileService._performConversion(sourceExt, targetFormat, filePath, outputPath);
      
      // 更新任务状态
      conversionTasks.set(taskId, {
        ...conversionTasks.get(taskId),
        status: 'completed'
      });

      return {
        fileId: taskId,
        originalName: fileNameWithoutExt,
        extension: targetFormat
      };
    } catch (error) {
      console.error('文件转换错误:', error);
      throw error;
    }
  },

  /**
   * 执行实际的文件转换
   * @param {string} sourceExt - 源文件扩展名
   * @param {string} targetFormat - 目标格式
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @returns {Promise<void>}
   * @private
   */
  _performConversion: async (sourceExt, targetFormat, inputPath, outputPath) => {
    // 根据不同的源格式和目标格式选择转换策略
    switch (true) {
      // TXT 转 PDF
      case (sourceExt.toLowerCase() === '.txt' && targetFormat.toLowerCase() === 'pdf'):
        return await fileService._convertTxtToPdf(inputPath, outputPath);
      
      // 其他转换格式暂时使用模拟方式
      default:
        return await fileService._mockConversion(inputPath, outputPath);
    }
  },
  
  /**
   * 将TXT文件转换为PDF
   * @param {string} inputPath - TXT文件路径
   * @param {string} outputPath - 输出PDF路径
   * @returns {Promise<void>}
   * @private
   */
  _convertTxtToPdf: async (inputPath, outputPath) => {
    try {
      console.log('开始读取TXT文件:', inputPath);
      
      // 读取原始二进制数据
      const buffer = fs.readFileSync(inputPath);
      let textContent;
      let encoding = 'utf8';
      
      // 检测编码
      if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        encoding = 'utf16le';
        textContent = iconv.decode(buffer, encoding);
        console.log('检测到UTF-16LE编码');
      } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
        encoding = 'utf16be';
        textContent = iconv.decode(buffer, encoding);
        console.log('检测到UTF-16BE编码');
      } else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        textContent = iconv.decode(buffer, encoding);
        console.log('检测到UTF-8 with BOM编码');
      } else {
        textContent = iconv.decode(buffer, encoding);
        console.log('使用默认UTF-8编码');
      }
      
      console.log('成功读取TXT文件内容, 长度:', textContent.length);
      
      // 创建HTML文件
      const htmlPath = outputPath.replace('.pdf', '.html');
      
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>文档预览</title>
  <style>
    @page {
      margin: 0;
    }
    body {
      font-family: "Microsoft YaHei", "SimSun", Arial, sans-serif;
      margin: 20px;
      padding: 0;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>${textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
</html>`;

      fs.writeFileSync(htmlPath, htmlContent, 'utf8');
      
      // 启动浏览器
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      try {
        // 创建新页面
        const page = await browser.newPage();
        
        // 设置页面大小为A4
        await page.setViewport({
          width: 794, // A4纸宽度在96dpi下的像素值
          height: 1123, // A4纸高度
          deviceScaleFactor: 2 // 提高清晰度
        });
        
        // 导航到HTML文件
        await page.goto(`file://${path.resolve(htmlPath)}`, {
          waitUntil: 'networkidle0',
          timeout: 60000
        });
        
        // 等待字体加载
        await page.evaluate(() => document.fonts.ready);
        
        // 生成PDF
        await page.pdf({
          path: outputPath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          }
        });
        
        console.log('PDF生成成功:', outputPath);
        
        // 删除临时HTML文件
        fs.unlinkSync(htmlPath);
        
        return Promise.resolve();
      } finally {
        // 确保关闭浏览器
        await browser.close();
      }
    } catch (error) {
      console.error('PDF生成失败:', error);
      return Promise.reject(error);
    }
  },
  
  /**
   * 模拟转换过程（仅复制文件并修改扩展名）
   * @param {string} inputPath - 输入文件路径
   * @param {string} outputPath - 输出文件路径
   * @returns {Promise<void>}
   * @private
   */
  _mockConversion: async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
      // 模拟转换耗时
      setTimeout(async () => {
        try {
          const readStream = fs.createReadStream(inputPath);
          const writeStream = fs.createWriteStream(outputPath);
          
          readStream.pipe(writeStream);
          
          writeStream.on('finish', () => {
            console.log(`已完成模拟转换: ${inputPath} -> ${outputPath}`);
            resolve();
          });
          
          writeStream.on('error', (err) => {
            reject(err);
          });
        } catch (err) {
          reject(err);
        }
      }, 1500); // 模拟延迟
    });
  },

  /**
   * 获取已转换的文件
   * @param {string} fileId - 文件ID
   * @returns {Promise<Object>} 文件信息
   */
  getConvertedFile: async (fileId) => {
    const task = conversionTasks.get(fileId);
    
    if (!task) {
      throw new Error('文件不存在或已过期');
    }
    
    if (task.status !== 'completed') {
      throw new Error('文件转换尚未完成');
    }
    
    if (!await fileUtils.fileExists(task.outputPath)) {
      throw new Error('转换后的文件已被删除');
    }
    
    return {
      filePath: task.outputPath,
      mimeType: fileUtils.getMimeType(path.extname(task.outputPath))
    };
  },

  /**
   * 取消文件转换
   * @param {string} fileId - 文件ID
   * @returns {Promise<boolean>} 是否成功取消
   */
  cancelConversion: async (fileId) => {
    const task = conversionTasks.get(fileId);
    
    if (!task) {
      return false;
    }
    
    // 删除源文件和输出文件
    try {
      await fileUtils.deleteFile(task.sourcePath);
      await fileUtils.deleteFile(task.outputPath);
    } catch (err) {
      console.error('删除文件失败:', err);
    }
    
    // 移除任务
    conversionTasks.delete(fileId);
    
    return true;
  },

  /**
   * 清理过期文件
   * @param {number} maxAgeMs - 最大保存时间（毫秒）
   * @returns {Promise<number>} 清理的文件数量
   */
  cleanupFiles: async (maxAgeMs = 24 * 60 * 60 * 1000) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    let cleanedCount = 0;
    
    try {
      const files = await fs.promises.readdir(uploadsDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.promises.stat(filePath);
        
        // 如果文件超过最大保存时间，则删除
        if (now - stats.mtime.getTime() > maxAgeMs) {
          await fileUtils.deleteFile(filePath);
          cleanedCount++;
        }
      }
    } catch (err) {
      console.error('清理文件失败:', err);
    }
    
    return cleanedCount;
  }
};

// 定期清理过期文件（每小时）
setInterval(() => {
  fileService.cleanupFiles()
    .then(cleanedCount => {
      if (cleanedCount > 0) {
        console.log(`已清理 ${cleanedCount} 个过期文件`);
      }
    })
    .catch(err => {
      console.error('定时清理文件失败:', err);
    });
}, 60 * 60 * 1000);

module.exports = fileService; 