const jwt = require('jsonwebtoken')
const User = require('../models/User')

function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/** Loads full user (with password field excluded by default) */
async function loadUser(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    req.user = user
    next()
  } catch (e) {
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { authRequired, loadUser }
