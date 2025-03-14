import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FileConvertPage from './pages/FileConvertPage';
import ImageCompressPage from './pages/ImageCompressPage';
import ImageCropPage from './pages/ImageCropPage';
import ImageFormatPage from './pages/ImageFormatPage';
import ImageWatermarkPage from './pages/ImageWatermarkPage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

// 设置dayjs区域为中文
dayjs.locale('zh-cn');

/**
 * 应用程序主组件
 * @returns {React.Component} 应用程序主组件
 */
const App = () => {
  // 初始化应用时检查文件格式预设
  useEffect(() => {
    // 如果还没有创建全局预设格式数据，在此创建
    if (!window.__fileFormatsFallback) {
      console.log('App组件: 创建全局文件格式数据');
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
    
    // 完全替换XMLHttpRequest.open方法，防止任何请求到localhost
    try {
      const originalOpen = XMLHttpRequest.prototype.open;
      
      if (originalOpen && !originalOpen.__intercepted) {
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
          // 对localhost的请求进行特殊处理
          if (typeof url === 'string' && url.includes('localhost')) {
            console.warn('App拦截器: 拦截到对localhost的请求 -', url);
            
            // 特殊处理file/formats请求
            if (url.includes('file/formats')) {
              // 设置一个标志，在send方法中进行特殊处理
              this.__isFormatRequest = true;
            } else {
              // 其他localhost请求修改为无效URL
              url = 'https://app-blocked-request/';
            }
          }
          
          // 调用原始方法
          return originalOpen.apply(this, [method, url, ...args]);
        };
        
        // 标记已拦截
        XMLHttpRequest.prototype.open.__intercepted = true;
        console.log('App组件: 已拦截XMLHttpRequest.open方法');
      }
    } catch (e) {
      console.error('无法拦截XMLHttpRequest:', e);
    }
  }, []);
  
  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="app-layout">
        <Navbar />
        <Layout.Content className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/file-convert" element={<FileConvertPage />} />
            <Route path="/image-compress" element={<ImageCompressPage />} />
            <Route path="/image-crop" element={<ImageCropPage />} />
            <Route path="/image-format" element={<ImageFormatPage />} />
            <Route path="/image-watermark" element={<ImageWatermarkPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Layout.Content>
        <Footer />
      </Layout>
    </ConfigProvider>
  );
};

export default App; 