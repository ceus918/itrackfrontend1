const nodemailer = require('nodemailer');

// Configure your email transport here
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another SMTP service
  auth: {
    user: process.env.EMAIL_USER, // set in your .env file
    pass: process.env.EMAIL_PASS  // set in your .env file
  }
});

async function sendResetEmail(to, resetLink) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>If you did not request this, please ignore this email.</p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = sendResetEmail;
