import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { connectDB } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import uploadRoutes from './routes/upload'
import aiRoutes from './routes/ai'
import projectRoutes from './routes/projects'
import generationRoutes from './routes/generation'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('combined'))

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
})
app.use('/api/', limiter)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 路由
app.use('/api/upload', uploadRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/generation', generationRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 错误处理
app.use(errorHandler)

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: '接口不存在' 
  })
})

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB()
    console.log('✅ 数据库连接成功')

    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
      console.log(`📊 健康检查: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...')
  process.exit(0)
}) 