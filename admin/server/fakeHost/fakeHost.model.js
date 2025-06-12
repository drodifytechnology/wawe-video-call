const mongoose = require("mongoose");

const fakeHost = new mongoose.Schema(
  {
    name: String,
    image: String,
    video: String,
    bio: { type: String, default: null },
    coin: { type: Number, default: 0 },
    followers_count: { type: Number, default: 0 },
    fcm_token: { type: String, default: null },
    country: { type: String, default: "India" },
    hostCountry: { type: mongoose.Schema.Types.ObjectId, ref: "Country" }, //get country when host is live

    // isLogout: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: true },
    isLive: { type: Boolean, default: false },
    isBusy: { type: Boolean, default: false },

    token: { type: String, default: null },
    channel: { type: String, default: null },
    // mobileNo: { type: String, default: "" },
    receivedCoin: { type: Number, default: 0 },
    uniqueId: String,
    bonusSwitch: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("FakeHost", fakeHost);
