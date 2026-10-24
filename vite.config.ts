/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig as defineVitestConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineVitestConfig({
  plugins: [react()],

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
});
