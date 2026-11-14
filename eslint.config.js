import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import localRules from './.eslint/plugins/local-rules.js';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'dev-dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      local: localRules,
      sonarjs
    },
    rules: {
      'local/no-hardcoded-ui-text': 'error',
      'sonarjs/cognitive-complexity': ['error', 15]
    }
  }
]);
