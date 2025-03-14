import React, { useState, useEffect, useCallback } from 'react';
import { Select, Button, message, Alert } from 'antd';
import { FileOutlined, DownloadOutlined } from '@ant-design/icons';
import FileUploader from '../../components/FileUploader';
import ProgressBar from '../../components/ProgressBar';
import { fileAPI } from '../../utils/api';
import './FileConvertPage.css';

const { Option } = Select;

// 默认支持的格式列表（当API获取失败时使用）
const DEFAULT_FORMATS = [
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
];

/**
 * 文件转换页面组件
 * @returns {React.Component} 文件转换页面组件
 */
const FileConvertPage = () => {
  // 状态
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [supportedFormats, setSupportedFormats] = useState(
    // 直接初始化为预设格式或默认格式
    window.__fileFormatsFallback ? window.__fileFormatsFallback.formats : DEFAULT_FORMATS
  );
  const [availableTargetFormats, setAvailableTargetFormats] = useState([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [convertedFileId, setConvertedFileId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [usingDefaultFormats, setUsingDefaultFormats] = useState(true); // 默认使用预设格式

  // 初始化时直接提示使用预设格式
  useEffect(() => {
    console.log('文件转换页面初始化 - 使用预设格式数据');
  }, []);

  // 添加重试获取格式的功能（仅用于UI交互，实际上永远使用预设格式）
  const retryFetchFormats = async () => {
    setError('');
    message.info('使用默认文件格式（离线模式）');
    return;
  };

  // 当文件变化时，更新可用的目标格式
  useEffect(() => {
    if (file && supportedFormats.length > 0) {
      // 获取文件扩展名
      const extension = file.name.split('.').pop().toLowerCase();
      
      // 找到当前文件类型支持转换的格式
      const currentFileType = supportedFormats.find(format => 
        format.extension === extension
      );
      
      if (currentFileType) {
        setAvailableTargetFormats(currentFileType.targetFormats);
        setTargetFormat(currentFileType.targetFormats[0]?.extension || '');
      } else {
        // 如果文件类型不在支持列表中，尝试使用默认格式中的第一个
        setAvailableTargetFormats(DEFAULT_FORMATS[0].targetFormats);
        setTargetFormat(DEFAULT_FORMATS[0].targetFormats[0]?.extension || '');
        if (!usingDefaultFormats) {
          setError(`不支持${extension}格式的文件转换，请尝试其他格式`);
        }
      }
    } else {
      setAvailableTargetFormats([]);
      setTargetFormat('');
    }
  }, [file, supportedFormats, usingDefaultFormats]);

  // 处理文件上传
  const handleFileUpload = useCallback((uploadedFile) => {
    setFile(uploadedFile);
    setError('');
    setIsCompleted(false);
    setConvertedFileId('');
    setProgress(0);
  }, []);

  // 处理格式选择
  const handleFormatChange = (value) => {
    setTargetFormat(value);
  };

  // 开始转换
  const startConversion = async () => {
    if (!file) {
      message.error('请先上传文件');
      return;
    }

    if (!targetFormat) {
      message.error('请选择目标格式');
      return;
    }

    setError('');
    setConverting(true);
    setProgress(0);
    setIsCompleted(false);
    
    try {
      // 上传文件并转换
      const result = await fileAPI.convertFile(
        file, 
        targetFormat,
        (percent) => setProgress(percent)
      );
      
      setConvertedFileId(result.fileId);
      setIsCompleted(true);
      message.success('文件转换成功！');
    } catch (err) {
      setError(err.message || '文件转换失败，请重试');
      console.error('转换错误:', err);
    } finally {
      setConverting(false);
    }
  };

  // 取消转换
  const cancelConversion = async () => {
    if (convertedFileId) {
      try {
        await fileAPI.cancelConversion(convertedFileId);
        message.info('已取消转换');
      } catch (err) {
        console.error('取消错误:', err);
      }
    }
    
    setConverting(false);
    setProgress(0);
  };

  // 下载文件
  const downloadFile = async () => {
    if (!convertedFileId) {
      message.error('没有可下载的文件');
      return;
    }

    try {
      const blob = await fileAPI.downloadFile(convertedFileId);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // 设置文件名
      const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
      a.download = `${fileNameWithoutExt}.${targetFormat}`;
      
      // 触发下载
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('下载文件失败');
      console.error('下载错误:', err);
    }
  };

  // 获取支持的文件格式列表
  const getAcceptedFormats = () => {
    if (!supportedFormats.length) return [];
    return supportedFormats.map(format => format.extension);
  };

  return (
    <div className="file-convert-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">文件转换</h1>
          <p className="page-description">
            支持多种文件格式之间的转换，满足您的各种文档处理需求
          </p>
        </div>

        {error && (
          <Alert
            message={usingDefaultFormats ? "提示" : "错误"}
            description={
              <div>
                {error}
                {usingDefaultFormats && (
                  <Button
                    type="link"
                    onClick={retryFetchFormats}
                    style={{ padding: 0, marginLeft: 10 }}
                  >
                    重试获取
                  </Button>
                )}
              </div>
            }
            type={usingDefaultFormats ? "info" : "error"}
            showIcon
            closable
            onClose={() => setError('')}
            className="error-alert"
          />
        )}

        <div className="uploader-section">
          <FileUploader
            onFileUpload={handleFileUpload}
            acceptedFormats={getAcceptedFormats()}
          />
          {usingDefaultFormats && !error && (
            <Alert
              message="提示"
              description={
                <div>
                  当前使用默认支持格式列表。
                  <Button
                    type="link"
                    onClick={retryFetchFormats}
                    style={{ padding: 0, marginLeft: 10 }}
                  >
                    获取完整格式列表
                  </Button>
                </div>
              }
              type="info"
              showIcon
              className="format-alert"
              style={{ marginTop: 16 }}
            />
          )}
        </div>

        {file && (
          <div className="file-info">
            <div className="file-details">
              <FileOutlined className="file-icon" />
              <div className="file-name-size">
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>

            <div className="convert-options">
              <div className="format-selector">
                <label>选择转换格式:</label>
                <Select
                  value={targetFormat}
                  onChange={handleFormatChange}
                  style={{ width: 120 }}
                  disabled={converting || !availableTargetFormats.length}
                >
                  {availableTargetFormats.map((format) => (
                    <Option key={format.extension} value={format.extension}>
                      {format.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <Button
                type="primary"
                onClick={startConversion}
                loading={converting}
                disabled={!targetFormat || converting}
                className="convert-button"
              >
                开始转换
              </Button>
            </div>
          </div>
        )}

        {(converting || isCompleted) && (
          <div className="conversion-progress">
            <h3 className="section-title">
              {isCompleted ? '转换完成' : '转换进度'}
            </h3>
            <ProgressBar
              percent={progress}
              onCancel={cancelConversion}
              onDownload={downloadFile}
              isCompleted={isCompleted}
              status={isCompleted ? 'success' : 'active'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileConvertPage; 