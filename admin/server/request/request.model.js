const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAccepted: { type: Boolean, default: false },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
  },
  {
    timestamps: true,
  }
);
requestSchema.index({ user_id: 1 });
requestSchema.index({ agencyId: 1 });
module.exports = mongoose.model("Request", requestSchema);
