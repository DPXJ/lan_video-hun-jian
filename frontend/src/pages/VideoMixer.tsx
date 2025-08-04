import React, { useState, useEffect } from 'react'
import { Button, message, Input, Space } from 'antd'
import { PlayCircleOutlined, SaveOutlined } from '@ant-design/icons'
import type { 
  VideoFile, 
  AudioFile, 
  Script, 
  ProjectConfig, 
  GenerationTask,
  DurationOption,
  VoiceOption,
  StyleConfig 
} from '../types'
import VideoUpload from '../components/VideoUpload'
import AudioUpload from '../components/AudioUpload'
import ScriptConfig from '../components/ScriptConfig'
import ConfigSettings from '../components/ConfigSettings'
import GenerationResult from '../components/GenerationResult'
import { saveProject, startGeneration, getGenerationStatus } from '../services/api'

const VideoMixer: React.FC = () => {
  // 状态管理
  const [projectName, setProjectName] = useState('')
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [audios, setAudios] = useState<AudioFile[]>([])
  const [scripts, setScripts] = useState<Script[]>([])
  const [duration, setDuration] = useState<DurationOption>('30s')
  const [videoCount, setVideoCount] = useState(3)
  const [voice, setVoice] = useState<VoiceOption>('female')
  const [style, setStyle] = useState<StyleConfig>({
    title: {
      color: '#ffffff',
      position: 'top',
      fontSize: 24,
    },
    subtitle: {
      color: '#ffffff',
      position: 'bottom',
      fontSize: 18,
    },
  })

  // 生成任务状态
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null)
  const [generating, setGenerating] = useState(false)

  // 轮询任务状态
  useEffect(() => {
    if (!currentTask || currentTask.status === 'completed' || currentTask.status === 'failed') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const updatedTask = await getGenerationStatus(currentTask.id)
        setCurrentTask(updatedTask)
        
        if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
          setGenerating(false)
        }
      } catch (error) {
        console.error('Failed to get task status:', error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [currentTask])

  const handleStartGeneration = async () => {
    // 验证输入
    if (!projectName.trim()) {
      message.error('请输入项目名称')
      return
    }

    if (videos.length === 0) {
      message.error('请至少上传一个视频')
      return
    }

    if (scripts.filter(s => s.selected).length === 0) {
      message.error('请至少选择一个文案')
      return
    }

    setGenerating(true)

    try {
      // 保存项目配置
      const project: Omit<ProjectConfig, 'id' | 'createdAt' | 'updatedAt'> = {
        name: projectName,
        videos,
        audios,
        scripts: scripts.filter(s => s.selected), // 只保存选中的文案
        duration,
        videoCount,
        voice,
        style,
      }

      const savedProject = await saveProject(project)

      // 开始生成任务
      const task = await startGeneration(savedProject.id)
      setCurrentTask(task)
      message.success('开始生成视频，请稍候...')
    } catch (error) {
      message.error('启动生成失败')
      console.error('Generation error:', error)
      setGenerating(false)
    }
  }

  const handleReset = () => {
    setCurrentTask(null)
    setGenerating(false)
  }

  const canGenerate = videos.length > 0 && 
    scripts.filter(s => s.selected).length > 0 && 
    !generating

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">AI视频混剪</h1>
        <p className="page-subtitle">
          上传视频素材，配置文案和样式，一键生成专业混剪视频
        </p>
      </div>

      <div className="page-content">
        {/* 项目名称 */}
        <div className="section">
          <div className="section-content">
            <div className="form-item">
              <label className="form-label">项目名称</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="请输入项目名称"
                maxLength={50}
              />
            </div>
          </div>
        </div>

        {/* 视频上传 */}
        <VideoUpload 
          videos={videos}
          onVideosChange={setVideos}
          maxCount={20}
        />

        {/* 音频上传 */}
        <AudioUpload 
          audios={audios}
          onAudiosChange={setAudios}
        />

        {/* 文案配置 */}
        <ScriptConfig 
          scripts={scripts}
          onScriptsChange={setScripts}
        />

        {/* 配置设置 */}
        <ConfigSettings
          duration={duration}
          onDurationChange={setDuration}
          videoCount={videoCount}
          onVideoCountChange={setVideoCount}
          voice={voice}
          onVoiceChange={setVoice}
          style={style}
          onStyleChange={setStyle}
        />

        {/* 生成按钮 */}
        <div className="action-buttons">
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              loading={generating}
              disabled={!canGenerate}
              onClick={handleStartGeneration}
            >
              {generating ? '生成中...' : '开始AI制作'}
            </Button>
            <Button
              size="large"
              icon={<SaveOutlined />}
              disabled={!canGenerate}
            >
              保存配置
            </Button>
          </Space>
        </div>

        {/* 生成结果 */}
        <GenerationResult 
          task={currentTask}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}

export default VideoMixer 