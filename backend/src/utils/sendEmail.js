const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML)
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (NOT your regular password)
    },
  });

  const mailOptions = {
    from: `"Beam Affiliate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Build a styled OTP email
 */
const buildOTPEmail = (otp, purpose = 'verify your account') => {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">Beam Affiliate</h1>
      </div>
      <div style="padding: 32px 24px; text-align: center;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Your OTP to <strong>${purpose}</strong>:</p>
        <div style="background: #fff; border: 2px dashed #6366f1; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px 24px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
};

module.exports = { sendEmail, buildOTPEmail };
