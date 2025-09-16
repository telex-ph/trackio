import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import flowbiteReact from 'flowbite-react/plugin/vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  preview: {
    host: '0.0.0.0', // already there
    port: parseInt(process.env.PORT) || 4173,
    allowedHosts: ['trackio-1.onrender.com'],
  },
});
