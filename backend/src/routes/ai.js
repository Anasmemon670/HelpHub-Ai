/**
 * Optional rule-based AI (same behaviour as frontend lib/ai-rules.ts)
 */
const express = require('express')

const router = express.Router()

const CATEGORY_KEYWORDS = [
  { category: 'Web Development', words: ['html', 'css', 'javascript', 'react', 'next', 'portfolio', 'responsive', 'frontend', 'website', 'web'] },
  { category: 'Design', words: ['figma', 'poster', 'ui', 'ux', 'design', 'layout', 'typography', 'visual'] },
  { category: 'Career', words: ['interview', 'career', 'internship', 'resume', 'job', 'mock'] },
  { category: 'Backend', words: ['node', 'api', 'jwt', 'rest', 'server', 'database', 'sql', 'auth'] },
  { category: 'Mobile', words: ['android', 'ios', 'react native', 'mobile', 'navigation', 'app'] },
]

const TAG_KEYWORDS = [
  { tag: 'HTML/CSS', words: ['html', 'css'] },
  { tag: 'Responsive', words: ['responsive', 'mobile', 'tablet', 'breakpoint'] },
  { tag: 'Portfolio', words: ['portfolio', 'demo'] },
  { tag: 'Figma', words: ['figma'] },
  { tag: 'Interview Prep', words: ['interview', 'mock'] },
  { tag: 'Node.js', words: ['node', 'express'] },
  { tag: 'JWT', words: ['jwt', 'token'] },
  { tag: 'React Native', words: ['react native'] },
  { tag: 'Android', words: ['android'] },
  { tag: 'Debugging', words: ['debug', 'bug', 'error'] },
]

const HIGH = ['urgent', 'asap', 'exam', 'deadline', 'today', 'tonight', 'emergency', 'critical']
const LOW = ['learning', 'curious', 'whenever', 'no rush', 'low priority', 'practice']

router.post('/analyze', (req, res) => {
  const text = String(req.body?.text || '').toLowerCase()
  let category = 'Other'
  let best = 0
  for (const row of CATEGORY_KEYWORDS) {
    const n = row.words.filter((w) => text.includes(w)).length
    if (n > best) {
      best = n
      category = row.category
    }
  }
  let urgency = 'Medium'
  if (HIGH.some((w) => text.includes(w))) urgency = 'High'
  else if (LOW.some((w) => text.includes(w))) urgency = 'Low'

  const tagSet = new Set()
  for (const row of TAG_KEYWORDS) {
    if (row.words.some((w) => text.includes(w))) tagSet.add(row.tag)
  }
  const tags = Array.from(tagSet).slice(0, 8)
  return res.json({ category, urgency, tags })
})

module.exports = router
