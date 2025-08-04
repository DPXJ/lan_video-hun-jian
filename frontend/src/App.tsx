import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './components/AppHeader'
import VideoMixer from './pages/VideoMixer'
import './App.css'

const { Content } = Layout

function App() {
  return (
    <Layout className="app-layout">
      <AppHeader />
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<VideoMixer />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App 