import React, { StrictMode, Component } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

// 引入Ant Design全局样式
import 'antd/dist/reset.css';

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