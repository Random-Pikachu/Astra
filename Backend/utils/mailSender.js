const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
  try {
    // Create a Transporter to send emails
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT) || 587;
    const secure = port === 465; // true for 465, false for 587/STARTTLS

    const transportConfig = {
      host,
      port,
      secure,
      requireTLS: !secure,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    };

    // Hint Nodemailer if using Gmail
    if (host && host.includes('gmail.com')) {
      transportConfig.service = 'gmail';
    }

    let transporter = nodemailer.createTransport(transportConfig);

    // Optional: verify connection configuration with timeout
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 5000)
        )
      ]);
    } catch (verifyErr) {
      // swallow verify logs in production
    }
    // Send emails to users with timeout
    let info = await Promise.race([
      transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: title,
        html: body,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 15000)
      )
    ]);
    return info;
  } catch (error) {
    // swallow mail send logs in production
  }
};
module.exports = mailSender;