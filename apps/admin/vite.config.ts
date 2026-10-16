import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // `base: './'` permite servir el panel desde cualquier ruta (vista previa estática).
  base: process.env.VITE_BASE ?? '/',
  server: { port: 5173 },
});
