import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest 設定：用 react plugin 轉換 game.jsx 的 JSX；測純函數用 node 環境即可
// （game.jsx 頂層的 localStorage 遷移已用 try/catch 包住，node 環境下安全略過）
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}', 'tests/**/*.test.{js,jsx}'],
  },
});
