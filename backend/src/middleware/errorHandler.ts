import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err }
  error.message = err.message

  // 记录错误日志
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = '资源不存在'
    error = { message, statusCode: 404 } as AppError
  }

  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ')
    error = { message, statusCode: 400 } as AppError
  }

  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = '数据已存在'
    error = { message, statusCode: 400 } as AppError
  }

  // JWT 错误处理
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的令牌'
    error = { message, statusCode: 401 } as AppError
  }

  if (err.name === 'TokenExpiredError') {
    const message = '令牌已过期'
    error = { message, statusCode: 401 } as AppError
  }

  // 文件上传错误
  if (err.message.includes('File too large')) {
    const message = '文件大小超出限制'
    error = { message, statusCode: 400 } as AppError
  }

  if (err.message.includes('Unexpected field')) {
    const message = '文件上传字段错误'
    error = { message, statusCode: 400 } as AppError
  }

  // 默认错误响应
  const statusCode = error.statusCode || 500
  const message = error.message || '服务器内部错误'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
} 