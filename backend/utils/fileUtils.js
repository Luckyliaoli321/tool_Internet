const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

// 转换为Promise的fs函数
const unlinkAsync = promisify(fs.unlink);
const renameAsync = promisify(fs.rename);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);

/**
 * 文件工具类
 */
const fileUtils = {
  /**
   * 获取文件扩展名
   * @param {string} filename - 文件名
   * @returns {string} 扩展名（小写，带点）
   */
  getExtension: (filename) => {
    return path.extname(filename).toLowerCase();
  },

  /**
   * 获取不带扩展名的文件名
   * @param {string} filename - 文件名
   * @returns {string} 不带扩展名的文件名
   */
  getBasename: (filename) => {
    return path.basename(filename, path.extname(filename));
  },

  /**
   * 检查文件是否存在
   * @param {string} filePath - 文件路径
   * @returns {Promise<boolean>} 文件是否存在
   */
  fileExists: async (filePath) => {
    try {
      await statAsync(filePath);
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * 删除文件
   * @param {string} filePath - 文件路径
   * @returns {Promise<void>}
   */
  deleteFile: async (filePath) => {
    try {
      if (await fileUtils.fileExists(filePath)) {
        await unlinkAsync(filePath);
      }
    } catch (err) {
      console.error(`删除文件失败: ${filePath}`, err);
      throw err;
    }
  },

  /**
   * 重命名文件
   * @param {string} oldPath - 旧文件路径
   * @param {string} newPath - 新文件路径
   * @returns {Promise<void>}
   */
  renameFile: async (oldPath, newPath) => {
    try {
      await renameAsync(oldPath, newPath);
    } catch (err) {
      console.error(`重命名文件失败: ${oldPath} -> ${newPath}`, err);
      throw err;
    }
  },

  /**
   * 生成唯一文件名
   * @param {string} extension - 文件扩展名（带点）
   * @returns {string} 唯一文件名
   */
  generateUniqueFileName: (extension) => {
    return `${uuidv4()}${extension}`;
  },

  /**
   * 获取文件的MIME类型
   * @param {string} extension - 文件扩展名（带点）
   * @returns {string} MIME类型
   */
  getMimeType: (extension) => {
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  },

  /**
   * 获取支持的文件格式列表
   * @returns {Object} 支持的文件格式
   */
  getSupportedFormats: () => {
    return {
      formats: [
        {
          extension: 'pdf',
          name: 'PDF',
          targetFormats: [
            { extension: 'docx', name: 'Word (DOCX)' },
            { extension: 'txt', name: 'Text (TXT)' }
          ]
        },
        {
          extension: 'docx',
          name: 'Word (DOCX)',
          targetFormats: [
            { extension: 'pdf', name: 'PDF' },
            { extension: 'txt', name: 'Text (TXT)' }
          ]
        },
        {
          extension: 'doc',
          name: 'Word (DOC)',
          targetFormats: [
            { extension: 'pdf', name: 'PDF' },
            { extension: 'docx', name: 'Word (DOCX)' },
            { extension: 'txt', name: 'Text (TXT)' }
          ]
        },
        {
          extension: 'xlsx',
          name: 'Excel (XLSX)',
          targetFormats: [
            { extension: 'pdf', name: 'PDF' },
            { extension: 'csv', name: 'CSV' }
          ]
        },
        {
          extension: 'xls',
          name: 'Excel (XLS)',
          targetFormats: [
            { extension: 'pdf', name: 'PDF' },
            { extension: 'xlsx', name: 'Excel (XLSX)' },
            { extension: 'csv', name: 'CSV' }
          ]
        },
        {
          extension: 'pptx',
          name: 'PowerPoint (PPTX)',
          targetFormats: [
            { extension: 'pdf', name: 'PDF' }
          ]
        },
        {
          extension: 'ppt',
          name: 'PowerPoint (PPT)',
          targetFormats: [
            { extension: 'pdf', name: 'PDF' },
            { extension: 'pptx', name: 'PowerPoint (PPTX)' }
          ]
        },
        {
          extension: 'txt',
          name: 'Text (TXT)',
          targetFormats: [
            { extension: 'pdf', name: 'PDF' },
            { extension: 'docx', name: 'Word (DOCX)' }
          ]
        }
      ]
    };
  }
};

module.exports = fileUtils; 