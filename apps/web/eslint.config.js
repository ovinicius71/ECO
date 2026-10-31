import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Regras de dependência de docs/arquitetura.md.
const noPages = {
  group: ['@/pages', '@/pages/*', '**/pages/*'],
  message: 'features/ e components/ não importam de pages/ (docs/arquitetura.md).',
}
const noFeatures = {
  group: ['@/features', '@/features/*', '**/features/*'],
  message: 'components/ não conhece domínio: não importe de features/ (docs/arquitetura.md).',
}

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [noPages] }] },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [noPages, noFeatures] }] },
  },
  prettier,
])
