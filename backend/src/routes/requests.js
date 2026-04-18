const express = require('express')
const mongoose = require('mongoose')
const HelpRequest = require('../models/HelpRequest')
const User = require('../models/User')
const Message = require('../models/Message')
const Notification = require('../models/Notification')
const { authRequired } = require('../middleware/auth')
const { mapRequestToDto, mapMessageToDto, statusToApi } = require('../utils/mappers')
const { TRUST_HELP, TRUST_SOLVE } = require('../utils/trust')

const router = express.Router()

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function createNotificationSafe(payload) {
  try {
    await Notification.create(payload)
  } catch (e) {
    console.error('[notifications] create failed', e)
  }
}

async function attachMessagesToRequestDto(dto) {
  const msgs = await Message.find({ requestId: dto.id }).sort({ timestamp: 1 }).populate('senderId')
  dto.messages = msgs.map((m) => {
    const name = m.senderId?.name || 'Member'
    return mapMessageToDto(m, name)
  })
  return dto
}

router.post('/create', authRequired, async (req, res) => {
  try {
    const { title, description, category, tags, urgency, status } = req.body
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'title, description, and category are required' })
    }
    const tagArr = Array.isArray(tags) ? tags : String(tags || '').split(',').map((t) => t.trim()).filter(Boolean)
    const doc = await HelpRequest.create({
      title: title.trim(),
      description,
      category: category.trim(),
      tags: tagArr,
      urgency: urgency || 'Medium',
      createdBy: req.userId,
      status: status ? statusToApi(status) : 'open',
    })
    const author = await User.findById(req.userId)
    author.contributions = (author.contributions || 0) + 1
    author.lastActiveAt = new Date()
    await author.save()
    await doc.populate('createdBy')
    const categoryRegex = new RegExp(escapeRegex(doc.category), 'i')
    const watchers = await User.find({
      _id: { $ne: req.userId },
      role: { $in: ['can_help', 'both'] },
      $or: [{ skills: { $elemMatch: { $regex: categoryRegex } } }, { interests: { $elemMatch: { $regex: categoryRegex } } }],
    }).select('_id name')
    if (watchers.length) {
      await Notification.insertMany(
        watchers.map((u) => ({
          userId: u._id,
          type: 'new_request_in_category',
          title: 'New request in your category',
          message: `${author.name} posted a new ${doc.category} request.`,
          requestId: doc._id,
          category: doc.category,
        })),
        { ordered: false }
      )
    }
    const dto = mapRequestToDto(doc, author.name)
    dto.messages = []
    return res.status(201).json({ request: dto })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Create failed' })
  }
})

