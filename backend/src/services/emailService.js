import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendOTPEmail = async ({ to, otp, name }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"AI Study Planner 📚" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Login OTP — AI Study Planner',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h1 style="color: #6366f1; margin: 0 0 8px;">AI Study Planner 📚</h1>
        <p style="color: #64748b; margin: 0 0 24px;">Your one-time login code</p>
        <p style="color: #0f172a; margin: 0 0 16px;">Hi ${name || 'there'},</p>
        <p style="color: #0f172a; margin: 0 0 24px;">Use the OTP below to log in. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #fff;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${to}`);
  } catch (error) {
    logger.error(`Failed to send OTP email: ${error.message}`);
    throw new Error('Failed to send OTP email');
  }
};

export const sendWelcomeEmail = async ({ to, name }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"AI Study Planner 📚" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to AI Study Planner! 🎉',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h1 style="color: #6366f1;">Welcome, ${name}! 🚀</h1>
        <p style="color: #0f172a;">Your AI-powered study companion is ready. Start by uploading your notes and let Gemini AI do the heavy lifting.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 16px;">Go to Dashboard</a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.warn(`Welcome email failed for ${to}: ${error.message}`);
    // Non-critical — don't throw
  }
};
