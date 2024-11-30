import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/news2oon/',
  server: {
    proxy: {
      '/auth': {
        target: 'https://xydaiteprfqekjgxbjwf.supabase.co',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});