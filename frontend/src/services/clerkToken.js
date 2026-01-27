// Clerk Token Helper - store reference to getToken function
// This is used by api.js to get Clerk tokens

let clerkGetToken = null;

export function setClerkTokenGetter(getTokenFn) {
  clerkGetToken = getTokenFn;
}

export async function getClerkToken() {
  if (!clerkGetToken) {
    console.warn('Clerk getToken not initialized');
    return null;
  }
  try {
    const token = await clerkGetToken();
    return token;
  } catch (err) {
    console.error('Error getting Clerk token:', err);
    return null;
  }
}
