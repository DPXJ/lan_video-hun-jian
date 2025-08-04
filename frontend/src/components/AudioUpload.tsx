import React, { useState } from 'react'
import { Upload, Button, message, Modal } from 'antd'
import { UploadOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd/es/upload/interface'
import type { AudioFile } from '../types'
import { uploadAudio, deleteAudio } from '../services/api'

interface AudioUploadProps {
  audios: AudioFile[]
  onAudiosChange: (audios: AudioFile[]) => void
}

const AudioUpload: React.FC<AudioUploadProps> = ({ audios, onAudiosChange }) => {
  const [uploading, setUploading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewAudio, setPreviewAudio] = useState<string>('')

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      message.error('只能上传音频文件')
      return false
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB
      message.error('音频文件大小不能超过100MB')
      return false
    }

    setUploading(true)
    try {
      const audioFile = await uploadAudio(file)
      onAudiosChange([...audios, audioFile])
      message.success('音频上传成功')
    } catch (error) {
      message.error('音频上传失败')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }

    return false // 阻止默认上传行为
  }

  const handleDelete = async (audioId: string) => {
    try {
      await deleteAudio(audioId)
      onAudiosChange(audios.filter(a => a.id !== audioId))
      message.success('音频删除成功')
    } catch (error) {
      message.error('音频删除失败')
      console.error('Delete error:', error)
    }
  }

  const handlePreview = (url: string) => {
    setPreviewAudio(url)
    setPreviewVisible(true)
  }

  const uploadProps: UploadProps = {
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: 'audio/*',
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
        背景音乐上传 ({audios.length})
      </div>
      
      <div className="section-content">
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={uploading}>
            选择音频文件
          </Button>
        </Upload>
        
        <div className="upload-list">
          {audios.map((audio) => (
            <div key={audio.id} className="upload-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{audio.name}</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {formatFileSize(audio.size)} • {formatDuration(audio.duration)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePreview(audio.url)}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(audio.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title="音频预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={400}
        centered
      >
        <audio controls style={{ width: '100%' }}>
          <source src={previewAudio} type="audio/mpeg" />
          您的浏览器不支持音频播放
        </audio>
      </Modal>
    </div>
  )
}

export default AudioUpload 