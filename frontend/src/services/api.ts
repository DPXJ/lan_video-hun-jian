import axios from 'axios'
import type { 
  VideoFile, 
  AudioFile, 
  Script, 
  ProjectConfig, 
  GenerationTask,
  ApiResponse,
  DurationOption,
  VoiceOption,
  StyleConfig 
} from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 文件上传
export const uploadVideo = async (file: File): Promise<VideoFile> => {
  const formData = new FormData()
  formData.append('video', file)
  
  const response = await api.post<ApiResponse<VideoFile>>('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  if (!response.data.success) {
    throw new Error(response.data.error || '上传失败')
  }
  
  return response.data.data!
}

export const uploadAudio = async (file: File): Promise<AudioFile> => {
  const formData = new FormData()
  formData.append('audio', file)
  
  const response = await api.post<ApiResponse<AudioFile>>('/upload/audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  if (!response.data.success) {
    throw new Error(response.data.error || '上传失败')
  }
  
  return response.data.data!
}

// AI文案生成
export const generateScripts = async (baseScript: string): Promise<Script[]> => {
  const response = await api.post<ApiResponse<Script[]>>('/ai/generate-scripts', {
    baseScript,
  })
  
  if (!response.data.success) {
    throw new Error(response.data.error || '生成失败')
  }
  
  return response.data.data!
}

// 项目配置
export const saveProject = async (config: Omit<ProjectConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectConfig> => {
  const response = await api.post<ApiResponse<ProjectConfig>>('/projects', config)
  
  if (!response.data.success) {
    throw new Error(response.data.error || '保存失败')
  }
  
  return response.data.data!
}

export const getProject = async (id: string): Promise<ProjectConfig> => {
  const response = await api.get<ApiResponse<ProjectConfig>>(`/projects/${id}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || '获取失败')
  }
  
  return response.data.data!
}

// 视频生成
export const startGeneration = async (projectId: string): Promise<GenerationTask> => {
  const response = await api.post<ApiResponse<GenerationTask>>('/generation/start', {
    projectId,
  })
  
  if (!response.data.success) {
    throw new Error(response.data.error || '启动失败')
  }
  
  return response.data.data!
}

export const getGenerationStatus = async (taskId: string): Promise<GenerationTask> => {
  const response = await api.get<ApiResponse<GenerationTask>>(`/generation/status/${taskId}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || '获取状态失败')
  }
  
  return response.data.data!
}

// 文件删除
export const deleteVideo = async (id: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/videos/${id}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || '删除失败')
  }
}

export const deleteAudio = async (id: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/audios/${id}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || '删除失败')
  }
}

export default api 