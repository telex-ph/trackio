import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import flowbiteReact from 'flowbite-react/plugin/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  preview: {
    host: '0.0.0.0', // allows network access
    port: parseInt(process.env.PORT) || 4173, // use Render's $PORT
    allowedHosts: 'all' // allow all hosts to prevent "Blocked request" errors
  },
  build: {
    outDir: 'dist', // production-ready files go here
    base: '/' // base path
  }
});
