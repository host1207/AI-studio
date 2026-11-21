import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  process.env.NODE_ENV = 'production';
  return {
    mode: 'production',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  build: {
    outDir: path.resolve(__dirname, 'Angles-ultimate/public'),
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/tracker-mount.tsx'),
      output: {
        format: 'iife',
        entryFileNames: 'tracker-suite.js',
        chunkFileNames: 'tracker-suite-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'tracker-suite.css';
          }
          return 'tracker-suite-[name][extname]';
        },
      },
    },
  },
  };
});
