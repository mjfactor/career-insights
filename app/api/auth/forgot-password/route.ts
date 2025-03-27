import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import crypto from 'crypto';

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

        // Send password reset email
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const emailResponse = await fetch(`${baseUrl}/api/email/send-password-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                name: user.name || 'User',
                resetUrl
            }),
        });

        if (!emailResponse.ok) {
            console.error('Failed to send password reset email:', await emailResponse.text());
            return NextResponse.json(
                { error: 'Failed to send password reset email' },
                { status: 500 }
            );
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