const mongoose = require("mongoose");

const liveStreamingHistorySchema = new mongoose.Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    hostTotalCoin: { type: Number, default: 0 },
    coin: { type: Number, default: 0 },
    time: { type: String, default: null }, //HH:MM:SS
    gift: { type: Number, default: 0 },
    user: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

liveStreamingHistorySchema.index({ host_id: 1 });

module.exports = mongoose.model("LiveStreamingHistory", liveStreamingHistorySchema);
