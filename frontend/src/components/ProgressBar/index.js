import React from 'react';
import { Progress, Button } from 'antd';
import './ProgressBar.css';

/**
 * 进度条组件
 * @param {Object} props - 组件属性
 * @param {number} props.percent - 进度百分比
 * @param {boolean} props.showActions - 是否显示操作按钮
 * @param {Function} props.onCancel - 取消操作回调
 * @param {Function} props.onDownload - 下载操作回调
 * @param {boolean} props.isCompleted - 是否已完成
 * @param {string} props.status - 进度条状态，可选值：'normal', 'exception', 'active', 'success'
 * @returns {React.Component} 进度条组件
 */
const ProgressBar = ({ 
  percent, 
  showActions = true,
  onCancel,
  onDownload,
  isCompleted = false,
  status = 'active'
}) => {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <Progress 
          percent={percent} 
          status={status}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      </div>
      
      {showActions && (
        <div className="progress-actions">
          {!isCompleted && (
            <Button 
              type="default" 
              danger
              onClick={onCancel}
              className="action-button"
            >
              取消转换
            </Button>
          )}
          
          {isCompleted && (
            <Button 
              type="primary" 
              onClick={onDownload}
              className="action-button"
            >
              下载文件
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 