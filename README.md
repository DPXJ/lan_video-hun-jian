# 视频混剪项目 (Video Mixer)

一个基于AI的视频混剪平台，支持多视频素材上传、AI文案生成、自定义BGM、语音朗读等功能。

## 🚀 功能特性

- **多视频上传**: 支持上传最多20个视频素材
- **自定义BGM**: 支持上传多个背景音乐文件
- **AI文案生成**: 基于基础文案自动生成20个变体
- **灵活时长设置**: 支持15秒、30秒、30-60秒三种时长选项
- **批量生成**: 可设置生成多个视频
- **语音朗读**: 支持男声/女声朗读文案
- **自定义样式**: 可设置标题/字幕颜色、位置、字体大小
- **智能转场**: 自动添加视频转场效果
- **实时预览**: 支持生成结果预览和下载

## 🛠 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Ant Design** - UI组件库
- **Axios** - HTTP客户端
- **React Router** - 路由管理
- **React Player** - 视频播放器
- **Day.js** - 日期处理
- **Vite** - 构建工具

### 后端
- **Node.js** - 运行环境
- **Express** - Web框架
- **TypeScript** - 类型安全
- **FFmpeg** - 视频处理
- **OpenAI API** - AI文案生成
- **Aliyun OSS** - 文件存储
- **MongoDB** - 数据库
- **Multer** - 文件上传
- **Mongoose** - ODM
- **UUID** - 唯一标识符
- **Node-cron** - 定时任务
- **Compression** - 响应压缩
- **Express-rate-limit** - 请求限流

## 📁 项目结构

```
video-mixer/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # React组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API服务
│   │   ├── types/           # TypeScript类型定义
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # 后端服务
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── middleware/      # 中间件
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── services/        # 业务逻辑
│   │   ├── types/           # TypeScript类型定义
│   │   └── index.ts         # 入口文件
│   └── package.json
├── shared/                   # 共享类型定义（已废弃）
├── .env.example             # 环境变量示例
├── .gitignore               # Git忽略文件
├── package.json             # 根目录配置
├── start.bat               # Windows启动脚本
└── README.md               # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 4.4
- FFmpeg >= 4.0

### 1. 克隆项目

```bash
git clone <repository-url>
cd video-mixer
```

### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下必要参数：

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/video-mixer

# 服务器配置
PORT=3001
NODE_ENV=development

# 阿里云OSS配置
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# OpenAI API配置
OPENAI_API_KEY=your_openai_api_key

# 文件上传配置
MAX_FILE_SIZE=500MB
UPLOAD_TEMP_DIR=./temp

# 视频生成配置
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe
```

### 4. 启动项目

#### 方式一：使用启动脚本（推荐）

```bash
# Windows (PowerShell)
.\start.ps1

# Windows (CMD)
start.bat

# 或手动运行
./start.bat
```

#### 方式二：手动启动

```bash
# 启动后端服务
cd backend
npm run dev

# 新开终端，启动前端服务
cd frontend
npm run dev
```

### 5. 访问应用

- **前端地址**: http://localhost:3000
- **后端地址**: http://localhost:3001

## 📝 使用说明

1. **上传视频素材**: 在首页上传最多20个视频文件
2. **上传BGM**: 上传自定义背景音乐文件
3. **设置文案**: 输入基础文案，点击"AI生成"获取20个变体
4. **选择文案**: 勾选要使用的文案
5. **配置参数**: 设置视频时长、生成数量、语音风格、样式等
6. **开始生成**: 点击"开始AI制作"开始视频混剪
7. **查看结果**: 等待生成完成后预览和下载视频

## 🔧 开发说明

### 前端开发

```bash
cd frontend
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
npm run lint         # 代码检查
```

### 后端开发

```bash
cd backend
npm run dev          # 启动开发服务器（支持热重载）
npm run build        # 构建TypeScript
npm run start        # 启动生产服务器
npm run lint         # 代码检查
```

## 📋 API接口

### 文件上传
- `POST /api/upload/video` - 上传视频文件
- `POST /api/upload/audio` - 上传音频文件
- `DELETE /api/upload/video/:id` - 删除视频文件
- `DELETE /api/upload/audio/:id` - 删除音频文件

### AI服务
- `POST /api/ai/generate-scripts` - 生成AI文案

### 项目管理
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目
- `GET /api/projects` - 获取项目列表

### 视频生成
- `POST /api/generation/start` - 开始视频生成
- `GET /api/generation/status/:taskId` - 获取生成状态
- `POST /api/generation/cancel/:taskId` - 取消生成任务
- `GET /api/generation` - 获取任务列表

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**
   - 确保Node.js版本 >= 16.0.0
   - 清除npm缓存: `npm cache clean --force`
   - 删除node_modules重新安装

2. **MongoDB连接失败**
   - 确保MongoDB服务已启动
   - 检查MONGODB_URI配置是否正确

3. **FFmpeg相关错误**
   - 确保FFmpeg已正确安装
   - 检查FFMPEG_PATH和FFPROBE_PATH配置

4. **OSS上传失败**
   - 检查阿里云OSS配置
   - 确保AccessKey有足够权限

### 日志查看

```bash
# 后端日志
cd backend
npm run dev

# 前端日志
cd frontend
npm run dev
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题，请通过以下方式联系：

- 提交GitHub Issue
- 发送邮件至: support@example.com 