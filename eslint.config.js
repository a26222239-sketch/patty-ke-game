import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// ESLint 9 flat config。起步策略：寬鬆、不阻斷現有風格，
// 只抓「真正會出事」的問題（未用變數、hooks 依賴/規則）。
// 之後 P2 重構穩定後再逐步收緊規則。
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  localStorage: 'readonly',
  navigator: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  console: 'readonly',
  Infinity: 'readonly',
  requestAnimationFrame: 'readonly',
};

const nodeGlobals = {
  process: 'readonly',
  __dirname: 'readonly',
  module: 'writable',
  require: 'readonly',
};

export default [
  { ignores: ['dist/**', 'node_modules/**'] },

  // 來源碼（瀏覽器環境，含 JSX）
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: browserGlobals,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React 17+ 自動 JSX runtime：不需 import React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // 現有碼風格寬鬆化，避免一次噴太多
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/no-unescaped-entities': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // 繁中 UI 字串/JSX 內大量使用全形空格，屬刻意排版
      'no-irregular-whitespace': 'off',
      // 以下為 P2 重構才處理的 React 反模式，先降為提示、不阻斷 CI 閘門
      'react-hooks/static-components': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/display-name': 'off',
    },
  },

  // 設定檔（node 環境）
  {
    files: ['*.config.js', 'vitest.config.js', 'vite.config.js', 'postcss.config.js', 'tailwind.config.js'],
    languageOptions: { globals: { ...nodeGlobals, ...browserGlobals } },
  },

  // 測試檔（vitest 全域由 import 提供，這裡放寬）
  {
    files: ['tests/**/*.{js,jsx}', 'src/**/*.test.{js,jsx}'],
    languageOptions: { globals: { ...browserGlobals, ...nodeGlobals } },
  },
];
