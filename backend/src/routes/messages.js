const express = require('express')
const mongoose = require('mongoose')
const Message = require('../models/Message')
const HelpRequest = require('../models/HelpRequest')
const User = require('../models/User')
const { authRequired } = require('../middleware/auth')
const { mapMessageToDto } = require('../utils/mappers')

const router = express.Router()

router.post('/send', authRequired, async (req, res) => {
  try {
    const { requestId, message, receiverId } = req.body
    if (!requestId || !message) {
      return res.status(400).json({ error: 'requestId and message are required' })
    }
    const r = await HelpRequest.findById(requestId)
    if (!r) {
      return res.status(404).json({ error: 'Request not found' })
    }
    const sender = await User.findById(req.userId)
    let recv = receiverId || null
    if (!recv) {
      recv = r.createdBy
    }
    const doc = await Message.create({
      requestId: r._id,
      senderId: req.userId,
      receiverId: recv || undefined,
      message: String(message).trim(),
    })
    await doc.populate('senderId')
    sender.lastActiveAt = new Date()
    await sender.save()
    const dto = mapMessageToDto(doc, doc.senderId?.name || sender.name)
    const io = req.app.locals.io
    if (io) {
      io.to(`request:${String(r._id)}`).emit('receive-message', dto)
    }
    return res.status(201).json({ message: dto })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Send failed' })
  }
})

router.get('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params
    if (!mongoose.isValidObjectId(requestId)) {
      return res.json({ messages: [] })
    }
    const msgs = await Message.find({ requestId }).sort({ timestamp: 1 }).populate('senderId')
    const out = msgs.map((m) => mapMessageToDto(m, m.senderId?.name || 'Member'))
    return res.json({ messages: out })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
