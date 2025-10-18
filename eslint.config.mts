import fs from 'node:fs';
import path from 'node:path';
import parserTypeScript from '@typescript-eslint/parser';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import type { Linter } from 'eslint';

// Read .prettierignore or fallback
const prettierIgnorePath = path.resolve('.prettierignore');
const ignorePatterns = fs.existsSync(prettierIgnorePath)
  ? fs
      .readFileSync(prettierIgnorePath, 'utf-8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
  : ['node_modules', 'dist', 'build'];

const config: Linter.FlatConfig[] = [
  {
    ignores: ignorePatterns,
  },
  // Client files (React + TS)
  {
    files: ['client/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        project: './client/tsconfig.json',
        tsconfigRootDir: path.resolve(),
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
      react: pluginReact,
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginTypeScript.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off', // disable this rule for React 17+
    },
    settings: {
      react: {
        version: 'detect', // this tells eslint-plugin-react to auto-detect your React version
      },
    },
  },
  // Server files (TS only, no JSX assumed)
  {
    files: ['server/**/*.{ts,js}'],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        project: './server/tsconfig.json', // point to server tsconfig
        tsconfigRootDir: path.resolve(),
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginTypeScript.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
    },
  },
];

export default config;
