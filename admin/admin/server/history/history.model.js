const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
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
    rupee: { type: Number, default: 0 },
    offlineRecharge: { type: Boolean, default: false },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
historySchema.index({ user_id: 1 });
historySchema.index({ host_id: 1 });
module.exports = mongoose.model("History", historySchema);
