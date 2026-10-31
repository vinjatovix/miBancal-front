/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig as defineVitestConfig } from 'vitest/config';

import { API_PUBLIC_PLANTS_PATTERN } from './src/shared/sw/urlPatterns.ts';

export default defineVitestConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode !== 'production' || env.VITE_SHOW_DEV_BANNER === 'true';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        devOptions: {
          enabled: process.env.SW_DEV === 'true',
          type: 'module'
        },
        workbox: {
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: API_PUBLIC_PLANTS_PATTERN,
              method: 'GET',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-public-plants',
                networkTimeoutSeconds: 3,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        manifest: {
          name: isDev ? 'MiBancal (Dev)' : 'MiBancal',
          short_name: isDev ? 'MiBancal [Dev]' : 'MiBancal',
          description: 'Catálogo de plantas y gestión de bancales',
          start_url: '/',
          display: 'standalone',
          background_color: '#f3fbf6',
          theme_color: '#002718',
          lang: 'es',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icons/icon-maskable.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable'
            },
            {
              src: '/icons/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any'
            }
          ]
        }
      })
    ],

    build: {
      manifest: true
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      env: {
        VITE_API_URL: 'http://localhost:3000'
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        reportsDirectory: './coverage',
        include: ['src/**'],
        exclude: ['src/main.tsx', 'src/**/*.d.ts'],
        thresholds: {
          perFile: false,
          lines: 85,
          statements: 85,
          functions: 85,
          branches: 80,
          'src/services/**': { lines: 95 },
          'src/shared/api/**': { lines: 95 },
          'src/shared/utils/**': { lines: 95 },
          'src/shared/errors/**': { lines: 95 },
          'src/i18n/**': { lines: 95 }
        }
      }
    }
  };
});
