const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendMail; 