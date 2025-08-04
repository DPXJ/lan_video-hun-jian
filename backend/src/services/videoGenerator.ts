import ffmpeg from 'fluent-ffmpeg'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Task } from '../models/Task'
import { Project } from '../models/Project'
import { uploadToOSS } from '../config/oss'

// 确保临时目录存在
const TEMP_DIR = path.join(__dirname, '../../temp')
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

export const startVideoGeneration = async (taskId: string, projectId: string) => {
  try {
    // 更新任务状态为处理中
    await Task.findByIdAndUpdate(taskId, {
      status: 'processing',
      progress: 10
    })

    // 获取项目信息
    const project = await Project.findById(projectId)
    if (!project) {
      throw new Error('项目不存在')
    }

    const selectedScripts = project.scripts.filter(s => s.selected)
    const videoCount = Math.min(project.videoCount, selectedScripts.length)
    const generatedVideos: string[] = []

    // 为每个选中的文案生成视频
    for (let i = 0; i < videoCount; i++) {
      const script = selectedScripts[i]
      const progress = 10 + Math.floor((i / videoCount) * 80)
      
      await Task.findByIdAndUpdate(taskId, { progress })

      try {
        const videoUrl = await generateSingleVideo(project, script, i)
        generatedVideos.push(videoUrl)
      } catch (error) {
        console.error(`生成第${i + 1}个视频失败:`, error)
        // 继续生成其他视频
      }
    }

    // 更新任务为完成状态
    await Task.findByIdAndUpdate(taskId, {
      status: 'completed',
      progress: 100,
      result: {
        videos: generatedVideos,
        previewUrl: generatedVideos[0] // 使用第一个视频作为预览
      }
    })

    console.log(`任务 ${taskId} 完成，生成了 ${generatedVideos.length} 个视频`)
  } catch (error) {
    console.error('视频生成失败:', error)
    
    // 更新任务为失败状态
    await Task.findByIdAndUpdate(taskId, {
      status: 'failed',
      error: error instanceof Error ? error.message : '视频生成失败'
    })
  }
}

const generateSingleVideo = async (
  project: any,
  script: any,
  index: number
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const outputFileName = `output_${taskId}_${index}.mp4`
      const outputPath = path.join(TEMP_DIR, outputFileName)

      // 计算目标时长
      const targetDuration = getTargetDuration(project.duration)
      
      // 创建FFmpeg命令
      const command = ffmpeg()

      // 添加视频输入
      const videoInputs = project.videos.map((video: any) => video.url)
      videoInputs.forEach(url => {
        command.input(url)
      })

      // 添加音频输入（如果有）
      if (project.audios && project.audios.length > 0) {
        const randomAudio = project.audios[Math.floor(Math.random() * project.audios.length)]
        command.input(randomAudio.url)
      }

      // 生成语音（这里简化处理，实际应该调用TTS服务）
      const audioUrl = await generateSpeech(script.content, project.voice)
      if (audioUrl) {
        command.input(audioUrl)
      }

      // 设置输出参数
      command
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-shortest',
          '-t', targetDuration.toString(),
          '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
          '-r', '30',
          '-b:v', '2M',
          '-b:a', '128k'
        ])
        .output(outputPath)
        .on('start', () => {
          console.log(`开始生成视频 ${index + 1}`)
        })
        .on('progress', (progress) => {
          console.log(`视频 ${index + 1} 生成进度: ${progress.percent}%`)
        })
        .on('end', async () => {
          try {
            // 上传到OSS
            const fileBuffer = fs.readFileSync(outputPath)
            const mockFile = {
              buffer: fileBuffer,
              originalname: outputFileName,
              mimetype: 'video/mp4'
            } as any

            const url = await uploadToOSS(mockFile, 'generated')
            
            // 清理临时文件
            fs.unlinkSync(outputPath)
            
            resolve(url)
          } catch (error) {
            reject(error)
          }
        })
        .on('error', (error) => {
          console.error(`视频 ${index + 1} 生成错误:`, error)
          reject(error)
        })
        .run()

    } catch (error) {
      reject(error)
    }
  })
}

const getTargetDuration = (duration: string): number => {
  switch (duration) {
    case '15s':
      return 15
    case '30s':
      return 30
    case '30-60s':
      return Math.floor(Math.random() * 30) + 30 // 30-60秒随机
    default:
      return 30
  }
}

const generateSpeech = async (text: string, voice: string): Promise<string | null> => {
  try {
    // 这里应该调用TTS服务，比如阿里云、腾讯云等
    // 简化处理，返回null
    console.log(`生成语音: ${text}, 声音: ${voice}`)
    return null
  } catch (error) {
    console.error('语音生成失败:', error)
    return null
  }
}

// 清理临时文件
export const cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(TEMP_DIR)
    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file)
      const stats = fs.statSync(filePath)
      
      // 删除超过1小时的文件
      if (Date.now() - stats.mtime.getTime() > 60 * 60 * 1000) {
        fs.unlinkSync(filePath)
      }
    })
  } catch (error) {
    console.error('清理临时文件失败:', error)
  }
}

// 定期清理临时文件
setInterval(cleanupTempFiles, 30 * 60 * 1000) // 每30分钟清理一次 