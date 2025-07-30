const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  location: { type: String }, // can be coordinates or city
  timings: {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  profilePic: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema); 