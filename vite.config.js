
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
import path from 'path';
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'code-wizard-prompts-factory-production.up.railway.app'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
