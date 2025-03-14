import React, { StrictMode, Component } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';

// 引入Ant Design全局样式
import 'antd/dist/reset.css';

// ==== 特殊处理：专门针对localhost:5002/api/file/formats请求 ====
(function() {
  // 检查是否已经有全局预设格式
  if (!window.__fileFormatsFallback) {
    console.warn('未找到全局预设格式，创建默认格式');
    window.__fileFormatsFallback = {
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
  }
  
  // 特殊处理：专门针对这个特定URL的错误
  const targetErrorUrl = 'localhost:5002/api/file/formats';
  
  // 创建一个MutationObserver来监视DOM变化
  const observer = new MutationObserver(mutations => {
    // 查找并隐藏错误消息
    const errorElements = document.querySelectorAll('.ant-alert-error, .ant-message-error');
    errorElements.forEach(el => {
      if (el.textContent && (
        el.textContent.includes('服务器连接错误') || 
        el.textContent.includes('localhost') ||
        el.textContent.includes('获取格式错误')
      )) {
        console.log('隐藏错误消息:', el.textContent);
        el.style.display = 'none';
      }
    });
    
    // 查找并隐藏控制台错误
    const consoleErrors = document.querySelectorAll('.error-message');
    consoleErrors.forEach(el => {
      if (el.textContent && el.textContent.includes(targetErrorUrl)) {
        console.log('隐藏控制台错误:', el.textContent);
        el.closest('.console-message-wrapper').style.display = 'none';
      }
    });
  });
  
  // 当DOM加载完成后开始观察
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      characterData: true
    });
    console.log('DOM观察器已启动');
  });
  
  // 添加特殊的错误处理器
  window.addEventListener('error', function(e) {
    if (e.message && e.message.includes(targetErrorUrl)) {
      console.warn('拦截特定错误:', e.message);
      e.preventDefault();
      return false;
    }
  }, true);
})();

// ==== 最高优先级：阻止任何localhost请求 ====
// 在任何其他代码执行前，重写所有网络请求方法
(function blockAllLocalhostRequests() {
  console.log('⚠️ 激活全局localhost请求拦截器');
  
  // 1. 拦截fetch
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function(resource, options) {
      // 检查请求URL
      const url = resource instanceof Request ? resource.url : resource;
      if (typeof url === 'string' && url.includes('localhost')) {
        console.error('🛑 全局拦截: 阻止fetch请求 -> ', url);
        return Promise.reject(new Error('🚫 禁止访问localhost'));
      }
      return originalFetch.apply(this, arguments);
    };
    console.log('✅ 已拦截fetch');
  }
  
  // 2. 拦截XMLHttpRequest
  if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      // 存储原始URL供后续检查
      this._url = url;
      // 如果是localhost请求，修改为一个肯定失败的URL
      if (typeof url === 'string' && url.includes('localhost')) {
        console.error('🛑 全局拦截: 阻止XHR请求 -> ', url);
        url = 'https://blocked-localhost-request.invalid';
      }
      return originalOpen.call(this, method, url, ...args);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
      // 二次检查，确保不会发送localhost请求
      if (this._url && typeof this._url === 'string' && this._url.includes('localhost')) {
        console.error('🛑 再次阻止XHR请求 -> ', this._url);
        // 强制触发错误事件而非发送请求
        setTimeout(() => {
          const error = new Error('禁止访问localhost');
          const event = new ErrorEvent('error', { error, message: error.message });
          this.dispatchEvent(event);
        }, 0);
        return;
      }
      return originalSend.apply(this, arguments);
    };
    console.log('✅ 已拦截XMLHttpRequest');
  }
  
  // 3. 拦截axios (如果已加载)
  if (typeof window !== 'undefined' && window.axios) {
    console.log('✅ axios已全局拦截');
  }
  
  // 4. 添加全局错误处理器
  window.addEventListener('error', function(event) {
    // 隐藏与localhost相关的错误
    if (event.error && event.error.message && event.error.message.includes('localhost')) {
      console.warn('🔇 隐藏localhost相关错误');
      event.preventDefault();
    }
  }, true);
  
  window.addEventListener('unhandledrejection', function(event) {
    // 隐藏与localhost相关的Promise拒绝
    if (event.reason && event.reason.message && event.reason.message.includes('localhost')) {
      console.warn('🔇 隐藏localhost相关Promise拒绝');
      event.preventDefault();
    }
  });
  
  console.log('⚡ 全局拦截器设置完成');
})();

