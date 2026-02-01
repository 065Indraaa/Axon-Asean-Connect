import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Sangat penting untuk library kriptografi Web3
      include: ['buffer', 'crypto', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    // Menggunakan globalThis lebih aman untuk browser modern
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimasi pemisahan file (Chunking)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Memisahkan library besar dari node_modules agar tidak jadi satu file raksasa
          if (id.includes('node_modules')) {
            // Memisahkan vendor dasar (React, dll)
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Memisahkan Coinbase SDK atau library kripto karena biasanya besar
            if (id.includes('@coinbase') || id.includes('ethers') || id.includes('viem')) {
              return 'vendor-web3';
            }
            return 'vendor'; // Library lainnya
          }
        },
      },
    },
    // Menaikkan limit warning menjadi 1000kB agar lebih bersih saat build
    chunkSizeWarningLimit: 1000,
  },
  // Tambahan: Mengatasi masalah resolusi jika ada library yang menggunakan format lama
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
    },
  },
});