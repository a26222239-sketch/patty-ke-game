// 地點立繪登記表 ─────────────────────────────────────────────────────
// 用途：每個地點一張「場景立繪」，玩家點該地點按鈕時顯示，增加沈浸感。
//
// 規格（固定）：
//   • 比例 9:16 直幅（與角色立繪一致，未來可在場景上疊角色）
//   • 像素 1080 × 1920 px（PNG，不需去背；可滿版出血）
//   • 風格：半寫實 anime / manhwa，對齊角色立繪 keyu_*.png 的質感
//   • 世界觀：現代亞洲都會、紅燈區底色（詳見 docs/ART_BIBLE.md）
//
// 新立繪畫好後：
//   1) 把檔案放到專案根目錄，命名 loc_<id>.png（例：loc_brothel.png）
//   2) 在下方 import 取消註解，並把對應 id 從 null 改成 import 進來的變數
//
// 尚未繪製的地點 → 維持 null，UI 會顯示「立繪製作中」佔位卡。

// import brothelArt  from '../loc_brothel.png';
// import shopArt     from '../loc_shop.png';
// import tattooArt   from '../loc_tattoo.png';
// import policeArt   from '../loc_police.png';
// import hospitalArt from '../loc_hospital.png';
// import toiletArt   from '../loc_toilet.png';
// import fieldArt    from '../loc_field.png';
// import homeArt     from '../loc_home.png';

export const LOCATION_ART = {
  brothel:  null,
  shop:     null,
  tattoo:   null,
  police:   null,
  hospital: null,
  toilet:   null,
  field:    null,
  home:     null,
};
