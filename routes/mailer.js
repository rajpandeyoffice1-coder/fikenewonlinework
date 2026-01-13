const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

module.exports = async ({ to, subject, html, cc }) => {
  await transporter.sendMail({
    from: `"FIKA" <${process.env.COMPANY_EMAIL}>`,
    to,
    cc,
    subject,
    html
  });
}
