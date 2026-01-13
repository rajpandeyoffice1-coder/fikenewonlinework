const transporter = require('./mailer')
const COMPANY_EMAIL = process.env.COMPANY_EMAIL

module.exports = async ({ to, subject, html, cc }) => {
  await transporter.sendMail({
    from: `"FIKA" <${COMPANY_EMAIL}>`,
    to,
    cc,
    subject,
    html
  })
}
