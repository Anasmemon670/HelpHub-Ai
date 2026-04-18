const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['new_request_in_category', 'request_helped', 'request_solved', 'system'],
      default: 'system',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpRequest', default: null },
    category: { type: String, default: null, trim: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
