const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    host_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Host' },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    duration: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
