import mongoose, { Schema, Document } from 'mongoose'
import type { ProjectConfig } from '../types'

export interface IProject extends Document, Omit<ProjectConfig, 'id'> {
  _id: string
}

const VideoFileSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  duration: { type: Number, required: true },
  thumbnail: { type: String },
  uploadedAt: { type: Date, default: Date.now },
})

const AudioFileSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  duration: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
})

const ScriptSchema = new Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  selected: { type: Boolean, default: false },
  generatedAt: { type: Date, default: Date.now },
})

const StyleConfigSchema = new Schema({
  title: {
    color: { type: String, default: '#ffffff' },
    position: { type: String, enum: ['top', 'center', 'bottom'], default: 'top' },
    fontSize: { type: Number, default: 24 },
  },
  subtitle: {
    color: { type: String, default: '#ffffff' },
    position: { type: String, enum: ['top', 'center', 'bottom'], default: 'bottom' },
    fontSize: { type: Number, default: 18 },
  },
})

const ProjectSchema = new Schema({
  name: { type: String, required: true, trim: true },
  videos: [VideoFileSchema],
  audios: [AudioFileSchema],
  scripts: [ScriptSchema],
  duration: { 
    type: String, 
    enum: ['15s', '30s', '30-60s'], 
    default: '30s' 
  },
  videoCount: { type: Number, min: 1, max: 10, default: 3 },
  voice: { 
    type: String, 
    enum: ['male', 'female'], 
    default: 'female' 
  },
  style: { type: StyleConfigSchema, default: () => ({}) },
}, {
  timestamps: true,
})

// 索引
ProjectSchema.index({ name: 1 })
ProjectSchema.index({ createdAt: -1 })

export const Project = mongoose.model<IProject>('Project', ProjectSchema) 