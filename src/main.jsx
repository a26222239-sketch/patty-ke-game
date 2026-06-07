import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import TowerGame from '../game.jsx';

// 不包 StrictMode：此遊戲大量使用 ref/effect，避免 dev 下重複觸發造成狀態異常
createRoot(document.getElementById('root')).render(<TowerGame />);
