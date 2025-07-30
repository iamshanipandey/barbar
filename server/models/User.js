const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['barber', 'customer'], required: true },
  password: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 