import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 'var(--spacing-lg)'
    }}>
      <div style={{
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <SignUp 
          routing="path" 
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/home"
          appearance={{
            elements: {
              rootBox: {
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderRadius: '16px'
              },
              card: {
                borderRadius: '16px'
              }
            }
          }}
        />
      </div>
    </div>
  );
}
