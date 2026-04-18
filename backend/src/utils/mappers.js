function statusToApi(s) {
  const m = {
    Open: 'open',
    'In Progress': 'in_progress',
    Solved: 'solved',
  }
  return m[s] || 'open'
}

function statusFromApi(s) {
  const m = {
    open: 'Open',
    in_progress: 'In Progress',
    solved: 'Solved',
  }
  return m[s] || 'Open'
}

function mapUserToDto(user) {
  if (!user) return null
  const u = user.toObject ? user.toObject() : user
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.displayRole || mapRoleKindToDisplay(u.role),
    skills: u.skills || [],
    trustScore: u.trustScore,
    contributions: u.contributions ?? 0,
    helpedCount: u.helpedCount ?? 0,
    solvedCount: u.solvedCount ?? 0,
    badges: u.badges || [],
    location: u.location || 'Remote',
    lastActiveAt: (u.lastActiveAt || new Date()).toISOString(),
    interests: u.interests || [],
    roleKind: u.role,
    isAdmin: !!u.isAdmin,
  }
}

function mapRoleKindToDisplay(roleKind) {
  if (roleKind === 'need_help') return 'Seeking help'
  if (roleKind === 'can_help') return 'Helper'
  return 'Member'
}

function mapRequestToDto(reqDoc, authorName) {
  const r = reqDoc.toObject ? reqDoc.toObject() : reqDoc
  const helpers = (r.helpers || []).map((h) => (h._id ? String(h._id) : String(h)))
  return {
    id: String(r._id),
    title: r.title,
    description: r.description,
    category: r.category,
    urgency: r.urgency,
    status: statusFromApi(r.status),
    tags: r.tags || [],
    authorId: r.createdBy?._id ? String(r.createdBy._id) : String(r.createdBy),
    authorName: authorName || r.createdBy?.name || 'Member',
    location: r.createdBy?.location || 'Remote',
    helperIds: helpers,
    messages: [],
    createdAt: (r.createdAt || new Date()).toISOString(),
    reviewed: !!r.reviewed,
  }
}

function mapMessageToDto(msg, senderName) {
  const m = msg.toObject ? msg.toObject() : msg
  return {
    id: String(m._id),
    requestId: String(m.requestId),
    authorId: String(m.senderId),
    authorName: senderName || 'Member',
    body: m.message,
    createdAt: (m.timestamp || new Date()).toISOString(),
    receiverId: m.receiverId ? String(m.receiverId) : null,
  }
}

module.exports = {
  statusToApi,
  statusFromApi,
  mapUserToDto,
  mapRequestToDto,
  mapMessageToDto,
}
