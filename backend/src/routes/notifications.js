const express = require('express')
const mongoose = require('mongoose')
const Notification = require('../models/Notification')
const { authRequired } = require('../middleware/auth')

const router = express.Router()

function toDto(n) {
  const x = n.toObject ? n.toObject() : n
  return {
    id: String(x._id),
    userId: String(x.userId),
    type: x.type,
    title: x.title,
    message: x.message,
    requestId: x.requestId ? String(x.requestId) : null,
    category: x.category || null,
    read: !!x.read,
    createdAt: (x.createdAt || new Date()).toISOString(),
  }
}

router.get('/:userId', authRequired, async (req, res) => {
  try {
    const { userId } = req.params
    if (String(req.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.json({ notifications: [], unreadCount: 0 })
    }
    const list = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(200)
    const unreadCount = list.reduce((acc, item) => acc + (item.read ? 0 : 1), 0)
    return res.json({ notifications: list.map(toDto), unreadCount })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.post('/create', authRequired, async (req, res) => {
  try {
    const { userId, type, title, message, requestId, category } = req.body
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'userId, title, and message are required' })
    }
    const doc = await Notification.create({
      userId,
      type: type || 'system',
      title,
      message,
      requestId: requestId || undefined,
      category: category || undefined,
    })
    return res.status(201).json({ notification: toDto(doc) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Create failed' })
  }
})

router.patch('/read', authRequired, async (req, res) => {
  try {
    const { userId, notificationId, readAll } = req.body
    const targetUserId = userId || req.userId
    if (String(targetUserId) !== String(req.userId)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    if (!mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ error: 'Invalid userId' })
    }

    if (readAll) {
      await Notification.updateMany({ userId: targetUserId, read: false }, { $set: { read: true } })
    } else if (notificationId) {
      if (!mongoose.isValidObjectId(notificationId)) {
        return res.status(400).json({ error: 'Invalid notificationId' })
      }
      await Notification.updateOne(
        { _id: notificationId, userId: targetUserId },
        { $set: { read: true } }
      )
    } else {
      return res.status(400).json({ error: 'notificationId or readAll is required' })
    }

    const unreadCount = await Notification.countDocuments({ userId: targetUserId, read: false })
    return res.json({ ok: true, unreadCount })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Update failed' })
  }
})

module.exports = router
