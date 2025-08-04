import React from 'react'
import { Layout, Typography } from 'antd'
import { VideoCameraOutlined } from '@ant-design/icons'

const { Header } = Layout
const { Title } = Typography

const AppHeader: React.FC = () => {
  return (
    <Header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <VideoCameraOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
        <Title level={3} className="header-title">
          AI视频混剪平台
        </Title>
      </div>
    </Header>
  )
}

export default AppHeader 