## media-upload-service

媒体上传微服务：提供批量预签名直传与服务端中转上传到阿里云 OSS，返回可访问 URL 列表。

### 运行
1. 复制 `env.example` 为 `.env` 并填写 OSS 与域名配置
2. 安装依赖并启动

```bash
cd media-upload-service
npm install
npm run dev
```

健康检查：`GET http://localhost:4010/v1/health`

### API
- POST `/v1/uploads/presign`
  - 请求：
  ```json
  {
    "files": [
      {"filename":"a.mp4","mimeType":"video/mp4","kind":"video"},
      {"filename":"b.mp3","mimeType":"audio/mpeg","kind":"audio"}
    ],
    "prefix":"org/project/2025/08/08",
    "expiresSec": 900
  }
  ```
  - 响应：`{ success,true, items:[{ filename,key,uploadUrl,headers,publicUrl }] }`

- POST `/v1/uploads/videos`（multipart, 字段名 `files`）
- POST `/v1/uploads/audios`（multipart, 字段名 `files`）

### 注意
- 仅演示简单 PUT 预签名与中转，不含分片接口（后续可加）
- 通过 `PUBLIC_BASE_URL` 返回 CDN 域名，否则回落到 OSS 域名


