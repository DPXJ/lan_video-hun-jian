import React, { useState } from 'react'
import { Progress, Button, message, Modal } from 'antd'
import { PlayCircleOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import type { GenerationTask } from '../types'
import ReactPlayer from 'react-player'

interface GenerationResultProps {
  task: GenerationTask | null
  onReset: () => void
}

const GenerationResult: React.FC<GenerationResultProps> = ({ task, onReset }) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewVideo, setPreviewVideo] = useState<string>('')

  const handlePreview = (url: string) => {
    setPreviewVideo(url)
    setPreviewVisible(true)
  }

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `混剪视频_${index + 1}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('开始下载')
  }

  const getStatusText = (status: GenerationTask['status']) => {
    switch (status) {
      case 'pending':
        return '等待中'
      case 'processing':
        return '处理中'
      case 'completed':
        return '已完成'
      case 'failed':
        return '失败'
      default:
        return '未知'
    }
  }

  const getStatusColor = (status: GenerationTask['status']) => {
    switch (status) {
      case 'pending':
        return '#faad14'
      case 'processing':
        return '#1890ff'
      case 'completed':
        return '#52c41a'
      case 'failed':
        return '#ff4d4f'
      default:
        return '#d9d9d9'
    }
  }

  if (!task) {
    return null
  }

  return (
    <div className="section">
      <div className="section-title">
        <PlayCircleOutlined />
        生成结果
      </div>
      
      <div className="section-content">
        <div className="generation-status">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span>状态: {getStatusText(task.status)}</span>
              <span style={{ color: getStatusColor(task.status) }}>
                {task.progress}%
              </span>
            </div>
            <Progress 
              percent={task.progress} 
              status={task.status === 'failed' ? 'exception' : undefined}
              strokeColor={getStatusColor(task.status)}
            />
          </div>

          {task.error && (
            <div style={{ 
              background: '#fff2f0', 
              border: '1px solid #ffccc7', 
              borderRadius: '6px', 
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ color: '#ff4d4f', fontWeight: 500, marginBottom: '4px' }}>
                错误信息
              </div>
              <div style={{ color: '#666' }}>{task.error}</div>
            </div>
          )}

          {task.status === 'completed' && task.result && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Button type="primary" onClick={onReset}>
                  重新生成
                </Button>
              </div>
              
              <div className="result-grid">
                {task.result.videos.map((videoUrl, index) => (
                  <div key={index} className="result-item">
                    <div style={{ 
                      width: '100%', 
                      height: '200px', 
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }} onClick={() => handlePreview(videoUrl)}>
                      <PlayCircleOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    </div>
                    <div className="result-info">
                      <div className="result-title">混剪视频 {index + 1}</div>
                      <div className="result-meta">
                        生成时间: {new Date(task.updatedAt).toLocaleString()}
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePreview(videoUrl)}
                        >
                          预览
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(videoUrl, index)}
                        >
                          下载
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="视频预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
        centered
      >
        <ReactPlayer
          url={previewVideo}
          controls
          width="100%"
          height="400px"
        />
      </Modal>
    </div>
  )
}

export default GenerationResult 