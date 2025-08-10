import express from 'express'
import multer from 'multer'
import type { PutObjectOptions } from 'ali-oss'
import { getOssClient, buildObjectKey, toPublicUrl } from '../lib/oss'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
})

const parseAllowed = (envName: string, defaults: string[]): Set<string> => {
  const raw = process.env[envName]
  const list = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : defaults
  return new Set(list)
}

const allowedVideo = parseAllowed('ALLOWED_VIDEO_MIME', ['video/mp4', 'video/quicktime', 'video/x-matroska'])
const allowedAudio = parseAllowed('ALLOWED_AUDIO_MIME', ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/aac'])

// 1) 批量预签名（简单直传 PUT）
router.post('/presign', async (req, res) => {
  try {
    const { files, prefix, access, expiresSec } = req.body as {
      files: Array<{ filename: string; mimeType: string; kind: 'video' | 'audio' }>
      prefix?: string
      access?: 'public' | 'private'
      expiresSec?: number
    }

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, error: 'files 不能为空' })
    }

    const client = getOssClient()
    const expires = Math.min(parseInt(String(expiresSec || process.env.PRESIGN_EXPIRES || 900), 10), 3600)

    const items = await Promise.all(
      files.map(async (f) => {
        const kindDir = f.kind === 'video' ? 'videos' : 'audios'
        const key = buildObjectKey({ prefix, kind: kindDir as 'videos' | 'audios', filename: f.filename })

        // mime 校验
        const ok = f.kind === 'video' ? allowedVideo.has(f.mimeType) : allowedAudio.has(f.mimeType)
        if (!ok) {
          return { filename: f.filename, error: 'mime_not_allowed' }
        }

        const url = await client.signatureUrl(key, {
          method: 'PUT',
          expires,
          'Content-Type': f.mimeType,
        } as any)

        return {
          filename: f.filename,
          key,
          uploadUrl: url,
          headers: { 'Content-Type': f.mimeType },
          publicUrl: toPublicUrl(key),
          access: access || 'public',
        }
      })
    )

    res.json({ success: true, items })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'presign 失败' })
  }
})

// 2) 服务端中转上传（批量）
router.post('/videos', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({ success: false, error: '未选择文件' })
    }
    const prefix = (req.body && req.body.prefix) || undefined
    const client = getOssClient()

    const results = await Promise.all(
      req.files.map(async (file: Express.Multer.File) => {
        if (!allowedVideo.has(file.mimetype)) {
          return { filename: file.originalname, reason: 'mime_not_allowed' }
        }
        const key = buildObjectKey({ prefix, kind: 'videos', filename: file.originalname })
        const options: PutObjectOptions = { mime: file.mimetype }
        const putRes = await client.put(key, file.buffer, options)
        const etag = (putRes as any).etag ?? (putRes as any)?.res?.headers?.etag ?? undefined
        return {
          filename: file.originalname,
          key,
          url: toPublicUrl(key),
          etag,
          size: file.size,
          mimeType: file.mimetype,
        }
      })
    )

    const uploaded = results.filter((r: any) => !('reason' in r))
    const failed = results.filter((r: any) => 'reason' in r)
    res.json({ success: true, uploaded, failed })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || '上传失败' })
  }
})

router.post('/audios', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({ success: false, error: '未选择文件' })
    }
    const prefix = (req.body && req.body.prefix) || undefined
    const client = getOssClient()

    const results = await Promise.all(
      req.files.map(async (file: Express.Multer.File) => {
        if (!allowedAudio.has(file.mimetype)) {
          return { filename: file.originalname, reason: 'mime_not_allowed' }
        }
        const key = buildObjectKey({ prefix, kind: 'audios', filename: file.originalname })
        const options: PutObjectOptions = { mime: file.mimetype }
        const putRes = await client.put(key, file.buffer, options)
        const etag = (putRes as any).etag ?? (putRes as any)?.res?.headers?.etag ?? undefined
        return {
          filename: file.originalname,
          key,
          url: toPublicUrl(key),
          etag,
          size: file.size,
          mimeType: file.mimetype,
        }
      })
    )

    const uploaded = results.filter((r: any) => !('reason' in r))
    const failed = results.filter((r: any) => 'reason' in r)
    res.json({ success: true, uploaded, failed })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || '上传失败' })
  }
})

export default router


