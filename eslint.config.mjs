import {defineConfig} from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default defineConfig([
  {files: ['**/*.{js,mjs,cjs}']},
  {files: ['**/*.js'], languageOptions: {sourceType: 'commonjs'}},
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ['**/*.test.js'],
    plugins: {js, import: importPlugin},
    extends: ['js/recommended'],
    rules: {
      // Add new line above comment
      'lines-around-comment': [
        'error',
        {
          beforeLineComment: true,
          beforeBlockComment: true,
          allowBlockStart: true,
          allowClassStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],

      // Add new line above return
      'newline-before-return': 'error',

      // Add new line below import
      'import/newline-after-import': [
        'error',
        {
          count: 1,
        },
      ],

      // Add new line after each var, const, let declaration
      'padding-line-between-statements': [
        'error',
        {blankLine: 'always', prev: ['export'], next: ['*']},
        {
          blankLine: 'always',
          prev: ['*'],
          next: ['multiline-const', 'multiline-let', 'multiline-var', 'export'],
        },
      ],
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: false,
          reportUsedIgnorePattern: false,
        },
      ],
    },
  },
]);
