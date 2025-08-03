const User = require('../models/User');
const sendMail = require('../utils/sendMail');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpStore');
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, userType, password } = req.body;

    if (!name || !email || !phone || !userType || !password)
      return res.status(400).json({ message: 'All fields are required' });

    let user = await User.findOne({ email });

    if (user && user.isVerified)
      return res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const otpExpiry = Date.now() + 5 * 60 * 1000;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      user = await User.create({
        name,
        email,
        phone,
        userType,
        password: hashedPassword,
        otp: hashedOtp,
        otpExpiry
      });
    } else {
      user.name = name;
      user.phone = phone;
      user.userType = userType;
      user.password = hashedPassword;
      user.otp = hashedOtp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }

    await sendMail(email, 'Your OTP', `<h2>Your OTP is: <b>${otp}</b></h2>`);
    res.status(200).json({ message: 'OTP sent to email' });

  } catch (err) {
    console.log('Signup Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired' });
    const valid = await verifyOTP(otp, user.otp);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, userType: user.userType } });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendMail(email, 'Your OTP', `<h2>Your OTP is: <b>${otp}</b></h2>`);
    res.status(200).json({ message: 'OTP resent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Email, password, and userType are required' });
    }

    const user = await User.findOne({ email, userType });

    if (!user) {
      return res.status(404).json({ message: 'User not found with provided credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your account first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    console.log('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile (name, phone, password)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.status(200).json({ message: 'Profile updated', user: { name: user.name, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendMail(email, 'Reset Password OTP', `<h2>Your OTP is: <b>${otp}</b></h2>`);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired' });

    const valid = await verifyOTP(otp, user.otp);
    if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};