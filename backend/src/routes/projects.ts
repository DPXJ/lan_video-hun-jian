import express from 'express'
import { Project } from '../models/Project'
import type { ProjectConfig } from '../types'

const router = express.Router()

// 创建项目
router.post('/', async (req, res) => {
  try {
    const projectData = req.body

    // 验证必填字段
    if (!projectData.name || !projectData.videos || projectData.videos.length === 0) {
      return res.status(400).json({
        success: false,
        error: '项目名称和视频素材为必填项'
      })
    }

    const project = new Project(projectData)
    await project.save()

    // 转换为前端格式
    const projectConfig: ProjectConfig = {
      id: project._id.toString(),
      name: project.name,
      videos: project.videos,
      audios: project.audios,
      scripts: project.scripts,
      duration: project.duration,
      videoCount: project.videoCount,
      voice: project.voice,
      style: project.style,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }

    res.status(201).json({
      success: true,
      data: projectConfig
    })
  } catch (error) {
    console.error('创建项目失败:', error)
    res.status(500).json({
      success: false,
      error: '创建项目失败'
    })
  }
})

// 获取项目详情
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      })
    }

    const projectConfig: ProjectConfig = {
      id: project._id.toString(),
      name: project.name,
      videos: project.videos,
      audios: project.audios,
      scripts: project.scripts,
      duration: project.duration,
      videoCount: project.videoCount,
      voice: project.voice,
      style: project.style,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }

    res.json({
      success: true,
      data: projectConfig
    })
  } catch (error) {
    console.error('获取项目失败:', error)
    res.status(500).json({
      success: false,
      error: '获取项目失败'
    })
  }
})

// 更新项目
router.put('/:id', async (req, res) => {
  try {
    const projectData = req.body
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      projectData,
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      })
    }

    const projectConfig: ProjectConfig = {
      id: project._id.toString(),
      name: project.name,
      videos: project.videos,
      audios: project.audios,
      scripts: project.scripts,
      duration: project.duration,
      videoCount: project.videoCount,
      voice: project.voice,
      style: project.style,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }

    res.json({
      success: true,
      data: projectConfig
    })
  } catch (error) {
    console.error('更新项目失败:', error)
    res.status(500).json({
      success: false,
      error: '更新项目失败'
    })
  }
})

// 删除项目
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      })
    }

    res.json({
      success: true,
      message: '项目删除成功'
    })
  } catch (error) {
    console.error('删除项目失败:', error)
    res.status(500).json({
      success: false,
      error: '删除项目失败'
    })
  }
})

// 获取项目列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, name } = req.query
    
    const query: any = {}
    if (name) {
      query.name = { $regex: name, $options: 'i' }
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Project.countDocuments(query)

    const projectConfigs: ProjectConfig[] = projects.map(project => ({
      id: project._id.toString(),
      name: project.name,
      videos: project.videos,
      audios: project.audios,
      scripts: project.scripts,
      duration: project.duration,
      videoCount: project.videoCount,
      voice: project.voice,
      style: project.style,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }))

    res.json({
      success: true,
      data: {
        projects: projectConfigs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('获取项目列表失败:', error)
    res.status(500).json({
      success: false,
      error: '获取项目列表失败'
    })
  }
})

export default router 