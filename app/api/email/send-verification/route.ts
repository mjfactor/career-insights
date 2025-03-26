import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { VerificationEmail } from '@/components/email/verification-email';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

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

    const emailContent = await VerificationEmail({ name, verificationUrl });
    const { data, error } = await resend.emails.send({
      from: 'Employment Opportunities <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email address',
      react: emailContent,
    });

    if (error) {
      console.error('Email sending error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}