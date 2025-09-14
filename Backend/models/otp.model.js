const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // Automatically delete after 5 minutes
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      'Verify your Astra account',
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your Astra account</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #47848F 0%, #9FEAF9 100%); padding: 40px 32px; text-align: center;">
            <div style="display: inline-block; width: 64px; height: 64px; margin-bottom: 16px;">
              <svg width="64" height="64" viewBox="0 0 256 256" style="display: block;">
                <circle cx="128" cy="128" r="120" fill="rgba(255,255,255,0.2)" />
                <circle cx="128" cy="128" r="100" fill="rgba(255,255,255,0.3)" />
                <circle cx="128" cy="128" r="85" fill="rgba(255,255,255,0.2)" />
                <circle cx="128" cy="128" r="70" fill="rgba(255,255,255,0.3)" />
                <circle cx="128" cy="128" r="55" fill="rgba(255,255,255,0.2)" />
                <circle cx="128" cy="128" r="40" fill="rgba(255,255,255,0.3)" />
                <circle cx="128" cy="128" r="25" fill="rgba(255,255,255,0.4)" />
              </svg>
            </div>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">Astra</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px;">
            <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">Verify your account</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Enter this verification code to complete your signup:</p>
            
            <!-- OTP Code -->
            <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
              <div style="font-size: 36px; font-weight: 700; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0; text-align: center;">This code will expire in <strong>5 minutes</strong> for security.</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0; text-align: center;">
              © 2024 Astra. All rights reserved.
            </p>
          </div>
          
        </div>
      </body>
      </html>
      `
    );
    
  } catch (error) {
    
    throw error;
  }
}

otpSchema.pre('save', function (next) {
  // no-op log in production
  if (this.isNew) {
    // Send email asynchronously to avoid blocking the response
    // Don't await this to prevent timeout issues
    sendVerificationEmail(this.email, this.otp).catch(() => {});
  }
  next();
});

module.exports = mongoose.model('OTP', otpSchema);

