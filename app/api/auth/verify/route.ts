import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/actions/register';

// Handle GET requests to /api/auth/verify
export async function GET(request: NextRequest) {
  // Get token and email from URL params
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Validate parameters
  if (!token || !email) {
    return NextResponse.redirect(new URL('/?error=missing_verification_params', request.url));
  }

  // Verify the email
  const result = await verifyEmail(token, email);

  if (result.success) {
    // Redirect to login page with success message
    return NextResponse.redirect(new URL('/?success=email_verified', request.url));
  } else {
    // Redirect to error page or home with error
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(result.error || 'verification_failed')}`, request.url));
  }
}