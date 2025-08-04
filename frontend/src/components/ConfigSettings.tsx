import React from 'react'
import { Select, InputNumber, Radio, ColorPicker, Space, Row, Col } from 'antd'
import { SettingOutlined, FontSizeOutlined, BgColorsOutlined } from '@ant-design/icons'
import type { DurationOption, VoiceOption, StyleConfig } from '../types'

interface ConfigSettingsProps {
  duration: DurationOption
  onDurationChange: (duration: DurationOption) => void
  videoCount: number
  onVideoCountChange: (count: number) => void
  voice: VoiceOption
  onVoiceChange: (voice: VoiceOption) => void
  style: StyleConfig
  onStyleChange: (style: StyleConfig) => void
}

const ConfigSettings: React.FC<ConfigSettingsProps> = ({
  duration,
  onDurationChange,
  videoCount,
  onVideoCountChange,
  voice,
  onVoiceChange,
  style,
  onStyleChange,
}) => {
  const handleStyleChange = (key: keyof StyleConfig, subKey: string, value: any) => {
    onStyleChange({
      ...style,
      [key]: {
        ...style[key],
        [subKey]: value,
      },
    })
  }

  return (
    <div className="section">
      <div className="section-title">
        <SettingOutlined />
        生成配置
      </div>
      
      <div className="section-content">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <div className="form-item">
              <label className="form-label">视频时长</label>
              <Select
                value={duration}
                onChange={onDurationChange}
                style={{ width: '100%' }}
                options={[
                  { label: '15秒', value: '15s' },
                  { label: '30秒', value: '30s' },
                  { label: '30-60秒', value: '30-60s' },
                ]}
              />
            </div>
          </Col>
          
          <Col xs={24} sm={12}>
            <div className="form-item">
              <label className="form-label">生成视频数量</label>
              <InputNumber
                value={videoCount}
                onChange={onVideoCountChange}
                min={1}
                max={10}
                style={{ width: '100%' }}
                placeholder="请输入生成数量"
              />
            </div>
          </Col>
          
          <Col xs={24} sm={12}>
            <div className="form-item">
              <label className="form-label">语音朗读</label>
              <Radio.Group value={voice} onChange={(e) => onVoiceChange(e.target.value)}>
                <Space direction="vertical">
                  <Radio value="male">男声</Radio>
                  <Radio value="female">女声</Radio>
                </Space>
              </Radio.Group>
            </div>
          </Col>
        </Row>

        <div style={{ marginTop: '24px' }}>
          <div className="section-title">
            <BgColorsOutlined />
            样式设置
          </div>
          
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <div className="form-item">
                <label className="form-label">标题样式</label>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#8c8c8c' }}>颜色</label>
                    <ColorPicker
                      value={style.title.color}
                      onChange={(color) => handleStyleChange('title', 'color', color?.toHexString() || '#ffffff')}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#8c8c8c' }}>位置</label>
                    <Select
                      value={style.title.position}
                      onChange={(value) => handleStyleChange('title', 'position', value)}
                      style={{ width: '100%' }}
                      options={[
                        { label: '顶部', value: 'top' },
                        { label: '居中', value: 'center' },
                        { label: '底部', value: 'bottom' },
                      ]}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#8c8c8c' }}>字体大小</label>
                    <InputNumber
                      value={style.title.fontSize}
                      onChange={(value) => handleStyleChange('title', 'fontSize', value)}
                      min={12}
                      max={72}
                      style={{ width: '100%' }}
                      addonAfter="px"
                    />
                  </div>
                </Space>
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="form-item">
                <label className="form-label">字幕样式</label>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#8c8c8c' }}>颜色</label>
                    <ColorPicker
                      value={style.subtitle.color}
                      onChange={(color) => handleStyleChange('subtitle', 'color', color?.toHexString() || '#ffffff')}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#8c8c8c' }}>位置</label>
                    <Select
                      value={style.subtitle.position}
                      onChange={(value) => handleStyleChange('subtitle', 'position', value)}
                      style={{ width: '100%' }}
                      options={[
                        { label: '顶部', value: 'top' },
                        { label: '居中', value: 'center' },
                        { label: '底部', value: 'bottom' },
                      ]}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#8c8c8c' }}>字体大小</label>
                    <InputNumber
                      value={style.subtitle.fontSize}
                      onChange={(value) => handleStyleChange('subtitle', 'fontSize', value)}
                      min={12}
                      max={48}
                      style={{ width: '100%' }}
                      addonAfter="px"
                    />
                  </div>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default ConfigSettings 