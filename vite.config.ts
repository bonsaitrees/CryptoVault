import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/',
  root: process.cwd(),
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        market: path.resolve(__dirname, 'page/market.html')
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api/contact': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'js')
    }
  }
}); 