import js from '@eslint/js';
import {defineConfig} from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

import enforceSingleObjectParam from './eslint-rules/enforceSingleObjectParam.js';

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
    plugins: {
      js,
      import: importPlugin,
      'local-rules': {
        rules: {
          'enforce-single-object-param': enforceSingleObjectParam,
        },
      },
    },

    extends: ['js/recommended'],
    rules: {
      'no-console': ['error', {allow: ['warn', 'error']}],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            {pattern: 'react', group: 'external', position: 'before'},
            {pattern: './**', group: 'internal'},
            {pattern: '../**', group: 'internal'},
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always-and-inside-groups',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

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

      // 'local-rules/enforce-single-object-param': ['error'],
    },
  },

  // Disable for middleware only
  {
    files: [
      '**/middleware.js',
      '**/middleware/**/*.js',
      '**/controllers.js',
      '**/controllers/**/*.js',
      '**/models/plugins/*.js',
    ],
    rules: {
      'local-rules/enforce-single-object-param': 'off',
    },
  },
]);
