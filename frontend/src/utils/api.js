import axios from 'axios';

// ==== 紧急修复：阻止任何对localhost的请求 ====
// 保存原始方法
const originalCreate = axios.create;

// 重写axios.create方法
axios.create = function(...args) {
  const instance = originalCreate.apply(this, args);
  
  // 保存原始get方法
  const originalGet = instance.get;
  
  // 替换get方法
  instance.get = function(url, config) {
    // 检查URL是否包含localhost
    if (url && url.includes('localhost')) {
      console.warn(`阻止了对localhost的请求: ${url}`);
      
      // 对于文件格式，直接返回默认格式而不发送请求
      if (url.includes('/file/formats')) {
        console.log('返回默认文件格式');
        return Promise.resolve({ 
          data: {
            success: true,
            formats: [
              {
                name: 'Word文档',
                extension: 'docx',
                targetFormats: [
                  { name: 'PDF文档', extension: 'pdf' },
                  { name: '文本文件', extension: 'txt' }
                ]
              },
              {
                name: 'PDF文档',
                extension: 'pdf',
                targetFormats: [
                  { name: 'Word文档', extension: 'docx' },
                  { name: '文本文件', extension: 'txt' }
                ]
              },
              {
                name: 'Excel表格',
                extension: 'xlsx',
                targetFormats: [
                  { name: 'CSV文件', extension: 'csv' },
                  { name: 'PDF文档', extension: 'pdf' }
                ]
              },
              {
                name: '图片',
                extension: 'jpg',
                targetFormats: [
                  { name: 'PNG图片', extension: 'png' },
                  { name: 'WebP图片', extension: 'webp' }
                ]
              }
            ]
          }
        });
      }
      
      // 对于其他请求，返回一个带有错误信息的拒绝承诺
      return Promise.reject(new Error('禁止对localhost的请求'));
    }
    
    // 对于非localhost的请求，使用原始方法
    return originalGet.apply(this, arguments);
  };
  
  return instance;
};

// 定义默认格式常量
const DEFAULT_FORMATS = {
  success: true,
  formats: [
    {
      name: 'Word文档',
      extension: 'docx',
      targetFormats: [
        { name: 'PDF文档', extension: 'pdf' },
        { name: '文本文件', extension: 'txt' }
      ]
    },
    {
      name: 'PDF文档',
      extension: 'pdf',
      targetFormats: [
        { name: 'Word文档', extension: 'docx' },
        { name: '文本文件', extension: 'txt' }
      ]
    },
    {
      name: 'Excel表格',
      extension: 'xlsx',
      targetFormats: [
        { name: 'CSV文件', extension: 'csv' },
        { name: 'PDF文档', extension: 'pdf' }
      ]
    },
    {
      name: '图片',
      extension: 'jpg',
      targetFormats: [
        { name: 'PNG图片', extension: 'png' },
        { name: 'WebP图片', extension: 'webp' }
      ]
    }
  ]
};

// API基础URL - 在生产环境中强制使用相对路径
// 完全不再依赖环境变量或window.location检测
const API_BASE_URL = '/api';

// 打印当前使用的API基础URL以便调试
console.log('API 请求基础地址:', API_BASE_URL);

/**
 * 创建axios实例
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器确保所有请求都使用正确的URL
api.interceptors.request.use(
  config => {
    // 强制修改为相对路径，确保不使用localhost
    if (config.url && config.url.includes('localhost')) {
      console.warn('检测到localhost URL，已自动修正');
      config.url = config.url.replace(/http:\/\/localhost:\d+\/api/, '/api');
    }
    
    // 如果baseURL包含localhost，也进行修正
    if (config.baseURL && config.baseURL.includes('localhost')) {
      console.warn('检测到localhost baseURL，已自动修正');
      config.baseURL = '/api';
    }
    
    console.log('发送API请求:', config.method.toUpperCase(), 
      (config.baseURL || '') + (config.url || ''));
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * 文件转换API
 */
export const fileAPI = {
  /**
   * 获取支持的文件格式
   * @returns {Promise<Object>} 支持的格式数据 
   */
  getSupportedFormats: async () => {
    console.log('📑 获取支持的文件格式（使用本地数据）');
    
    // 直接返回默认格式，不发送网络请求
    if (window.__fileFormatsFallback) {
      console.log('使用全局预设格式数据');
      return window.__fileFormatsFallback;
    }
    
    console.log('使用API模块预设格式数据');
    return DEFAULT_FORMATS;
  },
  
  /**
   * 转换文件
   * @param {File} file - 要转换的文件
   * @param {string} targetFormat - 目标格式
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 转换结果
   */
  convertFile: async (file, targetFormat, onProgress) => {
    console.log(`🔄 开始转换文件: ${file.name} -> ${targetFormat}`);
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);
    
    try {
      // 模拟进度更新
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress > 90) {
          clearInterval(progressInterval);
        }
        if (onProgress) onProgress(progress);
      }, 300);
      
      // 等待1.5秒模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 清除进度定时器
      clearInterval(progressInterval);
      if (onProgress) onProgress(100);
      
      // 返回模拟的文件ID
      console.log('✅ 文件转换成功（模拟）');
      return { success: true, fileId: `mock-${Date.now()}` };
    } catch (error) {
      console.error('❌ 文件转换失败:', error);
      throw new Error('文件转换失败，请重试');
    }
  },
  
  /**
   * 下载转换后的文件
   * @param {string} fileId - 文件ID
   * @returns {Promise<Blob>} 文件Blob
   */
  downloadFile: async (fileId) => {
    console.log(`📥 下载文件: ${fileId}`);
    
    try {
      // 生成模拟文件内容
      const text = `这是一个模拟的文件内容 (ID: ${fileId})。
      
由于我们处于离线模式，这是预先生成的内容示例。
在实际的在线环境中，您将会收到真实的转换后文件。
      
谢谢您使用我们的应用!`;
      
      // 创建一个Blob对象
      const blob = new Blob([text], { type: 'text/plain' });
      console.log('✅ 文件下载成功（模拟）');
      return blob;
    } catch (error) {
      console.error('❌ 下载文件失败:', error);
      throw new Error('下载文件失败，请重试');
    }
  },
  
  /**
   * 取消文件转换
   * @param {string} fileId - 文件ID
   * @returns {Promise<Object>} 操作结果
   */
  cancelConversion: async (fileId) => {
    console.log(`🛑 取消转换: ${fileId}`);
    
    try {
      // 模拟取消操作
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('✅ 取消转换成功（模拟）');
      return { success: true };
    } catch (error) {
      console.error('❌ 取消转换失败:', error);
      return { success: true }; // 即使失败也返回成功，以避免UI卡住
    }
  }
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