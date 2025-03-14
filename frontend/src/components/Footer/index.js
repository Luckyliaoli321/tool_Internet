import React from 'react';
import './Footer.css';

/**
 * 网站底部组件
 * @returns {React.Component} Footer组件
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">关于我们</h3>
            <p>我们致力于提供高效、便捷的在线工具，帮助您解决日常办公、图片处理等各种需求，提高工作效率。</p>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">服务导航</h3>
            <ul className="footer-links">
              <li><a href="/file-convert">文件转换</a></li>
              <li><a href="/image-compress">图片压缩</a></li>
              <li><a href="/image-crop">图片裁剪</a></li>
              <li><a href="/image-format">图片格式转换</a></li>
              <li><a href="/image-watermark">图片水印</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">联系我们</h3>
            <ul className="footer-contact">
              <li>邮箱: contact@example.com</li>
              <li>电话: (123) 456-7890</li>
              <li>地址: 北京市海淀区</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} 互联网一站式服务平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 