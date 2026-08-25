import nodemailer from 'nodemailer';

console.log("nodemailer.js loaded. SMTP_USER =", process.env.SMTP_USER, "SMTP_PASS exists =", !!process.env.SMTP_PASS);

// Configure the transporter with variables from environment settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass'
  }
});

// Flag to check if SMTP credentials are fully configured for live delivery
export const isMailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

export default transporter;
