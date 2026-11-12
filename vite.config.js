import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-spa-fallback',
      closeBundle() {
        try {
          const baseDir = import.meta.dirname || process.cwd();
          const reactHtml = path.resolve(baseDir, 'dist/index-react.html');
          const indexHtml = path.resolve(baseDir, 'dist/index.html');
          if (fs.existsSync(reactHtml)) {
            fs.copyFileSync(reactHtml, indexHtml);
          }
        } catch (e) {
          console.warn('Could not copy index-react.html to index.html:', e);
        }
      }
    }
  ],
  server: {
    port: 3000,
    open: '/index-react.html'
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: './index-react.html'
    }
  }
});
