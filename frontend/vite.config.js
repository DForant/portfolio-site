import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { existsSync, cpSync, mkdirSync } from 'fs';

// Copy assets to public directory for Vite to serve
const publicDir = resolve(__dirname, 'public');
const assetsDir = resolve(__dirname, 'assets');

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Copy assets to public/assets if not already there
const publicAssetsDir = resolve(publicDir, 'assets');
if (!existsSync(publicAssetsDir) && existsSync(assetsDir)) {
  cpSync(assetsDir, publicAssetsDir, { recursive: true });
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'assets'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to Netlify dev server or backend during development
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Allow importing SCSS variables
        api: 'modern-compiler',
      },
    },
  },
});
