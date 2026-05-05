import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api/users':    { target: 'http://localhost:8001', changeOrigin: true, rewrite: p => p.replace(/^\/api\/users/, '') },
      '/api/rooms':    { target: 'http://localhost:8002', changeOrigin: true, rewrite: p => p.replace(/^\/api\/rooms/, '') },
      '/api/expenses': { target: 'http://localhost:8003', changeOrigin: true, rewrite: p => p.replace(/^\/api\/expenses/, '') },
      '/api/payments': { target: 'http://localhost:8004', changeOrigin: true, rewrite: p => p.replace(/^\/api\/payments/, '') },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom'],
          state:   ['zustand'],
          network: ['axios'],
        },
      },
    },
  },
});