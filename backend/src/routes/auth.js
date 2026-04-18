const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { authRequired } = require('../middleware/auth')
const { mapUserToDto } = require('../utils/mappers')

const router = express.Router()

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

/** Map UI role label → platform role + display */
function deriveRoleFields(uiRole) {
  const label = (uiRole || 'Member').trim()
  let role = 'both'
  if (/student|need|seek/i.test(label)) role = 'need_help'
  else if (/mentor|professional|helper|can help/i.test(label)) role = 'can_help'
  return { role, displayRole: label }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role: uiRole, skills, interests, location } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' })
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    const hashed = await bcrypt.hash(password, 12)
    const skillArr = Array.isArray(skills)
      ? skills
      : String(skills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
    const { role, displayRole } = deriveRoleFields(uiRole)
    const interestArr = Array.isArray(interests)
      ? interests
      : String(interests || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      displayRole,
      skills: skillArr.length ? skillArr : ['Community'],
      interests: interestArr,
      location: location || 'Remote',
      badges: ['Member'],
      trustScore: 70,
    })

    const token = signToken(user._id)
    const dto = mapUserToDto(user)
    return res.status(201).json({ token, user: dto })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    user.lastActiveAt = new Date()
    await user.save()
    const token = signToken(user._id)
    const dto = mapUserToDto(await User.findById(user._id))
    return res.json({ token, user: dto })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
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