router.get('/', async (req, res) => {
  try {
    const list = await HelpRequest.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy')
      .populate('helpers')
    const out = []
    for (const r of list) {
      const authorName = r.createdBy?.name || 'Member'
      const dto = mapRequestToDto(r, authorName)
      const msgs = await Message.find({ requestId: r._id }).sort({ timestamp: 1 }).populate('senderId')
      dto.messages = msgs.map((m) => mapMessageToDto(m, m.senderId?.name || 'Member'))
      out.push(dto)
    }
    return res.json({ requests: out })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.put('/update', authRequired, async (req, res) => {
  try {
    const { id, title, description, category, tags, urgency, status } = req.body
    if (!id) {
      return res.status(400).json({ error: 'id is required' })
    }
    const r = await HelpRequest.findById(id)
    if (!r) {
      return res.status(404).json({ error: 'Not found' })
    }
    if (String(r.createdBy) !== String(req.userId)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    if (title) r.title = title.trim()
    if (description) r.description = description
    if (category) r.category = category.trim()
    if (Array.isArray(tags)) r.tags = tags
    if (urgency) r.urgency = urgency
    if (status) r.status = statusToApi(status)
    await r.save()
    await r.populate('createdBy')
    const dto = mapRequestToDto(r, r.createdBy.name)
    await attachMessagesToRequestDto(dto)
    return res.json({ request: dto })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Update failed' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Not found' })
    }
    const r = await HelpRequest.findById(req.params.id).populate('createdBy').populate('helpers')
    if (!r) {
      return res.status(404).json({ error: 'Not found' })
    }
    const authorName = r.createdBy?.name || 'Member'
    const dto = mapRequestToDto(r, authorName)
    await attachMessagesToRequestDto(dto)
    return res.json({ request: dto })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const r = await HelpRequest.findById(req.params.id)
    if (!r) {
      return res.status(404).json({ error: 'Not found' })
    }
    if (String(r.createdBy) !== String(req.userId)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    await Message.deleteMany({ requestId: r._id })
    await HelpRequest.deleteOne({ _id: r._id })
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Delete failed' })
  }
})

router.post('/help', authRequired, async (req, res) => {
  try {
    const { requestId } = req.body
    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' })
    }
    const r = await HelpRequest.findById(requestId).populate('createdBy')
    if (!r) {
      return res.status(404).json({ error: 'Not found' })
    }
    if (String(r.createdBy._id) === String(req.userId)) {
      return res.status(400).json({ error: 'Cannot help your own request' })
    }
    const helper = await User.findById(req.userId)
    const already = r.helpers.some((h) => String(h) === String(req.userId))
    if (already) {
      return res.status(400).json({ error: 'Already helping' })
    }
    r.helpers.push(req.userId)
    if (r.status === 'open') r.status = 'in_progress'
    helper.trustScore = Math.min(100, (helper.trustScore || 0) + TRUST_HELP)
    helper.helpedCount = (helper.helpedCount || 0) + 1
    helper.contributions = (helper.contributions || 0) + 1
    if (helper.trustScore >= 80 && !(helper.badges || []).includes('Trusted Helper')) {
      helper.badges = [...(helper.badges || []), 'Trusted Helper']
    }
    helper.lastActiveAt = new Date()
    await helper.save()
    await r.save()
    await Message.create({
      requestId: r._id,
      senderId: req.userId,
      receiverId: r.createdBy._id,
      message: `${helper.name} offered to help on this request.`,
    })
    await createNotificationSafe({
      userId: r.createdBy._id,
      type: 'request_helped',
      title: 'Someone can help',
      message: `${helper.name} offered to help with your request.`,
      requestId: r._id,
      category: r.category,
    })
    await r.populate('createdBy')
    await r.populate('helpers')
    const dto = mapRequestToDto(r, r.createdBy.name)
    await attachMessagesToRequestDto(dto)
    return res.json({ request: dto, user: {
      id: String(helper._id),
      trustScore: helper.trustScore,
      helpedCount: helper.helpedCount,
      contributions: helper.contributions,
      badges: helper.badges,
    }})
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.post('/solve', authRequired, async (req, res) => {
  try {
    const { requestId } = req.body
    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' })
    }
    const r = await HelpRequest.findById(requestId).populate('createdBy')
    if (!r) {
      return res.status(404).json({ error: 'Not found' })
    }
    const isAuthor = String(r.createdBy._id) === String(req.userId)
    const isHelper = r.helpers.some((h) => String(h) === String(req.userId))
    if (!isAuthor && !isHelper) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    if (r.status === 'solved') {
      return res.status(400).json({ error: 'Already solved' })
    }
    const actor = await User.findById(req.userId)
    r.status = 'solved'
    actor.trustScore = Math.min(100, (actor.trustScore || 0) + TRUST_SOLVE)
    actor.solvedCount = (actor.solvedCount || 0) + 1
    actor.contributions = (actor.contributions || 0) + 1
    if (!(actor.badges || []).includes('Problem Solver')) {
      actor.badges = [...(actor.badges || []), 'Problem Solver']
    }
    actor.lastActiveAt = new Date()
    await actor.save()
    await r.save()
    await Message.create({
      requestId: r._id,
      senderId: req.userId,
      receiverId: r.createdBy._id,
      message: 'This request was marked as solved.',
    })
    const notifyUserIds = new Set([
      String(r.createdBy._id),
      ...r.helpers.map((h) => String(h)),
    ])
    notifyUserIds.delete(String(req.userId))
    if (notifyUserIds.size) {
      await Notification.insertMany(
        Array.from(notifyUserIds).map((uid) => ({
          userId: uid,
          type: 'request_solved',
          title: 'Request marked solved',
          message: `${actor.name} marked a request as solved.`,
          requestId: r._id,
          category: r.category,
        })),
        { ordered: false }
      )
    }
    await r.populate('createdBy')
    await r.populate('helpers')
    const dto = mapRequestToDto(r, r.createdBy.name)
    await attachMessagesToRequestDto(dto)
    return res.json({
      request: dto,
      user: {
        id: String(actor._id),
        trustScore: actor.trustScore,
        solvedCount: actor.solvedCount,
        contributions: actor.contributions,
        badges: actor.badges,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
