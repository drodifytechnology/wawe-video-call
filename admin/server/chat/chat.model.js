const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Host',
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userChatDelete: {
      type: Boolean,
      default: false,
    },
    hostChatDelete: {
      type: Boolean,
      default: false,
    },
    message: String,
    sender: String,
    topic: String,
  },
  {
    timestamps: true,
  }
);
chatSchema.index({ host_id: 1 });
chatSchema.index({ user_id: 1 });
chatSchema.index({ topic: 1 });

module.exports = mongoose.model('Chat', chatSchema);
