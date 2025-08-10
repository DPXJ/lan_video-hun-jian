import OSS from 'ali-oss'
import { nanoid } from 'nanoid'

export interface OssClientConfig {
  region: string
  accessKeyId: string
  accessKeySecret: string
  bucket: string
}

export const getOssClient = () => {
  const region = process.env.OSS_REGION
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET
  const bucket = process.env.OSS_BUCKET

  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    throw new Error('OSS config missing: OSS_REGION/OSS_ACCESS_KEY_ID/OSS_ACCESS_KEY_SECRET/OSS_BUCKET')
  }

  return new OSS({ region, accessKeyId, accessKeySecret, bucket })
}

export const buildObjectKey = (params: {
  prefix?: string
  kind: 'videos' | 'audios'
  filename: string
}) => {
  const sanitizedPrefix = (params.prefix || '').replace(/^\/+|\/+$/g, '')
  const dotIndex = params.filename.lastIndexOf('.')
  const ext = dotIndex !== -1 ? params.filename.slice(dotIndex) : ''
  const base = dotIndex !== -1 ? params.filename.slice(0, dotIndex) : params.filename
  const id = nanoid(10)
  const parts = [sanitizedPrefix, params.kind, `${base}_${id}${ext}`].filter(Boolean)
  return parts.join('/')
}

export const toPublicUrl = (key: string) => {
  const base = process.env.PUBLIC_BASE_URL
  const encodedKey = key.split('/').map((s) => encodeURIComponent(s)).join('/')
  if (base) return `${base.replace(/\/$/, '')}/${encodedKey}`
  // fallback to OSS domain
  const region = process.env.OSS_REGION
  const bucket = process.env.OSS_BUCKET
  if (!region || !bucket) throw new Error('OSS config missing for public URL')
  // region 应为类似 oss-cn-hangzhou
  return `https://${bucket}.${region}.aliyuncs.com/${encodedKey}`
}


