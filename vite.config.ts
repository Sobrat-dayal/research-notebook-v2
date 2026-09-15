import react from '@vitejs/plugin-react';
import {sites} from '@openai/sites-vite-plugin';
import {defineConfig} from 'vite';
export default defineConfig({
  plugins: [react(), sites()],
  build: {outDir: 'dist/client'},
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (outgoing, incoming) => {
            // Translate only the trusted local UI origin to the worker origin.
            // Other origins remain intact so the worker rejects cross-site writes.
            if (incoming.headers.origin === 'http://127.0.0.1:5173') {
              outgoing.setHeader('Origin', 'http://127.0.0.1:8787');
            }
          });
        },
      },
    },
  },
});
