import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 1. Загружаем переменные из .env файла (для локальной разработки)
    // process.cwd() гарантирует правильный путь в среде Vercel
    const env = loadEnv(mode, process.cwd(), '');

    // 2. Определяем приоритет: Системная переменная (Vercel) > .env файл
    // SDK @google/genai ожидает API_KEY
    const apiKey = process.env.API_KEY || env.API_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // 3. Пробрасываем переменную в клиентский код.
        // JSON.stringify обязателен, иначе переменная вставится как код, а не строка.
        'process.env.API_KEY': JSON.stringify(apiKey || '')
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      },
      build: {
        outDir: 'dist',
        // Увеличиваем лимит предупреждения до 1000kb
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            // 4. Оптимизация: разделяем библиотеки и основной код
            manualChunks: {
              vendor: ['react', 'react-dom'],
              genai: ['@google/genai'],
              markdown: ['react-markdown', 'remark-gfm'],
              ui: ['lucide-react']
            }
          }
        }
      }
    };
});