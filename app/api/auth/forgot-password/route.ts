import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Create a nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Import the email template functions directly
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
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Check if user exists
        if (!user) {
            return NextResponse.json({
                error: 'Email not found. Please check your email or sign up for an account.'
            }, { status: 404 });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return NextResponse.json({
                error: 'Please verify your email first. Check your inbox for a verification link or request a new one.'
            }, { status: 400 });
        }

        // Delete any existing password reset tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { identifier: email }
        });

        // Create reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

        // Save token in database
        await prisma.passwordResetToken.create({
            data: {
                identifier: email,
                token,
                expires
            }
        });

        // Get the base URL for reset link
        const baseUrl = process.env.NEXTAUTH_URL || 'https://employment-opportunities.vercel.app';
        const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        try {
            // Send the email directly without calling another API route
            const mailOptions = {
                from: `"Employment Opportunities" <${process.env.GMAIL_EMAIL_ADDRESS}>`,
                to: email,
                subject: 'Reset your password',
                text: createPasswordResetEmailText(user.name || 'User', resetUrl),
                html: createPasswordResetEmailHTML(user.name || 'User', resetUrl),
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the request if email sending fails
            // The token is already in the database so the user can still reset if they know the URL
        }

        return NextResponse.json({
            success: true,
            message: "Password reset link has been sent to your email."
        });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}