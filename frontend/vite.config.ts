/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Custom plugin to defer Vite's injected CSS so it doesn't block the HTML skeleton paint
const asyncCssPlugin = () => ({
  name: 'async-css',
  enforce: 'post' as const,
  transformIndexHtml(html: string) {
    return html.replace(
      /<link rel="stylesheet" crossorigin href="(.*?)">/g,
      `<link rel="preload" as="style" href="$1">\n    <link rel="stylesheet" crossorigin href="$1" media="print" onload="this.media='all'">`
    );
  }
});

export default defineConfig({
  plugins: [react(), asyncCssPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          'vendor-mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'vendor-mui-icons': ['@mui/icons-material'],
          'vendor-swiper': ['swiper', 'react-slick', 'slick-carousel'],
          'vendor-motion': ['framer-motion'],
          'vendor-utils': ['axios', 'dayjs', 'yup', 'formik']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  }
})