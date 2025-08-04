import React, { useState } from 'react'
import { Input, Button, message, Checkbox, Space } from 'antd'
import { EditOutlined, RobotOutlined, CheckOutlined } from '@ant-design/icons'
import type { Script } from '../types'
import { generateScripts } from '../services/api'

const { TextArea } = Input

interface ScriptConfigProps {
  scripts: Script[]
  onScriptsChange: (scripts: Script[]) => void
}

const ScriptConfig: React.FC<ScriptConfigProps> = ({ scripts, onScriptsChange }) => {
  const [baseScript, setBaseScript] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!baseScript.trim()) {
      message.error('请输入基础文案')
      return
    }

    setGenerating(true)
    try {
      const generatedScripts = await generateScripts(baseScript)
      onScriptsChange(generatedScripts)
      message.success('文案生成成功')
    } catch (error) {
      message.error('文案生成失败')
      console.error('Generate error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleScriptToggle = (scriptId: string) => {
    const updatedScripts = scripts.map(script => 
      script.id === scriptId 
        ? { ...script, selected: !script.selected }
        : script
    )
    onScriptsChange(updatedScripts)
  }

  const handleSelectAll = () => {
    const updatedScripts = scripts.map(script => ({ ...script, selected: true }))
    onScriptsChange(updatedScripts)
  }

  const handleDeselectAll = () => {
    const updatedScripts = scripts.map(script => ({ ...script, selected: false }))
    onScriptsChange(updatedScripts)
  }

  const selectedCount = scripts.filter(s => s.selected).length

  return (
    <div className="section">
      <div className="section-title">
        <EditOutlined />
        文案配置 ({selectedCount}/{scripts.length} 已选择)
      </div>
      
      <div className="section-content">
        <div className="form-item">
          <label className="form-label">基础文案</label>
          <TextArea
            value={baseScript}
            onChange={(e) => setBaseScript(e.target.value)}
            placeholder="请输入基础文案，AI将基于此生成多个变体..."
            rows={4}
            style={{ marginBottom: '12px' }}
          />
          <Button
            type="primary"
            icon={<RobotOutlined />}
            loading={generating}
            onClick={handleGenerate}
            disabled={!baseScript.trim()}
          >
            AI生成文案
          </Button>
        </div>

        {scripts.length > 0 && (
          <div className="form-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label className="form-label">生成的文案</label>
              <Space>
                <Button size="small" onClick={handleSelectAll}>
                  全选
                </Button>
                <Button size="small" onClick={handleDeselectAll}>
                  取消全选
                </Button>
              </Space>
            </div>
            
            <div className="script-list">
              {scripts.map((script) => (
                <div 
                  key={script.id} 
                  className={`script-item ${script.selected ? 'selected' : ''}`}
                  onClick={() => handleScriptToggle(script.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Checkbox 
                      checked={script.selected}
                      onChange={() => handleScriptToggle(script.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="script-content">{script.content}</div>
                      <div className="script-meta">
                        生成时间: {new Date(script.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScriptConfig 