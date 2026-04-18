const mongoose = require('mongoose')

const helpRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'solved'],
      default: 'open',
    },
    helpers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reviewed: { type: Boolean, default: false, index: true },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

helpRequestSchema.index({ createdBy: 1 })
helpRequestSchema.index({ status: 1 })
helpRequestSchema.index({ createdAt: -1 })

module.exports = mongoose.model('HelpRequest', helpRequestSchema)
