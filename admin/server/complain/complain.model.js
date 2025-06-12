const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const complainSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    host_id: { type: Schema.Types.ObjectId, ref: "Host", default: null },
    agency_id: { type: Schema.Types.ObjectId, ref: "Agency", default: null },
    message: { type: String },
    contact: { type: String },
    image: { type: String, default: "null" },
    solved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
complainSchema.index({ user_id: 1 });
complainSchema.index({ host_id: 1 });
complainSchema.index({ agency_id: 1 });

module.exports = mongoose.model("Complain", complainSchema);
