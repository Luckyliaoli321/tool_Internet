import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileTextOutlined, 
  CompressOutlined, 
  ScissorOutlined, 
  SwapOutlined, 
  PictureOutlined,
  DesktopOutlined,
  GlobalOutlined,
  LineChartOutlined,
  BlockOutlined
} from '@ant-design/icons';
import ServiceCard from '../../components/ServiceCard';
import './Home.css';

/**
 * 网站首页组件
 * @returns {React.Component} 首页组件
 */
const Home = () => {
  // 使用useMemo缓存服务数据，避免重复创建
  const services = useMemo(() => [
    {
      id: 1,
      icon: <FileTextOutlined />,
      title: '文件转换',
      description: '支持多种文件格式之间的互相转换，包括PDF、Word、Excel、PPT等',
      link: '/file-convert'
    },
    {
      id: 2,
      icon: <CompressOutlined />,
      title: '图片压缩',
      description: '优化图片大小，在保持质量的同时有效减小文件体积',
      link: '/image-compress'
    },
    {
      id: 3,
      icon: <ScissorOutlined />,
      title: '图片裁剪',
      description: '轻松调整图片尺寸、比例，裁剪出需要的图片区域',
      link: '/image-crop'
    },
    {
      id: 4,
      icon: <SwapOutlined />,
      title: '图片格式转换',
      description: '支持JPG、PNG、GIF、WEBP等多种格式之间的转换',
      link: '/image-format'
    },
    {
      id: 5,
      icon: <PictureOutlined />,
      title: '图片水印',
      description: '为图片添加文字或图片水印，保护图片版权',
      link: '/image-watermark'
    }
  ], []);

  // 使用useMemo缓存业务领域数据
  const businessAreas = useMemo(() => [
    {
      icon: <DesktopOutlined />,
      title: 'IT技术'
    },
    {
      icon: <GlobalOutlined />,
      title: '互联网+'
    },
    {
      icon: <LineChartOutlined />,
      title: '大数据'
    },
    {
      icon: <BlockOutlined />,
      title: '区块链'
    }
  ], []);

  return (
    <div className="home-page">
      {/* 顶部横幅 */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">互联网一站式服务平台</h1>
          <p className="hero-subtitle">助你轻松进入互联网+时代</p>
          <Link to="/file-convert" className="hero-button">点击了解</Link>
        </div>
      </section>

      {/* 服务介绍 */}
      <section className="section services-section">
        <div className="container">
          <h2 className="section-title">我们的服务</h2>
          <p className="section-subtitle">提供多种在线工具，满足您的各种需求</p>
          
          <div className="services-grid">
            {services.map(service => (
              <div className="service-item" key={service.id}>
                <ServiceCard 
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  link={service.link}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 业务领域 */}
      <section className="section business-section">
        <div className="container">
          <h2 className="section-title">我们的案例</h2>
          <p className="section-subtitle">我们的服务已覆盖多个行业和领域</p>
          
          <div className="business-grid">
            {businessAreas.map((area, index) => (
              <div className="business-card" key={index}>
                <div className="business-icon">{area.icon}</div>
                <h3 className="business-title">{area.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 