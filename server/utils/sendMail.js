const nodemailer = require('nodemailer');
require('dotenv').config();

const user = (process.env.MAIL_USER || '').trim();
const pass = (process.env.MAIL_PASS || '')
  .trim()
  .replace(/['"]/g, '')            // quotes hataye
  .replace(/\s+/g, '')              // saare spaces hataye
  .replace(/[^\x20-\x7E]/g, '');    // non-ascii hidden chars hataye

console.log('MAIL_USER:', JSON.stringify(user));
console.log('PASS LENGTH:', pass.length); // 16 aana chahiye

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,        // STARTTLS
  secure: false,    // port 587 => secure false
  auth: { user, pass },
  requireTLS: true,
  logger: true,
  debug: true,
  tls: { minVersion: 'TLSv1.2' }
});

transporter.verify((err) => {
  if (err) console.error('❌ SMTP verify error:', err);
  else console.log('✅ SMTP ready');
});

module.exports = async function sendMail(to, subject, html) {
  return transporter.sendMail({
    from: `"Barber App" <${user}>`, // Gmail me from == user hi rakho
    to,
    subject,
    html
  });
};