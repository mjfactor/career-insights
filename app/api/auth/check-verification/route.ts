import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

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

        // If user doesn't exist
        if (!user) {
            return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 200 });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return NextResponse.json({ error: 'EMAIL_NOT_VERIFIED' }, { status: 200 });
        }

        // Email is verified
        return NextResponse.json({ verified: true }, { status: 200 });
    } catch (error) {
        console.error('Error checking email verification:', error);
        return NextResponse.json(
            { error: 'An error occurred while checking email verification' },
            { status: 500 }
        );
    }
}