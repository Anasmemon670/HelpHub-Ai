const mongoose = require('mongoose')

let state = {
  connected: false,
  lastError: null,
  lastAttemptAt: null,
  connectedAt: null,
}

function getDbState() {
  return { ...state }
}

async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }
  mongoose.set('strictQuery', true)
  state.lastAttemptAt = new Date().toISOString()
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 20000,
  })
  state.connected = true
  state.lastError = null
  state.connectedAt = new Date().toISOString()
  return mongoose.connection
}

async function connectDbWithRetry(options = {}) {
  const {
    initialDelayMs = 500,
    maxDelayMs = 15000,
    factor = 1.7,
  } = options

  let delay = initialDelayMs
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await connectDb()
      return mongoose.connection
    } catch (e) {
      state.connected = false
      state.lastError = e && e.message ? e.message : String(e)
      state.lastAttemptAt = new Date().toISOString()
      console.error('[db] connect failed:', state.lastError)
      await new Promise((r) => setTimeout(r, delay))
      delay = Math.min(maxDelayMs, Math.floor(delay * factor))
    }
  }
}

mongoose.connection.on('disconnected', () => {
  state.connected = false
})

module.exports = { connectDb, connectDbWithRetry, getDbState }
