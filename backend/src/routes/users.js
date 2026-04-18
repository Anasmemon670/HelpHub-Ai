const express = require('express')
const User = require('../models/User')
const { authRequired } = require('../middleware/auth')
const { mapUserToDto } = require('../utils/mappers')

const router = express.Router()

/** Public list for leaderboard */
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).sort({ trustScore: -1 }).limit(200).lean()
    return res.json({ users: users.map((u) => mapUserToDto(u)) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.put('/update', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const { name, skills, interests, location, role: uiRole } = req.body
    if (name) user.name = String(name).trim()
    if (Array.isArray(skills)) user.skills = skills
    if (typeof skills === 'string') {
      user.skills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (Array.isArray(interests)) user.interests = interests
    if (typeof interests === 'string') {
      user.interests = interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (location) user.location = String(location).trim()
    if (uiRole) {
      user.displayRole = String(uiRole).trim()
    }
    user.lastActiveAt = new Date()
    await user.save()
    return res.json({ user: mapUserToDto(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Update failed' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.json({ user: mapUserToDto(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
