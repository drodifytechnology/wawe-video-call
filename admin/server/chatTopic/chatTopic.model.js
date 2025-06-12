const mongoose = require("mongoose");

const chatTopicSchema = new mongoose.Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, //receiver id
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    }, //last chatId
  },
  {
    timestamps: true,
  }
);
chatTopicSchema.index({ host_id: 1 });
chatTopicSchema.index({ user_id: 1 });

module.exports = mongoose.model("ChatTopic", chatTopicSchema);
