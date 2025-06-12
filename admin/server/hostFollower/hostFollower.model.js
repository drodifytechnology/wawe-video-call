const mongoose = require("mongoose");

//following
const hostFollowerSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    host_id: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
  },
  {
    timestamps: true,
  }
);
hostFollowerSchema.index({ user_id: 1 });
hostFollowerSchema.index({ host_id: 1 });
module.exports = mongoose.model("HostFollower", hostFollowerSchema);
