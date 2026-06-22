// 立繪系統 — pickPortrait + PORTRAIT_RULES + 立繪資產（從 game.jsx 抽出）
import keyuT1 from '../keyu_t1.png';   // 立繪・全套第1級（初始造型；白底已去背）
import keyuT2 from '../keyu_t2.png';   // 立繪・全套第2級（深V吊帶衫/黑深V內衣/超短皮裙/白蕾絲短襪/黑包頭高跟）
import keyuT3 from '../keyu_t3.png';   // 立繪・全套第3級（交叉綁帶低胸背心/深V半罩杯薄紗內衣/低腰熱褲/黑絲質膝上襪/白細跟高跟）
import keyuT4 from '../keyu_t4.png';   // 立繪・全套第4級（純白蕾絲主題：透背薄衫/半罩內衣/高衩裙/吊帶蕾絲襪/白緞蝴蝶結高跟）
import keyuT5 from '../keyu_t5.png';   // 立繪・全套第5級（黑皮綁帶馬甲+豹紋深V內衣/黑皮短裙/黑魚網大腿襪/黑漆皮高跟）
import keyuT6 from '../keyu_t6.png';   // 立繪・全套第6級（護士主題：白開襟護士洋裝+紅蕾絲內衣/紅蕾絲吊帶大腿襪/紅漆皮高跟）
import keyuT7 from '../keyu_t7.png';   // 立繪・全套第7級（空姐主題：藏青雙排扣西裝外套+香檳內衣/藏青高衩窄裙/膚色絲襪/藏青尖頭高跟）
import keyuT8 from '../keyu_t8.png';   // 立繪・全套第8級（OL透視主題：白透視雪紡襯衫+黑蕾絲內衣/黑包臀窄裙/黑蕾絲頂大腿襪/黑繫踝尖頭高跟）
import keyuT9 from '../keyu_t9.png';   // 立繪・全套第9級（旗袍主題：黑金刺繡旗袍+黑絲綢肚兜/黑透膚大腿襪/黑尖頭高跟）
import keyuT10 from '../keyu_t10.png'; // 立繪・全套第10級（晚禮服主題：祖母綠深V裸背長禮服+雙高衩/裸腿/銀色綁帶高跟）
import keyuT11 from '../keyu_t11.png'; // 立繪・全套第11級（睡裙主題：酒紅絲緞吊帶睡裙+酒紅蕾絲內衣/酒紅吊帶大腿襪/酒紅高跟）
import keyuT12 from '../keyu_t12.png'; // 立繪・全套第12級（黑紗透視主題：交叉綁帶透視短上衣+黑蕾絲內衣/黑紗傘狀短裙/黑蕾絲吊帶大腿襪/黑繞踝魚口涼鞋）
import keyuT13 from '../keyu_t13.png'; // 立繪・全套第13級（哥德主題：哥德蕾絲馬甲上衣+骷髏腰帶/不對稱蕾絲裙/黑蕾絲吊帶大腿襪/黑色厚底繫帶踝靴）
import keyuT14 from '../keyu_t14.png'; // 立繪・全套第14級（比基尼主題：紅色微型三角比基尼/赤足）
import keyuFallback from '../keyu_fallback.png'; // 通用預設立繪：當穿著不成套（未完全符合任何一套）時顯示

