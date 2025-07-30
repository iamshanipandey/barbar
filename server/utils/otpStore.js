const bcrypt = require('bcryptjs');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOTP(otp) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
}

async function verifyOTP(otp, hash) {
  return await bcrypt.compare(otp, hash);
}

module.exports = { generateOTP, hashOTP, verifyOTP }; 