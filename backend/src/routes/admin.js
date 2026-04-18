const express = require('express')
const mongoose = require('mongoose')
const { authRequired, loadUser } = require('../middleware/auth')
const { adminRequired } = require('../middleware/admin')
const User = require('../models/User')
const HelpRequest = require('../models/HelpRequest')
const Message = require('../models/Message')
const Notification = require('../models/Notification')
const { mapUserToDto, mapRequestToDto } = require('../utils/mappers')

const router = express.Router()

router.use(authRequired, loadUser, adminRequired)

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalRequests, activeRequests] = await Promise.all([
      User.countDocuments({}),
      HelpRequest.countDocuments({}),
      HelpRequest.countDocuments({ status: { $ne: 'solved' } }),
    ])
    return res.json({ totalUsers, totalRequests, activeRequests })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).limit(500)
    return res.json({ users: users.map(mapUserToDto) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.get('/requests', async (req, res) => {
  try {
    const list = await HelpRequest.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy')
      .populate('helpers')
      .limit(500)
    const out = list.map((r) => mapRequestToDto(r, r.createdBy?.name || 'Member'))
    return res.json({ requests: out })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/request/:id/review', async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Not found' })
    const r = await HelpRequest.findById(id).populate('createdBy').populate('helpers')
    if (!r) return res.status(404).json({ error: 'Not found' })
    r.reviewed = true
    r.reviewedAt = new Date()
    r.reviewedBy = req.userId
    await r.save()
    const dto = mapRequestToDto(r, r.createdBy?.name || 'Member')
    return res.json({ request: dto })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Update failed' })
  }
})

router.delete('/request/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Not found' })
    const r = await HelpRequest.findById(id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    await Promise.all([
      Message.deleteMany({ requestId: r._id }),
      Notification.deleteMany({ requestId: r._id }),
      HelpRequest.deleteOne({ _id: r._id }),
    ])
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Delete failed' })
  }
})

module.exports = router