// ── 紙娃娃（立繪）系統：以「視覺可確定的穿著」定義每張立繪 ──────────────
// 每條規則：
//   need  = 視覺上「確定有穿」的部位 → 必須穿著對應單品(slot:id)
//   empty = 視覺上「確定沒穿」的部位 → 該部位必須為空
//   看不出的部位（被遮住、膚色襪等）不列入，視為「不限」(don't care)
// 依序比對，need 與 empty 全部滿足的第一條即採用；皆不符 → keyuFallback（牛仔褲預設）。
// 各規則的 need/empty 由逐張立繪的視覺判定而來（被遮住的內褲、看不出的胸罩/膚色襪皆排除）。
const PORTRAIT_RULES = [
  // 比基尼：只看得到內衣+內褲，且上衣/下著/襪子/鞋子確定皆空
  { img: keyuT14, need: { bra: 'b14', panties: 'p14' }, empty: ['top', 'bottom', 'socks', 'shoes'] },
  // 哥德：6 件全可見
  { img: keyuT13, need: { top: 't13', bra: 'b13', bottom: 'bt13', panties: 'p13', socks: 'sk13', shoes: 'sh13' } },
  // 黑紗透視：6 件全可見（內褲透視可見）
  { img: keyuT12, need: { top: 't12', bra: 'b12', bottom: 'bt12', panties: 'p12', socks: 'sk12', shoes: 'sh12' } },
  // 睡裙：胸口酒紅蕾絲半罩(b11)可見；睡裙透視，內褲(p11)可見；6 件可見
  { img: keyuT11, need: { top: 't11', bra: 'b11', bottom: 'bt11', panties: 'p11', socks: 'sk11', shoes: 'sh11' } },
  // 晚禮服：上衣/下著/內褲(側邊細帶)/鞋可見；確定沒戴胸罩(裸胸深V)、沒穿襪(裸腿)
  { img: keyuT10, need: { top: 't10', bottom: 'bt10', panties: 'p10', shoes: 'sh10' }, empty: ['bra', 'socks'] },
  // 旗袍：確定沒戴胸罩(keyhole 裸膚)；內褲(p9)可見；其餘可見
  { img: keyuT9, need: { top: 't9', bottom: 'bt9', panties: 'p9', socks: 'sk9', shoes: 'sh9' }, empty: ['bra'] },
  // OL透視：胸罩透出可見；內褲被遮 → 不檢
  { img: keyuT8, need: { top: 't8', bra: 'b8', bottom: 'bt8', socks: 'sk8', shoes: 'sh8' } },
  // 空姐：裙衩處可見膚色絲襪襪頂(sk7)；內褲被遮 → 不檢
  { img: keyuT7, need: { top: 't7', bra: 'b7', bottom: 'bt7', socks: 'sk7', shoes: 'sh7' } },
  // 護士：內褲被遮 → 不檢
  { img: keyuT6, need: { top: 't6', bra: 'b6', bottom: 'bt6', socks: 'sk6', shoes: 'sh6' } },
  // 黑馬甲豹紋：豹紋內褲(p5)明顯可見；6 件可見
  { img: keyuT5, need: { top: 't5', bra: 'b5', bottom: 'bt5', panties: 'p5', socks: 'sk5', shoes: 'sh5' } },
  // 純白蕾絲：裙子透視，內褲(p4)可見；6 件可見
  { img: keyuT4, need: { top: 't4', bra: 'b4', bottom: 'bt4', panties: 'p4', socks: 'sk4', shoes: 'sh4' } },
  // 交叉綁帶背心：深V處薄紗半罩可見(b3)；內褲被遮 → 不檢
  { img: keyuT3, need: { top: 't3', bra: 'b3', bottom: 'bt3', socks: 'sk3', shoes: 'sh3' } },
  // 深V吊帶+皮裙：胸罩深V露出可見；內褲被遮 → 不檢
  { img: keyuT2, need: { top: 't2', bra: 'b2', bottom: 'bt2', socks: 'sk2', shoes: 'sh2' } },
  // 黑洋裝：胸罩 b1 有穿（領口蕾絲半罩）；內褲被遮 → 不檢
  { img: keyuT1, need: { top: 't1', bra: 'b1', bottom: 'bt1', socks: 'sk1', shoes: 'sh1' } },
  // T0 牛仔休閒（預設起始裝）：T恤+牛仔褲+運動鞋可見；內衣/內褲/襪看不到 → 不檢。立繪沿用 casual 圖
  { img: keyuFallback, need: { top: 't0', bottom: 'bt0', shoes: 'sh0' } },
];
export const pickPortrait = (clothes) => {
  const c = clothes || {};
  const idOf = (it) => (it && it.id) || null;
  for (const r of PORTRAIT_RULES) {
    const needOk = Object.entries(r.need).every(([slot, id]) => idOf(c[slot]) === id);
    const emptyOk = (r.empty || []).every(slot => !c[slot]);
    if (needOk && emptyOk) return r.img;
  }
  return keyuFallback; // 不成套 → 通用預設立繪
};
