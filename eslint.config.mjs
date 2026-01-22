import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      indent: ['error', 4],
      semi: ['error', 'always'],
      // Disable the overly strict set-state-in-effect rule - data fetching is a valid use case
      'react-hooks/set-state-in-effect': 'off',
      // Disable the rule that forbids the explicit use of "any"
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
