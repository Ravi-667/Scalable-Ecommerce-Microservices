import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
  // Note: VITE_CLERK_PUBLISHABLE_KEY should be set in .env.local file
  // Do not hardcode API keys in config files
});
