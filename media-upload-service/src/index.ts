import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import uploadsRouter from './routes/uploads'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '4010', 10)

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/v1/', limiter)

app.get('/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'media-upload-service', time: new Date().toISOString() })
})

app.use('/v1/uploads', uploadsRouter)

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`media-upload-service listening on http://localhost:${PORT}`)
})


