import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const { email, token, password } = await request.json();

        if (!email || !token || !password) {
            return NextResponse.json({
                error: 'Email, token, and password are required'
            }, { status: 400 });
        }

        // Find the reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: {
                identifier_token: {
                    identifier: email,
                    token
                }
            }
        });

        // If token doesn't exist or has expired
        if (!resetToken || resetToken.expires < new Date()) {
            return NextResponse.json({
                error: 'Invalid or expired reset token'
            }, { status: 400 });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update user's password
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        // Delete the used reset token
        await prisma.passwordResetToken.deleteMany({
            where: { identifier: email }
        });

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json(
            { error: 'An error occurred while resetting your password' },
            { status: 500 }
        );
    }
}