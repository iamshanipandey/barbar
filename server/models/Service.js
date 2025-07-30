const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema); 