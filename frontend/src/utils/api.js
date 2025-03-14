import axios from 'axios';

// API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5002/api' : '/api');

/**
 * 创建axios实例
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 文件转换API
 */
export const fileAPI = {
  /**
   * 上传文件并转换格式
   * @param {File} file - 要转换的文件
   * @param {string} targetFormat - 目标格式
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise} 转换结果
   */
  convertFile: async (file, targetFormat, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);
    
    try {
      const response = await api.post('/file/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服务器连接错误' };
    }
  },
  
  /**
   * 获取支持的文件格式
   * @returns {Promise} 支持的格式列表
   */
  getSupportedFormats: async () => {
    try {
      const response = await api.get('/file/formats');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服务器连接错误' };
    }
  },
  
  /**
   * 下载转换后的文件
   * @param {string} fileId - 文件ID
   * @returns {Promise} 文件流
   */
  downloadFile: async (fileId) => {
    try {
      const response = await api.get(`/file/download/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服务器连接错误' };
    }
  },
  
  /**
   * 取消文件转换
   * @param {string} fileId - 文件ID
   * @returns {Promise} 取消结果
   */
  cancelConversion: async (fileId) => {
    try {
      const response = await api.post(`/file/cancel/${fileId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服务器连接错误' };
    }
  },
};

/**
 * 图片处理API
 */
export const imageAPI = {
  /**
   * 压缩图片
   * @param {File} image - 要压缩的图片
   * @param {Object} options - 压缩选项
   * @param {number} options.quality - 压缩质量 (1-100)
   * @param {number} options.scale - 缩放比例 (1-100)
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise} 压缩结果
   */
  compressImage: async (image, options = { quality: 70, scale: 100 }, onProgress) => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('quality', options.quality);
    formData.append('scale', options.scale);
    
    try {
      const response = await api.post('/image/compress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progressEvent);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服务器连接错误' };
    }
  },
  
  /**
   * 转换图片格式
   * @param {File} image - 要转换的图片
   * @param {string} targetFormat - 目标格式
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise} 转换结果
   */
  convertImageFormat: async (image, targetFormat, onProgress) => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('targetFormat', targetFormat);
    
    try {
      const response = await api.post('/image/format-convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progressEvent);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服务器连接错误' };
    }
  }
};

export default api; 