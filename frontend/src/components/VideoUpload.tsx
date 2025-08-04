import React, { useState } from 'react'
import { Upload, Button, List, Progress, message, Modal } from 'antd'
import { UploadOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import type { VideoFile } from '../types'
import { uploadVideo, deleteVideo } from '../services/api'
import ReactPlayer from 'react-player'

interface VideoUploadProps {
  videos: VideoFile[]
  onVideosChange: (videos: VideoFile[]) => void
  maxCount?: number
}

const VideoUpload: React.FC<VideoUploadProps> = ({ 
  videos, 
  onVideosChange, 
  maxCount = 20 
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewVideo, setPreviewVideo] = useState<string>('')

  const handleUpload = async (file: File) => {
    if (videos.length >= maxCount) {
      message.error(`最多只能上传${maxCount}个视频`)
      return false
    }

    if (!file.type.startsWith('video/')) {
      message.error('只能上传视频文件')
      return false
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB
      message.error('视频文件大小不能超过500MB')
      return false
    }

    setUploading(true)
    try {
      const videoFile = await uploadVideo(file)
      onVideosChange([...videos, videoFile])
      message.success('视频上传成功')
    } catch (error) {
      message.error('视频上传失败')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }

    return false // 阻止默认上传行为
  }

  const handleDelete = async (videoId: string) => {
    try {
      await deleteVideo(videoId)
      onVideosChange(videos.filter(v => v.id !== videoId))
      message.success('视频删除成功')
    } catch (error) {
      message.error('视频删除失败')
      console.error('Delete error:', error)
    }
  }

  const handlePreview = (url: string) => {
    setPreviewVideo(url)
    setPreviewVisible(true)
  }

  const uploadProps: UploadProps = {
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: 'video/*',
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="section">
      <div className="section-title">
        <UploadOutlined />
        视频素材上传 ({videos.length}/{maxCount})
      </div>
      
      <div className="section-content">
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            disabled={videos.length >= maxCount}
          >
            选择视频文件
          </Button>
        </Upload>
        
        <div className="upload-list">
          {videos.map((video) => (
            <div key={video.id} className="upload-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{video.name}</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {formatFileSize(video.size)} • {formatDuration(video.duration)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePreview(video.url)}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(video.id)}
                  />
                </div>
              </div>
              
              {video.thumbnail && (
                <div style={{ 
                  width: '100%', 
                  height: '120px', 
                  background: `url(${video.thumbnail}) center/cover`,
                  borderRadius: '4px',
                  marginTop: '8px'
                }} />
              )}
            </div>
          ))}
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

export default VideoUpload 