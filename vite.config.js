import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base 必須是 GitHub Pages 的 repo 子路徑：https://<user>.github.io/patty-ke-game/
export default defineConfig({
  base: '/patty-ke-game/',
  plugins: [react()],
});
