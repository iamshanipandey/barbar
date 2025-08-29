const nodemailer = require("nodemailer");
require("dotenv").config();

const user = (process.env.MAIL_USER || "").trim();
const pass = (process.env.MAIL_PASS || "").trim().replace(/['"]/g, ""); // quotes hata diye

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,        // SSL port
  secure: true,     // true because using 465
  auth: { user, pass }
});

// Optional: startup verify
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP error:", err.message);
  } else {
    console.log("✅ SMTP ready to send mails");
  }
});

async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Barber App" <${user}>`, // Gmail rule: from must match auth user
      to,
      subject,
      html,
    });
    console.log("📩 Mail sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Mail send error:", err.message);
    throw err;
  }
}

module.exports = sendMail;
