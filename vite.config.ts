import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  // Deploy base path. '/' for local + root hosts; set VITE_BASE=/sfa-insurance/ for
  // the GitHub Pages project subpath (see .github/workflows/deploy.yml).
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 2588,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors so marketing pages don't ship Stripe/Supabase up front.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          supabase: ['@supabase/supabase-js'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
});

