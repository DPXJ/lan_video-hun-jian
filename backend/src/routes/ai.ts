import express from 'express'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'
import type { Script } from '../types'

const router = express.Router()

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 生成文案
router.post('/generate-scripts', async (req, res) => {
  try {
    const { baseScript } = req.body

    if (!baseScript || !baseScript.trim()) {
      return res.status(400).json({
        success: false,
        error: '请输入基础文案'
      })
    }

    // 构建提示词
    const prompt = `基于以下基础文案，生成20个不同的变体文案，要求：
1. 保持原意不变，但表达方式要多样化
2. 适合短视频平台使用
3. 语言简洁有力，有感染力
4. 每个文案长度控制在50字以内
5. 风格可以是：幽默、励志、温暖、专业等

基础文案：${baseScript}

请直接返回20个文案，每个文案一行，不要编号。`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的短视频文案创作助手，擅长创作吸引人的短视频文案。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.8,
    })

    const content = completion.choices[0]?.message?.content || ''
    
    // 解析生成的文案
    const scriptLines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.length <= 50)
      .slice(0, 20) // 最多取20个

    // 如果没有生成到足够的文案，补充一些
    while (scriptLines.length < 20) {
      scriptLines.push(`${baseScript} - 变体${scriptLines.length + 1}`)
    }

    const scripts: Script[] = scriptLines.map((content, index) => ({
      id: uuidv4(),
      content,
      selected: false,
      generatedAt: new Date(),
    }))

    res.json({
      success: true,
      data: scripts
    })
  } catch (error) {
    console.error('AI文案生成失败:', error)
    
    // 如果AI生成失败，返回一些基础变体
    const baseScript = req.body.baseScript || ''
    const fallbackScripts: Script[] = [
      { id: uuidv4(), content: baseScript, selected: false, generatedAt: new Date() },
      { id: uuidv4(), content: `${baseScript} - 精彩版`, selected: false, generatedAt: new Date() },
      { id: uuidv4(), content: `${baseScript} - 震撼版`, selected: false, generatedAt: new Date() },
      { id: uuidv4(), content: `${baseScript} - 温馨版`, selected: false, generatedAt: new Date() },
      { id: uuidv4(), content: `${baseScript} - 专业版`, selected: false, generatedAt: new Date() },
    ]

    res.json({
      success: true,
      data: fallbackScripts,
      message: 'AI生成失败，返回基础变体'
    })
  }
})

export default router 