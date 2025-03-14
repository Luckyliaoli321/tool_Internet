const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const fileUtils = require('../utils/fileUtils');
const { execFile } = require('child_process');
const execFilePromise = promisify(execFile);
const PDFDocument = require('pdfkit');

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
      const sourceExt = path.extname(filePath).toLowerCase();
      const fileNameWithoutExt = fileUtils.getBasename(originalFileName);
      
      console.log(`文件转换 - 源文件: ${filePath}, 扩展名: ${sourceExt}, 目标格式: ${targetFormat}`);
      
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
    console.log(`选择转换策略 - 源扩展名: ${sourceExt}, 目标格式: ${targetFormat}`);
    
    // 根据不同的源格式和目标格式选择转换策略
    if (sourceExt === '.txt' && targetFormat.toLowerCase() === 'pdf') {
      console.log(`执行TXT到PDF转换: ${inputPath} -> ${outputPath}`);
      return await fileService._convertTxtToPdf(inputPath, outputPath);
    } else {
      console.log(`执行模拟转换: ${inputPath} -> ${outputPath}`);
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
    return new Promise((resolve, reject) => {
      try {
        console.log(`开始TXT到PDF转换过程: ${inputPath}`);
        
        // 读取TXT文件内容
        const textContent = fs.readFileSync(inputPath, 'utf8');
        console.log(`成功读取TXT文件，内容长度：${textContent.length}字符`);
        
        // 创建PDF文档
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(outputPath);
        
        console.log(`创建PDF文档对象和输出流: ${outputPath}`);
        
        // 将PDF写入文件流
        doc.pipe(writeStream);
        
        // 设置文档属性
        doc.info.Title = path.basename(inputPath, '.txt');
        doc.info.Author = '创网工具';
        doc.info.Subject = '由TXT转换为PDF';
        
        // 添加页眉
        doc.fontSize(18)
           .text('文档转换', { align: 'center' })
           .moveDown(1);
           
        console.log('已添加PDF页眉');
           
        // 添加正文内容
        doc.fontSize(12)
           .text(textContent, {
             align: 'left',
             columns: 1,
             lineGap: 5,
             width: 500
           });
           
        console.log('已添加PDF正文内容');
           
        // 添加页脚
        doc.moveDown(4)
           .fontSize(10)
           .text(`转换时间: ${new Date().toLocaleString()}`, { align: 'right' });
           
        console.log('已添加PDF页脚');
           
        // 完成PDF
        doc.end();
        
        console.log('PDF文档生成完成，等待写入文件系统');
        
        writeStream.on('finish', () => {
          console.log(`TXT转PDF转换完成: ${inputPath} -> ${outputPath}`);
          resolve();
        });
        
        writeStream.on('error', (err) => {
          console.error(`PDF写入错误:`, err);
          reject(err);
        });
      } catch (err) {
        console.error('TXT转PDF错误:', err);
        reject(err);
      }
    });
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
            console.error(`模拟转换写入错误:`, err);
            reject(err);
          });
        } catch (err) {
          console.error(`模拟转换错误:`, err);
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