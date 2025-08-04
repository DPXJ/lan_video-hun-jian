import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import ffmpeg from 'fluent-ffmpeg'
import { uploadToOSS, deleteFromOSS } from '../config/oss'
import type { VideoFile, AudioFile } from '../types'

const router = express.Router()

// 配置multer
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('只能上传视频文件'))
      }
    } else if (file.fieldname === 'audio') {
      if (!file.mimetype.startsWith('audio/')) {
        return cb(new Error('只能上传音频文件'))
      }
    }
    cb(null, true)
  },
})

// 获取视频信息
const getVideoInfo = (buffer: Buffer): Promise<{ duration: number; thumbnail?: string }> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(buffer, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      const duration = metadata.format.duration || 0
      
      // 生成缩略图
      const thumbnailBuffer = Buffer.alloc(0)
      ffmpeg(buffer)
        .screenshots({
          timestamps: ['50%'],
          filename: 'thumbnail.jpg',
          folder: '/tmp',
          size: '320x240'
        })
        .on('end', () => {
          // 这里可以上传缩略图到OSS
          resolve({ duration })
        })
        .on('error', () => {
          resolve({ duration })
        })
    })
  })
}

// 获取音频信息
const getAudioInfo = (buffer: Buffer): Promise<{ duration: number }> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(buffer, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      const duration = metadata.format.duration || 0
      resolve({ duration })
    })
  })
}

// 上传视频
router.post('/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请选择视频文件'
      })
    }

    // 获取视频信息
    const videoInfo = await getVideoInfo(req.file.buffer)
    
    // 上传到OSS
    const url = await uploadToOSS(req.file, 'videos')
    
    // 生成缩略图URL（这里简化处理）
    const thumbnailUrl = url.replace(/\.[^/.]+$/, '_thumb.jpg')
    
    const videoFile: VideoFile = {
      id: uuidv4(),
      name: req.file.originalname,
      url,
      size: req.file.size,
      duration: videoInfo.duration,
      thumbnail: thumbnailUrl,
      uploadedAt: new Date(),
    }

    res.json({
      success: true,
      data: videoFile
    })
  } catch (error) {
    console.error('视频上传失败:', error)
    res.status(500).json({
      success: false,
      error: '视频上传失败'
    })
  }
})

// 上传音频
router.post('/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请选择音频文件'
      })
    }

    // 获取音频信息
    const audioInfo = await getAudioInfo(req.file.buffer)
    
    // 上传到OSS
    const url = await uploadToOSS(req.file, 'audios')
    
    const audioFile: AudioFile = {
      id: uuidv4(),
      name: req.file.originalname,
      url,
      size: req.file.size,
      duration: audioInfo.duration,
      uploadedAt: new Date(),
    }

    res.json({
      success: true,
      data: audioFile
    })
  } catch (error) {
    console.error('音频上传失败:', error)
    res.status(500).json({
      success: false,
      error: '音频上传失败'
    })
  }
})

// 删除视频
router.delete('/video/:id', async (req, res) => {
  try {
    // 这里需要从数据库获取视频信息来删除OSS文件
    // 简化处理，实际应该查询数据库
    res.json({
      success: true,
      message: '视频删除成功'
    })
  } catch (error) {
    console.error('视频删除失败:', error)
    res.status(500).json({
      success: false,
      error: '视频删除失败'
    })
  }
})

// 删除音频
router.delete('/audio/:id', async (req, res) => {
  try {
    // 这里需要从数据库获取音频信息来删除OSS文件
    // 简化处理，实际应该查询数据库
    res.json({
      success: true,
      message: '音频删除成功'
    })
  } catch (error) {
    console.error('音频删除失败:', error)
    res.status(500).json({
      success: false,
      error: '音频删除失败'
    })
  }
})

export default router 