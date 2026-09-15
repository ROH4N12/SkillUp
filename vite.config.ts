import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react({
      babel: {
        parserOpts: {
          plugins: [
            ['typescript', { isTSX: true }]
          ]
        }
      }
    }),
    tailwindcss(),
  ],
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.jsx': 'tsx'
      }
    }
  },
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/app/components'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // ─── Build Optimization ────────────────────────────────────────────
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',
    // Recharts alone is ~580kB minified — suppress warning for vendor chunks
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split large vendor libraries into separate cacheable chunks
        manualChunks: {
          // React core — shared by every page, cached forever
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // Recharts — only needed by dashboard/progress pages
          'vendor-charts': ['recharts'],
          // Google OAuth — only needed on login page
          'vendor-auth': ['@react-oauth/google'],
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
