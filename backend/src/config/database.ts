import mongoose from 'mongoose'

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/video-mixer'
    
    await mongoose.connect(mongoURI)
    
    console.log('MongoDB 连接成功')
  } catch (error) {
    console.error('MongoDB 连接失败:', error)
    process.exit(1)
  }
}

// 监听连接事件
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 连接错误:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 连接断开')
})

// 优雅关闭
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('MongoDB 连接已关闭')
  process.exit(0)
}) 