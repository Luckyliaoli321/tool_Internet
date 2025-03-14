import React, { useState, useEffect, useCallback } from 'react';
import { Select, Button, message, Alert } from 'antd';
import { FileOutlined, DownloadOutlined } from '@ant-design/icons';
import FileUploader from '../../components/FileUploader';
import ProgressBar from '../../components/ProgressBar';
import { fileAPI } from '../../utils/api';
import './FileConvertPage.css';

const { Option } = Select;

/**
 * 文件转换页面组件
 * @returns {React.Component} 文件转换页面组件
 */
const FileConvertPage = () => {
  // 状态
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [supportedFormats, setSupportedFormats] = useState([]);
  const [availableTargetFormats, setAvailableTargetFormats] = useState([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [convertedFileId, setConvertedFileId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // 获取支持的文件格式
  useEffect(() => {
    const fetchSupportedFormats = async () => {
      try {
        const data = await fileAPI.getSupportedFormats();
        setSupportedFormats(data.formats);
      } catch (err) {
        setError('获取支持的文件格式失败');
        console.error('获取格式错误:', err);
      }
    };

    fetchSupportedFormats();
  }, []);

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
        setAvailableTargetFormats([]);
        setTargetFormat('');
        setError(`不支持${extension}格式的文件转换`);
      }
    } else {
      setAvailableTargetFormats([]);
      setTargetFormat('');
    }
  }, [file, supportedFormats]);

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
            onFileUpload={handleFileUpload}
            acceptedFormats={getAcceptedFormats()}
          />
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