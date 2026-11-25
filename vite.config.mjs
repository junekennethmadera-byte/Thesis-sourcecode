import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'frontend/react-department-tabs.jsx',
      formats: ['iife'],
      name: 'EDataDepartmentTabs',
      fileName: () => 'department-tabs.js'
    },
    outDir: 'frontend/assets/react',
    emptyOutDir: true,
    minify: false
  }
});
