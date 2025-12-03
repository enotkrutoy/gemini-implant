import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Load variables from .env file (for local development)
  // process.cwd() ensures the correct path in the Vercel environment
  const env = loadEnv(mode, process.cwd(), '');

  // 2. Define Priority: System Variable (Vercel) > .env file
  // Vercel injects variables into process.env during the build
  // VERCEL_ENV is automatically set by Vercel (production, preview, development)
  const apiKey = process.env.API_KEY || env.API_KEY;
  const vercelEnv = process.env.VERCEL_ENV || 'development';

  // Logging for build debugging (visible in Vercel build logs)
  if (!apiKey) {
    console.warn(`[Vite Build] ⚠️ API_KEY is missing! Environment: ${vercelEnv}`);
  } else {
    console.log(`[Vite Build] ✅ API_KEY loaded successfully. Environment: ${vercelEnv}`);
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    define: {
      // 3. Inject variable into client code.
      // JSON.stringify is mandatory, otherwise it's inserted as code, not string.
      'process.env.API_KEY': JSON.stringify(apiKey || ''),
      'process.env.VERCEL_ENV': JSON.stringify(vercelEnv),
    },
    build: {
      outDir: 'dist',
      // Increase warning limit to 1000kb to reduce noise
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // 4. Optimization: Split dependencies into chunks for faster loading
          manualChunks: {
            vendor: ['react', 'react-dom'],
            genai: ['@google/genai'],
            markdown: ['react-markdown', 'remark-gfm'],
            ui: ['lucide-react']
          },
        },
      },
    },
  };
});