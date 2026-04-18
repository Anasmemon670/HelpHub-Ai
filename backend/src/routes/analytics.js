const express = require('express')
const mongoose = require('mongoose')
const { authRequired } = require('../middleware/auth')
const { getDbState } = require('../config/db')
const HelpRequest = require('../models/HelpRequest')
const User = require('../models/User')

const router = express.Router()

router.get('/overview', authRequired, async (req, res) => {
  const db = getDbState()
  if (!db.connected || mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database unavailable' })
  }

  try {
    const [totalRequests, byStatusAgg, catAgg, createdAgg, helpedAgg] = await Promise.all([
      HelpRequest.countDocuments({}),
      HelpRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      HelpRequest.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),
      HelpRequest.aggregate([{ $group: { _id: '$createdBy', created: { $sum: 1 } } }]),
      HelpRequest.aggregate([
        { $match: { helpers: { $exists: true, $ne: [] } } },
        { $unwind: '$helpers' },
        { $group: { _id: '$helpers', helped: { $sum: 1 } } },
      ]),
    ])

    const byStatus = { open: 0, in_progress: 0, solved: 0 }
    for (const row of byStatusAgg) {
      const k = row._id
      if (k && Object.prototype.hasOwnProperty.call(byStatus, k)) {
        byStatus[k] = row.count
      }
    }

    const solved = byStatus.solved
    const successRate = totalRequests === 0 ? 0 : Math.round((solved / totalRequests) * 1000) / 10

    const topCategories = catAgg.map((row) => ({
      category: row._id ? String(row._id) : 'Uncategorized',
      count: row.count,
    }))

    const activityMap = new Map()
    for (const row of createdAgg) {
      if (!row._id) continue
      const id = String(row._id)
      activityMap.set(id, {
        userId: id,
        requestsCreated: row.created,
        helpSessions: 0,
      })
    }
    for (const row of helpedAgg) {
      if (!row._id) continue
      const id = String(row._id)
      const cur = activityMap.get(id) || { userId: id, requestsCreated: 0, helpSessions: 0 }
      cur.helpSessions = row.helped
      activityMap.set(id, cur)
    }

    const ranked = Array.from(activityMap.values())
      .map((u) => ({
        ...u,
        activityScore: u.requestsCreated + u.helpSessions,
      }))
      .filter((u) => u.activityScore > 0)
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 15)

    const ids = ranked.map((u) => u.userId)
    const userDocs = await User.find({ _id: { $in: ids } }).select('name')
    const nameById = new Map(userDocs.map((doc) => [String(doc._id), doc.name || 'Member']))

    const mostActiveUsers = ranked.map((u) => ({
      userId: u.userId,
      name: nameById.get(u.userId) || 'Member',
      requestsCreated: u.requestsCreated,
      helpSessions: u.helpSessions,
      activityScore: u.activityScore,
    }))

    return res.json({
      totalRequests,
      byStatus,
      successRate,
      topCategories,
      mostActiveUsers,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
