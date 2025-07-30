const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  customers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['waiting', 'done'], default: 'waiting' },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Queue', queueSchema); 