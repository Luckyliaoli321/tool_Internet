import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

// 使用React.lazy懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const FileConvertPage = lazy(() => import('./pages/FileConvertPage'));
const ImageCompressPage = lazy(() => import('./pages/ImageCompressPage'));

/**
 * 加载中显示的组件
 * @returns {React.Component} 加载中组件
 */
const LoadingComponent = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px' 
  }}>
    <div style={{
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * 应用主组件
 * @returns {React.Component} App组件
 */
const App = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Suspense fallback={<LoadingComponent />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/file-convert" element={<FileConvertPage />} />
            <Route path="/image-compress" element={<ImageCompressPage />} />
            <Route path="/image-crop" element={<ComingSoon title="图片裁剪" />} />
            <Route path="/image-format" element={<ComingSoon title="图片格式转换" />} />
            <Route path="/image-watermark" element={<ComingSoon title="图片水印" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

/**
 * 即将推出页面组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 功能标题
 * @returns {React.Component} 即将推出页面组件
 */
const ComingSoon = React.memo(({ title }) => {
  return (
    <div className="coming-soon">
      <div className="container">
        <h1>{title}</h1>
        <p>该功能正在开发中，敬请期待！</p>
      </div>
    </div>
  );
});

/**
 * 404页面组件
 * @returns {React.Component} 404页面组件
 */
const NotFound = React.memo(() => {
  return (
    <div className="not-found">
      <div className="container">
        <h1>404</h1>
        <p>抱歉，您访问的页面不存在。</p>
      </div>
    </div>
  );
});

export default App; 