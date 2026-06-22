// 全域樣式 — BR / BB / LOG_COLORS / S（從 game.jsx SECTION 1 抽出）

// 1.1 房間按鈕樣式 BR — 地下酒館風格（深紅 / 暗金）
export const BR = {
  primary: 'py-2.5 rounded-lg font-bold text-sm transition-all font-serif',
  primaryStyle: {background:'#2b1605',border:'1px solid #9c7028',borderBottom:'2px solid #bc8a32',color:'#f0d078',textShadow:'0 0 10px rgba(240,200,80,0.3)'},
  rose:    'py-2.5 rounded-lg font-bold text-sm transition-all font-serif',
  roseStyle: {background:'#2c0808',border:'1px solid #802020',borderBottom:'2px solid #a83030',color:'#f08888',textShadow:'0 0 8px rgba(240,80,80,0.25)'},
  ghost:   'py-2.5 rounded-lg font-bold text-sm transition-all font-serif',
  ghostStyle: {background:'#170f04',border:'1px solid #3e2812',borderBottom:'2px solid #4e3420',color:'#8a6c38'},
  pref:    'py-2.5 rounded-lg font-bold text-sm transition-all font-serif',
  prefStyle: {background:'#2c0808',border:'1px solid #a87028',borderBottom:'2px solid #c88838',color:'#f0c850'},
  dis:     'py-2.5 rounded-lg font-bold text-sm cursor-not-allowed font-serif',
  disStyle: {background:'#120c04',border:'1px solid #2a1a08',borderBottom:'2px solid #2a1a08',color:'#3a2c14'},
};

// 1.2 浴室按鈕樣式 BB — 水感明快風格（深藍 / 青綠）
export const BB = {
  primary: 'py-2.5 rounded-lg font-bold text-sm transition-all font-serif',
  primaryStyle: {background:'#031e2e',border:'1px solid #1a7c96',borderBottom:'2px solid #26a8c4',color:'#88e4f4',textShadow:'0 0 10px rgba(100,220,240,0.25)'},
  rose:    'py-2.5 rounded-lg font-bold text-sm transition-all font-serif',
  roseStyle: {background:'#20080e',border:'1px solid #702040',borderBottom:'2px solid #902c52',color:'#e888ac'},
  ghost:   'py-2.5 rounded-lg font-bold text-sm transition-all font-serif',
  ghostStyle: {background:'#021218',border:'1px solid #0e3c4c',borderBottom:'2px solid #144e62',color:'#5898ac'},
  dis:     'py-2.5 rounded-lg font-bold text-sm cursor-not-allowed font-serif',
  disStyle: {background:'#021018',border:'1px solid #0c2c38',borderBottom:'2px solid #0c2c38',color:'#244450'},
};

// 1.3 log 文字顏色 LOG_COLORS
export const LOG_COLORS = {
  sep:     'text-slate-700',
  title:   'text-indigo-400 font-bold text-center',
  death:   'text-red-400 font-semibold',
  sex:     'text-pink-300 leading-relaxed',
  story:   'text-rose-300',
  undress: 'text-rose-400',
  chat:    'text-blue-300',
  hint:    'text-yellow-300',
  good:    'text-green-400',
  hit:     'text-orange-300',
  bad:     'text-red-300',
  note:    'text-slate-500 text-xs pl-4',
  gold:    'text-yellow-300',
  shield:  'text-cyan-300 font-semibold',
  default: 'text-slate-300',
};

// 1.4 共用 UI 樣式 S
export const S = {
  card:      'bg-slate-800/60 rounded-lg p-3 border border-slate-700/40',
  cardTitle: 'text-slate-400 text-xs mb-2 font-bold',
  btnFull:   'w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold transition-colors text-sm',
  btnGrid2:  'grid grid-cols-2 gap-2',
  btnGrid3:  'grid grid-cols-3 gap-1.5',
  textXsGray:  'text-slate-500 text-xs',
  textXsDark:  'text-slate-600 text-xs',
  textXsMid:   'text-slate-400 text-xs',
  textSmWhite: 'text-slate-200 text-sm',
  textSmItalic:'text-slate-600 text-sm italic',
  textRoseBold:'text-rose-300 font-semibold',
  row:    'flex justify-between items-center',
  rowMb1: 'flex justify-between items-center mb-1',
  rowMb2: 'flex justify-between items-center mb-2',
  rowXs:  'flex justify-between text-xs text-slate-500',
  hpBar:  'bg-rose-500 h-2 rounded-full transition-all',
};
