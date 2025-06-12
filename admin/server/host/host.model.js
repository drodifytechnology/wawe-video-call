const mongoose = require("mongoose");
const config = require("./../../config");

const hostSchema = new mongoose.Schema(
  {
    name: String,
    image: { type: String, default: config.baseURL + "storage/female.png" },
    username: String,
    hostId: String,
    password: String,
    bio: { type: String, default: null },
    coin: { type: Number, default: 0 },
    followers_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
    fcm_token: { type: String, default: null },
    block: { type: Boolean, default: false },
    country: { type: String, default: "India" },
    hostCountry: { type: mongoose.Schema.Types.ObjectId, ref: "Country" }, //get country when host is live
    isLogout: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    identity: { type: String, default: null },
    isLive: { type: Boolean, default: false },
    isBusy: { type: Boolean, default: false },
    token: { type: String, default: null },
    channel: { type: String, default: null },
    mobileNo: { type: String, default: "" },
    receivedCoin: { type: Number, default: 0 },
    liveStreamingHistoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveStreamingHistory",
    },
    IPAddress: { type: String, default: null },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    uniqueId: String,
    bonusSwitch: { type: Boolean, default: false },
    callId: { type: String, default: null },
    onlineOfPenal: { type: Boolean, default: false },
    startLoginTime: { type: String, default: null },
    TotalLoginTime: { type: Number, default: 0 }, //in minutes
  },
  {
    timestamps: true,
  }
);

hostSchema.index({ liveStreamingHistoryId: 1 });
hostSchema.index({ agencyId: 1 });
hostSchema.index({ isOnline: 1 });
module.exports = mongoose.model("Host", hostSchema);
