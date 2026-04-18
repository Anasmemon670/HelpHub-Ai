function adminRequired(req, res, next) {
  const user = req.user
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = { adminRequired }

