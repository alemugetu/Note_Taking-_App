import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Single transporter instance (Brevo SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - recipient address
 * @param {string} subject
 * @param {string} text - plain text body
 * @param {string} [html] - optional HTML body
 * @returns {Promise<boolean>}
 */
export async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      // Use SMTP_USER as from — it is the verified Brevo sender
      from: `"${process.env.SENDER_NAME || 'Note Taking App'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      ...(html && { html }),
    });
    console.log(`[MAIL] Sent to ${to}: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[MAIL] Failed to send to ${to}:`, err.message);
    return false;
  }
}

export default transporter;
