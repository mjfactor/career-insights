import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD, // This should be an app password, not your regular Gmail password
    },
});

// Create HTML template for password reset email
function createPasswordResetEmailHTML(name: string, resetUrl: string) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">Hello ${name},</p>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${resetUrl}"
          style="background-color: #22c55e; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;"
        >
          Reset Password
        </a>
      </div>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">
        This link will expire in 1 hour.
      </p>
      <p style="font-size: 14px; color: #777; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;
}

// Create plain text version for email clients that don't support HTML
function createPasswordResetEmailText(name: string, resetUrl: string) {
    return `
    Reset Your Password
    
    Hello ${name},
    
    We received a request to reset your password. Please visit the following link to create a new password:
    
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, you can safely ignore this email.
  `;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, resetUrl } = body;

        if (!email || !name || !resetUrl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Configure email options with both HTML and plain text versions
        const mailOptions = {
            from: `"Employment Opportunities" <${process.env.GMAIL_EMAIL_ADDRESS}>`,
            to: email,
            subject: 'Reset your password',
            text: createPasswordResetEmailText(name, resetUrl),
            html: createPasswordResetEmailHTML(name, resetUrl),
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            data: { messageId: info.messageId }
        });
    } catch (error) {
        console.error('Password reset email error:', error);
        return NextResponse.json(
            { error: 'Failed to send password reset email' },
            { status: 500 }
        );
    }
}