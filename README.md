# 工具箱 - 一站式在线工具平台

这是一个提供多种实用工具的网站，包括文件转换、图片压缩、图片裁剪、图片格式转换和图片水印功能。

## 功能特点

- **文件转换**：支持多种文件格式转换，包括PDF、Word、Excel、PPT等
- **图片压缩**：高效压缩图片大小，保持图片质量，节省存储空间
- **图片裁剪**：自由裁剪图片尺寸，支持多种比例和自定义裁剪
- **图片格式转换**：支持JPG、PNG、GIF、WEBP等多种图片格式互相转换
- **图片水印**：为图片添加文字或图片水印，保护图片版权

## 技术栈

### 前端
- React.js
- React Router
- Ant Design
- Axios
- React Dropzone

### 后端
- Node.js
- Express
- Multer
- Sharp
- PDF-lib, docx, xlsx等文件处理库

## 安装与运行

### 前提条件
- Node.js (>= 14.x)
- npm (>= 6.x)

### 安装依赖

```bash
# 安装项目依赖
npm run install-all
```

### 运行项目

```bash
# 同时运行前端和后端
npm start

# 只运行前端
npm run start-frontend

# 只运行后端
npm run start-backend

# 以开发模式运行后端（支持热重载）
npm run dev-backend
```

## 项目结构

```
/tool-website/              # 项目根目录
├── frontend/               # 前端代码
│   ├── public/             # 静态资源
│   └── src/                # 源代码
│       ├── components/     # 公共组件
│       ├── pages/          # 页面组件
│       └── ...
├── backend/                # 后端代码
│   ├── routes/             # 路由
│   ├── controllers/        # 控制器
│   ├── services/           # 服务层
│   └── ...
└── ...
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT 