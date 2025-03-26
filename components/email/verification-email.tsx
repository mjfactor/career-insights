import * as React from 'react';

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({
  name,
  verificationUrl,
}) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  }}>
    <h1 style={{ color: '#333', textAlign: 'center' }}>Welcome to Employment Opportunities!</h1>
    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#555' }}>Hello {name},</p>
    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#555' }}>
      Thank you for registering. Please click the button below to verify your email address:
    </p>
    <div style={{ textAlign: 'center', margin: '30px 0' }}>
      <a 
        href={verificationUrl}
        style={{
          backgroundColor: '#22c55e',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'inline-block'
        }}
      >
        Verify my email
      </a>
    </div>
    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#555' }}>
      This link will expire in 24 hours.
    </p>
    <p style={{ fontSize: '14px', color: '#777', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      If you didn't create this account, you can safely ignore this email.
    </p>
  </div>
);