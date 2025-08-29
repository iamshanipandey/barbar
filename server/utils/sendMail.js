const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("ENV PASS:", process.env.MAIL_PASS); // quotes ke saath check karo

// Transporter ko global declare karo
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Direct gmail service use karo
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS.trim()
  }
});

// Verify connection
transporter.verify(function(error, success) {
  if (error) {
    console.log("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});

const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Barber App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Mail sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail error:", error.message);
    throw error;
  }
};

module.exports = sendMail;