import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Загружаем переменные из .env файла (для локальной разработки)
  const env = loadEnv(mode, process.cwd(), '');
  
  // 2. Гибридная стратегия загрузки переменных (Hybrid Injection)
  // Приоритет: Vercel System Vars > Local .env
  const apiKey = process.env.API_KEY || env.API_KEY;

  // 3. Логирование для отладки сборки (Server-Side)
  console.log(`[Vite] Build Mode: ${mode}`);
  if (!apiKey) {
    console.warn(`[Vite] ⚠️  WARNING: API_KEY is undefined. The app may fail at runtime.`);
  } else {
    console.log(`[Vite] ✅ API_KEY injected successfully.`);
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd()), // Maps @ to project root
      },
    },
    define: {
      // 4. Пробрасываем переменную в клиентский код
      'process.env.API_KEY': JSON.stringify(apiKey || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'dist',
      // Увеличиваем лимит предупреждения до 1000kb (GenAI SDK достаточно тяжелый)
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // 5. Оптимизация: разделяем вендоров и код приложения
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