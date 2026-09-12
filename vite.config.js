import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 9000,
    strictPort: true,
    open: false
  },
  preview: {
    port: 9000
  }
});
