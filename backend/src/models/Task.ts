import mongoose, { Schema, Document } from 'mongoose'
import type { GenerationTask } from '../types'

export interface ITask extends Document, Omit<GenerationTask, 'id'> {
  _id: string
}

const TaskSchema = new Schema({
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  result: {
    videos: [String],
    previewUrl: String,
  },
  error: { type: String },
}, {
  timestamps: true,
})

// 索引
TaskSchema.index({ projectId: 1 })
TaskSchema.index({ status: 1 })
TaskSchema.index({ createdAt: -1 })

export const Task = mongoose.model<ITask>('Task', TaskSchema) 