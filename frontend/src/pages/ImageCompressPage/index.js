import React, { useState, useEffect } from 'react';
import { Slider, Button, Alert, Typography, Row, Col, Spin, message } from 'antd';
import { DownloadOutlined, EyeOutlined, CompressOutlined } from '@ant-design/icons';
import FileUploader from '../../components/FileUploader';
import ProgressBar from '../../components/ProgressBar';
import { imageAPI } from '../../utils/api';
import './ImageCompressPage.css';

const { Title, Text, Paragraph } = Typography;

/**
 * 图片压缩页面组件
 * @returns {React.Component} 图片压缩页面组件
 */
const ImageCompressPage = () => {
  // 组件状态
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressedPreview, setCompressedPreview] = useState('');
  const [quality, setQuality] = useState(70);
  const [scale, setScale] = useState(50);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');
  
  // 支持的图片格式
  const acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  
  // 处理图片上传
  const handleImageUpload = (file) => {
    // 重置状态
    setCompressedImage(null);
    setCompressedPreview('');
    setIsCompleted(false);
    setError('');
    
    // 设置新上传的图片
    setImage(file);
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };
  
  // 处理质量滑块变化
  const handleQualityChange = (value) => {
    setQuality(value);
  };
  
  // 处理尺寸滑块变化
  const handleScaleChange = (value) => {
    setScale(value);
  };
  
  // 预览压缩效果 (客户端预览)
  const previewCompression = async () => {
    if (!image) {
      message.error('请先上传图片');
      return;
    }
    
    try {
      // 使用Canvas进行客户端压缩预览
      const img = new Image();
      img.onload = () => {
        // 计算新尺寸
        const newWidth = (img.width * scale) / 100;
        const newHeight = (img.height * scale) / 100;
        
        // 创建canvas
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 绘制图片
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // 导出预览图
        const previewUrl = canvas.toDataURL('image/jpeg', quality / 100);
        setCompressedPreview(previewUrl);
      };
      
      img.src = imagePreview;
    } catch (err) {
      setError('预览失败，请重试');
      console.error('预览错误：', err);
    }
  };
  
  // 开始压缩 (发送到服务器处理)
  const startCompression = async () => {
    if (!image) {
      message.error('请先上传图片');
      return;
    }
    
    setIsCompressing(true);
    setProgress(0);
    setError('');
    
    try {
      // 大图片发送到服务器压缩
      if (image.size > 2 * 1024 * 1024) { // 大于2MB
        const result = await imageAPI.compressImage(
          image, 
          { quality, scale },
          (progressEvent) => {
            // 更新进度
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        );
        
        // 处理压缩后的图片
        const blob = await fetch(result.imageUrl).then(res => res.blob());
        setCompressedImage(new File([blob], `compressed_${image.name}`, { type: image.type }));
        setCompressedPreview(result.imageUrl);
      } else {
        // 小图片直接在客户端压缩 (使用canvas)
        await new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            // 更新进度
            setProgress(30);
            
            // 计算新尺寸
            const newWidth = (img.width * scale) / 100;
            const newHeight = (img.height * scale) / 100;
            
            // 创建canvas
            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            // 更新进度
            setProgress(60);
            
            // 绘制图片
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            // 导出为blob
            canvas.toBlob((blob) => {
              setProgress(90);
              setCompressedImage(new File([blob], `compressed_${image.name}`, { type: 'image/jpeg' }));
              const previewUrl = URL.createObjectURL(blob);
              setCompressedPreview(previewUrl);
              
              setProgress(100);
              resolve();
            }, 'image/jpeg', quality / 100);
          };
          
          img.src = imagePreview;
        });
      }
      
      // 完成处理
      setIsCompleted(true);
    } catch (err) {
      setError('压缩失败，请重试');
      console.error('压缩错误：', err);
    } finally {
      setIsCompressing(false);
    }
  };
  
  // 下载压缩后的图片
  const downloadCompressedImage = () => {
    if (!compressedImage || !compressedPreview) {
      message.error('没有可下载的压缩图片');
      return;
    }
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = compressedPreview;
    link.download = compressedImage.name;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    URL.revokeObjectURL(compressedPreview);
    document.body.removeChild(link);
  };
  
  // 格式化大小
  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  // 计算压缩比例
  const getCompressionRatio = () => {
    if (!image || !compressedImage) return null;
    
    const ratio = ((image.size - compressedImage.size) / image.size * 100).toFixed(1);
    return ratio;
  };
  
  // 在组件卸载时清理URL对象
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (compressedPreview) URL.revokeObjectURL(compressedPreview);
    };
  }, [imagePreview, compressedPreview]);
  
  return (
    <div className="image-compress-page">
      <div className="container">
        <div className="page-header">
          <Title level={2} className="page-title">图片压缩</Title>
          <Paragraph className="page-description">
            压缩图片以减小文件大小，提高加载速度和节省存储空间
          </Paragraph>
        </div>
        
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            className="error-alert"
          />
        )}
        
        <div className="uploader-section">
          <FileUploader
            onFileUpload={handleImageUpload}
            acceptedFormats={acceptedFormats}
            maxSize={10 * 1024 * 1024} // 10MB
          />
          
          {image && (
            <div className="format-info">
              <Text>支持的图片格式：JPG, JPEG, PNG, GIF, WEBP, BMP</Text>
            </div>
          )}
        </div>
        
        {image && (
          <div className="compress-settings">
            <Title level={4}>压缩设置</Title>
            
            <div className="setting-item">
              <Text>压缩质量：{quality}%</Text>
              <Slider
                min={1}
                max={100}
                value={quality}
                onChange={handleQualityChange}
                className="quality-slider"
              />
            </div>
            
            <div className="setting-item">
              <Text>图片尺寸：{scale}%</Text>
              <Slider
                min={1}
                max={100}
                value={scale}
                onChange={handleScaleChange}
                className="scale-slider"
              />
            </div>
            
            <div className="action-buttons">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={previewCompression}
                className="preview-button"
              >
                预览效果
              </Button>
              
              <Button
                type="primary"
                icon={<CompressOutlined />}
                onClick={startCompression}
                loading={isCompressing}
                className="compress-button"
              >
                开始压缩
              </Button>
            </div>
          </div>
        )}
        
        {isCompressing && (
          <div className="compression-progress">
            <Title level={4}>正在压缩...</Title>
            <ProgressBar
              percent={progress}
              status="active"
              showActions={false}
            />
          </div>
        )}
        
        {(compressedPreview || isCompleted) && (
          <div className="compression-result">
            <Title level={4}>压缩结果</Title>
            
            <Row gutter={24} className="image-preview-row">
              <Col span={12} className="image-preview-col">
                <div className="image-preview-container">
                  <div className="image-preview-header">
                    <Text strong>原图</Text>
                    <Text className="file-size">({formatFileSize(image.size)})</Text>
                  </div>
                  <div className="image-preview">
                    <img src={imagePreview} alt="原图预览" />
                  </div>
                </div>
              </Col>
              
              <Col span={12} className="image-preview-col">
                <div className="image-preview-container">
                  <div className="image-preview-header">
                    <Text strong>压缩后</Text>
                    {compressedImage && (
                      <Text className="file-size">
                        ({formatFileSize(compressedImage.size)})
                        {getCompressionRatio() && (
                          <span className="compression-ratio">
                            减小了 {getCompressionRatio()}%
                          </span>
                        )}
                      </Text>
                    )}
                  </div>
                  <div className="image-preview">
                    {compressedPreview ? (
                      <img src={compressedPreview} alt="压缩后预览" />
                    ) : (
                      <Spin tip="加载中..." />
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            
            <div className="download-section">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                onClick={downloadCompressedImage}
                disabled={!compressedImage}
                className="download-button"
              >
                下载压缩后的图片
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompressPage; 