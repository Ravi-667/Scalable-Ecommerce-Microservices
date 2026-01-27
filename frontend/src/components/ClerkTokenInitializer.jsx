import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setClerkTokenGetter } from '../services/clerkToken';

// Component to initialize Clerk token getter
export default function ClerkTokenInitializer({ children }) {
  const { getToken } = useAuth();
  
  useEffect(() => {
    // Initialize the token getter for api.js
    if (getToken) {
      setClerkTokenGetter(getToken);
    }
  }, [getToken]);
  
  return <>{children}</>;
}
