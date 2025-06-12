const mongoose = require("mongoose");

const giftSchema = mongoose.Schema(
  {
    icon: String,
    coin: Number,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);
giftSchema.index({ category: 1 });
module.exports = mongoose.model("Gift", giftSchema);
