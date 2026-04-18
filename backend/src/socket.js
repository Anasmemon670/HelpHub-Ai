const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Message = require('./models/Message')
const HelpRequest = require('./models/HelpRequest')
const User = require('./models/User')
const { mapMessageToDto } = require('./utils/mappers')

function getTokenFromHandshake(socket) {
  const authToken = socket.handshake?.auth?.token
  if (authToken && typeof authToken === 'string') return authToken
  const header = socket.handshake?.headers?.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return null
}

function initSocket(io) {
  io.use((socket, next) => {
    try {
      const token = getTokenFromHandshake(socket)
      if (!token) return next(new Error('Authentication required'))
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = String(payload.sub)
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('join-room', ({ requestId }) => {
      if (!requestId || !mongoose.isValidObjectId(requestId)) return
      socket.join(`request:${requestId}`)
    })

    socket.on('send-message', async (payload = {}, ack) => {
      try {
        const { requestId, message, receiverId } = payload
        if (!requestId || !message) {
          if (typeof ack === 'function') ack({ ok: false, error: 'requestId and message are required' })
          return
        }
        if (!mongoose.isValidObjectId(requestId)) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Invalid requestId' })
          return
        }
        const reqDoc = await HelpRequest.findById(requestId)
        if (!reqDoc) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Request not found' })
          return
        }
        const sender = await User.findById(socket.userId)
        if (!sender) {
          if (typeof ack === 'function') ack({ ok: false, error: 'User not found' })
          return
        }
        const recv = receiverId || reqDoc.createdBy
        const doc = await Message.create({
          requestId: reqDoc._id,
          senderId: socket.userId,
          receiverId: recv || undefined,
          message: String(message).trim(),
        })
        await doc.populate('senderId')
        sender.lastActiveAt = new Date()
        await sender.save()
        const dto = mapMessageToDto(doc, doc.senderId?.name || sender.name)
        io.to(`request:${requestId}`).emit('receive-message', dto)
        if (typeof ack === 'function') ack({ ok: true, message: dto })
      } catch (e) {
        if (typeof ack === 'function') ack({ ok: false, error: 'Send failed' })
      }
    })
  })
}

module.exports = { initSocket }
