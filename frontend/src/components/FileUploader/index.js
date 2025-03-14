import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { InboxOutlined } from '@ant-design/icons';
import { message } from 'antd';
import './FileUploader.css';

/**
 * 文件上传组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onFileUpload - 文件上传成功回调
 * @param {Array} props.acceptedFormats - 接受的文件格式
 * @param {number} props.maxSize - 最大文件大小（字节）
 * @returns {React.Component} 文件上传组件
 */
const FileUploader = ({ onFileUpload, acceptedFormats = [], maxSize = 50 * 1024 * 1024 }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  // 处理文件拖放和选择
  const onDrop = useCallback((acceptedFiles) => {
    // 验证文件
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // 检查文件大小
      if (file.size > maxSize) {
        message.error(`文件大小不能超过${maxSize / 1024 / 1024}MB`);
        return;
      }
      
      // 检查文件类型
      if (acceptedFormats.length > 0) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!acceptedFormats.includes(fileExtension)) {
          message.error(`不支持的文件格式，请上传${acceptedFormats.join(', ')}格式的文件`);
          return;
        }
      }
      
      // 调用父组件回调
      onFileUpload(file);
    }
  }, [onFileUpload, acceptedFormats, maxSize]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    multiple: false,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`file-uploader ${isDragActive ? 'active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="uploader-content">
        <InboxOutlined className="upload-icon" />
        <p className="upload-text">拖拽文件到此处或点击上传</p>
        {acceptedFormats.length > 0 && (
          <p className="upload-hint">
            支持的文件格式：{acceptedFormats.map(ext => ext.toUpperCase()).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUploader; 