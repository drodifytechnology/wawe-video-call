const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    type: String,
    image: String,
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
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ host_id: 1 });
notificationSchema.index({ user_id: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
