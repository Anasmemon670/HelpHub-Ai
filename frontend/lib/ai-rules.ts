import type { UrgencyLevel } from './types'

const CATEGORY_KEYWORDS: { category: string; words: string[] }[] = [
  { category: 'Web Development', words: ['html', 'css', 'javascript', 'react', 'next', 'portfolio', 'responsive', 'frontend', 'website', 'web'] },
  { category: 'Design', words: ['figma', 'poster', 'ui', 'ux', 'design', 'layout', 'typography', 'visual'] },
  { category: 'Career', words: ['interview', 'career', 'internship', 'resume', 'job', 'mock'] },
  { category: 'Backend', words: ['node', 'api', 'jwt', 'rest', 'server', 'database', 'sql', 'auth'] },
  { category: 'Mobile', words: ['android', 'ios', 'react native', 'mobile', 'navigation', 'app'] },
]

const TAG_KEYWORDS: { tag: string; words: string[] }[] = [
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

const HIGH_URGENCY = ['urgent', 'asap', 'exam', 'deadline', 'today', 'tonight', 'emergency', 'critical']
const LOW_URGENCY = ['learning', 'curious', 'whenever', 'no rush', 'low priority', 'practice']

export interface AiAnalysisResult {
  category: string
  urgency: UrgencyLevel
  tags: string[]
}

function normalize(text: string): string {
  return text.toLowerCase()
}

export function analyzeRequestText(raw: string): AiAnalysisResult {
  const text = normalize(raw || '')
  let category = 'Other'
  let best = 0
  for (const row of CATEGORY_KEYWORDS) {
    const n = row.words.filter((w) => text.includes(w)).length
    if (n > best) {
      best = n
      category = row.category
    }
  }
  if (best === 0 && text.length > 0) {
    for (const row of CATEGORY_KEYWORDS) {
      if (row.words.some((w) => text.split(/\s+/).some((part) => part.length > 3 && part.includes(w)))) {
        category = row.category
        break
      }
    }
  }

  let urgency: UrgencyLevel = 'Medium'
  if (HIGH_URGENCY.some((w) => text.includes(w))) {
    urgency = 'High'
  } else if (LOW_URGENCY.some((w) => text.includes(w))) {
    urgency = 'Low'
  }

  const tagSet = new Set<string>()
  for (const row of TAG_KEYWORDS) {
    if (row.words.some((w) => text.includes(w))) {
      tagSet.add(row.tag)
    }
  }
  const words = text.split(/[^a-z0-9+#]+/).filter(Boolean)
  for (const w of words) {
    if (w.length >= 4 && /^[a-z]+$/i.test(w)) {
      const cap = w.charAt(0).toUpperCase() + w.slice(1)
      if (tagSet.size < 8) tagSet.add(cap)
    }
  }

  const tags = Array.from(tagSet).slice(0, 8)
  return { category, urgency, tags }
}