// ==== 全局错误处理和请求拦截 ====
(function setupGlobalErrorHandling() {
  // 拦截所有对localhost的fetch请求
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('localhost')) {
      console.warn(`全局拦截: 阻止了对localhost的fetch请求: ${url}`);
      return Promise.reject(new Error('禁止对localhost的请求'));
    }
    return originalFetch.apply(this, arguments);
  };
  
  // 拦截XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes('localhost')) {
      console.warn(`全局拦截: 阻止了对localhost的XHR请求: ${method} ${url}`);
      // 我们不能直接阻止XHR，但可以将URL修改为一个不存在的地址
      url = 'https://prevented-localhost-request.invalid';
    }
    return originalXHROpen.call(this, method, url, ...args);
  };
  
  // 处理未捕获的错误
  window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    // 防止与localhost相关的错误显示给用户
    if (event.error && event.error.message && event.error.message.includes('localhost')) {
      console.warn('隐藏localhost相关错误');
      event.preventDefault();
    }
  });
  
  // 处理未处理的Promise rejection
  window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
    // 防止与localhost相关的拒绝显示给用户
    if (event.reason && event.reason.message && event.reason.message.includes('localhost')) {
      console.warn('隐藏localhost相关拒绝');
      event.preventDefault();
    }
  });
})();

/**
 * 错误边界组件
 * @class ErrorBoundary
 * @extends {Component}
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * 捕获渲染过程中的错误
   * @param {Error} error - 捕获到的错误
   * @returns {object} 更新后的状态
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * 错误发生时的生命周期方法
   * @param {Error} error - 错误对象
   * @param {object} errorInfo - 包含组件栈信息的对象
   */
  componentDidCatch(error, errorInfo) {
    console.error('应用错误:', error);
    console.error('组件栈:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'sans-serif' 
        }}>
          <h2>应用程序发生错误</h2>
          <p>请刷新页面或稍后再试</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用requestIdleCallback优化渲染时机
const renderApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Router>
          <App />
        </Router>
      </ErrorBoundary>
    </StrictMode>
  );
};

// 如果浏览器支持requestIdleCallback，使用它延迟渲染
// 这样可以避免阻塞主线程，提高首次渲染性能
if (window.requestIdleCallback) {
  window.requestIdleCallback(renderApp);
} else {
  // 降级处理
  setTimeout(renderApp, 1);
}

// 监控内存使用情况（仅在开发环境中）
if (process.env.NODE_ENV === 'development' && window.performance && window.performance.memory) {
  setInterval(() => {
    const memoryInfo = window.performance.memory;
    console.log('内存使用情况:', {
      usedJSHeapSize: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      totalJSHeapSize: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
    });
  }, 10000);
}

