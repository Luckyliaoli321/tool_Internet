import React, { useState } from 'react';
import { Layout, Typography, Upload, Select, Button, message, Card, Space } from 'antd';
import { InboxOutlined, FileOutlined } from '@ant-design/icons';
import axios from 'axios';
import './index.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

const FileConvert = () => {
  const [fileList, setFileList] = useState([]);
  const [targetFormat, setTargetFormat] = useState('');
  const [converting, setConverting] = useState(false);

  const supportedFormats = {
    'doc': ['pdf', 'docx', 'txt'],
    'docx': ['pdf', 'doc', 'txt'],
    'pdf': ['doc', 'docx', 'txt'],
    'txt': ['pdf', 'doc', 'docx'],
  };

  const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
  };

  const beforeUpload = (file) => {
    const extension = getFileExtension(file.name);
    if (!supportedFormats[extension]) {
      message.error('不支持该文件格式！');
      return false;
    }
    setFileList([file]);
    return false;
  };

  const handleFormatChange = (value) => {
    setTargetFormat(value);
  };

  const handleConvert = async () => {
    if (!fileList.length) {
      message.error('请先上传文件！');
      return;
    }
    if (!targetFormat) {
      message.error('请选择目标格式！');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('targetFormat', targetFormat);

    setConverting(true);
    try {
      const response = await axios.post('/api/file/convert', formData, {
        responseType: 'blob',
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `converted.${targetFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('转换成功！');
    } catch (error) {
      message.error('转换失败，请重试！');
      console.error('Error:', error);
    } finally {
      setConverting(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload,
    fileList,
    onRemove: () => {
      setFileList([]);
      setTargetFormat('');
    },
    onDrop(e) {
      console.log('Drop event:', e);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        const extension = getFileExtension(file.name);
        if (supportedFormats[extension]) {
          setFileList([file]);
        } else {
          message.error('不支持该文件格式！');
        }
      }
    },
    accept: '.doc,.docx,.pdf,.txt',
    showUploadList: {
      showPreviewIcon: false,
      showRemoveIcon: true,
    },
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo">工具网站</div>
        <nav className="nav">
          <a href="/">首页</a>
          <a href="/about">关于我们</a>
          <a href="/contact">联系我们</a>
        </nav>
      </Header>

      <Content className="content">
        <div className="container">
          <Title level={2} className="page-title">文件转换</Title>
          <Paragraph className="page-description">
            支持多种文件格式互转，包括PDF、Word、TXT等格式
          </Paragraph>

          <Card className="convert-card">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持单个文件上传，可转换的格式：PDF、DOC、DOCX、TXT
                </p>
              </Dragger>

              {fileList.length > 0 && (
                <div className="format-select">
                  <Title level={5}>选择目标格式：</Title>
                  <Select
                    style={{ width: 200 }}
                    onChange={handleFormatChange}
                    value={targetFormat}
                  >
                    {fileList.length > 0 &&
                      supportedFormats[getFileExtension(fileList[0].name)]?.map(
                        (format) => (
                          <Option key={format} value={format}>
                            {format.toUpperCase()}
                          </Option>
                        )
                      )}
                  </Select>
                </div>
              )}

              <Button
                type="primary"
                onClick={handleConvert}
                disabled={!fileList.length || !targetFormat}
                loading={converting}
                icon={<FileOutlined />}
                size="large"
                block
              >
                开始转换
              </Button>
            </Space>
          </Card>
        </div>
      </Content>

      <Footer className="footer">
        <p>©2024 工具网站 版权所有</p>
      </Footer>
    </Layout>
  );
};

export default FileConvert; 