const mongoose = require('mongoose');
const queueHistorySchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  joinedAt: Date,
  leftAt: Date,
  status: String
});
module.exports = mongoose.model('QueueHistory', queueHistorySchema);