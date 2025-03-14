import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

/**
 * 服务卡片组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.icon - 图标
 * @param {string} props.title - 标题
 * @param {string} props.description - 描述
 * @param {string} props.link - 链接地址
 * @returns {React.Component} 服务卡片组件
 */
const ServiceCard = ({ icon, title, description, link }) => {
  return (
    <div className="service-card">
      <div className="service-icon">{icon}</div>
      <h3 className="service-title">{title}</h3>
      <p className="service-description">{description}</p>
      <Link to={link} className="service-link">
        点击了解
        <svg className="arrow-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
};

// 使用React.memo优化组件渲染性能
export default React.memo(ServiceCard); 