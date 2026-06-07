/** @type {import('tailwindcss').Config} */
// 所有 class 都是 game.jsx / index.html / src 裡的字面字串（已驗證無變數拼接），掃描即可全數涵蓋
export default {
  content: ['./index.html', './game.jsx', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};
