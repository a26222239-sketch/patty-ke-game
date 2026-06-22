// 全域常數 — 時間 / 存檔版本 / 體毛 / 商品價格（從 game.jsx SECTION 2 抽出）

// 2.1 存檔版本號 — 每次 INITIAL_PLAYER 結構有破壞性變動時遞增
export const SAVE_VERSION = 1;

// 2.2 體毛系統常數
export const HAIR_LEVELS      = ['光滑無毛', '稀疏', '濃密', '雜草叢生'];
export const HAIR_LEVEL_KEYS  = ['smooth',   'sparse', 'thick', 'wild'];
export const HAIR_PARTS       = ['armpit', 'pubic', 'anal'];
export const HAIR_PART_NAMES  = { armpit: '腋毛', pubic: '陰毛', anal: '肛毛' };
export const HAIR_GROW_DAYS   = 5; // 成長速度：每 N 天升 1 級

// 2.6 商品價格 — 保險套、穿環、刺青、修毛
export const CONDOM_PRICE = 50;
export const PIERCING_PRICES = { ear:300, navel:800, areola:1500, labia:3000 };
export const TATTOO_SIZES = {
  S:{ name:'小型', charm:8,  price:1000, rank:1, patterns:['愛心','唇印','正字','黑桃'] },
  M:{ name:'中型', charm:20, price:2500, rank:2, patterns:['淫紋','條碼','魅魔紋','蝴蝶結'] },
  L:{ name:'大型', charm:50, price:6000, rank:3, patterns:['大面積淫紋','母豬烙印','觸手圖騰','家畜印記'] }
};
export const HAIR_TRIM_PRICE = 100; // 修剪體毛單次價格