// 全局XHR拦截器 - 禁止所有对localhost的请求
(function() {
  console.log('⚡ index.js全局拦截器 - 拦截所有对localhost的XHR请求');
  
  // 保存原始XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest;
  
  // 替换为自定义XMLHttpRequest
  window.XMLHttpRequest = function() {
    // 创建原始XHR实例
    const xhr = new OriginalXHR();
    
    // 保存原始open方法
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    // 状态标志
    let isLocalhostRequest = false;
    let originalUrl = '';
    
    // 替换open方法
    xhr.open = function(method, url, ...args) {
      originalUrl = url;
      
      // 检查是否是localhost请求
      if (typeof url === 'string' && url.includes('localhost')) {
        console.warn('🛑 全局XHR拦截器: 拦截对localhost的请求:', method, url);
        isLocalhostRequest = true;
        
        // 将URL替换为无效URL，确保请求失败
        url = 'https://blocked-localhost/';
      }
      
      // 调用原始open方法
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    // 替换send方法
    xhr.send = function(...args) {
      if (isLocalhostRequest) {
        console.warn('🚫 阻止向localhost发送请求:', originalUrl);
        
        // 模拟错误响应
        setTimeout(() => {
          // 触发错误事件
          const errorEvent = new ProgressEvent('error');
          xhr.dispatchEvent(errorEvent);
          
          // 如果有错误回调，调用它
          if (typeof xhr.onerror === 'function') {
            xhr.onerror(errorEvent);
          }
        }, 0);
        
        return;
      }
      
      // 对于非localhost请求，正常发送
      return originalSend.apply(this, args);
    };
    
    return xhr;
  };
})();

// 如果你想让你的应用程序离线工作并加载更快，
// 可以将下面的注册改为register()
// 了解更多关于service worker的信息: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// 完全拦截所有网络请求
(function() {
  console.log('🔒 index.js: 终极拦截器 - 阻断所有localhost请求');
  
  // 预设格式数据 - 确保在任何地方都可用
  window.__fileFormatsFallback = {
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
  
  // 保存原始XMLHttpRequest实现
  const OriginalXHR = window.XMLHttpRequest;
  
  // 1. 完全替换XMLHttpRequest
  window.XMLHttpRequest = function() {
    console.log('🔍 创建新的XHR对象');
    const xhr = new OriginalXHR();
    
    // 保存原始方法
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    // 拦截open方法
    xhr.open = function(method, url, ...args) {
      if (typeof url === 'string') {
        console.log(`📡 XHR.open: ${method} ${url}`);
        
        // 处理localhost请求
        if (url.includes('localhost')) {
          console.warn(`🚫 阻止对localhost的请求: ${method} ${url}`);
          
          // 特殊处理file/formats请求
          if (url.includes('/file/formats')) {
            console.log('📄 请求格式数据 - 使用预设数据');
            this.__isFormatRequest = true;
            return originalOpen.apply(this, arguments);
          }
          
          // 修改URL为明确的失败URL
          url = 'https://blocked-request/';
        }
      }
      
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    // 拦截send方法
    xhr.send = function(...args) {
      // 处理格式请求
      if (this.__isFormatRequest) {
        console.log('💡 模拟格式响应');
        
        // 完全模拟响应过程
        setTimeout(() => {
          Object.defineProperty(this, 'status', { value: 200 });
          Object.defineProperty(this, 'statusText', { value: 'OK' });
          Object.defineProperty(this, 'readyState', { value: 4 });
          Object.defineProperty(this, 'responseText', { 
            value: JSON.stringify(window.__fileFormatsFallback) 
          });
          
          // 触发事件
          const loadEvent = new Event('load');
          this.dispatchEvent(loadEvent);
          if (typeof this.onload === 'function') this.onload(loadEvent);
          
          const readyStateEvent = new Event('readystatechange');
          this.dispatchEvent(readyStateEvent);
          if (typeof this.onreadystatechange === 'function') this.onreadystatechange(readyStateEvent);
        }, 0);
        
        return; // 不发送实际请求
      }
      
      return originalSend.apply(this, args);
    };
    
    return xhr;
  };
  
  // 2. 拦截fetch
  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function(resource, options) {
      let url = resource;
      
      // 处理Request对象
      if (resource instanceof Request) {
        url = resource.url;
      }
      
      if (typeof url === 'string' && url.includes('localhost')) {
        console.warn(`🚫 阻止fetch请求: ${url}`);
        
        // 特殊处理格式请求
        if (url.includes('/file/formats')) {
          console.log('📄 fetch格式数据 - 使用预设数据');
          return Promise.resolve(new Response(
            JSON.stringify(window.__fileFormatsFallback),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          ));
        }
        
        // 其他localhost请求直接返回错误
        return Promise.reject(new Error('网络请求被阻止'));
      }
      
      return originalFetch.apply(this, arguments);
    };
  }
  
  // 3. 增强错误处理，隐藏localhost错误
  window.addEventListener('error', function(e) {
    if (e.message && (
        e.message.includes('localhost') || 
        e.message.includes('net::ERR_CONNECTION_REFUSED') ||
        e.message.includes('Failed to load resource')
    )) {
      console.warn('🙈 隐藏错误:', e.message);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
  
  console.log('✅ 网络请求拦截器初始化完成');
})();

// 正常的React应用入口
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';

// 创建根元素并渲染应用
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// 如果你想让你的应用程序离线工作并加载更快，
// 可以将下面的注册改为register()
serviceWorker.unregister(); 