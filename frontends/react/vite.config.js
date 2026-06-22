import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const djangoApi = process.env.DJANGO_API_PROXY_TARGET || 'http://127.0.0.1:8001';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': djangoApi
    }
  }
});
