const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpRequest', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    message: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

messageSchema.index({ requestId: 1, timestamp: 1 })

module.exports = mongoose.model('Message', messageSchema)
