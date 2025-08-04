import OSS from 'aliyun-sdk'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

// OSS 客户端配置
const ossClient = new OSS({
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  endpoint: process.env.OSS_ENDPOINT || 'oss-cn-hangzhou.aliyuncs.com',
  bucket: process.env.OSS_BUCKET!,
})

// 文件上传到OSS
export const uploadToOSS = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<string> => {
  try {
    const fileExtension = path.extname(file.originalname)
    const fileName = `${folder}/${uuidv4()}${fileExtension}`
    
    const result = await ossClient.put(fileName, file.buffer, {
      headers: {
        'Content-Type': file.mimetype,
      },
    })

    return result.url
  } catch (error) {
    console.error('OSS上传失败:', error)
    throw new Error('文件上传失败')
  }
}

// 从OSS删除文件
export const deleteFromOSS = async (url: string): Promise<void> => {
  try {
    const key = url.split('.com/')[1]
    await ossClient.delete(key)
  } catch (error) {
    console.error('OSS删除失败:', error)
    throw new Error('文件删除失败')
  }
}

// 生成文件访问URL
export const getFileUrl = (key: string): string => {
  return `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT || 'oss-cn-hangzhou.aliyuncs.com'}/${key}`
}

export default ossClient 