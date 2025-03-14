import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import './Header.css';

/**
 * 网站头部导航组件
 * @returns {React.Component} Header组件
 */
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // 使用useCallback缓存函数
  const toggleMenu = useCallback(() => {
    setMenuOpen(prevState => !prevState);
  }, []);
  
  // 当路由变化时关闭移动端菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  
  // 监听窗口点击事件，点击菜单外区域时关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      const nav = document.querySelector('.nav');
      const menuBtn = document.querySelector('.mobile-menu-btn');
      
      if (menuOpen && nav && !nav.contains(event.target) && !menuBtn.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    
    // 添加点击事件监听
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    // 清理函数
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);
  
  // 监听窗口大小变化，在桌面模式下关闭移动菜单
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">b</span>
            <span className="logo-text">创网</span>
          </Link>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <MenuOutlined />
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li className={location.pathname === "/" ? "active" : ""}>
              <Link to="/">首页</Link>
            </li>
            <li className={location.pathname === "/file-convert" ? "active" : ""}>
              <Link to="/file-convert">文件转换</Link>
            </li>
            <li className={location.pathname === "/image-compress" ? "active" : ""}>
              <Link to="/image-compress">图片压缩</Link>
            </li>
            <li className={location.pathname === "/image-crop" ? "active" : ""}>
              <Link to="/image-crop">图片裁剪</Link>
            </li>
            <li className={location.pathname === "/image-format" ? "active" : ""}>
              <Link to="/image-format">图片格式转换</Link>
            </li>
            <li className={location.pathname === "/image-watermark" ? "active" : ""}>
              <Link to="/image-watermark">图片水印</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default React.memo(Header); 