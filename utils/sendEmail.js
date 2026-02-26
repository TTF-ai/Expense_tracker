const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOTPEmail = async (to, otp) => {
    const mailOptions = {
        from: `"Expense Tracker" <${process.env.SMTP_USER}>`,
        to,
        subject: "🔐 Your OTP for Expense Tracker Verification",
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%); border-radius: 16px; padding: 40px; border: 1px solid #90caf9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1976d2; margin: 0; font-size: 28px;">💰 Expense Tracker</h1>
          <p style="color: #64b5f6; margin: 5px 0 0;">Email Verification</p>
        </div>
        <div style="background: #ffffff; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 2px 12px rgba(25,118,210,0.08);">
          <p style="color: #455a64; font-size: 16px; margin: 0 0 20px;">Your One-Time Password is:</p>
          <div style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 16px 24px; border-radius: 10px; display: inline-block;">
            ${otp}
          </div>
          <p style="color: #90a4ae; font-size: 13px; margin: 20px 0 0;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <p style="color: #b0bec5; font-size: 12px; text-align: center; margin: 20px 0 0;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;
