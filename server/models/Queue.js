const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  customers: [
  {
    name: { type: String, required: true },         // NEW
    phone: { type: String, required: true },        // NEW
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, if logged in
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['waiting', 'serving', 'done', 'skipped', 'out'], default: 'waiting' },
    token: { type: Number },
  },
],
}, { timestamps: true });

module.exports = mongoose.model('Queue', queueSchema);