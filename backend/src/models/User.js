const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    /** Platform role for matching / filters: need_help | can_help | both */
    role: {
      type: String,
      enum: ['need_help', 'can_help', 'both'],
      default: 'both',
    },
    /** Original UI label from signup (Student, Mentor, …) */
    displayRole: { type: String, default: 'Member' },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    trustScore: { type: Number, default: 70, min: 0, max: 100 },
    badges: [{ type: String }],
    helpedCount: { type: Number, default: 0, min: 0 },
    solvedCount: { type: Number, default: 0, min: 0 },
    contributions: { type: Number, default: 0, min: 0 },
    location: { type: String, default: 'Remote', trim: true },
    lastActiveAt: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
)

userSchema.index({ trustScore: -1 })

module.exports = mongoose.model('User', userSchema)
