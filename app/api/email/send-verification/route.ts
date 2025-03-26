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

// Create HTML template for verification email
function createVerificationEmailHTML(name: string, verificationUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h1 style="color: #333; text-align: center;">Welcome to Employment Opportunities!</h1>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">Hello ${name},</p>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">
        Thank you for registering. Please click the button below to verify your email address:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a 
          href="${verificationUrl}"
          style="background-color: #22c55e; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;"
        >
          Verify my email
        </a>
      </div>
      <p style="font-size: 16px; line-height: 1.5; color: #555;">
        This link will expire in 24 hours.
      </p>
      <p style="font-size: 14px; color: #777; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>
  `;
}

// Create plain text version for email clients that don't support HTML
function createVerificationEmailText(name: string, verificationUrl: string) {
  return `
    Welcome to Employment Opportunities!
    
    Hello ${name},
    
    Thank you for registering. Please visit the following link to verify your email address:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create this account, you can safely ignore this email.
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, verificationUrl } = body;

    if (!email || !name || !verificationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Configure email options with both HTML and plain text versions
    const mailOptions = {
      from: `"Employment Opportunities" <${process.env.GMAIL_EMAIL_ADDRESS}>`,
      to: email,
      subject: 'Verify your email address',
      text: createVerificationEmailText(name, verificationUrl),
      html: createVerificationEmailHTML(name, verificationUrl),
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      data: { messageId: info.messageId }
    });
  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}