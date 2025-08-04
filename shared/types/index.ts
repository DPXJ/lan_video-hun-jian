// 视频文件信息
export interface VideoFile {
  id: string;
  name: string;
  url: string;
  size: number;
  duration: number;
  thumbnail?: string;
  uploadedAt: Date;
}

// 音频文件信息
export interface AudioFile {
  id: string;
  name: string;
  url: string;
  size: number;
  duration: number;
  uploadedAt: Date;
}

// 文案信息
export interface Script {
  id: string;
  content: string;
  selected: boolean;
  generatedAt: Date;
}

// 时间设置选项
export type DurationOption = '15s' | '30s' | '30-60s';

// 语音朗读选项
export type VoiceOption = 'male' | 'female';

// 样式配置
export interface StyleConfig {
  title: {
    color: string;
    position: 'top' | 'center' | 'bottom';
    fontSize: number;
  };
  subtitle: {
    color: string;
    position: 'top' | 'center' | 'bottom';
    fontSize: number;
  };
}

// 项目配置
export interface ProjectConfig {
  id: string;
  name: string;
  videos: VideoFile[];
  audios: AudioFile[];
  scripts: Script[];
  duration: DurationOption;
  videoCount: number;
  voice: VoiceOption;
  style: StyleConfig;
  createdAt: Date;
  updatedAt: Date;
}

// 生成任务状态
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 生成任务
export interface GenerationTask {
  id: string;
  projectId: string;
  status: TaskStatus;
  progress: number;
  result?: {
    videos: string[];
    previewUrl?: string;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 上传进度
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
} 