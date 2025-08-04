import express from 'express'
import { Task } from '../models/Task'
import { Project } from '../models/Project'
import { startVideoGeneration } from '../services/videoGenerator'
import type { GenerationTask } from '../types'

const router = express.Router()

// 开始生成视频
router.post('/start', async (req, res) => {
  try {
    const { projectId } = req.body

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: '项目ID为必填项'
      })
    }

    // 检查项目是否存在
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({
        success: false,
        error: '项目不存在'
      })
    }

    // 检查项目配置
    if (!project.videos || project.videos.length === 0) {
      return res.status(400).json({
        success: false,
        error: '项目缺少视频素材'
      })
    }

    const selectedScripts = project.scripts.filter(s => s.selected)
    if (selectedScripts.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请至少选择一个文案'
      })
    }

    // 创建生成任务
    const task = new Task({
      projectId,
      status: 'pending',
      progress: 0,
    })
    await task.save()

    // 转换为前端格式
    const generationTask: GenerationTask = {
      id: task._id.toString(),
      projectId: task.projectId.toString(),
      status: task.status,
      progress: task.progress,
      result: task.result,
      error: task.error,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }

    // 异步开始视频生成
    startVideoGeneration(task._id.toString(), projectId)

    res.json({
      success: true,
      data: generationTask
    })
  } catch (error) {
    console.error('启动视频生成失败:', error)
    res.status(500).json({
      success: false,
      error: '启动视频生成失败'
    })
  }
})

// 获取生成状态
router.get('/status/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '任务不存在'
      })
    }

    const generationTask: GenerationTask = {
      id: task._id.toString(),
      projectId: task.projectId.toString(),
      status: task.status,
      progress: task.progress,
      result: task.result,
      error: task.error,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }

    res.json({
      success: true,
      data: generationTask
    })
  } catch (error) {
    console.error('获取任务状态失败:', error)
    res.status(500).json({
      success: false,
      error: '获取任务状态失败'
    })
  }
})

// 取消生成任务
router.post('/cancel/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: '任务不存在'
      })
    }

    if (task.status === 'completed' || task.status === 'failed') {
      return res.status(400).json({
        success: false,
        error: '任务已完成，无法取消'
      })
    }

    task.status = 'failed'
    task.error = '用户取消'
    await task.save()

    res.json({
      success: true,
      message: '任务已取消'
    })
  } catch (error) {
    console.error('取消任务失败:', error)
    res.status(500).json({
      success: false,
      error: '取消任务失败'
    })
  }
})

// 获取任务列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    
    const query: any = {}
    if (status) {
      query.status = status
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Task.countDocuments(query)

    const generationTasks: GenerationTask[] = tasks.map(task => ({
      id: task._id.toString(),
      projectId: task.projectId.toString(),
      status: task.status,
      progress: task.progress,
      result: task.result,
      error: task.error,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }))

    res.json({
      success: true,
      data: {
        tasks: generationTasks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('获取任务列表失败:', error)
    res.status(500).json({
      success: false,
      error: '获取任务列表失败'
    })
  }
})

export default router 