const nodemailer = require('nodemailer');

// Clean env values (quotes/spaces hatao, hidden chars handle)
const RAW_USER = process.env.MAIL_USER || '';
const RAW_PASS = process.env.MAIL_PASS || '';

const MAIL_USER = RAW_USER.trim();
let MAIL_PASS = RAW_PASS.trim()
  .replace(/^['"]|['"]$/g, '')  // surrounding quotes remove
  .replace(/\s+/g, '');         // any spaces remove (app password me spaces nahi hote)

console.log('Mail ENV sanity:', {
  user: MAIL_USER,
  passLen: MAIL_PASS.length
});

// Transport A: Gmail service with STARTTLS (587)
const transportA = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: MAIL_USER, pass: MAIL_PASS },
  authMethod: 'LOGIN',
  logger: true,
  debug: true
});

// Transport B: Direct SMTP SSL (465)
const transportB = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: MAIL_USER, pass: MAIL_PASS },
  authMethod: 'LOGIN',
  logger: true,
  debug: true
});

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Try 587 first
  try {
    const t = transportA();
    await t.verify();
    console.log('✅ Gmail transporter ready (587 TLS)');
    transporter = t;
    return transporter;
  } catch (e) {
    console.warn('587 verify failed:', e?.response || e?.message);
  }

  // Fallback to 465
  const t2 = transportB();
  await t2.verify();
  console.log('✅ Gmail transporter ready (465 SSL)');
  transporter = t2;
  return transporter;
};

const sendMail = async (to, subject, html) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"Barber App" <${MAIL_USER}>`,
    to,
    subject,
    html
  });
  console.log('📧 Email sent:', info.messageId);
  return info;
};

module.exports = sendMail;