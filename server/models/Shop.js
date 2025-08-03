const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
},
  timings: {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  profilePic: { type: String },
}, { timestamps: true });

shopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shop', shopSchema); 