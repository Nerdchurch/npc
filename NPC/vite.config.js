import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Production configuration for Ubuntu server deployment
export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production (enable for debugging if needed)
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-checkbox'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },

  // Server configuration (for production preview)
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true
  },

  // Preview configuration (matches production)
  preview: {
    port: 3000,
    host: '0.0.0.0'
  },

  // Path resolution
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },

  // Optimization for production
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@supabase/supabase-js',
      'framer-motion'
    ]
  }
});