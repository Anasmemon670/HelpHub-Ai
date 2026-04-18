require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const { connectDbWithRetry, getDbState } = require('./config/db')
const { initSocket } = require('./socket')

const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const requestsRoutes = require('./routes/requests')
const messagesRoutes = require('./routes/messages')
const aiRoutes = require('./routes/ai')
const notificationsRoutes = require('./routes/notifications')
const adminRoutes = require('./routes/admin')
const analyticsRoutes = require('./routes/analytics')

const app = express()
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  },
})
const PORT = process.env.PORT || 4000

app.use(
  cors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))
app.locals.io = io
initSocket(io)

app.get('/health', (req, res) => {
  const db = getDbState()
  res.json({ ok: true, service: 'helplytics-api', db })
})

app.get('/api/health', (req, res) => {
  const db = getDbState()
  res.json({ ok: true, service: 'helplytics-api', db })
})

app.get('/', (req, res) => {
  res.send('Helplytics Backend Running 🚀')
})

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/requests', requestsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/analytics', analyticsRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

async function main() {
  httpServer.listen(PORT, () => {
    console.log(`Helplytics API listening on http://localhost:${PORT}`)
  })
  // Connect in background; keep server up even if Mongo is down.
  void connectDbWithRetry()
}

main().catch((e) => {
  console.error(e)
  // Don't crash the process; health will expose DB state.
})