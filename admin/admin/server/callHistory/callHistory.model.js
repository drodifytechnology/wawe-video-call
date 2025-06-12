const mongoose = require("mongoose");

const callHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    coin: { type: Number, default: 0 },
    time: { type: String, default: null }, //HH:MM:SS
    hostDelete: { type: Boolean, default: false },
    callConnect: { type: Boolean, default: false },
    userDelete: { type: Boolean, default: false },
    callStartTime: { type: String, default: null },
    callEndTime: { type: String, default: null },
    type: { type: String, default: null }, //outgoing
    gift: Array,
  },
  {
    timestamps: true,
  }
);
callHistorySchema.index({ user_id: 1 });
callHistorySchema.index({ host_id: 1 });

module.exports = mongoose.model("CallHistory", callHistorySchema);
