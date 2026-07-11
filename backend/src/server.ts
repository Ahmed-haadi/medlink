import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { requireAuth } from './middleware/auth.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(cors())
app.use(express.json())

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok', service: 'medlink-api' })
})

app.get('/me', requireAuth, (request, response) => {
  response.status(200).json(request.auth)
})

app.listen(port, () => {
  console.log(`MedLink API listening on port ${port}`)
})
