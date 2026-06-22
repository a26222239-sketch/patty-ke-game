// ╔════════════════════════════════════════════════════════════════════╗
// ║              柯妤潔的娼館 — 永續開發規則文件 (v1.5)                        ║
// ║  新增功能必須遵循此規則，違反會在驗證時被掃出來                      ║
// ╚════════════════════════════════════════════════════════════════════╝
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 A：所有修改持久 state 的函數必須有重入保護                      │
// └────────────────────────────────────────────────────────────────────┘
// 1. 函數開頭三行（在既有 if (!enemy) 等檢查之後）：
//      if (leavingRef.current) return;
//      if (actionRef.current) return;
//      actionRef.current = true;
// 2. 結尾與每個 return 路徑前必須：actionRef.current = false;
// 3. 離場函數例外：用 leavingRef 自己的保護機制
//    （resolveEnemyLeave / resolveSexDefeat / doSendOff）
//
// 目前涵蓋的 21 個函數：
//   doChat, doSeduce, doForeplay, doBathInvite, doBathService, doBath,
//   doStartSex, doAskCondom, doSex, doBuyItem, doBuyCondom, doTattoo,
//   doBuyPiercing, doRest, doOpenShop, doExplore, doEquip, doUnequip,
//   doSave, doLoad, doDeleteSave
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 B：文本池規則                                                  │
// └────────────────────────────────────────────────────────────────────┘
// • 每個文本池至少 3 條（避免 pick([]) 回 undefined）
// • 高頻文本（做愛）至少 5 條；勾引至少 6 條
// • 獨立分支池（懷孕/月經/死魚等）至少 4 條（覆蓋情境變化）
// • 風格：直白不暗喻，性器官直接說出（小穴、肉棒、乳頭、肛門等）
// • 柯妤潔核心人設：固定為娼婦，存在目的就是滿足客人
//   - 不論任何狀態（疲憊/被滿足/被虐），最終仍以這個身分行事
//   - 不會出現「拒絕」「反抗」「勸退」這類跳脫人設的台詞
//   - 台詞以卑賤蕩婦的主觀視角書寫（例：「我就是這種賤女人」）
// • 收尾要有破碎、未完、餘韻感（避免一板一眼用句點作結）
//   - 收尾符號可變化（— / ⋯⋯ / 句點 / 直接斷句），依情境節奏選擇
//   - 同池內條目應避免全部用同一種收尾，保持節奏多樣
// • 動作描述優於口頭強調（避免「我已經習慣」這類重複）
// • placeholder 統一在 formatText 處理（見 SECTION 8.3 函數實作）
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 C：state 更新規則                                              │
// └────────────────────────────────────────────────────────────────────┘
// • setPlayer(p => ...) / setEnemy(e => ...) 永遠用 functional update
// • callback 內用 p / e，不用 player / enemy（避免 stale state）
// • callback 內不能有副作用（禁止 setTimeout、setShop 等）
// • hp 更新必須用 Math.max(0, ...) 防負數
// • arousal 累加必須用 Math.min(200, ...) 防超上限
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 D：log 訊息規則                                                │
// └────────────────────────────────────────────────────────────────────┘
// • 玩家動作開頭呼叫 addSep() 隔開上一輪
// • 文本用 addLog(text, tag) 或批次 addLogs([[text,tag],...])
// • 不在 UI 上輸出技術備註（如「已收過費」）
// • tag：'story' 動作敘事 / 'hint' 提示 / 'good' 正面 / 'bad' 負面
//        / 'sex' 做愛 / 'chat' 對話 / 'gold' 金錢 / 'undress' 脫衣
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 E：保險套狀態機規則                                            │
// └────────────────────────────────────────────────────────────────────┘
// • enemy.condomMode: null | 'with' | 'without'
// • 戴套接受 → condomMode='with'；射精後 condomEquipped=false 但
//   condomMode 重設為 null（重新詢問）
// • 拒絕戴套或玩家不戴 → condomMode='without'，從此不再詢問
// • 浴室一律無套 → condomMode='without'
// • 客人離場 → genEnemy 重設為 null
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 F：射精扣血規則                                                │
// └────────────────────────────────────────────────────────────────────┘
// • 客人射精時 enemy.hp 額外扣 vol*2（與服務 enemyDmg 獨立計算）
// • 服務本身的 player.hp 消耗（playerDmg）跟客人射精無關
// • 吞精恢復 player.hp = vol（doForeplay swallow / doSex 戴套後喝套）
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 G：性奮度與解鎖規則                                            │
// └────────────────────────────────────────────────────────────────────┘
// • UI 顯示用 effArousal（含魅力加成）
// • 解鎖判斷用 maxEffArousal（歷史最高，含魅力加成）
// • 前戲解鎖閾值 80，做愛解鎖閾值 120，性奮度上限 200
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 H：時間系統規則                                                │
// └────────────────────────────────────────────────────────────────────┘
// • 時間單位是分鐘，從 540（早上 9:00）開始
// • 1440 分 = 一天，跨日用 addMinutes(p, mins) 自動處理 days +1
// • 商店營業時間 9:00-21:00（h ≥ 9 && h < 21）
// • 死魚醒來跳到隔天 9:00、體力恢復 50%
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 I：UI 設計規則                                                 │
// └────────────────────────────────────────────────────────────────────┘
// • BR 樣式 = 房間（暗棕金色），BB 樣式 = 浴室（水藍色）
// • 不顯示技術性備註
// • 刪除存檔需要二次確認（pendingDeleteSlot）
// • 連點兩次按鈕不能造成扣兩次錢/推進兩倍時間（靠 actionRef 保護）
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 J：存讀檔規則                                                  │
// └────────────────────────────────────────────────────────────────────┘
// • 存檔含 version: SAVE_VERSION
// • 讀檔用 {...INITIAL_PLAYER, ...data.player} 補齊舊存檔欄位
// • INITIAL_PLAYER 必須包含所有 player 用到的欄位
// • 讀檔失敗用 try/catch，catch 內也要 reset actionRef
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 K：場景切換規則                                                │
// └────────────────────────────────────────────────────────────────────┘
// • gs 合法值：explore | bathroom | shop | wardrobe |
//              piercingShop | saveLoad | birth | status
// • 場景切換時要清理對應 state（如 bathSavedClothes / shopSessionOpen）
// • 浴室退場有獨立流程（bathDismiss + bathReturnAlone）
// • ⛔ 禁止新增 'display' / 'show' 類的中間畫面 gs 值
// • ⛔ 禁止用 gs 來「展示文字」，文字展示請用 addLog()
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 L：分層結構與函數歸屬                                          │
// └────────────────────────────────────────────────────────────────────┘
// 【分層結構】（對應 22 SECTION）
// 1. 資料層     — 常數、資料庫、INITIAL_PLAYER（SECTION 1-4）
// 2. 文本庫     — SCENE_TEXTS、條件變體、獨立文本物件（SECTION 5-7）
// 3. 工具函數   — 純函數，無副作用，不呼叫 setState（SECTION 8-16）
// 4. 子元件     — Panel/Bar 等渲染元件（SECTION 21）
// 5. 主元件     — state / 動作函數 / renderActions / JSX（SECTION 22）
//
// 【按鈕規則】
// ⛔ 按鈕內只能有動作名稱（接客、淫語、勾引…）
// ⛔ 按鈕內禁止出現故事、描述、結果文字
// ✅ 所有事件敘述一律透過 addLog() / addLogs() 輸出
//
// 【函數歸屬】
// • 新增玩家動作 → 建立獨立的 do___() 函數
// • 新增計算邏輯 → 寫成純工具函數，放在元件外部
// • 新增敘事文本 → 加入 SCENE_TEXTS 對應分類，遵守規則 N（命名）+ 規則 O（機制）
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 M：參數註解規則                                                │
// └────────────────────────────────────────────────────────────────────┘
// • 所有新加入的參數必須有屬於它的註解
// • 優先尋找適合這個參數的現有註解（同子區、同類別）並沿用
// • 若沒有合適的註解，才新增註解
// • 新增註解的用詞、原則、與邏輯必須與同區註解相同或類似
//   - 同區若使用「//」單行註解，新增也用「//」單行
//   - 同區若使用 ─── 框線分隔，新增也用 ─── 框線
//   - 同區若用「• 」項目符號，新增也用「• 」
// • 註解必須說明參數的用途、單位、範圍（如有），不能只寫變數名稱
// • 分區內新增/修改任何文件、變數、參數時，必須檢視該分區現有註解
//   是否仍正確，若新增/修改導致註解內容過時，必須同步更新註解：
//   - 子區標題列出的成員（例：「// 11.5 名聲 — getReputation /
//     getReputationTitle」）若新增或移除函數，標題列出內容必須同步更新
//   - 物件結構說明（例：「// 結構：HAIR_PREF_HIT_TEXTS[part][level]」）
//     若結構改變，說明文字必須同步更新
//   - SECTION 標題說明（例：「SECTION 1: 全域樣式 — BR / BB /
//     LOG_COLORS / S」）若分區內成員變更，標題列出項目必須同步更新
//   - 規則文件內條列的命名範例（規則 N 等），若新增/修改命名公約，
//     範例必須同步反映最新狀態
// • 不得讓註解與實際程式碼脫節；註解過時等同錯誤訊息，會誤導未來開發
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 N：命名公約（識別符命名規則）                                   │
// └────────────────────────────────────────────────────────────────────┘
// 本檔案採用三類命名規則，新增任何識別符必須遵守：
//
// 【1. CONSTANT_CASE — 全大寫加底線】
//   用於：頂層常數變數名、資料表變數名、文本物件變數名（變數本身）
//   規則：所有字母大寫，多字之間用底線 _ 分隔
//   範例：
//     const HAIR_LEVELS = [...]
//     const CLOTHING_DB = {...}
//     const SCENE_TEXTS = {...}
//     const INITIAL_PLAYER = {...}
//     const HAIR_PREF_HIT_TEXTS = {...}
//     const FOREPLAY_DMG = {...}
//     const SAVE_SLOTS = [...]
//
// 【2. camelCase — 小寫開頭駝峰】
//   用於：
//     • 頂層工具函數（純函數）
//     • TowerGame 內部 state、useRef、衍生變數
//     • 物件內的 key / 屬性名（包含 SCENE_TEXTS / INITIAL_PLAYER 等）
//     • 陣列元素的物件屬性名
//   規則：第一個字小寫，後續每個字首大寫
//   範例：
//     pick / formatText / addMinutes / genEnemy / restockShop
//     getHairLevel / leavingRef / actionRef / showSexMenu
//     SCENE_TEXTS.roomSexFront
//     INITIAL_PLAYER.bodyHair.armpit
//     CLOTHING_DB.top[0].name
//
// 【3. PascalCase — 大寫開頭駝峰】
//   用於：React 元件
//   規則：每個字首大寫
//   範例：TowerGame / EnemyBar / StatusPanel / BathroomPanel /
//        SaveLoadPanel
//
// 【SCENE_TEXTS 內 key 命名公約】
//   結構：地點前綴 + 動作 + 變體（全 camelCase）。★核心分類「以地點為準」，可隨新地點擴充。
//   地點前綴（首字小寫，依「玩家所在地點」命名）：
//     room*     房間場景
//     bath*     浴室場景
//     shop*     商店前台場景（含老闆索取折扣的服務）
//     shopRest* 商店休息區（肉償・老闆阿坤的完整服務）；與前台 shop* 區分但同屬商店
//     toilet*   公廁場景（野戰）
//     ※「野戰」只是概念，分類一律「靠地點」：用該地點當前綴（toilet*、alley* 巷弄…），
//       不可用 field*／street* 之類的「概念前綴」。新地點同理：以該地點為前綴。
//   非地點的獨立分類（例外，沿用既有）：
//     wake*     起床（與地點無關）
//     entry*    入場
//   動作關鍵字（中段，首字大寫；★全地點共用同一套，不可為新地點另創同義詞）：
//     Chat / Seduce / Foreplay / Sex / Dismiss / Leave / Finish / Cleanup
//     ※手交/口交/露胸等「前戲性質」的服務一律用 Foreplay。
//       故商店老闆的折扣服務 = shopForeplay（巢狀 hand/mouth/…），與 roomForeplay/bathForeplay 同構。
//   變體（後段，首字大寫接續駝峰）：
//     Front / Back / Vagina / Anal / Condom / NoCondom / Arousal /
//     Orgasm / Normal / NoTop / NoBottom / Naked / Timeout /
//     Endurance / Semen / Defeated
//   範例：
//     roomSexFront          房間做愛-前位
//     bathLeaveTimeout      浴室退場-時間到
//     shopForeplay          商店-前戲服務（巢狀 hand/mouth/…）
//     toiletSexBack         公廁-做愛-後位（野戰，靠地點分類）
//     wakeExhausted         起床-精疲力盡
//     entryNoTop            入場-無上著
//
// 【其他文本物件命名公約】
//   • 變數名（外殼）：CONSTANT_CASE
//   • 內部 key：camelCase（如有）
//   範例：
//     const PREGNANT_WAKE_TEXTS = { early: [...], mid: [...], late: [...] }
//     const HAIR_PREF_HIT_TEXTS = { armpit: { smooth: [...], sparse: [...] } }
//     const STAIN_TEXTS = { hand: [...], face: [...] }
//
// 【為何用混合規則】
//   • CONSTANT_CASE 限縮在「頂層變數名」是因為這個位置真的是「常數」
//     ，視覺上能跟工具函數明確區分。
//   • 物件內 key 改用 camelCase 是因為它們是「屬性名」而不是常數，
//     符合 JavaScript 主流寫法，也避免 ROOM_SEX_FRONT_AROUSAL 這種
//     冗長底線堆疊造成視覺疲勞。
//   • 從外層 SCENE_TEXTS.xxx 的呼叫已經足夠表達「這是常數來源」，
//     內層 key 不需要再用 CONSTANT_CASE 重複強調。
//
// 【新增規則】
//   • 新增任何識別符前，先確認是哪一類（資料變數/函數/元件/key）
//     並用對應規則
//   • 新增 SCENE_TEXTS key 時，必須遵守「場景前綴+動作+變體」結構
//   • 同義詞不可混用同概念（例如 dismiss / leave 必須指不同情境）
//   • 同類概念必須用同一前綴（所有浴室場景都用 bath* 開頭）
//   • 不得在物件內 key 用 CONSTANT_CASE 寫法（例如 ROOM_SEX_FRONT
//     違反公約，應為 roomSexFront）
//
// ┌────────────────────────────────────────────────────────────────────┐
// │ 規則 O：文本機制設計                                                  │
// └────────────────────────────────────────────────────────────────────┘
// 新增文本時，依「狀態對行為的影響強度」選機制，不得錯用。
// 本規則指導判斷「該用哪種機制」、避免機制錯用導致品質下降或維護爆炸。
//
// 【三層機制】
// 1. Placeholder 變體 — 用於修飾性差異
//    • 適用：罩杯、體毛、視線等身體外觀變化（不影響動作流程）
//    • 實作：formatText 內依玩家 state 替換；文本池放 SECTION 6
//    • 設計要求：句子在「拿掉/加上 placeholder 都通順」（無痕嵌入）
//    • 標點符號自帶於 placeholder 內（避免空字串時殘留逗號）
//
// 2. 池內條件擴增 — 用於同動作不同身體條件
//    • 適用：巨乳乳交、大屁股後入、體毛喜好命中（已實作）
//    • 實作：池內混合條件性文本、抽選時用 condition 函數過濾
//    • 條件不符的文本仍可作為一般文本使用（fallback）
//    • 條件性文本內部仍可用 placeholder
//
// 3. 獨立文本池 — 用於行為流程質變
//    • 適用：懷孕中後期陰道做愛、月經陰道做愛、死魚狀態
//    • 實作：新增 SCENE_TEXTS key（命名 = 原 key + 狀態後綴）
//    • 動作函數內判斷狀態 → 選對應池
//    • 範例：roomSexFront → roomSexFrontPregnantMid / Late / Period
//
// 【三層機制可組合使用，不互斥】
// 獨立池內可使用 placeholder（例：roomSexFrontPregnantLate 內用 {BELLY_LATE}）
//
// 【判斷標準】
// • 動作流程改變 / 客人反應顯著不同 → 獨立池
// • 只有身體外觀或觸感的修飾 → Placeholder
// • 動作相同但描述細節須呼應身體條件 → 池內條件擴增
//
// 【新增狀態系統前的義務】
// 新增任何狀態系統（月經 / 玩具 / 野戰等）前，必須先列「動作 × 狀態」表，
// 為每個動作 × 該狀態組合判斷所屬機制；不得在未確認機制時就動手寫文本。
// 判斷結果寫進該系統的開發紀錄、不寫進規則文件。
//
// ╔════════════════════════════════════════════════════════════════════╗
// ║                       規則文件結束                                  ║
// ╚════════════════════════════════════════════════════════════════════╝


// ╔════════════════════════════════════════════════════════════════════╗
// ║              文本整頓進度表（開發紀錄）                              ║
// ╚════════════════════════════════════════════════════════════════════╝
// 整頓策略：依玩家觸發頻率 + 戲劇張力分層
// 每個池走 5 步：盤點 → 標記 → 改寫 → 確認 → 寫回
// 風格基準：直白、性器官直說、淫靡、柯妤潔卑賤蕩婦視角、
//          結尾用破折號或省略號、語氣帶喘息與失控感
// 圖例：[✅] 已整頓  [🔄] 整頓中  [⏳] 待整頓  [—] 不需整頓
//
// ┌─────────────────────────────────────────────────────────────────┐
// │ 🔴 P1 — 高頻 / 高戲劇張力                                         │
// └─────────────────────────────────────────────────────────────────┘
// [✅] 5.5  做愛主場景（房間）— roomSexFront/Back/Arousal/Finish/Cleanup 等 13 池
//        ↳ 已完成：全部 13 池（含正戲、高性奮、射精×4、清理×4、吞精）
// [✅] 5.11 做愛主場景（浴室）— 插入/後續/主場景/高性奮/高潮/清理 全12池
//
// ┌─────────────────────────────────────────────────────────────────┐
// │ 🟠 P2 — 中頻 / 中戲劇張力                                         │
// └─────────────────────────────────────────────────────────────────┘
// [✅] 5.3  前戲（房間）— roomForeplay 各 type、含 Arousal/Reject 等 17 池
//        ↳ 已完成：Arousal×5 type、spill×5 type、mouth.swallow、Reject、Cleanup；hand/boob/butt/leg 已改 spill主文本+swallowExtra追加 架構（邏輯+文本皆完成，swallowExtra 各5條）
// [✅] 5.10 前戲（浴室）— bathForeplay spill/swallow + Arousal + 清潔口交 16 池
//        ↳ 已完成：spill×5 type、Arousal×5 type、mouth.swallow、清潔口交（共 12 池）；hand/boob/butt/leg swallowExtra 已填（各5條）
// [✅] 5.6  退場（房間）— roomDismiss/Leave/Drained 10 池
//        ↳ 已完成：全部 10 池（DismissPlayer/Enemy/Dress、LeaveTimeout/Endurance/Semen 含 Dress × 3、Drained）
// [✅] 5.12 退場（浴室）— bathLeave×3/Dismiss/Return×2 共6池
//
// ┌─────────────────────────────────────────────────────────────────┐
// │ 🟡 P3 — 高頻 / 低戲劇張力                                         │
// └─────────────────────────────────────────────────────────────────┘
// [✅] 5.7  入場（浴室）— bathInvite/Accept/Reject/EnemyReaction 4 池
// [✅] 5.2  對話互動（房間）— roomChat/Seduce 含 Orgasm 4 池
// [✅] 5.8  對話互動（浴室）— bathChat/bathSeduce 2 池（無 Orgasm 變體）
//
// ┌─────────────────────────────────────────────────────────────────┐
// │ 🟢 P4 — 特殊情境                                                 │
// └─────────────────────────────────────────────────────────────────┘
// [✅] 5.4  保險套對話（房間）— askCondom/refuseCondom/forceAgree 等 14 池
// [✅] 5.9  浴室洗澡服務 — bathHelpUndress/bathFullClean/bathService 等 7 池
//        ↳ 已完成：bathHelpUndress、bathFullClean、bathService、bathServiceRepeat、bathServiceArousal、bathServiceOrgasm、bathServiceCleanup（全 7 池）
// [✅] 5.13 休息／起床 — wakeExhausted/Tired/Ok/Good/Full/Defeated 6 池（HP梯度，懷孕中性）
// [✅] 5.14 死魚 — roomSexDefeated/bathSexDefeated 2 池（無套內射小穴、全程無意識；浴室=橋接拖到床+串接房間死魚）
//
// ┌─────────────────────────────────────────────────────────────────┐
// │ 整頓計數                                                         │
// └─────────────────────────────────────────────────────────────────┘
// 總池數：105 池（含巢狀子池；原記 91 未完整展開 swallow/spill 等子池，2026-06-06 校正）
// 已整頓：105 池（A1×4 + A2×4 + A3×13 + A4×14 + A5×13 + A6×10 + 死魚×2 + B7×4 + B8×2 + B9×7 + B10×12 + B11×12 + B12×6 + B13×6 + swallowExtra×8）
// 待整頓：0 池（全數完成；swallowExtra 8 池已填，舊 swallow 全文池已淘汰）
//   • 已完成區段：全 5.1–5.14（入場/對話/戴套/做愛主場景房+浴/退場房+浴/入場浴/洗澡/休息起床/死魚/前戲房+浴含swallowExtra）
//   • 部分完成：無
//
// ┌─────────────────────────────────────────────────────────────────┐
// │ 待辦事項（架構性改動，需要程式邏輯+文本同步處理）                    │
// └─────────────────────────────────────────────────────────────────┘
// [✅] 前戲射精文本架構重整（spill主文本 + swallowExtra吞精追加）—— 已完成
//   問題：原 swallow / spill 兩池射精過程重複，工作量翻倍且維護成本高。
//   方案：改為「spill 主文本一律先走 + didSwallow(50%) 時追加 swallowExtra 短段」（mouth 維持 swallow/spill 不變）。
//   狀態：doForeplay 邏輯已實作（見 type!=='mouth' 分支）；舊 swallow 8 池已淘汰、改 swallowExtra；8 池文本已填（各5條）。
//   範圍：roomForeplay 4 type + bathForeplay 4 type（hand/boob/butt/leg）。
//
// ┌─────────────────────────────────────────────────────────────────┐
// │ 整頓變更記錄                                                      │
// └─────────────────────────────────────────────────────────────────┘
// （每池整頓後在此追加一行：日期 子區編號 池名 條數變化 備註）
//
// 2026-05-08  5.1  entryNormal/NoTop/NoBottom/Naked  各 6 條  急迫/中庸/從容結構
// 2026-05-08  5.2  roomChat/ChatOrgasm/Seduce/SeduceOrgasm  8/5/6/6 條
// 2026-05-10  5.3  roomForeplayArousal/spill/swallow 多池更新
// 2026-05-23  5.4  保險套對話系列前半 (Vagina/Anal)
// 2026-05-24  5.4  保險套對話系列後半 (Agree/Skip/Continue)
// 2026-05-25  5.1-5.3 詞彙修正 (發洩工具→精液袋等)
// 2026-05-28  5.5  roomSexFront / roomSexBack        各 10 條 10種體位主場景
// 2026-05-31  全域  SCENE_TEXTS 詞彙規範化            144 處  替換白濁/巨物/媚肉/嬌軀等
// 2026-05-31  機制  穿孔 UI + getRevealDesc 修補      —      PiercingShopPanel 補按鈕
// 2026-05-31  5.5  roomSexFrontArousal/BackArousal   各 4 條  高性奮擴寫
// 2026-05-31  5.5  roomFinish* 系列 (射精池)          共 20 條 擴寫射精結算細節
// 2026-05-31  5.5  roomCleanup* 系列 (清理池)         共 20 條 擴寫拔套、清理與吸出殘精
// 2026-05-31  5.5  roomDrinkCondom (吞精池)           5 條    擠壓保險套吞精動作升級
// 2026-05-31  5.14 roomSexDefeated (房間死魚敗北)     5 條    改為意識微弱、身體本能迎合至徹底暈厥
// 2026-05-31  5.6  roomLeaveTimeout/Endurance/TimeoutDress/EnduranceDress  各 5 條 時間到/體力耗盡離場+穿衣
// 2026-05-31  5.6  roomLeaveSemen                    5 條    精液耗盡後客人滿足付帳
// 2026-05-31  5.6  roomLeaveSemenDress               3→5 條  精液耗盡後客人滿足穿衣離場
// 2026-05-31  5.6  roomDrained                       5 條    精液耗盡瞬間痙攣虛脫場景
// 2026-05-31  5.6  roomLeaveTimeout                  5 條    時間到客人懊惱送客+柯妤潔撒嬌留客
// 2026-05-31  5.6  roomLeaveEndurance                5 條    體力耗盡客人癱軟+柯妤潔得意榨精自豪
// 2026-05-31  5.6  roomLeaveTimeoutDress             3→5 條  被打斷的客人煩躁穿衣離場
// 2026-05-31  5.6  roomLeaveEnduranceDress           3→5 條  被榨乾的客人虛脫穿衣離場
// 2026-06-03  5.7  bathInvite                        4→5 條  柯妤潔邀浴室
// 2026-06-03  5.7  bathAccept                        4→5 條  客人接受邀請
// 2026-06-03  5.7  bathReject                        4→5 條  客人拒絕直接上
// 2026-06-03  5.7  bathEnemyReaction                 4→5 條  客人看見裸體反應
// 2026-06-03  5.9  bathHelpUndress                   4→5 條  柯妤潔替客人脫衣
// 2026-06-03  5.8  bathChat                          5 條    確認整頓完成（浴室淫語互動）
// 2026-06-03  5.8  bathSeduce                        5 條    確認整頓完成（浴室勾引動作）
// 2026-06-06  5.9  bathFullClean        5 條    身體清洗（沖淨精液/愛液恢復潔淨）
// 2026-06-06  5.9  bathService          8→5 條  泡沫乳交洗背+擼動肉棒揉睪丸，重構精簡
// 2026-06-06  5.9  bathServiceRepeat    3 條    客人嫌重複洗澡、興致消退拒絕
// 2026-06-06  5.9  bathServiceArousal   4→5 條  泡沫蹂躪下強忍射精、理智苦撐
// 2026-06-06  5.9  bathServiceOrgasm    5 條    熱水中失控繳械、狼狽射精
// 2026-06-06  5.9  bathServiceCleanup   4→5 條  跪地含吸馬眼、真空抽吸榨乾殘精
// 2026-06-06  5.9  全系列整頓完成（bathHelpUndress 除外）：直白泡沫身體洗澡服務與射後抽吸殘精
// 2026-06-06  5.10 bathForeplay.{hand,mouth,boob,butt,leg}.spill  各 6 條  浴室前戲射出體外（手/口/乳/股/腿）
// 2026-06-06  5.10 bathForeplayArousal.{hand,mouth,boob,butt,leg}  3→5 條   浴室前戲高性奮強忍，補至各 5 條
// 2026-06-06  5.10 bathForeplay.mouth.swallow      6 條    浴室口交吞精（例外池單獨整頓；修房間殘留/黏連句/重複）
// 2026-06-06  5.10 其餘 swallow 8 池(hand/boob/butt/leg×room+bath)維持 DEFER，待 main+swallowExtra 架構重整
// 2026-06-06  5.11 做愛主場景(浴室)批次1：插入×2/後續×2/主場景×2/高性奮×2 共8池（SexFront/Back 5→8、Arousal 3→5）
// 2026-06-06  5.11 做愛收尾(浴室)批次2：Finish×2(小穴/後庭內射)/口交清潔×3 共5池（小穴Finish加懷孕淫語、補客人狀聲詞、Finish 3→5）
// 2026-06-06  5.10 歸屬修正：bathCleanupFellatio（前戲口交清潔）由 5.11 移回 5.10 前戲區塊，對齊房間版 roomCleanupFellatio 於 5.3
// 2026-06-06  5.12 退場(浴室)：bathLeave Timeout/Endurance/Semen + Dismiss + ReturnAlone/WithEnemy 共6池（3→5條，平靜過場語氣、客人態度分明、ReturnAlone無客人）
// 2026-06-06  計數校正：總池數 91→105、待整頓據實重算為 15（原計數未完整展開巢狀子池，長期漂移，此次對齊真實 leaf 池數）
// 2026-06-06  5.13 起床：wake Exhausted/Tired/Ok/Good/Full/Defeated 共6池（3→5條，HP恢復梯度分明、零佔位符、懷孕中性，懷孕由PREGNANT_WAKE_TEXTS獨立疊加）
// 2026-06-06  5.14 死魚：已修正戰敗死魚文本池（bathSexDefeated, roomSexDefeated）各5條，全面統一為無套內射小穴版本並剔除所有肛交情節；柯妤潔全程無意識(肉便器/精液袋)。浴室改為橋接(全裸拖到床、不含插入)＋串接房間死魚，resolveSexDefeat 同步串接邏輯。
// 2026-06-06  規則  「嬌軀」解除禁用（從詞彙規範禁用詞移除），戰敗死魚原字保留；game.tsx 廢棄刪除，往後一律以 game.jsx 為主檔
// 2026-06-06  5.3/5.10 前戲吞精架構重整（邏輯）：doForeplay 改為非 mouth 部位一律先走 spill 主文本，didSwallow(50%) 時追加 swallowExtra；舊 swallow 8 池(hand/boob/butt/leg×room+bath)移除改 swallowExtra:[] 佔位；didSwallow 的體力恢復/污漬等 bonus 完全不變
// 2026-06-06  5.3/5.10 swallowExtra（吞精追加）文本：hand/boob/butt/leg × room+bath 共8池各5條填入（接在 spill 結尾，舔起身上精液吞下；全程只用{E}、無{V_*}）。修6處錯字(捏頭→乳頭/⋯術→⋯⋯/翼紋→小心/浪芬→浪叫×2/使記→使勁)。前戲架構重整全數完成、待整頓歸零
// 2026-06-06  全域  文言剔除/台灣口語化字詞替換（僅換詞、不動句子主幹，跳過註解行）：巧笑倩兮→奉上勾魂的微笑、半推半就→迫不及待、如獲大赦般→興奮地、大馬金刀地在床沿坐下→霸氣地在床沿大開雙腿坐下、不著寸縷→一絲不掛、更衣→脫衣服(服務)/換衣服(自換)、蜜液→愛液、交槍/繳械→交代出來、浪肉/賤肉→欠操的騷肉、花唇→花瓣、豪乳→巨乳、胴體→身子、白濁→濃精(濃稠白濁→大股濃精)。刻意保留：身軀(客人用詞)、雙峰({BUST}相鄰)、未用K罩杯(避免與{BUST}衝突)；自貶詞變化調整(主觀改寫)未做
// 2026-06-06  身軀  柯妤潔語境 8 處 身軀→身子/騷身子/發情的身體（客人/兩人 10 處保留）；884「奶子用力揉碎」語病→「狠狠抓揉」
// 2026-06-06  邏輯  P1 戰敗死魚孔洞強制 vagina（對齊「一律內射小穴」文本，修污漬記anal/不懷孕的矛盾）；P2 doSave 補 try/catch+finally（寫入失敗不再鎖死 actionRef，並提示改用匯出）
// 2026-06-07  拆檔  P3 將 6 個文本常數(SCENE_TEXTS/HAIR_PREF_HIT_TEXTS/PREGNANT_WAKE_TEXTS/BODYHAIR_GROW_TEXTS/STAIN_TEXTS/BATH_WASH_TEXTS)抽出至 texts.js；game.jsx 5026→3862行。編譯產物大小不變(等價)。清過時設計備註與 SECTION9 註解
// 2026-06-07  P4  P4-5 Tailwind 改編譯(移除CDN, 加 tailwind/postcss config, 產18KB CSS, 已驗證含所有class)；P4-6 加起始畫面 gs='title'(繼續上次進度/讀取匯入/開新遊戲)；P4-7 抽出 migrateSave/applySave(doLoad+doImportText共用, 版本提示與升級擴充點)


import React, { useState, useEffect, useRef } from 'react';
import { Heart, ArrowUp, Beaker, ChevronRight, Bed, Baby, HeartHandshake,
         Store, Coins, Shirt, ShieldCheck, User, Scissors, PenTool, Flame } from 'lucide-react';
import { SCENE_TEXTS, HAIR_PREF_HIT_TEXTS, PREGNANT_WAKE_TEXTS, BODYHAIR_GROW_TEXTS, BATH_WASH_TEXTS } from './texts.js';
import townMapUrl from './townmap.png';   // 城鎮地圖底圖（手繪插畫）
import { BR, BB, LOG_COLORS, S } from './src/styles.js'; // 全域樣式（SECTION 1 已抽出）
import { SHOPKEEPER_NAME, SAVE_VERSION, HAIR_LEVELS, HAIR_LEVEL_KEYS, HAIR_PARTS, HAIR_PART_NAMES, HAIR_GROW_DAYS, CONDOM_PRICE, PIERCING_PRICES, TATTOO_SIZES, HAIR_TRIM_PRICE } from './src/constants.js'; // 全域常數（SECTION 2 已抽出）
import { pick, vary, formatTime, getTimePeriod, addMinutes, formatText, formatZhe, SAVE_SLOTS, SAVE_KEY, readSaveMeta, getStainLevel, addStainLog, gainProf, getPregnancyStage, getBodyMeasurements, getCurrentCup, calcCharm, getReputation, getReputationTitle, FOREPLAY_DMG, SEX_DMG, SEX_FEE, FOREPLAY_FEE, FAME_BY_LEAVE, calcServiceCharge, calcEffectiveArousal, calcOrgasmChance, calcArousalGain, calcOrgasmOutput, calcProfDmgMult, calcEnemyDmgMult, dmgVariance } from './src/logic.js'; // 純邏輯（SECTION 8-12 已抽出）
import { genEnemy, genBoss, genBossDate, restockShop, makeShop, buildUndressLogs, getRevealDesc, restoreUndressed, enemyCanSeeHair, getHairPartName, getHairLevelName } from './src/systems.js'; // 系統(SECTION 13-16 已抽出)
import { CAT, CLOTHING_DB, CUPS, SERVICE_NAMES, SERVICE_TO_CLOTHING, PIERCING_NAMES, TATTOO_LOCS, INITIAL_PLAYER } from './src/data.js'; // 資料表（SECTION 3-4 已抽出）
import { pickPortrait } from './src/portrait.js'; // 立繪系統（已抽出）
import { LOCATION_ART } from './src/locationArt.js'; // 地點場景立繪登記表
// 肉償休息區老闆文本：遵守規則 N（地點+行為），歸在「商店休息區」地點 = shopRest*，
// 與前台 shop* 區分。下表把娼館池鍵對應到 shopRest* 池；未列入或未填者自動回退娼館文本。
const BOSS_KEY = {
  roomChat:'shopRestChat', roomChatOrgasm:'shopRestChatOrgasm',
  roomSeduce:'shopRestSeduce', roomSeduceOrgasm:'shopRestSeduceOrgasm',
  roomForeplayReject:'shopRestForeplayReject',
  roomNoCondomVagina:'shopRestNoCondomVagina', roomNoCondomAnal:'shopRestNoCondomAnal',
  roomContinueNoCondomVagina:'shopRestContinueNoCondomVagina', roomContinueNoCondomAnal:'shopRestContinueNoCondomAnal',
  roomSexFront:'shopRestSexFront', roomSexBack:'shopRestSexBack',
  roomSexFrontArousal:'shopRestSexFrontArousal', roomSexBackArousal:'shopRestSexBackArousal',
  roomFinishFrontNoCondom:'shopRestFinishFront', roomFinishBackNoCondom:'shopRestFinishBack',
  roomLeaveEndurance:'shopRestLeaveEndurance', roomLeaveSemen:'shopRestLeaveSemen', roomDrained:'shopRestDrained',
  roomSexDefeated:'shopRestDefeated',
};
// 關店後做愛(isBossDate)：阿坤專屬主動文本 shopDate*；未填的鍵自動回退娼館 room*（room* 本就柯妤潔主動）
const DATE_KEY = {
  roomChat:'shopDateChat', roomChatOrgasm:'shopDateChatOrgasm',
  roomSeduce:'shopDateSeduce', roomSeduceOrgasm:'shopDateSeduceOrgasm',
  roomNoCondomVagina:'shopDateNoCondomVagina', roomNoCondomAnal:'shopDateNoCondomAnal',
  roomContinueNoCondomVagina:'shopDateContinueNoCondomVagina', roomContinueNoCondomAnal:'shopDateContinueNoCondomAnal',
  roomSexFront:'shopDateSexFront', roomSexBack:'shopDateSexBack',
  roomSexFrontArousal:'shopDateSexFrontArousal', roomSexBackArousal:'shopDateSexBackArousal',
  roomFinishFrontNoCondom:'shopDateFinishFront', roomFinishBackNoCondom:'shopDateFinishBack',
  roomLeaveEndurance:'shopDateLeaveEndurance', roomLeaveSemen:'shopDateLeaveSemen', roomDrained:'shopDateDrained',
  roomSexDefeated:'shopDateDefeated',
  roomForeplayReject:'shopDateForeplayReject',
  roomAskCondomVagina:'shopDateAskCondomVagina', roomAskCondomAnal:'shopDateAskCondomAnal',
  roomRefuseCondomVagina:'shopDateRefuseCondomVagina', roomRefuseCondomAnal:'shopDateRefuseCondomAnal',
  roomForceAgreeVagina:'shopDateForceAgreeVagina', roomForceAgreeAnal:'shopDateForceAgreeAnal',
  roomAgreeCondomVagina:'shopDateAgreeCondomVagina', roomAgreeCondomAnal:'shopDateAgreeCondomAnal',
  roomSkipCondomVagina:'shopDateSkipCondomVagina', roomSkipCondomAnal:'shopDateSkipCondomAnal',
  roomFinishFrontCondom:'shopDateFinishFrontCondom', roomFinishBackCondom:'shopDateFinishBackCondom',
  roomDrinkCondom:'shopDateDrinkCondom',
  // 前戲主池 shopDateForeplay/Arousal 由 doForeplay 直接判斷 isBossDate 取用（巢狀，非經此表）
  // 清潔口交(roomCleanupSex*) shopDate 版未寫，暫回退 room*
};
// ⚠ 技術債／待辦：肉償(shopRest*)文本需重新檢討（場景/姿勢一致性等），標記待後續處理。
const bossPool = (enemy, sceneKey) => {
  const bk = enemy?.isBoss ? BOSS_KEY[sceneKey] : (enemy?.isBossDate ? DATE_KEY[sceneKey] : null);
  return (bk && SCENE_TEXTS[bk]) || SCENE_TEXTS[sceneKey];
};

// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 1: 全域樣式 — BR / BB / LOG_COLORS / S                      ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 1.1 房間按鈕樣式 BR — 地下酒館風格（深紅 / 暗金）
// ─────────────────────────────────────────────────────────────────────
// BR / BB / LOG_COLORS / S 已抽至 ./src/styles.js（見頂部 import）


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 2: 全域常數 — 時間 / 存檔版本 / 業務常數 / 商品價格         ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 2.1 時間 / 存檔版本
// ─────────────────────────────────────────────────────────────────────
// 存檔版本號 — 每次 INITIAL_PLAYER 結構有破壞性變動時遞增
// 全域常數已抽至 ./src/constants.js（見頂部 import）


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 3: 資料表 — 衣物 / 客人 / 服務 / 裝飾                       ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 3.1 衣物資料 — CAT / CAT_KEYS / CLOTHING_DB / INIT_CLOTHES / INIT_WARDROBE
// ─────────────────────────────────────────────────────────────────────
// 衣物分類顯示名稱（CAT 必須先於 CAT_KEYS，因 CAT_KEYS 用 Object.keys(CAT)）
// 資料表 CAT/CLOTHING_DB/INITIAL_PLAYER 等已抽至 ./src/data.js（見頂部 import）


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 5: 主文本（按場景）— SCENE_TEXTS 物件 default 文本                 ║
// ╚════════════════════════════════════════════════════════════════════╝

// 子區結構：
//    5.1  入場（房間）
//    5.2  對話互動（房間）— 淫語、勾引
//    5.3  前戲（房間）
//    5.4  保險套對話（房間專用）
//    5.5  做愛主場景（房間）
//    5.6  退場（房間）
//    5.7  入場（浴室）
//    5.8  對話互動（浴室）
//    5.9  浴室洗澡服務
//    5.10 前戲（浴室）
//    5.11 做愛主場景（浴室）
//    5.12 退場（浴室）
//    5.13 休息／起床
//    5.14 死魚

// SCENE_TEXTS 已移至 texts.js（import 於檔案頂端）


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 6: 條件變體文本 — 跨場景的條件變體                          ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 6.1 體毛喜好命中 — HAIR_PREF_HIT_TEXTS
//      結構：HAIR_PREF_HIT_TEXTS[part][level]
//      part:  armpit / pubic / anal（3 部位）
//      level: smooth / sparse / thick / wild（4 等級）
//      共 12 池（3×4），每池 3 條文本
//      觸發條件：客人 hairPref 命中當下，先於主場景文本顯示
//      文本規則：直白動作、肉棒反應為主、客人粗口、結尾破折號或省略號
// ─────────────────────────────────────────────────────────────────────
// HAIR_PREF_HIT_TEXTS 已移至 texts.js（import 於檔案頂端）

// ─────────────────────────────────────────────────────────────────────
// 6.2 懷孕變體（預留空殼）
// ─────────────────────────────────────────────────────────────────────
// 未來放：PREGNANT_VARIANT_TEXTS（懷孕中期/晚期客人反應變體）

// ─────────────────────────────────────────────────────────────────────
// 6.3 月經變體（預留空殼）
// ─────────────────────────────────────────────────────────────────────
// 未來放：MENSTRUAL_VARIANT_TEXTS

// ─────────────────────────────────────────────────────────────────────
// 6.4 玩具變體（預留空殼）
// ─────────────────────────────────────────────────────────────────────
// 未來放：TOY_VARIANT_TEXTS

// ─────────────────────────────────────────────────────────────────────
// 6.5 野戰變體（預留空殼）
// ─────────────────────────────────────────────────────────────────────
// 未來放：FIELD_VARIANT_TEXTS


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 7: 獨立文本物件                                             ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 7.1 PREGNANT_WAKE_TEXTS — 懷孕起床特殊文本
//      結構：{early/mid/late/postBirth}，依懷孕階段顯示
// ─────────────────────────────────────────────────────────────────────
// PREGNANT_WAKE_TEXTS 已移至 texts.js（import 於檔案頂端）

// ─────────────────────────────────────────────────────────────────────
// 7.2 BODYHAIR_GROW_TEXTS — 體毛升級通知文本
//      用 {PART} 替換腋毛/陰毛/肛毛、{LEVEL} 替換濃密/雜草叢生
//      觸發時機：doRest 內 bodyHair 升級到 thick(2) 或 wild(3) 時
// ─────────────────────────────────────────────────────────────────────
// BODYHAIR_GROW_TEXTS 已移至 texts.js（import 於檔案頂端）

// ─────────────────────────────────────────────────────────────────────
// 7.3 月經獨立物件（預留空殼）
//      未來放：MENSTRUAL_TEXTS（生理期狀態文本）
// ─────────────────────────────────────────────────────────────────────


// 純邏輯（工具/污漬/角色屬性/戰鬥）已抽至 ./src/logic.js（見頂部 import）
// 系統函數(客人/脫衣/體毛)已抽至 ./src/systems.js（見頂部 import）
// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 17: 懷孕系統（預留空殼）                                    ║
// ╚════════════════════════════════════════════════════════════════════╝
// 預留空殼 — 後續階段才會放入懷孕相關工具：
//   - 受孕判定
//   - 分娩流程
//   - 親子關係追蹤
// 注意：getPregnancyStage 已位於 SECTION 11.2（屬於角色屬性）
//       PREGNANT_WAKE_TEXTS 已位於 SECTION 7.1（獨立文本物件）


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 18: 月經系統（預留空殼）                                    ║
// ╚════════════════════════════════════════════════════════════════════╝
// 預留空殼 — 後續階段才會放入月經系統：
//   - MENSTRUAL_CYCLE_DAYS 週期天數常數（已在 SECTION 2.3 預留）
//   - MENSTRUAL_TEXTS 月經狀態文本（已在 SECTION 7.3 預留）
//   - getMenstrualPhase / isOvulating 等判斷工具


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 19: 玩具系統（預留空殼）                                    ║
// ╚════════════════════════════════════════════════════════════════════╝
// 預留空殼 — 後續階段才會放入玩具系統：
//   - TOY_TYPES / TOY_PRICES 玩具資料（已在 SECTION 2.4 預留）
//   - getToyEffect / equipToy 等使用工具


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 20: 野戰系統（預留空殼）                                    ║
// ╚════════════════════════════════════════════════════════════════════╝
// 預留空殼 — 後續階段才會放入野戰系統：
//   - FIELD_LOCATIONS / FIELD_RISK_LEVELS 場地資料（已在 SECTION 2.5 預留）
//   - getFieldEvent / triggerFieldRisk 等場地工具


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 21: UI 子元件                                               ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 21.1 顯示元件 — EnemyBar / StatusPanel
// ─────────────────────────────────────────────────────────────────────
const EnemyBar = ({enemy, endPct, inSex=false, charmTotal=0}) => {
  const effArousal = calcEffectiveArousal(enemy, charmTotal);
  const arousalColor = effArousal>=160?'text-red-400':effArousal>=120?'text-orange-400':effArousal>=80?'text-yellow-400':'text-slate-500';
  return (
    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700/80">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-slate-300 text-sm font-bold">{enemy.name}</span>
        <span className={`text-xs font-bold ${arousalColor}`}>性奮 {effArousal}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
        <div className={S.hpBar} style={{width:`${Math.max(0,Math.min(100,endPct))}%`}}/>
      </div>
      <div className={S.rowXs}>
        <span>體力 {enemy.hp} / {enemy.maxHp}</span>
        {inSex && <span>{enemy.condomEquipped?'🛡 有套':'⚠ 無套'}</span>}
      </div>
    </div>
  );
};

const StatusPanel = ({ player, onBack }) => {
  const stage = player.isPregnant
    ? (player.pregnantDays<=21?'著床期':player.pregnantDays<=90?'早期':player.pregnantDays<=180?'中期':'晚期')
    : null;
  const PART_NAMES = {hand:'手交',mouth:'口交',boob:'乳交',butt:'臀交',leg:'腿交',vagina:'小穴',anal:'肛門'};
  const STAIN_NAMES = {face:'臉',hand:'手',boob:'胸部',butt:'臀部',leg:'大腿',vagina:'小穴',anal:'後庭'};
  const STAIN_LEVELS_DESC = ['','少量','明顯','大量','滿溢'];
  const CAT_CLOTHES = {top:'上著',bra:'內衣',bottom:'下著',panties:'內褲',socks:'襪子',shoes:'鞋子',ear:'耳飾',navel:'肚臍環',areola:'乳環',labia:'陰唇環'};
  const TATTOO_NAMES = {face:'臉',neck:'頸',breast:'胸',abdomen:'腹',back:'背',buttocks:'臀',thigh:'大腿',arm:'手臂'};
  const PIERCING_NAMES = {ear:'耳洞',navel:'肚臍環',areola:'乳環',labia:'陰唇環'};
  const stains = player.semenStains||{};
  const dirtyParts = Object.keys(stains).filter(k=>stains[k]>0);
  const piercings = Object.keys(player.piercings||{}).filter(k=>player.piercings[k]);
  const tattoos = Object.keys(player.tattoos||{}).filter(k=>player.tattoos[k]);
  const clothes = Object.entries(player.clothes||{}).filter(([,v])=>v);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-start py-4 px-4">
      <div className="w-full max-w-sm space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-pink-300 font-bold text-lg">📋 狀態欄</h3>
        <button onClick={onBack} className="text-slate-500 text-sm hover:text-slate-300 border border-slate-700 px-3 py-1 rounded-lg">✕ 返回</button>
      </div>
      {/* 角色卡：姓名 + 大圖立繪 + 儀表數據 */}
      <div className="rounded-2xl overflow-hidden border border-pink-900/40 bg-slate-950 shadow-lg shadow-pink-950/30">
        {/* 姓名列 */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-slate-900 to-transparent">
          <p className="text-pink-200 font-bold text-2xl leading-none tracking-wide">柯妤潔</p>
          <span className="text-xs px-2.5 py-1 rounded-full bg-pink-950/60 border border-pink-800/40 text-pink-300">{getReputationTitle(getReputation(player)).title}</span>
        </div>
        {/* 立繪（置中大圖）*/}
        <div className="flex justify-center" style={{background:'radial-gradient(130% 75% at 50% 0%, #3a1c3e, #0e1320)'}}>
          <img src={pickPortrait(player.clothes)} alt="柯妤潔" className="block"
            style={{maxHeight:'62vh', width:'auto', maxWidth:'100%'}}/>
        </div>
        {/* 儀表數據 */}
        <div className="grid grid-cols-4 divide-x divide-pink-900/25 border-t border-pink-900/30 bg-slate-900/40">
          {[['身高',player.height,'cm'],['體重',player.weight,'kg'],['三圍',`${player.bust}/${player.waist}/${player.hips}`,''],['罩杯',player.cup,'',true]].map(([l,v,u,hl])=>(
            <div key={l} className="py-2 text-center">
              <p className="text-[10px] text-slate-500 leading-none mb-1">{l}</p>
              <p className={`text-sm font-bold leading-none ${hl?'text-pink-300':'text-slate-100'}`}>{v}<span className="text-[10px] text-slate-400 font-normal">{u}</span></p>
            </div>
          ))}
        </div>
        {/* 懷孕狀態 */}
        <div className="px-4 py-2 text-center text-xs border-t border-pink-900/20 bg-slate-950">
          {player.isPregnant
            ? <span className="text-pink-400 font-semibold">已懷孕（{stage}・第{player.pregnantDays}天）</span>
            : <span className="text-slate-500">未懷孕</span>}
        </div>
      </div>
      {/* 目前服裝（部位標籤 + 名稱 + 魅惑值）*/}
      <div className={S.card}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-pink-300 font-bold text-sm">目前服裝</p>
          {clothes.length>0 && <span className="text-xs text-pink-300">總魅惑 +{clothes.reduce((s,[,it])=>s+(it.charm||0),0)}</span>}
        </div>
        {clothes.length===0
          ? <p className="text-slate-600 text-xs">全裸</p>
          : <div className="space-y-1">
              {clothes.map(([slot,item])=>(
                <div key={slot} className="flex items-center gap-2 text-xs">
                  <span className="shrink-0 w-10 text-center text-[10px] text-pink-300/90 bg-pink-950/40 rounded px-1 py-0.5 border border-pink-900/40">{CAT_CLOTHES[slot]||slot}</span>
                  <span className="flex-1 min-w-0 truncate text-slate-200">{item.name}</span>
                  <span className="shrink-0 text-slate-400">+{item.charm}</span>
                </div>
              ))}
            </div>
        }
        {piercings.length>0 && (
          <div className="mt-2 pt-2 border-t border-slate-700/40">
            <p className="text-yellow-400 text-xs">{piercings.map(k=>PIERCING_NAMES[k]||k).join('、')}</p>
          </div>
        )}
        {tattoos.length>0 && (
          <div className="mt-1">
            <p className="text-purple-400 text-xs">刺青：{tattoos.map(k=>`${TATTOO_NAMES[k]||k}（${player.tattoos[k].size}）`).join('、')}</p>
          </div>
        )}
      </div>
      {/* 體毛狀態 */}
      <div className={S.card}>
        <p className={S.cardTitle}>體毛狀態</p>
        <div className="grid grid-cols-3 gap-1">
          {HAIR_PARTS.map(part => {
            const lv = player.bodyHair?.[part] ?? 1;
            const colorMap = ['text-slate-400','text-slate-300','text-amber-400','text-orange-500'];
            return (
              <p key={part} className="text-xs">
                <span className="text-slate-500">{HAIR_PART_NAMES[part]}</span>
                <span className={`block ${colorMap[lv]}`}>{HAIR_LEVELS[lv]}</span>
              </p>
            );
          })}
        </div>
      </div>
      {/* 熟練度 */}
      <div className={S.card}>
        <p className={S.cardTitle}>服務熟練度</p>
        {Object.entries(player.prof||{}).map(([key,val])=>(
          <div key={key} className="flex justify-between items-center mb-1">
            <span className="text-slate-400 text-xs">{PART_NAMES[key]||key}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-700 rounded-full h-1.5">
                <div className="bg-pink-500 h-1.5 rounded-full" style={{width:`${val}%`}}/>
              </div>
              <span className="text-slate-300 text-xs w-8 text-right">{val}</span>
            </div>
          </div>
        ))}
      </div>
      {/* 污漬狀態 */}
      <div className={S.card}>
        <p className={S.cardTitle}>身體污漬</p>
        {dirtyParts.length===0
          ? <p className="text-slate-600 text-xs">身上乾淨，無殘留</p>
          : dirtyParts.map(k=>{
              const lvFixed = getStainLevel(stains[k]);
              return (
                <p key={k} className="text-xs text-amber-400">
                  {STAIN_NAMES[k]||k}：{STAIN_LEVELS_DESC[lvFixed]||'滿溢'}精液（{stains[k]}ml）
                </p>
              );
            })
        }
      </div>
      {/* 個人紀錄（終身累計，敘述式） */}
      {(()=>{
        const rec = player.record || {};
        const acts = rec.acts || {}, semen = rec.semen || {};
        // 敘述用動詞短語：前戲「X交」、做愛「用小穴/肛門做愛」
        const REC_VERB = {hand:'手交', mouth:'口交', boob:'乳交', butt:'臀交', leg:'腿交', vagina:'用小穴做愛', anal:'用肛門做愛'};
        const ORDER = ['hand','mouth','boob','butt','leg','vagina','anal'];
        const rows = ORDER.filter(k => (acts[k]||0) > 0 || (semen[k]||0) > 0);
        const b = (v,c='text-pink-200') => <b className={c}>{v}</b>;
        return (
          <div className={S.card}>
            <p className={S.cardTitle}>📖 柯妤潔的個人紀錄</p>
            {rows.length===0 && (rec.drunkCount||0)===0 && (rec.pregnant||0)===0 && (rec.abort||0)===0
              ? <p className="text-slate-600 text-xs">尚無任何紀錄，去伺候第一個客人吧……</p>
              : (
                <div className="space-y-1 leading-relaxed">
                  {rows.map(k=>(
                    <p key={k} className="text-xs text-slate-300">
                      已經{REC_VERB[k]||k}過 {b(acts[k]||0)} 人，榨出了 {b(semen[k]||0,'text-yellow-300')} ml 精液
                    </p>
                  ))}
                  <p className="text-xs text-slate-300 pt-1 border-t border-slate-700/40">
                    喝過 {b(rec.drunkCount||0,'text-rose-300')} 人的精液，共喝下 {b(rec.drunk||0,'text-rose-300')} ml 精液
                  </p>
                  <p className="text-xs text-slate-300">
                    懷孕過 {b(rec.pregnant||0,'text-pink-300')} 次，墮胎過 {b(rec.abort||0,'text-pink-300')} 次
                  </p>
                </div>
              )
            }
          </div>
        );
      })()}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// 21.2 場景面板 — BathroomPanel / ShopPanel / WardrobePanel / PiercingShopPanel
// ─────────────────────────────────────────────────────────────────────
const BathroomPanel = ({ player, enemy, onDoBath, onDoBathService, onDoForeplay, onDoStartSex, onDoSex, onResolveSexDefeat, onDoChat, onDoSeduce, onDoSendOff, onBack }) => {
  const stains = player.semenStains||{};
  const dirty = Object.keys(stains).filter(k=>stains[k]>0);
  const PART_NAMES = {face:'臉',hand:'手',boob:'胸部',butt:'臀部',leg:'大腿',vagina:'小穴',anal:'後庭'};
  const BASE_WASH_TIME = {face:2,hand:2,boob:3,butt:3,leg:3,vagina:7,anal:7};
  const total = dirty.reduce((s,k)=>s+(BASE_WASH_TIME[k]||3)+getStainLevel(stains[k]),0);
  // 浴室做愛中：顯示衝刺按鈕
  if (enemy?.phase==='sex') {
    const endPct = enemy.hp/enemy.maxHp*100;
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-3 border border-cyan-900/60 shadow-inner" style={{background:'linear-gradient(135deg, rgba(5,20,25,0.97) 0%, rgba(2,12,18,0.99) 100%)'}}>
          <div className="text-center mb-2">
            <span className="text-2xl">🛁</span>
            <p className="text-cyan-400 text-xs font-bold mt-0.5">浴室做愛中</p>
          </div>
          <div className="flex justify-between text-xs text-cyan-900 mb-1">
            <span>體力 {enemy.hp} / {enemy.maxHp}</span>
            <span>⚠ 無套</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 mb-3">
            <div className="h-2 rounded-full" style={{width:`${Math.max(0,Math.min(100,endPct))}%`,background:'linear-gradient(90deg,#164e63,#06b6d4)'}}/>
          </div>
          {player.hp<=0 && !enemy?.semenDepleted ? (
            <button onClick={onResolveSexDefeat}
              className="w-full py-4 rounded-xl font-bold text-base animate-pulse border-2 border-red-700 text-red-300"
              style={{background:'rgba(60,0,0,0.95)'}}>
              😵 柯妤潔暈了過去……（點此繼續）
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onDoSex}
                className="py-3 col-span-2 rounded-lg font-bold text-sm border border-cyan-900/60 text-cyan-200 hover:border-cyan-700 transition-colors"
                style={{background:'rgba(5,25,35,0.95)'}}>
                💦 繼續衝刺
              </button>
              <button onClick={onDoSendOff}
                className="py-2 col-span-2 rounded-lg font-bold text-sm border border-slate-800 text-slate-600 hover:text-slate-400 transition-colors"
                style={{background:'rgba(5,10,12,0.95)'}}>
                🚪 送客
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl p-4 border border-cyan-900/60 shadow-inner" style={{background:'linear-gradient(135deg,#0f2027,#203a43,#2c5364)'}}>
        <div className="text-center mb-3">
          <span className="text-3xl">🛁</span>
          <h3 className="text-cyan-200 font-bold text-lg mt-1">浴室</h3>
          <p className="text-cyan-600 text-xs mt-0.5">蒸氣瀰漫，水聲潺潺</p>
        </div>
        {enemy && (
          <>
            <EnemyBar enemy={enemy} endPct={enemy.hp/enemy.maxHp*100} inSex={enemy.phase==='sex'} charmTotal={calcCharm(player).total}/>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={onDoChat} className="py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-900/60 rounded-lg font-bold transition-colors text-sm col-span-2">💋 淫語</button>
              <button onClick={onDoSeduce} className="py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-900/60 rounded-lg font-bold transition-colors text-sm col-span-2">💃 勾引</button>
              <button
                onClick={onDoBathService}
                disabled={enemy.bathedThisVisit}
                className={`py-2.5 rounded-lg font-bold transition-colors text-sm ${enemy.bathedThisVisit?'bg-slate-800 text-slate-600 cursor-not-allowed':'bg-cyan-950 hover:bg-cyan-900 text-cyan-600 border border-cyan-900/50'}`}>
                🧴 幫忙沐浴{enemy.bathedThisVisit?'（冷靜中）':''}
              </button>
              <button onClick={onDoSendOff} className="py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-700 border border-slate-800/60 rounded-lg font-bold transition-colors text-sm">🚪 送客</button>
            </div>
            {enemy.foreplayRejected ? (
              <div className="py-2 text-center text-xs text-slate-600 bg-slate-900/40 rounded-lg border border-slate-800 mb-2">⛔ 前戲已被拒絕</div>
            ) : (
              <div className="mb-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(SERVICE_NAMES).filter(([k])=>!['vagina','anal'].includes(k)).map(([k,n])=>(
                    <button key={k} onClick={()=>onDoForeplay(k)}
                      className={`py-2 text-xs rounded-lg font-bold transition-colors ${enemy.revealedPreference&&enemy.preference===k?'bg-rose-900 border border-yellow-700 text-yellow-300':'bg-rose-950 hover:bg-rose-900 border border-rose-900/50 text-rose-400'}`}>
                      {n}{enemy.revealedPreference&&enemy.preference===k?' ⭐':''}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {enemy.revealedPreference&&(enemy.mainActPref==='vagina'||enemy.mainActPref==='anal')&&(
              <div className="text-xs text-yellow-300 text-center bg-yellow-900/30 rounded-lg py-1 mb-1.5">
                ⭐ {enemy.name}喜歡用【{enemy.mainActPref==='vagina'?'小穴':'肛門'}】
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={()=>onDoStartSex('vagina')}
                className={`py-3 text-white rounded-lg font-bold transition-colors text-sm ${enemy.revealedPreference&&enemy.mainActPref==='vagina'?'bg-rose-800 border-2 border-yellow-600':'bg-rose-950 border border-rose-900/60'}`}>
                小穴{enemy.revealedPreference&&enemy.mainActPref==='vagina'?' ⭐':''}
              </button>
              <button onClick={()=>onDoStartSex('anal')}
                className={`py-3 text-white rounded-lg font-bold transition-colors text-sm ${enemy.revealedPreference&&enemy.mainActPref==='anal'?'bg-purple-500 hover:bg-purple-400 ring-2 ring-yellow-400':'bg-purple-700 hover:bg-purple-600'}`}>
                肛門{enemy.revealedPreference&&enemy.mainActPref==='anal'?' ⭐':''}
              </button>
            </div>
          </>
        )}
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/40 mb-2">
          <p className="text-slate-400 text-xs font-bold mb-1.5">💦 身體狀況</p>
          {dirty.length===0
            ? <p className={S.textXsGray}>身上沒有需要清洗的部位。</p>
            : <><div className="flex flex-wrap gap-1 mb-1">{dirty.map(k=><span key={k} className="bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded-full text-xs">💦 {PART_NAMES[k]||k}</span>)}</div><p className={S.textXsGray}>預計清洗：{total>=30?'30分（全身）':`${total}分`}</p></>
          }
        </div>
        <div className="flex gap-2">
          {!enemy && (
            <button onClick={onDoBath} className="flex-1 py-2.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-500 border border-cyan-900/50 rounded-lg font-bold transition-colors text-sm">🚿 洗淨自己</button>
          )}
          <button onClick={onBack} className="py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-slate-700 border border-slate-800/50 rounded-lg font-bold transition-colors text-sm">{enemy?'返回服務':'離開'}</button>
        </div>
      </div>
    </div>
  );
};

// 商店人流（依營業 9:00–21:00 的鐘形曲線：開店少→午後尖峰→近打烊又少）；UI 只顯示形容詞、不顯示數字
const FOOT_TRAFFIC_LABELS = ['門可羅雀','三三兩兩','人來人往','摩肩接踵','水泄不通'];
// 人流原始值 0~100（打烊回 null）；折扣機率公式要用到數字，故拆成獨立函數
const getFootTrafficValue = (timeMinutes) => {
  const mins = ((timeMinutes % 1440) + 1440) % 1440;
  if (mins < 540 || mins >= 1260) return null;            // 打烊
  const t = (mins - 540) / 720;                           // 0(9:00)→1(21:00)
  return Math.round(100 * (1 - Math.pow(2*t - 1, 2)));    // 鐘形，15:00 尖峰 100
};
const getFootTraffic = (timeMinutes) => {
  const v = getFootTrafficValue(timeMinutes);
  if (v === null) return null;
  return FOOT_TRAFFIC_LABELS[v<=20?0 : v<=40?1 : v<=60?2 : v<=80?3 : 4];
};
// SHOPKEEPER_NAME 已移至 src/constants.js

// ─────────────────────────────────────────────────────────────────────
// 城鎮地圖（定位用）：分區 + 地點登錄表。座標(0~100)同時用於畫小地圖與算移動時間。
//   移動時間 = max(3, round(兩點直線距離 × TRAVEL_K))，跨區遠、同區近。
// ─────────────────────────────────────────────────────────────────────
const DISTRICTS = {
  central: { name:'中區', sub:'商業', color:'#3a3320', x:50, y:50 },
  east:    { name:'東區', sub:'風月', color:'#3a2030', x:84, y:50 },
  north:   { name:'北區', sub:'機構', color:'#1f2c3a', x:50, y:17 },
  south:   { name:'南區', sub:'陋巷', color:'#2a2418', x:50, y:83 },
  west:    { name:'西區', sub:'住宅', color:'#22301f', x:16, y:50 },
};
const DISTRICT_ORDER = ['central','east','north','south','west'];
// 區間道路（與小地圖路線一致）：中區是樞紐，外區只連到中區 → 外區之間須經中區轉。
const DISTRICT_ADJ = {
  central: ['east','north','south','west'],
  east:  ['central'],
  north: ['central'],
  south: ['central'],
  west:  ['central'],
};
const TOWN_LOCATIONS = [
  { id:'brothel',  name:'娼院',   icon:'💋', district:'east',    x:84, y:50, todo:false },
  { id:'shop',     name:'商店',   icon:'🏪', district:'central', x:43, y:46, todo:false },
  { id:'tattoo',   name:'刺青店', icon:'🎨', district:'central', x:58, y:55, todo:false },
  { id:'police',   name:'警局',   icon:'🚓', district:'north',   x:42, y:17, todo:true  },
  { id:'hospital', name:'醫院',   icon:'🏥', district:'north',   x:59, y:15, todo:true  },
  { id:'toilet',   name:'公廁',   icon:'🚽', district:'south',   x:43, y:83, todo:true  },
  { id:'field',    name:'巷弄',   icon:'🌃', district:'south',   x:59, y:85, todo:true  },
  { id:'home',     name:'家',     icon:'🏠', district:'west',    x:16, y:50, todo:true  },
];
const LOC_BY_ID = Object.fromEntries(TOWN_LOCATIONS.map(l=>[l.id, l]));
// 地點氛圍一句話（進場立繪卡下方顯示，世界觀一致；立繪未到位前先撐起沈浸感）
const LOCATION_FLAVOR = {
  brothel:  '霓虹把窗紙染成一片曖昧的桃紅，廊上脂粉與菸酒的氣味揮之不去。',
  shop:     '老式日光燈管嗡嗡作響，貨架上塞滿了從成衣到雜貨的零碎物事。',
  tattoo:   '門簾後針機低鳴，牆上釘滿刺青與穿環的樣稿，混著一股消毒水味。',
  police:   '灰牆藍燈的派出所，鐵柵與公告欄前總有人低著頭進出。',
  hospital: '消毒水氣味從自動門裡漫出來，候診的長椅上坐著神色各異的人。',
  toilet:   '巷角一間沒人管的公廁，磁磚剝落、燈光昏黃，門板上滿是塗鴉。',
  field:    '入夜後的窄巷，鐵皮與電線交錯，遠處的霓虹照不進來的暗角。',
  home:     '紅瓦舊樓的一間小屋，是這座城裡她唯一能喘口氣的角落。',
};
const TRAVEL_K = 0.4;   // 距離→分鐘係數（同區約3~6分、跨城約20~26分）
// 跨區移動時間：以兩區「區中心」的距離計（同區=0，中區←→外區約13~14分，外區對角約19~27分）
const districtMins = (fromD, toD) => {
  if (fromD === toD) return 0;
  const a = DISTRICTS[fromD], b = DISTRICTS[toD];
  if (!a || !b) return 10;
  return Math.max(3, Math.round(Math.hypot(b.x-a.x, b.y-a.y) * TRAVEL_K));
};



// 城鎮小地圖：以城鎮插畫為底圖，把定位大頭針疊在目前所在區
// （北=機構官府／中=商業中心／東=風月紅燈／西=住宅紅瓦／南=棚屋陋巷）。
const TOWN_PIN = {
  north:   { x:49, y:12 },
  central: { x:46, y:26 },
  east:    { x:70, y:27 },
  west:    { x:18, y:26 },
  south:   { x:43, y:43 },
};
const TownMiniMap = ({ districtId, timeMinutes }) => {
  const hour = Math.floor(((timeMinutes%1440)+1440)%1440 / 60);
  const night = hour < 6 || hour >= 19;
  const dusk = !night && (hour < 8 || hour >= 16);
  const here = DISTRICTS[districtId] || DISTRICTS.east;
  const p = TOWN_PIN[districtId] || TOWN_PIN.east;
  const tint = night ? { c:'#0a1430', o:0.52 } : dusk ? { c:'#5a2a2e', o:0.30 } : null;
  return (
    <div className="rounded-xl overflow-hidden border" style={{borderColor: night?'#252b46':'#3c4768'}}>
      <svg viewBox="0 0 100 54.5" className="w-full" style={{display:'block'}}>
        <defs>
          <linearGradient id="mmPin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff84ac"/><stop offset="1" stopColor="#d2335f"/></linearGradient>
          <radialGradient id="mmGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffd0e4" stopOpacity="0.85"/><stop offset="1" stopColor="#ffd0e4" stopOpacity="0"/></radialGradient>
          <radialGradient id="mmVig" cx="0.5" cy="0.46" r="0.72"><stop offset="0.55" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity="0.38"/></radialGradient>
          <filter id="mmSh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0.4" stdDeviation="0.35" floodColor="#000" floodOpacity="0.5"/></filter>
        </defs>
        <image href={townMapUrl} x="0" y="0" width="100" height="54.5" preserveAspectRatio="xMidYMid slice"/>
        {tint && <rect x="0" y="0" width="100" height="54.5" fill={tint.c} opacity={tint.o}/>}
        <rect x="0" y="0" width="100" height="54.5" fill="url(#mmVig)"/>
        <ellipse cx={p.x} cy={p.y} rx="11" ry="6.5" fill="url(#mmGlow)">
          <animate attributeName="opacity" values="0.95;0.5;0.95" dur="2.4s" repeatCount="indefinite"/>
        </ellipse>
        <g transform={`translate(${p.x} ${p.y})`}>
          <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0; 0 -1.4; 0 0" dur="1.7s" repeatCount="indefinite"/>
          <g transform="scale(0.82)">
            <ellipse cx="0" cy="0.4" rx="2.6" ry="0.9" fill="#000" opacity="0.32"/>
            <path d="M0,0 C-1.5,-2.6 -4.2,-4.3 -4.2,-7.2 A4.2,4.2 0 1 1 4.2,-7.2 C4.2,-4.3 1.5,-2.6 0,0 Z"
              fill="url(#mmPin)" stroke="#8a1f44" strokeWidth="0.5" filter="url(#mmSh)"/>
            <circle cx="0" cy="-7.2" r="1.9" fill="#fff"/>
            <circle cx="0" cy="-7.2" r="0.95" fill="#d2335f"/>
          </g>
        </g>
      </svg>
      <div className="text-center text-[11px] py-1.5 font-bold" style={{color: night?'#c8b0e0':'#d0b090', background:'#13192a'}}>
        📍 柯妤潔現在在【{here.name}・{here.sub}】{night?'　🌙 夜晚':dusk?'　🌆 黃昏':'　☀️ 白天'}
      </div>
    </div>
  );
};


// 地點場景立繪卡：9:16 直幅；有立繪顯示圖、無則顯示佔位；底部浮層疊地點名與區域
const LocationArt = ({ locId }) => {
  const art = LOCATION_ART[locId];
  const loc = LOC_BY_ID[locId];
  const dist = DISTRICTS[loc?.district];
  return (
    <div className="relative mx-auto rounded-xl overflow-hidden border"
      style={{aspectRatio:'9 / 16', maxHeight:'56vh', borderColor:'#3c3346', background:'#14101a'}}>
      {art
        ? <img src={art} alt={loc?.name} className="w-full h-full object-cover" style={{display:'block'}}/>
        : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-4">
            <span style={{fontSize:'3.2rem'}}>{loc?.icon}</span>
            <span className="text-slate-300 text-base font-bold">{loc?.name}</span>
            <span className="text-slate-600 text-xs">立繪製作中…</span>
          </div>}
      <div className="absolute bottom-0 left-0 right-0 px-3 pt-6 pb-2"
        style={{background:'linear-gradient(transparent, rgba(0,0,0,0.78))'}}>
        <div className="text-white font-bold text-lg leading-tight">{loc?.icon} {loc?.name}</div>
        {dist && <div className="text-slate-300 text-xs">{dist.name}・{dist.sub}</div>}
      </div>
    </div>
  );
};

// ── 索取折扣（為老闆服務換結帳折扣）──────────────────────────────────────
// 每天只有一次機會：柯妤潔提議 → 老闆判定接受/拒絕 → 接受則開出折扣 → 柯妤潔決定接不接受。
// 任一終點（老闆拒絕／柯妤潔不接受／服務完成）都用掉當日機會，隔天開店才能再要求。
//   acceptPenalty：服務越明顯，老闆越怕被店裡客人看到，接受率額外扣的基數（露胸最隱密、口交最明顯）。
//   discountRange：成功完成可得的折扣區間(off 比例)；人流越高越刺激→折扣越靠區間上限。
// 老闆服務（共用於「索取折扣」與「提供性服務(收費)」兩模式）。
//   time：耗時（手交/口交 15 分、露胸 10 分，與娼院前戲一致）。
//   hp：體力消耗，比照娼院前戲 FOREPLAY_DMG.player（hand5/mouth7/boob6）→露胸較輕給4。
//   discountRange：折扣模式(有購物籃)→換折扣(off比例)。
//   payRange：收費模式(無購物籃)→老闆付的報酬(G)，人流越高越刺激→越靠上限。
const SHOP_DISCOUNT_SERVICES = [
  { key:'flash', label:'露出胸部', risk:'較隱密',   acceptPenalty:0.00, discountRange:[0.05, 0.15], payRange:[20, 50],  time:10, hp:4 },
  { key:'hand',  label:'手交',     risk:'有點明顯', acceptPenalty:0.15, discountRange:[0.15, 0.35], payRange:[40, 100], time:15, hp:5 },
  { key:'oral',  label:'口交',     risk:'非常明顯', acceptPenalty:0.30, discountRange:[0.30, 0.60], payRange:[80, 200], time:15, hp:7 },
];
// 老闆接受率：人流越多越怕被看到；服務越明顯再扣基數。夾在 0~1（折扣/收費共用）
const discountAcceptChance = (svc, traffic) =>
  Math.max(0, Math.min(1, (100 - (traffic ?? 0)) / 100 - svc.acceptPenalty));
// 老闆開出的折扣(off 比例)：人流越高越刺激→越靠區間上限，加小幅隨機，量化到 5% 一檔、夾回區間
const rollDiscount = (svc, traffic) => {
  const [lo, hi] = svc.discountRange;
  const t = Math.max(0, Math.min(1, (traffic ?? 0) / 100));
  const center = lo + (hi - lo) * t;
  const v = center + (Math.random()*2 - 1) * (hi - lo) * 0.20;
  return Math.max(lo, Math.min(hi, Math.round(v*20)/20));
};
// 老闆開出的報酬(G)：人流越高越刺激→越靠區間上限，加小幅隨機，量化到 5G 一檔、夾回區間
const rollPay = (svc, traffic) => {
  const [lo, hi] = svc.payRange;
  const t = Math.max(0, Math.min(1, (traffic ?? 0) / 100));
  const center = lo + (hi - lo) * t;
  const v = center + (Math.random()*2 - 1) * (hi - lo) * 0.20;
  return Math.round(Math.max(lo, Math.min(hi, v)) / 5) * 5;
};
// 每次判定通過率（服務拆成四次判定，故調得寬鬆、讓四連可行）：
//   人越多越容易被客人撞見而中斷；服務越明顯(acceptPenalty)也越容易中斷。夾在 0.6~0.98。
const judgePassChance = (svc, traffic) =>
  Math.max(0.6, Math.min(0.98, 0.97 - ((traffic ?? 0)/100) * 0.18 - (svc.acceptPenalty||0) * 0.5));
// 老闆服務場景組裝（折扣/收費共用結構）：flash 扁平、hand spill+swallowExtra、oral swallow。
// 場景文本只含 {BOSS}（無 {V_*}），回傳已替換的字串。
const bossServiceScene = (poolObj, key) => {
  const pool = (poolObj && poolObj[key]) || [];
  let tpl;
  if (Array.isArray(pool)) tpl = pick(pool);
  else if (pool.swallow) tpl = pick(pool.swallow);
  else { tpl = pick(pool.spill||[]); if (pool.swallowExtra && pool.swallowExtra.length) tpl += pick(pool.swallowExtra); }
  return (tpl||'').replace(/{BOSS}/g, SHOPKEEPER_NAME);
};
// 肉償成功率：依魅惑度，越高越高，達 MEAT_CHARM_FULL 即 100%
const MEAT_CHARM_FULL = 80;
const meatCompChance = (charm) => Math.min(1, Math.max(0, charm) / MEAT_CHARM_FULL);

// 個人紀錄累加：回傳更新後的 record（不可變）。「人數」與「精液量」分開計：
//   countAct    — 將此方式的「服務人數」+1（僅在「同一客人首次以此方式射精」時傳入）
//   semenAct/vol— 此方式累加榨出的精液量（每次射精都加，不論是否首次）
//   drunk       — 本次喝下的精液量（ml，含保險套吸食，每次都加）
//   drunkPerson — 將「喝過幾人精液」+1（僅在「同一客人首次喝其精」時傳 true）
//   preg/abort  — 懷孕 / 墮胎次數 +1
const bumpRecord = (rec, { countAct=null, semenAct=null, vol=0, drunk=0, drunkPerson=false, preg=0, abort=0 } = {}) => {
  const r = rec || {};
  const acts = { ...(r.acts || {}) };
  const semen = { ...(r.semen || {}) };
  if (countAct) acts[countAct] = (acts[countAct] || 0) + 1;
  if (semenAct) semen[semenAct] = (semen[semenAct] || 0) + (vol || 0);
  return {
    acts, semen,
    drunk: (r.drunk || 0) + (drunk || 0),
    drunkCount: (r.drunkCount || 0) + (drunkPerson ? 1 : 0),
    pregnant: (r.pregnant || 0) + (preg || 0),
    abort: (r.abort || 0) + (abort || 0),
  };
};

const ShopPanel = ({player, shop, cart, onToggleCart, onCheckout, onBuyCondom, onBack, area, setArea, footTraffic, shopClosed, nearClose, onTalkBoss, discount=0, services=[], onAskDiscount, onAskService, onBossDate, bossOffer, onAcceptOffer, onDeclineOffer, bossService, onServiceStep, lowStamina, discountLocked, bossSated, theftPhase, onLeave, onReturnAndLeave, onAttemptTheft, onCancelLeave, onCompensate, onMeatComp, onGotoJail, theftFine=0, meatFailed=false}) => {
  const [bossMenu, setBossMenu] = React.useState(false);
  const gold = <span className="text-yellow-300 text-lg font-bold">💰 {player.gold}G</span>;
  const cartTotal = cart.reduce((s,i)=>s+i.price, 0);
  const payTotal = Math.round(cartTotal * (1 - discount));
  // 竊盜流程覆蓋層（優先於各區域）
  if (theftPhase === 'warn') return (
    <div className="space-y-3">
      <div className="flex justify-between items-center"><h3 className="text-red-300 font-bold">⚠️ 未結帳商品</h3>{gold}</div>
      <div className="bg-red-950/40 rounded-lg p-3 border border-red-800/50 text-sm text-red-200 leading-relaxed">
        購物籃裡還有 <b className="text-red-100">{cart.length}</b> 件商品（共 {cartTotal}G）尚未結帳。<br/>
        直接帶走將被視為<b className="text-red-100">竊盜</b>——{shopClosed?<span className="text-red-100">店已打烊、空無一人，沒有人潮掩護，這麼做一定會被老闆逮到！</span>:'店裡人越多越不容易被發現，但風險自負。'}
      </div>
      <button onClick={onReturnAndLeave} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-bold">🛒 放回商品，正常離開</button>
      <button onClick={onAttemptTheft} className="w-full py-3 bg-red-800 hover:bg-red-700 text-white rounded-lg font-bold">🥷 鋌而走險，把東西偷走</button>
      <button onClick={onCancelLeave} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold">↩ 取消，繼續逛</button>
    </div>
  );
  if (theftPhase === 'caught') return (
    <div className="space-y-3">
      <div className="flex justify-between items-center"><h3 className="text-red-300 font-bold">🚨 被當場逮住</h3>{gold}</div>
      <div className="bg-red-950/40 rounded-lg p-3 border border-red-800/50 text-sm text-red-200 leading-relaxed">
        老闆 {SHOPKEEPER_NAME} 追了出來、揪住了柯妤潔。你得給個交代：
        {meatFailed && <><br/><span className="text-pink-300 text-xs">老闆不吃肉償這套，堅持要妳拿錢賠。</span></>}
      </div>
      <button onClick={onCompensate} disabled={player.gold<theftFine}
        className={`w-full py-3 rounded-lg font-bold ${player.gold<theftFine?'bg-slate-800 text-slate-600':'bg-yellow-700 hover:bg-yellow-600 text-white'}`}>
        💸 賠償 {theftFine}G（商品價的 50%）{player.gold<theftFine?'（金幣不足）':''}
      </button>
      {!meatFailed && <button onClick={onMeatComp} className="w-full py-3 bg-pink-800 hover:bg-pink-700 text-white rounded-lg font-bold">💋 肉償（以身體抵償，看魅惑度）</button>}
      <button onClick={onGotoJail} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-bold">🚓 拒絕 → 被送警局關押 48 小時</button>
    </div>
  );
  const BackToLobby = () => (
    <button onClick={()=>setArea('lobby')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold">↩ 返回門口</button>
  );
  const JEWELRY = ['ear','navel','areola','labia'];  // 飾品 slot（其餘為服飾）
  const itemRow = (item,i) => item.sold ? (
    <div key={item.slot+i} className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/40 flex justify-between items-center opacity-50">
      <div><p className="text-slate-500 text-sm">{CAT[item.slot]||item.slot}</p><p className="text-slate-600 text-xs">目前暫無進貨</p></div>
      <span className="text-slate-600 text-xs">─</span>
    </div>
  ) : (
    <div key={item.id} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/40 flex justify-between items-center">
      <div><p className="text-slate-200 text-sm font-bold">{item.name}</p><p className={S.textXsGray}>{CAT[item.type||item.slot]} · 魅惑+{item.charm}</p></div>
      <button onClick={()=>onToggleCart(item)} disabled={player.wardrobe.includes(item.id)}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${player.wardrobe.includes(item.id)?'bg-slate-700 text-slate-500':cart.find(x=>x.id===item.id)?'bg-green-700 hover:bg-green-600 text-white':'bg-yellow-600 hover:bg-yellow-500 text-white'}`}>
        {player.wardrobe.includes(item.id)?'已擁有':cart.find(x=>x.id===item.id)?'✓ 放回':`拿起 ${item.price}G`}
      </button>
    </div>
  );
  const cartFooter = cart.length>0 ? <div className="text-center text-xs text-amber-300">🛒 已拿 {cart.length} 件・共 {cartTotal}G（到櫃台結帳）</div> : null;
  // 櫃台：老闆 + 保險套
  if (area==='counter') return (
    <div className="space-y-3">
      <div className="flex justify-between items-center"><h3 className="text-yellow-300 font-bold">🧾 櫃台</h3>{gold}</div>
      <button onClick={()=>setBossMenu(v=>!v)}
        className="w-full bg-slate-800/70 rounded-lg p-3 border border-amber-900/50 flex items-center gap-3 hover:bg-slate-800 transition-colors text-left">
        <span className="text-3xl">🧔</span>
        <div className="flex-1"><p className="text-amber-200 text-sm font-bold">老闆 {SHOPKEEPER_NAME}</p>
          <p className="text-slate-500 text-xs">{bossMenu?'收起…':(shopClosed?(cart.length>0?'點我…':'打烊了，點我陪老闆…'):(cart.length>0?'點我索取折扣…':'點我提供性服務賺錢…'))}</p></div>
        <span className="text-amber-300 text-xs">{bossMenu?'▴':'▾'}</span>
      </button>
      {bossMenu && (
        <div className="rounded-lg p-3 border border-pink-900/50 space-y-2" style={{background:'#1c0f16'}}>
          <p className="text-pink-300 text-xs font-bold">{shopClosed ? '🌙 打烊後・陪老闆' : (cart.length>0 ? '💋 索取折扣（為老闆服務換折扣）' : '💋 提供性服務（為老闆服務賺錢）')}</p>
          {bossService ? (
            <div className="space-y-2">
              <p className="text-pink-100 text-sm">服務進行中：<span className="font-bold">{bossService.svc.label}</span>　第 <span className="text-yellow-300 font-bold">{bossService.step+1}</span>/4 次（每次都可能被客人撞見而中斷，只有四次都成功老闆才會給{bossService.mode==='pay'?'錢':'折扣'}）</p>
              {lowStamina && <p className="text-red-400 text-[11px]">⚠ 體力過低，繼續可能會撐不住而中途放棄（拿不到{bossService.mode==='pay'?'報酬':'折扣'}）。</p>}
              <button onClick={onServiceStep} className="w-full py-3 rounded-lg bg-pink-700 hover:bg-pink-600 text-white text-sm font-bold">{bossService.step===0?'開始':'繼續'}{bossService.svc.label}（第 {bossService.step+1}/4 次）</button>
            </div>
          ) : bossSated ? (
            <p className="text-slate-500 text-xs">老闆 {SHOPKEEPER_NAME} 今天已經被妳伺候到爽夠了，沒了興致。</p>
          ) : discountLocked ? (
            <p className="text-slate-500 text-xs">老闆 {SHOPKEEPER_NAME} 今天已經陪妳玩過一回了，明天開店後再來吧。</p>
          ) : bossOffer ? (
            <div className="space-y-2">
              {bossOffer.mode==='pay' ? (
                <p className="text-pink-100 text-sm leading-relaxed">老闆願意接受【{bossOffer.svc.label}】，付妳 <span className="text-yellow-300 font-bold">{bossOffer.pay}G</span> 當報酬。要答應嗎？</p>
              ) : (
                <p className="text-pink-100 text-sm leading-relaxed">老闆願意接受【{bossOffer.svc.label}】，給妳打 <span className="text-yellow-300 font-bold">{formatZhe(bossOffer.off)}</span> 折、省 {Math.round(bossOffer.off*100)}%。要答應嗎？</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={onAcceptOffer} className="py-2 rounded-lg bg-pink-700 hover:bg-pink-600 text-white text-sm font-bold">答應並服務</button>
                <button onClick={onDeclineOffer} className="py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold">{bossOffer.mode==='pay'?'嫌太少，拒絕':'不划算，拒絕'}</button>
              </div>
            </div>
          ) : shopClosed ? (
            cart.length===0 ? (
              <>
                <button onClick={onBossDate} className="w-full py-3 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-sm font-bold">❤️ 做愛（打烊後，跟老闆來一場）</button>
                <p className="text-slate-600 text-[10px]">店打烊了、剩你們倆。玩法同娼館（前戲/做愛/可戴套/飲精），老闆爽夠付錢、自己離開不付錢。老闆今天沒做過服務才會答應。</p>
              </>
            ) : (
              <p className="text-slate-500 text-xs">已經打烊了，先到櫃台把購物籃裡的東西處理掉吧。</p>
            )
          ) : nearClose ? (
            <p className="text-slate-500 text-xs">老闆 {SHOPKEEPER_NAME} 看了眼時鐘：「快關店了，這會兒時間不夠玩，改天早點來吧。」（晚上 8 點後不接服務）</p>
          ) : (
            <>
              {services.map(svc=>(
                <button key={svc.key} onClick={()=>cart.length>0 ? onAskDiscount(svc) : onAskService(svc)}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-lg bg-pink-900/30 hover:bg-pink-800/40 text-pink-100 text-sm font-bold">
                  <span>{svc.label}</span><span className="text-pink-400 text-[10px]">{svc.risk}</span>
                </button>
              ))}
              <p className="text-slate-600 text-[10px]">人越少老闆越敢答應；人越多、服務越大膽，{cart.length>0?'折扣越高':'報酬越高'}。每天只有一次機會，皆消耗體力。</p>
            </>
          )}
        </div>
      )}
      <div className="bg-slate-800/60 rounded-lg p-3 border border-amber-900/40">
        <p className="text-amber-200 text-sm font-bold mb-1">🛒 購物籃</p>
        {cart.length===0 ? <p className="text-slate-500 text-xs">還沒拿任何東西</p> : cart.map(i=>(
          <div key={i.id} className="flex justify-between text-xs text-slate-300"><span>{i.name}</span><span>{i.price}G</span></div>
        ))}
        {cart.length>0 && (
          <div className="mt-1 pt-1 border-t border-slate-700">
            {discount>0 && <div className="flex justify-between text-xs text-slate-400"><span>小計</span><span className="line-through">{cartTotal}G</span></div>}
            {discount>0 && <div className="flex justify-between text-xs text-pink-300"><span>老闆折扣</span><span>-{Math.round(discount*100)}%</span></div>}
            <div className="flex justify-between text-sm font-bold text-yellow-300"><span>應付</span><span>{payTotal}G</span></div>
          </div>
        )}
        <button onClick={onCheckout} disabled={cart.length===0 || player.gold<payTotal}
          className={`w-full mt-2 py-2 rounded-lg text-sm font-bold transition-colors ${cart.length===0||player.gold<payTotal?'bg-slate-800 text-slate-600':'bg-yellow-600 hover:bg-yellow-500 text-white'}`}>
          💳 結帳{cart.length>0?` ${payTotal}G`:''}{player.gold<payTotal&&cart.length>0?'（金幣不足）':''}
        </button>
      </div>
      <div className="bg-slate-800/60 rounded-lg p-3 border border-cyan-900/40 flex justify-between items-center">
        <div>
          <p className="text-cyan-200 text-sm font-bold">🛡 保險套</p>
          <p className={S.textXsGray}>每天限量 2 個 · 剩餘 {player.shopCondomsLeft||0} 個</p>
        </div>
        <button onClick={onBuyCondom} disabled={!player.shopCondomsLeft || player.gold<CONDOM_PRICE}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${(!player.shopCondomsLeft||player.gold<CONDOM_PRICE)?'bg-slate-800 text-slate-600':'bg-cyan-700 hover:bg-cyan-600 text-white'}`}>
          {!player.shopCondomsLeft?'售完':`${CONDOM_PRICE}G`}
        </button>
      </div>
      <BackToLobby/>
    </div>
  );
  // 服飾區：買衣物
  if (area==='clothing') return (
    <div className="space-y-3">
      <div className="flex justify-between items-center"><h3 className="text-yellow-300 font-bold">🛍 服飾區</h3>{gold}</div>
      <div className="grid grid-cols-1 gap-2">
        {shop.filter(it=>!JEWELRY.includes(it.slot)).map(itemRow)}
      </div>
      {cartFooter}
      <BackToLobby/>
    </div>
  );
  if (area==='jewelry') return (
    <div className="space-y-3">
      <div className="flex justify-between items-center"><h3 className="text-pink-300 font-bold">💍 飾品區</h3>{gold}</div>
      <div className="grid grid-cols-1 gap-2">
        {shop.filter(it=>JEWELRY.includes(it.slot)).map(itemRow)}
      </div>
      {cartFooter}
      <BackToLobby/>
    </div>
  );
  // 門口（預設）：人流氛圍 + 進各區 + 離開
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center"><h3 className="text-yellow-300 font-bold">🏪 商店・門口</h3>{gold}</div>
      <div className="bg-slate-800/40 rounded-lg p-3 border border-amber-900/30 text-center text-sm" style={{color:'#c0a070'}}>{shopClosed?'店已打烊，此刻空無一人……':`店裡此刻${footTraffic||'空無一人'}……`}</div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={()=>!shopClosed&&setArea('clothing')} disabled={shopClosed} className={`py-3 rounded-lg font-bold ${shopClosed?'bg-slate-900 text-slate-700':'bg-slate-800 hover:bg-slate-700 text-yellow-200'}`}>🛍 服飾區{shopClosed?'（已打烊）':''}</button>
        <button onClick={()=>!shopClosed&&setArea('jewelry')} disabled={shopClosed} className={`py-3 rounded-lg font-bold ${shopClosed?'bg-slate-900 text-slate-700':'bg-slate-800 hover:bg-slate-700 text-pink-200'}`}>💍 飾品區{shopClosed?'（已打烊）':''}</button>
      </div>
      <button onClick={()=>setArea('counter')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-200 rounded-lg font-bold">🧾 櫃台{cart.length>0?`（🛒${cart.length}）`:''}</button>
      <button onClick={onLeave} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold">🚪 離開（回街道）{cart.length>0?`（🛒${cart.length} 未結帳）`:''}</button>
    </div>
  );
};

const WardrobePanel = ({player, onEquip, onUnequip, onBack}) => {
  const slots = ['top','bra','bottom','panties','socks','shoes','ear','navel','areola','labia'];
  return (
    <div className="space-y-3">
      <h3 className="text-pink-300 font-bold">👗 衣物管理</h3>
      {slots.map(slot=>{
        const equipped = player.clothes[slot];
        const inWardrobe = CLOTHING_DB[slot]?.filter(i=>player.wardrobe.includes(i.id))||[];
        return (
          <div key={slot} className={S.card}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 text-xs">{CAT[slot]}</span>
              {equipped && <button onClick={()=>onUnequip(slot)} className="text-xs text-slate-500 hover:text-slate-400">脫下</button>}
            </div>
            {equipped ? (
              <p className={S.textSmWhite}>{equipped.name} <span className={S.textXsGray}>（魅惑+{equipped.charm}）</span></p>
            ) : (
              <p className={S.textSmItalic}>未穿著</p>
            )}
            {inWardrobe.length>0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {inWardrobe.filter(i=>i.id!==equipped?.id).map(i=>(
                  <button key={i.id} onClick={()=>onEquip(slot,i)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-0.5 rounded">
                    {i.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button onClick={onBack} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold">返回</button>
    </div>
  );
};

const PiercingShopPanel = ({player, tattooDraft, setTattooDraft, onBuyPiercing, onTattoo, onTrimHair, onBack}) => (
  <div className="space-y-3">
    <h3 className="text-purple-300 font-bold">🎨 刺青店</h3>
    <div className={S.card}>
      <p className="text-slate-300 text-sm font-bold mb-2">刺青</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select value={tattooDraft.loc||''} onChange={e=>setTattooDraft(d=>({...d,loc:e.target.value}))}
          className="bg-slate-700 text-slate-300 rounded text-xs p-1.5">
          <option value="">部位</option>
          {Object.entries(TATTOO_LOCS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <select value={tattooDraft.size||''} onChange={e=>setTattooDraft(d=>({...d,size:e.target.value}))}
          className="bg-slate-700 text-slate-300 rounded text-xs p-1.5">
          <option value="">大小</option>
          {Object.entries(TATTOO_SIZES).map(([k,v])=><option key={k} value={k}>{v.name}（{v.price}G）</option>)}
        </select>
      </div>
      {tattooDraft.size && (
        <div className="flex flex-wrap gap-1 mb-2">
          {TATTOO_SIZES[tattooDraft.size]?.patterns.map(p=>(
            <button key={p} onClick={()=>setTattooDraft(d=>({...d,content:p}))}
              className={`text-xs px-2 py-0.5 rounded ${tattooDraft.content===p?'bg-purple-600 text-white':'bg-slate-700 text-slate-400'}`}>{p}</button>
          ))}
        </div>
      )}
      <button onClick={onTattoo} disabled={!tattooDraft.loc||!tattooDraft.size||!tattooDraft.content}
        className="w-full py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-bold disabled:bg-slate-800 disabled:text-slate-600">
        刺青（{tattooDraft.size?TATTOO_SIZES[tattooDraft.size]?.price:0}G）
      </button>
    </div>
    {/* 穿孔 */}
    <div className={S.card}>
      <p className="text-slate-300 text-sm font-bold mb-1">穿孔</p>
      <p className="text-slate-500 text-xs mb-2">穿孔後才能穿戴對應的環飾</p>
      {Object.entries(PIERCING_PRICES).map(([loc, price]) => {
        const hasIt = player.piercings?.[loc];
        const canAfford = player.gold >= price;
        return (
          <div key={loc} className="mb-2 pb-2 border-b border-slate-700/30 last:border-0 last:mb-0 last:pb-0">
            <p className="text-xs mb-1">
              <span className="text-slate-400">{PIERCING_NAMES[loc]}：</span>
              <span className={hasIt ? 'text-purple-400' : 'text-slate-500'}>
                {hasIt ? '已穿孔' : '未穿孔'}
              </span>
            </p>
            <div className="flex gap-1">
              {hasIt ? (
                <span className="text-slate-600 text-xs">已完成</span>
              ) : (
                <button
                  onClick={() => onBuyPiercing(loc)}
                  disabled={!canAfford}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    !canAfford
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-purple-700 hover:bg-purple-600 text-white'
                  }`}
                >
                  穿孔（{price}G）
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
    {/* 修剪體毛 */}
    <div className={S.card}>
      <p className="text-slate-300 text-sm font-bold mb-1">修剪體毛</p>
      <p className="text-slate-500 text-xs mb-2">每次 {HAIR_TRIM_PRICE}G，可降至任意低等級</p>
      {HAIR_PARTS.map(part => {
        const lv = player.bodyHair?.[part] ?? 1;
        const partName = HAIR_PART_NAMES[part];
        const lvName = HAIR_LEVELS[lv];
        const lvColor = ['text-slate-400','text-slate-300','text-amber-400','text-orange-500'][lv];
        return (
          <div key={part} className="mb-2 pb-2 border-b border-slate-700/30 last:border-0 last:mb-0 last:pb-0">
            <p className="text-xs mb-1">
              <span className="text-slate-400">{partName}：</span>
              <span className={lvColor}>{lvName}</span>
            </p>
            <div className="flex gap-1">
              {HAIR_LEVELS.map((targetLvName, targetLv) => {
                if (targetLv >= lv) return null;  // 只能往低降
                return (
                  <button
                    key={targetLv}
                    onClick={() => onTrimHair(part, targetLv)}
                    disabled={player.gold < HAIR_TRIM_PRICE}
                    className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                      player.gold < HAIR_TRIM_PRICE
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-purple-700 hover:bg-purple-600 text-white'
                    }`}
                  >
                    →{targetLvName}
                  </button>
                );
              })}
              {lv === 0 && <span className="text-slate-600 text-xs">已是最低</span>}
            </div>
          </div>
        );
      })}
    </div>
    <button onClick={onBack} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold">返回</button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// 21.3 系統面板 — SaveLoadPanel
// ─────────────────────────────────────────────────────────────────────
const SaveLoadPanel = ({slots, readMeta, onSave, onLoad, onDelete, onBack, onExport, onImport}) => {
  const [pendingDeleteSlot, setPendingDeleteSlot] = React.useState(null);
  const [exportText, setExportText] = React.useState('');
  const [importText, setImportText] = React.useState('');
  const [ioMsg, setIoMsg] = React.useState('');
  const handleDeleteClick = (slot) => {
    if (pendingDeleteSlot === slot) {
      // 第二次點擊：執行刪除
      onDelete(slot);
      setPendingDeleteSlot(null);
    } else {
      // 第一次點擊：進入確認狀態
      setPendingDeleteSlot(slot);
    }
  };
  // 點別的按鈕（存/讀/別的 slot 刪/返回）會重置 pending
  const handleSaveClick = (slot) => { setPendingDeleteSlot(null); onSave(slot); };
  const handleLoadClick = (slot) => { setPendingDeleteSlot(null); onLoad(slot); };
  const handleBackClick = () => { setPendingDeleteSlot(null); onBack(); };
  return (
  <div className="space-y-3">
    <h3 className="text-cyan-300 font-bold">💾 存檔 / 讀檔</h3>
    {slots.map(slot=>{
      const meta = readMeta(slot);
      const isPending = pendingDeleteSlot === slot;
      return (
        <div key={slot} className={S.card}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              {meta ? (
                <>
                  <p className={S.textSmWhite}>{meta.name}</p>
                  <p className={S.textXsGray}>第{meta.day}天　{formatTime(meta.time||0)}</p>
                  <p className={S.textXsGray}>體力 {meta.hp}/{meta.baseHp}　💰 {meta.gold}G　🌟 {meta.fame}</p>
                  {meta.isPregnant && <p className="text-pink-400 text-xs">已懷孕第 {meta.pregnantDays} 天</p>}
                </>
              ) : (
                <p className={S.textSmItalic}>空槽</p>
              )}
            </div>
            <div className="flex gap-1">
              <button onClick={()=>handleSaveClick(slot)} className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs">存</button>
              {meta && <>
                <button onClick={()=>handleLoadClick(slot)} className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs">讀</button>
                <button onClick={()=>handleDeleteClick(slot)}
                  className={`px-2 py-1 ${isPending ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-red-900 hover:bg-red-800'} text-white rounded text-xs font-bold`}>
                  {isPending ? '⚠️ 確定刪除' : '刪'}
                </button>
              </>}
            </div>
          </div>
          {isPending && (
            <p className="text-red-400 text-xs mt-1">⚠️ 此操作無法復原，再點一次「確定刪除」即執行</p>
          )}
        </div>
      );
    })}
    {/* 匯出 / 匯入存檔 — 不依賴 localStorage 持久化，跨裝置或沙箱(Claude預覽)用 */}
    <div className="border-t border-slate-700 pt-3 space-y-2">
      <p className="text-cyan-300 text-sm font-bold">📦 匯出 / 匯入存檔</p>
      <p className={S.textXsGray}>在 Claude 預覽等不持久的環境，用這個把進度複製出來自行保存；換環境或下次再貼回來匯入即可。</p>
      <button onClick={()=>{ setPendingDeleteSlot(null); setImportText(''); setIoMsg(''); setExportText(onExport()); }}
        className="w-full py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded text-xs font-bold">📤 匯出目前進度</button>
      {exportText && (<>
        <textarea readOnly value={exportText} onFocus={e=>e.target.select()} rows={3}
          className="w-full text-[10px] bg-slate-950 text-slate-300 rounded p-2 border border-slate-700 font-mono" />
        <button onClick={()=>{ try { navigator.clipboard.writeText(exportText); setIoMsg('✅ 已複製到剪貼簿，請貼到安全的地方保存'); } catch { setIoMsg('ℹ️ 無法自動複製，請手動反白上面文字複製'); } }}
          className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs">複製</button>
      </>)}
      <textarea value={importText} onChange={e=>setImportText(e.target.value)} placeholder="把先前匯出的存檔字串貼在這裡…" rows={3}
        className="w-full text-[10px] bg-slate-950 text-slate-300 rounded p-2 border border-slate-700 font-mono" />
      <button onClick={()=>{ const ok = onImport(importText.trim()); if (!ok) setIoMsg('❌ 字串無效，無法匯入'); }}
        className="w-full py-1.5 bg-green-800 hover:bg-green-700 text-white rounded text-xs font-bold">📥 匯入並開始遊戲</button>
      {ioMsg && <p className="text-xs text-amber-300">{ioMsg}</p>}
    </div>
    <button onClick={handleBackClick} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold">返回</button>
  </div>
  );
};


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 22: 主元件 TowerGame                                        ║
// ╚════════════════════════════════════════════════════════════════════╝

const TowerGame = () => {

  // ─────────────────────────────────────────────────────────────────
  // 22.1 State 宣告 — useState / useRef / log helpers
  // ─────────────────────────────────────────────────────────────────
  const [player,  setPlayer]  = useState(() => JSON.parse(JSON.stringify(INITIAL_PLAYER)));
  const [enemy,   setEnemy]   = useState(null);
  const leavingRef = useRef(false);
  const actionRef = useRef(false);
  const [logs,    setLogs]    = useState([{msg:'歡迎來到柯妤潔的娼館。',tag:'hint'}]);
  const [gs,      setGs]      = useState('title');
  const [pendingLoc, setPendingLoc] = useState(null); // 地點立繪：點按地點後在 locIntro 待進入的地點 id
  const [shopArea, setShopArea] = useState('lobby');  // 商店內裝子區：lobby(門口)/counter(櫃台)/clothing(服飾區)
  const [cart, setCart] = useState([]);  // 購物籃：服飾區「拿起」的物品，到櫃台結帳才扣款
  const [shopDiscount, setShopDiscount] = useState(0);  // 跟老闆服務換來的結帳折扣(0~1)
  const [bossOffer, setBossOffer] = useState(null);     // 老闆已開價/開折扣、待柯妤潔決定 {svc, mode, off|pay, traffic}
  const [bossService, setBossService] = useState(null); // 服務進行中（四次判定）{svc, mode, off|pay, step(已成功次數0~3)}
  const [theftPhase, setTheftPhase] = useState(null);   // 竊盜流程：null / 'warn'(離開警告) / 'caught'(被逮·賠償選擇)
  const [meatFailed, setMeatFailed] = useState(false);  // 肉償判定失敗（老闆拒絕、堅持賠錢）→ 隱藏肉償鈕
  const [shop,    setShop]    = useState([]);
  const [tattooDraft, setTattooDraft] = useState({loc:'',size:'',content:''});
  const [showRestMenu, setShowRestMenu] = useState(false);
  const [showSexMenu, setShowSexMenu] = useState(false);
  const [showForeplayMenu, setShowForeplayMenu] = useState(false);


  // 體力歸零由 UI 昏倒按鈕觸發（移除 useEffect 避免閉包問題）

  const MAX_LOGS = 60;
  const addLog  = (msg, tag='default') => setLogs(l=>{const base=l.length>0&&l[0].tag==='__CLEAR__'?[]:l;const n=[...base,{msg,tag}];return n.length>MAX_LOGS?n.slice(-MAX_LOGS):n;});
  const addLogs = (arr) => setLogs(l=>{const base=l.length>0&&l[0].tag==='__CLEAR__'?[]:l;const n=[...base,...arr.map(([msg,tag='default'])=>({msg,tag}))];return n.length>MAX_LOGS?n.slice(-MAX_LOGS):n;});
  const addSep  = () => setLogs([{msg:'',tag:'__CLEAR__'}]);


  // ─────────────────────────────────────────────────────────────────
  // 22.2 離場處理 — resolveEnemyLeave / resolvePriority / 服務時間 useEffect
  // ─────────────────────────────────────────────────────────────────
  const resolveEnemyLeave = (reason) => {
    if (!enemy) return;
    if (leavingRef.current) return; // 防重複觸發
    leavingRef.current = true;
    addSep();
    const e = enemy;
    let fameGain = FAME_BY_LEAVE[reason]||1;
    let bonusGold = 0;
    let leaveText='';
    // 小費公式（前三種離場共用）：體力消耗×0.5 + 精液消耗×3
    const enemyHpUsed = (e.maxHp||0) - (e.hp||0);
    const semenUsed = (e.baseSemen||0) - (e.semenVolume||0);
    const tip = Math.ceil(enemyHpUsed*0.5 + semenUsed*3);
    // 總額 = 固定消費 + 服務項目累計 + 小費
    const totalPay = Math.min(e.heldGold||0, Math.ceil((e.minFee||0) + (e.accumulatedFee||0) + tip));

    if (reason==='timeout') {
      if (gs==='bathroom') {
        // 浴室：客人裹浴巾走出 → 柯妤潔獨自走出 → 房間說話 → 房間穿衣
        addLog(formatText(pick(SCENE_TEXTS.bathLeaveTimeout), e.name, 0,'',''), 'story');
      } else {
        leaveText = formatText(pick(SCENE_TEXTS.roomLeaveTimeout), e.name, 0,'','');
        addLog(leaveText,'story');
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveTimeoutDress), e.name, 0,'',''), 'story');
      }
      bonusGold = totalPay;
    } else if (reason==='enemyHp') {
      if (gs==='bathroom') {
        addLog(formatText(pick(SCENE_TEXTS.bathLeaveEndurance), e.name, 0,'',''), 'story');
      } else {
        leaveText = formatText(pick(bossPool(enemy,'roomLeaveEndurance')), e.name,0,'','');
        addLog(leaveText,'story');
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveEnduranceDress), e.name, 0,'',''), 'story');
      }
      bonusGold = totalPay;
      fameGain = FAME_BY_LEAVE.enemyHp;
    } else if (reason==='semen') {
      const drainingText = formatText(pick(bossPool(enemy,'roomDrained')), e.name,0,'','');
      addLog(drainingText,'story');
      if (gs==='bathroom') {
        addLog(formatText(pick(SCENE_TEXTS.bathLeaveSemen), e.name, 0,'',''), 'story');
      } else {
        addLog(formatText(pick(bossPool(enemy,'roomLeaveSemen')), e.name,0,'',''),'story');
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveSemenDress), e.name, 0,'',''), 'story');
      }
      bonusGold = totalPay;
      fameGain = FAME_BY_LEAVE.semen;
    }
    // 浴室退場：客人已從浴室離開 → 柯妤潔獨自走出 → 在房間正式離場
    if (gs==='bathroom') {
      addLog(pick(SCENE_TEXTS.bathReturnAlone).replace(/{E}/g, e.name), 'story');
      setGs('explore');
      // 房間裡的離場文本（客人說話 + 穿衣）
      if (reason==='timeout') {
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveTimeout), e.name, 0,'',''), 'story');
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveTimeoutDress), e.name, 0,'',''), 'story');
      } else if (reason==='enemyHp') {
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveEndurance), e.name, 0,'',''), 'story');
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveEnduranceDress), e.name, 0,'',''), 'story');
      } else if (reason==='semen') {
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveSemen), e.name, 0,'',''), 'story');
        addLog(formatText(pick(SCENE_TEXTS.roomLeaveSemenDress), e.name, 0,'',''), 'story');
      }
    }
    if (bonusGold>0) addLog(`💰 獲得 ${bonusGold}G　🌟 名氣 +${fameGain}`,'gold');
    else if (e.isBoss) addLog(`🌟 名氣 +${fameGain}`,'gold');
    // 恢復入場時的完整衣物狀態
    const restoredClothes = e.entryClothes || restoreUndressed(e, player);
    const putBackSlots = Object.keys(restoredClothes).filter(slot=>
      restoredClothes[slot] && restoredClothes[slot] !== player.clothes[slot]
    );
    if (putBackSlots.length > 0) {
      const names = putBackSlots.map(slot=>restoredClothes[slot].name).join('、');
      addLog(`柯妤潔默默把${names}穿上，整理了一下儀容。`,'hint');
    } else {
      addLog(`柯妤潔整理了一下儀容。`,'hint');
    }

    // 小穴和肛門污漬不恢復（需自己去浴室洗）
    // 使用 p=> 回調確保拿到最新 state，避免 doSex 剛更新的污漬被舊快照蓋掉
    setPlayer(p=>({...p,
      gold:p.gold+bonusGold,
      fame:(p.fame||0)+fameGain,
      clothes:restoredClothes,
      semenStains: p.semenStains || {},
      ...(e.isBoss||e.isBossDate ? {bossSatedDay:p.days} : {}),   // 老闆爽夠/陪睡過，今天不再服務
    }));
    leavingRef.current = false;
    setEnemy(null);
    setShowForeplayMenu(false);
    setShowSexMenu(false);
    setShowRestMenu(false);
    if (gs==='bathroom') setGs('explore');
    if (e.isBoss || e.isBossDate) {   // 肉償/關店做愛結束 → 回到商店門口
      addLog(`🚪 老闆 ${SHOPKEEPER_NAME} 心滿意足地拍了拍柯妤潔的臉，把她送回店門口。`, 'hint');
      setShopArea('lobby');
      setGs('shop');
    }

  };

  // ── 優先仲裁函數 ────────────────────────────────────────────
  // 統一處理動作後的退場觸發，優先序：
  // 1. 柯妤潔體力歸零（死魚）2. 精液耗盡 3. 敵人體力歸零 4. 時間到
  // 參數：
  //   didOrgasm       — 本次動作是否射精
  //   newVol          — 射精後剩餘精液量
  //   enemyHpAfter    — 敵人體力扣除後的值（enemy.hp - enemyDmg）
  //   playerHpAfter   — 柯妤潔體力扣除後的值（player.hp - playerDmg）
  //   timeNowAfter    — 動作後的絕對分鐘數（player.timeMinutes+mins + player.days*1440）
  const resolvePriority = ({ didOrgasm=false, newVol=999, enemyHpAfter=999, playerHpAfter=999, timeNowAfter=0 }={}) => {
    if (!enemy) return;
    const serviceEnd = enemy.serviceEndTime || Infinity;
    if (playerHpAfter<=0) {
      setTimeout(()=>resolveSexDefeat(),300);
    } else if (didOrgasm && newVol<=0) {
      setTimeout(()=>resolveEnemyLeave('semen'),300);
    } else if (enemyHpAfter<=0) {
      setTimeout(()=>resolveEnemyLeave('enemyHp'),300);
    } else if (timeNowAfter >= serviceEnd) {
      setTimeout(()=>resolveEnemyLeave('timeout'),300);
    }
  };

  // 服務時間到期 useEffect（被動觸發，玩家未執行動作時的 timeout 保護）
  useEffect(()=>{
    if (!enemy || !enemy.serviceEndTime) return;
    const now = player.timeMinutes + player.days*1440;
    if (now >= enemy.serviceEndTime) {
      resolveEnemyLeave('timeout');
    }
  }, [player.timeMinutes, player.days, enemy, resolveEnemyLeave]);
  // gazeTop / gazeBottom 動態描述

  // ─────────────────────────────────────────────────────────────────
  // 22.3 衍生資料 — gazeXxx / isXxx / bustDesc / hipsDesc / getPeriodText
  // ─────────────────────────────────────────────────────────────────
  const gazeTop = (p) => {
    const cup = getCurrentCup(p);
    const bust = getBodyMeasurements(p).bust;
    const stage = getPregnancyStage(p);
    const parts = [];
    // 胸部描述（含懷孕狀態）
    if (stage === 3) parts.push(`${bust}公分、${cup}罩杯的巨大乳房，高度隆起、沉甸甸的`);
    else if (stage === 2) parts.push(`${bust}公分、${cup}罩杯的豐滿乳房`);
    else parts.push(`${bust}公分、${cup}罩杯的裸胸`);
    // 懷孕中期以上加肚子描述
    if (stage === 2) parts.push(`以及明顯隆起的小腹`);
    else if (stage === 3) parts.push(`以及高高隆起的大肚子`);
    // 飾品和刺青
    if (p.piercings?.areola) parts.push(`乳頭上穿著乳暈環`);
    const t = p.tattoos||{};
    if (t.breast) parts.push(`乳房上刺著${t.breast.content}`);
    return parts.join('，');
  };
  const gazeBottom = (p) => {
    const parts = [];
    const t = p.tattoos||{};
    if (p.piercings?.labia) parts.push(`陰唇穿著陰唇環`);
    if (t.buttocks) parts.push(`臀部刺著${t.buttocks.content}`);
    if (t.thigh) parts.push(`大腿內側刺著${t.thigh.content}`);
    if (parts.length === 0) parts.push(`白皙的小穴與渾圓的屁股`);
    return parts.join('、');
  };

  // 時段文字
  const getPeriodText = () => {
    const p = getTimePeriod(player.timeMinutes);
    return {morning:'今早',afternoon:'今天下午',evening:'今晚',midnight:'今夜'}[p];
  };

  // 服裝狀態
  const isTopless  = () => !player.clothes.top && !player.clothes.bra;
  const isBottomless = () => !player.clothes.bottom && !player.clothes.panties;
  const isNaked    = () => isTopless() && isBottomless();

  // cup / hips 描述
  const bustDesc = () => {
    const cup = getCurrentCup(player);
    const idx = CUPS.indexOf(cup);
    if (idx >= 20) return '媲美人妻的';
    if (idx >= 16) return '極為豐滿的';
    if (idx >= 12) return '豐滿的';
    if (idx >= 8)  return '飽滿的';
    if (idx >= 4)  return '小巧的';
    return '嬌小的';
  };
  const hipsDesc = () => {
    const h = getBodyMeasurements(player).hips;
    if (h >= 105) return '豐腴圓潤';
    if (h >= 95)  return '飽滿緊實';
    if (h >= 85)  return '纖細勻稱';
    return '纖細';
  };

  // ── 探索 ──────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────
  // 22.4 場景動作 — 接客 / 休息
  // ─────────────────────────────────────────────────────────────────
  const doExplore = () => {
    if (enemy) return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const e = genEnemy(player);
    // 入場文本
    let tpl;
    if (isNaked()) {
      tpl = pick(SCENE_TEXTS.entryNaked);
    } else if (isTopless()) {
      tpl = pick(SCENE_TEXTS.entryNoTop);
    } else if (isBottomless()) {
      tpl = pick(SCENE_TEXTS.entryNoBottom);
    } else {
      tpl = pick(SCENE_TEXTS.entryNormal);
    }
    const now = player.timeMinutes + player.days*1440;
    const endTime = now + e.serviceTime;
    const newEnemy = {...e, serviceEndTime: endTime};
    let text = tpl
      .replace(/{E}/g, e.name)
      .replace(/{T}/g, String(e.serviceTime))
      .replace(/{PERIOD}/g, getPeriodText())
      .replace(/{GAZE_TOP}/g, gazeTop(player))
      .replace(/{GAZE_BOTTOM}/g, gazeBottom(player));
    addSep();
    addLog(text, 'story');
    addLog(`💰 ${e.name} 買下了柯妤潔 ${e.serviceTime} 分鐘（${e.baseFee}G + ${e.ratePerMin}G/分）。`, 'gold');
    // 記錄入場時柯妤潔的衣物狀態（離場時恢復用）
    newEnemy.entryClothes = {...player.clothes};
    // 體毛喜好命中（入場時若已可見，立即觸發）
    const part = newEnemy.hairPref?.part;
    if (part && enemyCanSeeHair(player, part)) {
      const lvKey = HAIR_LEVEL_KEYS[player.bodyHair?.[part] ?? 1];
      if (lvKey === newEnemy.hairPref.level) {
        const pool = HAIR_PREF_HIT_TEXTS[part]?.[lvKey] || [];
        if (pool.length > 0) {
          const tpl = pick(pool);
          const hairText = formatText(tpl, newEnemy.name, 0, bustDesc(), hipsDesc());
          addLog(hairText, 'sex');
        }
        const newArousal = Math.min(200, (newEnemy.arousal||0) + 60);
        newEnemy.arousal = newArousal;
        newEnemy.maxArousal = Math.max(newEnemy.maxArousal||0, newArousal);
        newEnemy.hairPrefSatisfied = true;
      }
    }
    setEnemy(newEnemy);
    actionRef.current = false;

  };

  // ── 休息 ─────────────────────────────────────────────────
  const doRest = (hours) => {
    addSep();
    if (enemy) return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    // 恢復比例（非線性，鼓勵睡長）
    const HEAL_RATE = [0, 0.06, 0.13, 0.22, 0.34, 0.48, 0.63, 0.80, 1.00];
    const isSleepTillMorning = hours === 'morning';
    // 計算實際分鐘數
    let mins;
    if (isSleepTillMorning) {
      // 睡到隔天早上9:00
      const curMins = player.timeMinutes;
      mins = curMins <= 540 ? (540 - curMins + 1440) : (1440 - curMins + 540);
    } else {
      mins = hours * 60;
    }
    const stage = getPregnancyStage(player);
    // 恢復上限（懷孕中晚期限制）
    const healCap = stage === 3 ? 0.50 : stage === 2 ? 0.75 : 1.00;
    // 恢復比例（睡到早上依實際小時數計算）
    let healPct;
    if (isSleepTillMorning) {
      const actualHours = Math.min(8, mins / 60);
      const h = Math.floor(actualHours);
      healPct = HEAL_RATE[Math.min(h, 8)] || 1.00;
    } else {
      healPct = HEAL_RATE[hours] || 0;
    }
    // 懷孕中晚期效率打折
    const efficiencyMult = stage === 3 ? 0.50 : stage === 2 ? 0.75 : 1.00;
    healPct = healPct * efficiencyMult;
    const maxRecoverable = Math.floor(player.baseHp * healCap);
    const healAmount = Math.min(
      maxRecoverable - Math.min(player.hp, maxRecoverable),
      Math.floor(player.baseHp * healPct)
    );
    const newHp = Math.min(maxRecoverable, player.hp + healAmount);
    const hpPct = newHp / player.baseHp;
    // 起床文本
    let wakePool;
    if (hpPct < 0.25)       wakePool = SCENE_TEXTS.wakeExhausted;
    else if (hpPct < 0.50)  wakePool = SCENE_TEXTS.wakeTired;
    else if (hpPct < 0.75)  wakePool = SCENE_TEXTS.wakeOk;
    else if (hpPct < 1.00)  wakePool = SCENE_TEXTS.wakeGood;
    else                     wakePool = SCENE_TEXTS.wakeFull;
    // 先算出休息後的懷孕天數，起床文字用更新後的值判斷（避免跨分期時說錯）
    const daysPassed = Math.floor((player.timeMinutes + mins) / 1440) - Math.floor(player.timeMinutes / 1440);
    const newPregnantDaysForText = player.isPregnant
      ? Math.min(270, (player.pregnantDays||0) + daysPassed)
      : 0;
    const justBornForText = player.isPregnant && newPregnantDaysForText >= 270;
    const stgForText = getPregnancyStage({...player, pregnantDays: newPregnantDaysForText});
    const newPostBirthDaysForText = justBornForText ? 0 : (player.postBirthDays||0) + daysPassed;

    // 體毛成長計算（用於起床通知文本）
    const newDaysForHair = player.days + daysPassed;
    const hairGrownTo = {};  // { part: newLevel } 記錄升到 ≥ 2 的部位
    for (const part of HAIR_PARTS) {
      const oldLevel = player.bodyHair?.[part] ?? 1;
      const lastTrim = player.bodyHairTrimDay?.[part] ?? 1;
      if (oldLevel >= 3) continue; // 已到上限
      const elapsed = newDaysForHair - lastTrim;
      const grownLevels = Math.floor(elapsed / HAIR_GROW_DAYS);
      if (grownLevels > 0) {
        const newLevel = Math.min(3, oldLevel + grownLevels);
        if (newLevel >= 2 && newLevel > oldLevel) {
          hairGrownTo[part] = newLevel;
        }
      }
    }

    setPlayer(p=>{
      const dp = Math.floor((p.timeMinutes + mins) / 1440) - Math.floor(p.timeMinutes / 1440);
      const newPregnantDays = p.isPregnant ? Math.min(270, (p.pregnantDays||0) + dp) : p.pregnantDays;
      const justBorn = p.isPregnant && newPregnantDays >= 270;
      const innerNewHp = Math.min(maxRecoverable, p.hp + healAmount);
      // 體毛成長套用
      const newDaysAfter = p.days + dp;
      const newBodyHair = {...(p.bodyHair || {armpit:1,pubic:1,anal:1})};
      const newBodyHairTrimDay = {...(p.bodyHairTrimDay || {armpit:1,pubic:1,anal:1})};
      for (const part of HAIR_PARTS) {
        const oldLv = newBodyHair[part] ?? 1;
        if (oldLv >= 3) continue;
        const lastTrim = newBodyHairTrimDay[part] ?? 1;
        const elapsed = newDaysAfter - lastTrim;
        const grown = Math.floor(elapsed / HAIR_GROW_DAYS);
        if (grown > 0) {
          newBodyHair[part] = Math.min(3, oldLv + grown);
          newBodyHairTrimDay[part] = newDaysAfter;
        }
      }
      return addMinutes({
        ...p,
        hp: innerNewHp,
        pregnantDays: justBorn ? 0 : newPregnantDays,
        isPregnant: justBorn ? false : p.isPregnant,
        birthCount: justBorn ? (p.birthCount||0)+1 : p.birthCount,
        postBirthDays: justBorn ? 0 : (p.postBirthDays||0) + dp,
        bodyHair: newBodyHair,
        bodyHairTrimDay: newBodyHairTrimDay,
      }, mins);
    });
    const timeLabel = isSleepTillMorning ? '睡到天亮' : `${hours}小時`;
    addLog(`🛌 休息了${timeLabel}，恢復了 ${healAmount} 點體力（${Math.round(healPct*100)}%）。`, 'good');
    addLog(pick(wakePool), 'story');
    // 懷孕特殊起床文本（用更新後的分期判斷）
    if (!justBornForText) {
      if (stgForText === 1) addLog(pick(PREGNANT_WAKE_TEXTS.early), 'story');
      else if (stgForText === 2) addLog(pick(PREGNANT_WAKE_TEXTS.mid), 'story');
      else if (stgForText === 3) addLog(pick(PREGNANT_WAKE_TEXTS.late), 'story');
      else if (player.birthCount > 0 && newPostBirthDaysForText > 0 && newPostBirthDaysForText <= 60) addLog(pick(PREGNANT_WAKE_TEXTS.postBirth), 'story');
    }
    // 體毛升到濃密/雜草通知文本（H6 才會有實際文本，目前 BODYHAIR_GROW_TEXTS 為空陣列就跳過）
    for (const [part, level] of Object.entries(hairGrownTo)) {
      if (BODYHAIR_GROW_TEXTS.length > 0) {
        const tpl = pick(BODYHAIR_GROW_TEXTS);
        const text = tpl.replace(/\{PART\}/g, getHairPartName(part)).replace(/\{LEVEL\}/g, getHairLevelName(level));
        addLog(text, 'story');
      }
    }
    actionRef.current = false;
  };

  // ─────────────────────────────────────────────────────────────────
  // 22.5 商店動作 — doOpenShop / doBuyItem / doBuyCondom
  // ─────────────────────────────────────────────────────────────────
  // 地圖移動（兩層）：先「跨區」走到目標區（依區中心距離扣時間），到了該區才能點進該區的店。
  const travelDistrict = (toD) => {
    if (toD === player.district) return;
    if (!(DISTRICT_ADJ[player.district]||[]).includes(toD)) return;  // 只能走到相鄰區（外區須經中區轉）
    const mins = districtMins(player.district, toD);
    const dd = DISTRICTS[toD];
    addLog(`🚶 柯妤潔走到了${dd?.name||toD}（約 ${mins} 分鐘）`, 'hint');
    setPlayer(p => ({ ...addMinutes(p, mins), district: toD }));
  };
  const doOpenShop = () => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const h = Math.floor(player.timeMinutes/60) % 24;
    if (!player.shopSessionOpen && (h < 9 || h >= 21)) {
      addLog('🔒 商店只在早上9點到晚上9點營業。','bad');
      actionRef.current = false;
      return;
    }
    setShop(makeShop(player.wardrobe, player.shopProgress||{}));
    setPlayer(p=>({...addMinutes(restockShop(p),15), shopSessionOpen:true}));
    setShopArea('lobby');
    setCart([]);
    setShopDiscount(0);
    setBossOffer(null);
    setBossService(null);
    setTheftPhase(null);
    setMeatFailed(false);
    setGs('shop');
    actionRef.current = false;

  };
  // 服飾區「拿起 / 放回」：只進出購物籃，不扣款
  const toggleCart = (item) => {
    setCart(c => c.find(x=>x.id===item.id) ? c.filter(x=>x.id!==item.id) : [...c, item]);
  };
  // ── 老闆服務（索取折扣／提供性服務）：100% 同意 → 開價 → 接受 → 四次判定 ──
  // step 1（折扣）：柯妤潔提議，老闆一律同意並開出折扣
  const doAskDiscount = (svc) => {
    if (actionRef.current || bossOffer || bossService) return;
    if (cart.length === 0) { addLog('🛒 購物籃是空的，先拿點東西吧。','hint'); return; }
    if (getFootTrafficValue(player.timeMinutes)===null || (Math.floor(player.timeMinutes/60)%24) >= 20) { addLog(`🕗 老闆 ${SHOPKEEPER_NAME} 看了眼時鐘：「快關店了，這會兒時間不夠玩，改天早點來吧。」`,'hint'); return; }
    if (player.bossSatedDay === player.days) { addLog('😏 老闆今天已經被妳伺候到爽夠了，擺擺手沒了興致。','hint'); return; }
    if (player.discountAttemptDay === player.days) { addLog('🚫 老闆今天已經陪妳玩過一回了，明天再來吧。','hint'); return; }
    actionRef.current = true;
    const traffic = getFootTrafficValue(player.timeMinutes) ?? 0;
    addLog('💋 ' + pick(SCENE_TEXTS.shopAskDiscount).replace(/{BOSS}/g, SHOPKEEPER_NAME).replace(/{SVC}/g, svc.label), 'hint');
    const off = rollDiscount(svc, traffic);
    setBossOffer({ svc, mode:'discount', off, traffic });
    addLog('🧔 ' + pick(SCENE_TEXTS.shopBossOffer).replace(/{BOSS}/g, SHOPKEEPER_NAME).replace(/{ZHE}/g, formatZhe(off)), 'good');
    actionRef.current = false;
  };
  // step 1（收費）：購物籃為空時，老闆一律同意並開出報酬
  const doAskService = (svc) => {
    if (actionRef.current || bossOffer || bossService) return;
    if (cart.length > 0) { addLog('🛒 購物籃有東西時老闆只談折扣；想單純賺錢請先清空購物籃。','hint'); return; }
    if (getFootTrafficValue(player.timeMinutes)===null || (Math.floor(player.timeMinutes/60)%24) >= 20) { addLog(`🕗 老闆 ${SHOPKEEPER_NAME} 看了眼時鐘：「快關店了，這會兒時間不夠玩，改天早點來吧。」`,'hint'); return; }
    if (player.bossSatedDay === player.days) { addLog('😏 老闆今天已經被妳伺候到爽夠了，擺擺手沒了興致。','hint'); return; }
    if (player.discountAttemptDay === player.days) { addLog('🚫 老闆今天已經陪妳玩過一回了，明天再來吧。','hint'); return; }
    actionRef.current = true;
    const traffic = getFootTrafficValue(player.timeMinutes) ?? 0;
    addLog('💋 ' + pick(SCENE_TEXTS.shopAskService).replace(/{BOSS}/g, SHOPKEEPER_NAME).replace(/{SVC}/g, svc.label), 'hint');
    const pay = rollPay(svc, traffic);
    setBossOffer({ svc, mode:'pay', pay, traffic });
    addLog('🧔 ' + pick(SCENE_TEXTS.shopBossPayOffer).replace(/{BOSS}/g, SHOPKEEPER_NAME).replace(/{PAY}/g, String(pay)), 'good');
    actionRef.current = false;
  };
  // step 2a：柯妤潔答應老闆開的價/折扣 → 進入服務（四次判定），用掉今日機會
  const doAcceptOffer = () => {
    if (actionRef.current || !bossOffer) return;
    actionRef.current = true;
    setBossService({ ...bossOffer, step:0 });
    setPlayer(p=>({...p, discountAttemptDay:p.days}));
    setBossOffer(null);
    actionRef.current = false;
  };
  // step 2b：柯妤潔嫌不划算/太少 → 拒絕，用掉今日機會
  const doDeclineOffer = () => {
    if (actionRef.current || !bossOffer) return;
    actionRef.current = true;
    const pool = bossOffer.mode==='pay' ? SCENE_TEXTS.shopDeclinePay : SCENE_TEXTS.shopDeclineOffer;
    setPlayer(p=>({...p, discountAttemptDay:p.days}));
    addLog('🙅 ' + pick(pool).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'hint');
    setBossOffer(null);
    actionRef.current = false;
  };
  // step 3：一次判定（共四次，每次獨立）。成功→繼續/完成給獎；失敗(中斷)或體力不足(喊累)→無獎
  const doServiceStep = () => {
    if (actionRef.current || !bossService) return;
    actionRef.current = true;
    const bs = bossService, svc = bs.svc;
    // 體力 <20% → 柯妤潔主動喊累放棄，老闆不爽、不給獎
    if (player.hp < player.baseHp * 0.2) {
      addLog('🥵 ' + pick(SCENE_TEXTS.shopServiceTapout[svc.key]).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'bad');
      addLog(`🧔 老闆 ${SHOPKEEPER_NAME} 沒能盡興，不滿地哼了一聲：「半途而廢，這可不算數。」柯妤潔這次拿不到${bs.mode==='pay'?'報酬':'折扣'}。`, 'hint');
      setBossService(null);
      actionRef.current = false;
      return;
    }
    const traffic = getFootTrafficValue(player.timeMinutes) ?? 0;
    const pass = Math.random() < judgePassChance(svc, traffic);
    const stepTime = Math.max(2, Math.round((svc.time||12)/4));
    setPlayer(p=>addMinutes({...p, hp:Math.max(0, p.hp-(svc.hp||0))}, stepTime));   // 每次判定都扣體力(比照娼院前戲)+耗時
    if (!pass) {   // 客人走近被迫中斷（非柯妤潔主動）→ 按已完成進度照比例給獎
      addLog('🚶 ' + pick(SCENE_TEXTS.shopServiceInterrupt).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'bad');
      if (bs.step > 0) {
        const ratio = bs.step / 4;
        if (bs.mode === 'pay') {
          const partial = Math.max(5, Math.round((bs.pay*ratio)/5)*5);
          setPlayer(p=>({...p, gold:p.gold+partial}));
          addLog(`💰 雖然中途被客人打斷，老闆還是按柯妤潔伺候的程度付了她 ${partial}G。`, 'gold');
        } else {
          const partialOff = Math.max(0.05, Math.round(bs.off*ratio*20)/20);
          setShopDiscount(d=>Math.max(d, partialOff));
          addLog(`💳 雖然中途被客人打斷，老闆還是按柯妤潔伺候的程度給了她結帳打 ${formatZhe(partialOff)} 折。`, 'gold');
        }
      } else {
        addLog('還沒進入狀況就被客人打斷，這次什麼也沒拿到。', 'hint');
      }
      setBossService(null);
      actionRef.current = false;
      return;
    }
    // 成功：輸出本級文本（越後越激烈）
    addLog('💋 ' + pick(SCENE_TEXTS.shopService[svc.key][bs.step]).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'story');
    if (bs.step + 1 >= 4) {   // 第四次成功 → 老闆射精(露胸不射但滿足)、給完整獎勵
      if (bs.mode === 'pay') {
        setPlayer(p=>({...p, gold:p.gold+bs.pay}));
        addLog(`💰 老闆 ${SHOPKEEPER_NAME} 爽到不行，心滿意足地付給柯妤潔 ${bs.pay}G。`, 'gold');
      } else {
        setShopDiscount(d => Math.max(d, bs.off));
        addLog(`💳 老闆 ${SHOPKEEPER_NAME} 爽到不行，給柯妤潔結帳打 ${formatZhe(bs.off)} 折，省 ${Math.round(bs.off*100)}%。`, 'gold');
      }
      setBossService(null);
    } else {
      setBossService({ ...bs, step: bs.step + 1 });
    }
    actionRef.current = false;
  };
  // ── 離開商店 / 竊盜 ───────────────────────────────────────────────
  // 統一離店：清空購物籃/折扣/竊盜狀態，回街道
  const leaveShop = () => {
    setCart([]); setShopDiscount(0); setBossOffer(null); setBossService(null); setTheftPhase(null); setMeatFailed(false);
    setPlayer(p=>({...p, shopSessionOpen:false}));
    setGs('street');
  };
  // 點離開：購物籃空→直接離店；有東西→跳竊盜警告（防誤點）
  const doLeaveShop = () => {
    if (cart.length > 0) { setTheftPhase('warn'); return; }
    leaveShop();
  };
  const doReturnAndLeave = () => {
    addLog('🛒 柯妤潔把購物籃裡的東西一一放回架上，空手離開了商店。', 'hint');
    leaveShop();
  };
  // 竊盜判定：成功率 = 人流/100 × 0.4（人越多越不易被發現，上限 40%、不可當賺錢手段）
  const doAttemptTheft = () => {
    if (actionRef.current || cart.length === 0) return;
    actionRef.current = true;
    const closed = getFootTrafficValue(player.timeMinutes) === null;
    const traffic = getFootTrafficValue(player.timeMinutes) ?? 0;
    const chance = Math.min(0.4, traffic/100 * 0.4);
    // 打烊後店內空無一人，沒人潮掩護 → 必定被逮（成功率 0）
    if (!closed && Math.random() < chance) {
      const ids = cart.map(i=>i.id);
      const names = cart.map(i=>i.name).join('、');
      setPlayer(p=>{
        const newProg = {...(p.shopProgress||{})};
        cart.forEach(i=>{ newProg[i.slot] = (newProg[i.slot]||0)+1; });
        const newWardrobe = [...p.wardrobe, ...ids];
        setTimeout(()=>setShop(makeShop(newWardrobe, newProg)),0);
        return {...p, wardrobe:newWardrobe, shopProgress:newProg};
      });
      addLog('🥷 ' + pick(SCENE_TEXTS.shopTheftSuccess).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'good');
      addLog(`🛍 柯妤潔無償得到了：${names}`, 'gold');
      actionRef.current = false;
      leaveShop();
    } else {
      addLog('🚨 ' + pick(SCENE_TEXTS.shopTheftCaught).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'bad');
      setTheftPhase('caught');
      actionRef.current = false;
    }
  };
  // 被逮後賠償：付購物籃總價 50%，商品歸還貨架、脫身
  const theftFine = () => Math.ceil(cart.reduce((s,i)=>s+i.price,0) * 0.5);
  const doCompensate = () => {
    if (actionRef.current) return;
    const fine = theftFine();
    if (player.gold < fine) { addLog(`💰 金幣不足以賠償（需 ${fine}G）。`, 'bad'); return; }
    actionRef.current = true;
    setPlayer(p=>({...p, gold:p.gold-fine}));
    addLog('💸 ' + pick(SCENE_TEXTS.shopTheftCompensate).replace(/{BOSS}/g, SHOPKEEPER_NAME).replace(/{FINE}/g, String(fine)), 'gold');
    addLog(`🛒 購物籃的商品被收回貨架，柯妤潔賠了 ${fine}G 後脫身。`, 'hint');
    actionRef.current = false;
    leaveShop();
  };
  // 肉償：柯妤潔暗示用身體抵償 → 依魅惑度判定。
  //   失敗：老闆拒絕、堅持賠錢（隱藏肉償鈕，只剩賠償/警局）。
  //   成功：商品歸還、自動進入平時不開放的「休息區」（玩法同娼館）。
  const doMeatCompensate = () => {
    if (actionRef.current) return;
    actionRef.current = true;
    addLog('💋 ' + pick(SCENE_TEXTS.shopMeatOffer).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'story');
    const charm = calcCharm(player).total;
    if (Math.random() < meatCompChance(charm)) {
      addLog(`💋 老闆 ${SHOPKEEPER_NAME} 嚥了口口水，鬆開手、把柯妤潔往店內深處帶去……`, 'good');
      addLog('🚪 平時不對外開放的【休息區】，今天為了肉償破例打開了。', 'hint');
      setCart([]);                  // 購物籃商品歸還貨架
      setShopDiscount(0); setBossOffer(null); setTheftPhase(null); setMeatFailed(false);
      setEnemy(null);
      setGs('restArea');            // 進入休息區（玩法同娼館）
      actionRef.current = false;
    } else {
      addLog('🙅 ' + pick(SCENE_TEXTS.shopMeatRefuse).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'bad');
      setMeatFailed(true);         // 肉償失敗，老闆堅持賠錢
      actionRef.current = false;
    }
  };
  // 休息區：開始/繼續肉償（生成老闆作為客人，玩法同娼館；接客鈕→肉償）
  const doMeatService = () => {
    if (enemy) return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const e = genBoss(player);
    addSep();
    addLog(formatText(pick(SCENE_TEXTS.shopRestEntry), e.name, 0, bustDesc(), hipsDesc()), 'story');
    e.entryClothes = {...player.clothes};
    setEnemy(e);
    actionRef.current = false;
  };
  // 關店後做愛：無購物籃時，老闆今天沒做過任何服務→100%同意，進休息區娼館式做愛（會付錢、可戴套）
  const doBossDate = () => {
    if (enemy || leavingRef.current || actionRef.current) return;
    if (player.discountAttemptDay === player.days || player.bossSatedDay === player.days) {
      addLog(`😪 老闆 ${SHOPKEEPER_NAME} 打了個哈欠：「今天忙了一整天，老骨頭沒力氣囉，改天再陪妳玩。」`, 'hint');
      return;
    }
    actionRef.current = true;
    const e = genBossDate(player);
    addSep();
    addLog('🌙 ' + formatText(pick(SCENE_TEXTS.shopDateEntry), e.name, 0, bustDesc(), hipsDesc()), 'story');
    e.entryClothes = {...player.clothes};
    setPlayer(p=>({...p, bossSatedDay:p.days}));   // 標記今天老闆已服務（不再答應其他）
    setEnemy(e);
    setGs('restArea');
    actionRef.current = false;
  };
  // 拒絕賠償 → 送警局：當下商品即歸還，隨後強制關押 48 小時
  const doGotoJail = () => {
    if (actionRef.current) return;
    actionRef.current = true;
    addLog('🚓 ' + pick(SCENE_TEXTS.shopTheftJail).replace(/{BOSS}/g, SHOPKEEPER_NAME), 'bad');
    addLog('🛒 購物籃的商品當場全數歸還商店。', 'hint');               // 送辦當下即歸還
    addLog('🔒 柯妤潔被帶回派出所，依竊盜送辦、強制留置 48 小時無法離開。', 'bad');
    setPlayer(p=>addMinutes({...p}, 48*60));   // 隨後推進 48 小時
    actionRef.current = false;
    leaveShop();
  };
  // 櫃台結帳：一次付清購物籃，套用老闆折扣，扣款並入手
  const doCheckout = () => {
    if (actionRef.current) return;
    if (cart.length === 0) { addLog('🛒 購物籃是空的。','hint'); return; }
    // 已打烊：收銀機關了，強制取消交易、商品收回，不扣錢
    if (getFootTrafficValue(player.timeMinutes) === null) {
      addLog(`🔒 老闆 ${SHOPKEEPER_NAME} 攤手：「不好意思妹妹，到關店時間了，收銀機都關起來囉，這些東西改天再買吧。」`, 'bad');
      addLog('🛒 未結帳的商品被收回貨架，交易取消（沒有扣款）。', 'hint');
      setCart([]);
      setShopDiscount(0);
      return;
    }
    const raw = cart.reduce((s,i)=>s+i.price, 0);
    const total = Math.round(raw * (1 - shopDiscount));
    if (player.gold < total) { addLog(`💰 金幣不足，結帳需 ${total}G。`,'bad'); return; }
    actionRef.current = true;
    const ids = cart.map(i=>i.id);
    const names = cart.map(i=>i.name).join('、');
    setPlayer(p=>{
      const newProg = {...(p.shopProgress||{})};
      cart.forEach(i=>{ newProg[i.slot] = (newProg[i.slot]||0)+1; });
      const newWardrobe = [...p.wardrobe, ...ids];
      setTimeout(()=>setShop(makeShop(newWardrobe, newProg)),0);
      return {...p, gold:p.gold-total, wardrobe:newWardrobe, shopProgress:newProg};
    });
    addLog(`💳 結帳：${names}（-${total}G${shopDiscount>0?`，已折 ${Math.round(shopDiscount*100)}%`:''}）`,'gold');
    setCart([]);
    setShopDiscount(0);
    actionRef.current = false;
  };
  const doBuyCondom = () => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    if ((player.shopCondomsLeft||0) <= 0) {
      addLog('🛡 保險套已售完，明天再來。','bad');
      actionRef.current = false;
      return;
    }
    if (player.gold < CONDOM_PRICE) {
      addLog('💰 金幣不足。','bad');
      actionRef.current = false;
      return;
    }
    const newRemain = Math.max(0,(player.shopCondomsLeft||0)-1);
    setPlayer(p=>({...p, gold:p.gold-CONDOM_PRICE, condoms:p.condoms+1, shopCondomsLeft:newRemain}));
    addLog(`🛡 購買保險套 -${CONDOM_PRICE}G（剩餘庫存：${newRemain}）`,'good');
    actionRef.current = false;

  };


  // ─────────────────────────────────────────────────────────────────
  // 22.6 衣物動作 — doEquip / doUnequip
  // ─────────────────────────────────────────────────────────────────
  const doEquip = (slot, item) => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    setPlayer(p=>({...p, clothes:{...p.clothes,[slot]:item}}));
    addLog(`👗 穿上了【${item.name}】。`,'hint');
    actionRef.current = false;

  };
  const doUnequip = (slot) => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const item = player.clothes[slot];
    if (!item) {
      actionRef.current = false;
      return;
    }
    const newClothes = {...player.clothes, [slot]:null};
    const revealDesc = getRevealDesc({...player, clothes:newClothes}, slot);
    const revealPart = revealDesc ? `，露出了${revealDesc}` : '';
    setPlayer(p=>({...p, clothes:newClothes}));
    addLog(`👗 柯妤潔脫下了【${item.name}】${revealPart}。`,'undress');
    actionRef.current = false;

  };

  // ─────────────────────────────────────────────────────────────────
  // 22.7 裝飾動作 — doBuyPiercing / doTattoo / doTrimHair
  // ─────────────────────────────────────────────────────────────────
  const doBuyPiercing = (loc) => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const price = PIERCING_PRICES[loc];
    if (player.gold < price) {
      addLog('💰 金幣不足。','bad');
      actionRef.current = false;
      return;
    }
    setPlayer(p=>addMinutes({...p, gold:p.gold-price, piercings:{...p.piercings,[loc]:true}},30));
    addLog(`✂️ 完成了${PIERCING_NAMES[loc]}穿洞（-${price}G，耗時30分鐘）。`,'good');
    actionRef.current = false;

  };

  // ── 刺青 ─────────────────────────────────────────────────
  const doTattoo = () => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const {loc,size,content} = tattooDraft;
    if (!loc||!size||!content) {
      actionRef.current = false;
      return;
    }
    const price = TATTOO_SIZES[size].price;
    if (player.gold < price) {
      addLog('💰 金幣不足。','bad');
      actionRef.current = false;
      return;
    }
    // 取代限制：只能用更大的尺寸取代，同級或更小不能蓋
    const existing = player.tattoos[loc];
    if (existing) {
      const existingRank = TATTOO_SIZES[existing.size]?.rank || 0;
      const newRank      = TATTOO_SIZES[size]?.rank || 0;
      if (newRank <= existingRank) {
        addLog(`❌ ${TATTOO_LOCS[loc]}已有【${existing.content}】（${TATTOO_SIZES[existing.size]?.name}），只能用更大的刺青取代。`,'bad');
        actionRef.current = false;
        return;
      }
    }
    setPlayer(p=>addMinutes({...p, gold:p.gold-price, tattoos:{...p.tattoos,[loc]:{size,content}}},180));
    const replaceMsg = existing ? `取代了【${existing.content}】，在` : '在';
    addLog(`🎨 ${replaceMsg}${TATTOO_LOCS[loc]}刺上了【${content}】（-${price}G，耗時180分鐘）。`,'good');
    setTattooDraft({loc:'',size:'',content:''});
    actionRef.current = false;
  };

  // ── 修剪體毛 ─────────────────────────────────────────────
  const doTrimHair = (part, targetLevel) => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const currentLv = player.bodyHair?.[part] ?? 1;
    if (targetLevel >= currentLv) {
      addLog('❌ 只能往低修剪。', 'bad');
      actionRef.current = false;
      return;
    }
    if (player.gold < HAIR_TRIM_PRICE) {
      addLog('💰 金幣不足。', 'bad');
      actionRef.current = false;
      return;
    }
    const partName = HAIR_PART_NAMES[part];
    const targetName = HAIR_LEVELS[targetLevel];
    setPlayer(p => addMinutes({
      ...p,
      gold: p.gold - HAIR_TRIM_PRICE,
      bodyHair: { ...(p.bodyHair||{}), [part]: targetLevel },
      bodyHairTrimDay: { ...(p.bodyHairTrimDay||{}), [part]: p.days },  // 重置成長計時
    }, 15));
    addLog(`✂️ 修剪了【${partName}】至【${targetName}】（-${HAIR_TRIM_PRICE}G，耗時15分鐘）。`, 'good');
    actionRef.current = false;
  };

  // ─────────────────────────────────────────────────────────────────
  // 22.8 系統動作 — doSave / doLoad / doDeleteSave
  // ─────────────────────────────────────────────────────────────────
  const doSave = (slot) => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    try {
      const data = {version:SAVE_VERSION, player, enemy, logs:logs.slice(-50)};
      localStorage.setItem(SAVE_KEY(slot), JSON.stringify(data));
      addLog(`💾 已存入 ${slot}。`,'good');
    } catch {
      // localStorage 寫入可能失敗（沙箱被擋/容量滿）；務必還原 actionRef，否則之後動作會被鎖死
      addLog('❌ 存檔失敗（瀏覽器空間不足或被封鎖）。可改用「📤 匯出目前進度」自行保存。','bad');
    } finally {
      actionRef.current = false;
    }
  };
  // 存檔升級：未來破壞性結構改動的單一擴充點。目前以 INITIAL_PLAYER 補齊舊檔缺漏欄位（向後相容）
  const migrateSave = (data) => ({
    fromVersion: data.version,
    player: {...INITIAL_PLAYER, ...(data.player||{})},
    enemy: data.enemy || null,
    // 載入舊存檔時，順手把日誌裡殘留的舊遊戲名「百層塔」更新成現名（避免舊歡迎詞露出）
    logs: (data.logs && data.logs.length>0)
      ? data.logs.map(e => typeof e === 'string'
          ? e.replace(/百層塔/g, '柯妤潔的娼館')
          : (e && e.msg ? {...e, msg: e.msg.replace(/百層塔/g, '柯妤潔的娼館')} : e))
      : [{msg:'歡迎來到柯妤潔的娼館。',tag:'hint'}],
  });
  // 把（已升級的）存檔套用到遊戲狀態
  const applySave = (data) => {
    const s = migrateSave(data);
    setPlayer(s.player);
    setEnemy(s.enemy);
    setLogs(s.logs);
    setGs('explore');
    if (s.fromVersion !== SAVE_VERSION) {
      addLog(`ℹ️ 存檔版本 ${s.fromVersion ?? '未知'}（目前 v${SAVE_VERSION}），已自動相容升級。`, 'hint');
    }
  };
  const doLoad = (slot) => {
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY(slot)));
      if (!data) { addLog('❌ 無存檔資料。','bad'); return; }
      applySave(data);
      addLog('📂 讀取存檔成功。','good');
    } catch {
      addLog('❌ 讀取失敗。','bad');
    } finally {
      actionRef.current = false;
    }
  };
  const doDeleteSave = (slot) => {
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    localStorage.removeItem(SAVE_KEY(slot));
    addLog(`🗑 已刪除 ${slot}。`,'hint');
    actionRef.current = false;

  };
  // 匯出/匯入：把進度序列化成文字，不依賴 localStorage 持久化（跨裝置/沙箱用）
  const doExportCurrent = () => JSON.stringify({version:SAVE_VERSION, player, enemy, logs:logs.slice(-50)});
  const doImportText = (str) => {
    if (!str) return false;
    try {
      const data = JSON.parse(str);
      if (!data || !data.player) return false;
      applySave(data);
      addLog('📥 已從匯入字串載入進度。','good');
      return true;
    } catch {
      return false;
    }
  };

  // ── 送客 ──────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────
  // 22.9 服務動作 — 送客 / 淫語 / 勾引 / 前戲 / 清潔口交
  // ─────────────────────────────────────────────────────────────────

  // 體毛喜好命中：每個動作開頭呼叫，命中時 +60 性奮並標記下次 orgasm 跳過
  // 回傳 true 表示這次有命中（呼叫端可選擇不再做別的事）
  const triggerHairPrefHit = () => {
    if (!enemy) return false;
    if (enemy.hairPrefSatisfied) return false;
    const part = enemy.hairPref?.part;
    if (!part) return false;
    if (!enemyCanSeeHair(player, part)) return false;
    const currentLevelKey = HAIR_LEVEL_KEYS[player.bodyHair?.[part] ?? 1];
    if (currentLevelKey !== enemy.hairPref.level) return false;
    // 命中！
    const pool = HAIR_PREF_HIT_TEXTS[part]?.[currentLevelKey] || [];
    if (pool.length > 0) {
      const tpl = pick(pool);
      const text = formatText(tpl, enemy.name, 0, bustDesc(), hipsDesc());
      addLog(text, 'sex');
    }
    setEnemy(e => {
      const newArousal = Math.min(200, (e.arousal||0) + 60);
      return {
        ...e,
        arousal: newArousal,
        maxArousal: Math.max(e.maxArousal||0, newArousal),
        hairPrefSatisfied: true,
      };
    });
    return true;
  };

  const doSendOff = () => {
    addSep();
    if (!enemy) return;
    if (leavingRef.current) return; // 防重複觸發
    leavingRef.current = true;
    // 關店做愛：柯妤潔主動喊停（沒力了），老闆不付錢，回店門口
    if (enemy.isBossDate) {
      addLog(`💋 柯妤潔嬌喘著推開老闆 ${enemy.name}：「坤哥～人家真的沒力氣了，今天就到這吧……」她意猶未盡地理好凌亂的衣服。`, 'story');
      addLog('💢 柯妤潔主動喊停離開，老闆沒能盡興，這場沒有半毛錢。', 'bad');
      const restored = enemy.entryClothes || player.clothes;
      setPlayer(p=>({...p, clothes:restored, semenStains: p.semenStains || {}}));
      addLog('柯妤潔整理了一下儀容。','hint');
      setShopArea('lobby'); setGs('shop');
      leavingRef.current = false; setEnemy(null);
      setShowForeplayMenu(false); setShowSexMenu(false); setShowRestMenu(false);
      return;
    }
    const dismissP = pick(SCENE_TEXTS.roomDismissPlayer);
    const dismissE = formatText(pick(SCENE_TEXTS.roomDismissEnemy), enemy.name, 0, bustDesc(), hipsDesc());
    addLog(dismissP, 'story');
    addLog(dismissE, 'story');
    // 穿衣文本（房間/浴室）
    if (gs==='bathroom') {
      addLog(formatText(pick(SCENE_TEXTS.bathDismiss), enemy.name, 0,'',''), 'story');
      addLog(pick(SCENE_TEXTS.bathReturnAlone).replace(/{E}/g, enemy.name), 'story');
    } else {
      addLog(formatText(pick(SCENE_TEXTS.roomDismissDress), enemy.name, 0,'',''), 'story');
    }
    addLog('💢 客人憤怒離場，不付任何費用。','bad');
    // 衣物恢復（浴室版不恢復 vagina/anal 污漬）
    const dismissRestored = enemy.entryClothes || player.clothes;
    // 柯妤潔穿衣 log（比對哪些 slot 被脫過）
    const putBackSlots = Object.keys(dismissRestored).filter(slot=>
      dismissRestored[slot] && dismissRestored[slot] !== player.clothes[slot]
    );
    if (putBackSlots.length > 0) {
      const names = putBackSlots.map(slot=>dismissRestored[slot].name).join('、');
      addLog(`柯妤潔默默把${names}穿上，整理了一下儀容。`,'hint');
    } else {
      addLog(`柯妤潔整理了一下儀容。`,'hint');
    }
    setPlayer(p=>({...p,
      clothes:dismissRestored,
      semenStains: p.semenStains || {},
    }));
    if (gs==='bathroom') setGs('explore');
    leavingRef.current = false;
    setEnemy(null);
    setShowForeplayMenu(false);
    setShowSexMenu(false);
    setShowRestMenu(false);

  };

  // ── 淫語 ──────────────────────────────────────────────────
  const doChat = () => {
    addSep();
    if (!enemy) return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    // 1. 計算數值
    const arousalGain = 15+Math.floor(Math.random()*10);
    const newArousal = Math.min(200, (enemy.arousal||0)+arousalGain);
    const orgasmChance = calcOrgasmChance(calcEffectiveArousal({...enemy,arousal:newArousal}, calcCharm(player).total), 0.15);
    const didOrgasm = Math.random() < orgasmChance*0.3;
    let vol=0, newVol=enemy.semenVolume;
    if (didOrgasm) ({vol, newVol} = calcOrgasmOutput(enemy.semenVolume, newArousal, enemy.tierIdx||0));
    const revealsPreference = !enemy.revealedPreference && Math.random()<0.3;
    // 2. 選文本並輸出
    const arr = gs==='bathroom' ? SCENE_TEXTS.bathChat : bossPool(enemy,'roomChat');
    const tpl = pick(arr);
    const text = formatText(tpl, enemy.name, vol, bustDesc(), hipsDesc());
    addLog(text, 'chat');
    if (didOrgasm) {
      const orgText = formatText(pick(bossPool(enemy,'roomChatOrgasm')), enemy.name, vol, bustDesc(), hipsDesc());
      addLog(orgText, 'sex');
    }
    if (revealsPreference) {
      addLog(`💡 ${enemy.name}的反應透露出他偏好【${SERVICE_NAMES[enemy.preference]||''}】和【${enemy.mainActPref==='vagina'?'小穴':'肛門'}】。`,'hint');
    }
    // 3. 更新 state
    // 淫語觸發射精：客人自行失控，精液不碰到柯妤潔，不留污漬
    // 射精時客人額外消耗 vol*2 的體力（與服務消耗獨立）
    const orgasmEnemyHpCost = didOrgasm ? vol * 2 : 0;
    setPlayer(p=>addMinutes(p,5));
    setEnemy(e=>({...e,
      hp: Math.max(0, e.hp - orgasmEnemyHpCost),
      arousal: didOrgasm ? Math.ceil(newArousal*0.25) : newArousal,
      maxArousal: Math.max(e.maxArousal||0, newArousal),
      semenVolume: newVol,
      revealedPreference: revealsPreference ? true : e.revealedPreference,
      semenDepleted: didOrgasm && newVol<=0 ? true : e.semenDepleted,
    }));
    // 精液耗盡或敵人體力歸零觸發
    resolvePriority({
      didOrgasm, newVol,
      enemyHpAfter: enemy.hp - orgasmEnemyHpCost,
      timeNowAfter: (player.timeMinutes + 5) + player.days*1440,
    });
    actionRef.current = false;

  };
  // ── 勾引 ──────────────────────────────────────────────────
  const doSeduce = () => {
    addSep();
    if (!enemy) return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    // 1. 計算數值
    const arousalGain = 20+Math.floor(Math.random()*15);
    const newArousal = Math.min(200, (enemy.arousal||0)+arousalGain);
    const orgasmChance = calcOrgasmChance(calcEffectiveArousal({...enemy,arousal:newArousal}, calcCharm(player).total), 0.25);
    const didOrgasm = Math.random() < orgasmChance*0.4;
    let vol=0, newVol=enemy.semenVolume;
    if (didOrgasm) ({vol, newVol} = calcOrgasmOutput(enemy.semenVolume, newArousal, enemy.tierIdx||0));
    // 2. 選文本並輸出
    const arr = gs==='bathroom' ? SCENE_TEXTS.bathSeduce : bossPool(enemy,'roomSeduce');
    const tpl = pick(arr);
    const text = tpl
      .replace(/{E}/g, enemy.name)
      .replace(/{HIPS}/g, hipsDesc())
      .replace(/{BUST}/g, bustDesc());
    addLog(text, 'sex');
    if (didOrgasm) {
      const orgText = formatText(pick(bossPool(enemy,'roomSeduceOrgasm')), enemy.name, vol, bustDesc(), hipsDesc());
      addLog(orgText, 'sex');
    }
    // 3. 更新 state
    // 勾引觸發射精：客人自行失控，精液不碰到柯妤潔，不留污漬
    // 射精時客人額外消耗 vol*2 的體力（與服務消耗獨立）
    const orgasmEnemyHpCost = didOrgasm ? vol * 2 : 0;
    setPlayer(p=>({...addMinutes(p,10), hp:Math.max(0,p.hp-3)}));
    setEnemy(e=>({...e,
      hp: Math.max(0, e.hp - orgasmEnemyHpCost),
      arousal: didOrgasm ? Math.ceil(newArousal*0.25) : newArousal,
      maxArousal: Math.max(e.maxArousal||0, newArousal),
      semenVolume: newVol,
      semenDepleted: didOrgasm && newVol<=0 ? true : e.semenDepleted,
    }));
    resolvePriority({
      didOrgasm, newVol,
      enemyHpAfter: enemy.hp - orgasmEnemyHpCost,
      playerHpAfter: player.hp - 3,
      timeNowAfter: (player.timeMinutes + 10) + player.days*1440,
    });
    actionRef.current = false;

  };
  // ── 前戲 ──────────────────────────────────────────────────
  // 清潔口交：射精後50%觸發，固定25G，不影響性奮度，在退場前執行
  const resolveCleanupFellatio = (didOrgasm) => {
    if (!didOrgasm) return 0;
    if (Math.random() >= 0.5) return 0;
    const cleanupCharge = FOREPLAY_FEE.mouth;
    const cleanupPool = (gs==='bathroom') ? SCENE_TEXTS.bathCleanupFellatio : SCENE_TEXTS.roomCleanupFellatio;
    addLog(pick(cleanupPool).replace(/{E}/g, enemy?.name||''), 'sex');
    // 清潔口交費用累積至 accumulatedFee，離場結算
    setEnemy(e=>({...e, accumulatedFee:(e.accumulatedFee||0)+cleanupCharge}));
    return cleanupCharge;
  };

    const doForeplay = (type) => {
    addSep();
    if (!enemy) return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const isBath = gs==='bathroom';
    // 成功率
    const baseRate = {hand:0.90,mouth:0.85,boob:0.80,butt:0.75,leg:0.85}[type]||0.80;
    const decayRate = Math.max(0, enemy.foreplayCount*0.05);
    const profBonus = Math.min(0.30, (player.prof[type]||0)*0.003);
    const charmBonus = Math.min(0.15, calcCharm(player).total*0.001);
    const finalRate = enemy.foreplayCount===0 ? 1.0 : Math.min(0.98, baseRate - decayRate + profBonus + charmBonus);
    if (Math.random() > finalRate) {
      const rejectTpl = pick(bossPool(enemy,'roomForeplayReject')).replace(/{E}/g, enemy.name);
      addLog(rejectTpl, 'bad');
      const hole = enemy.mainActPref || 'vagina';
      if (enemy.isBoss) {
        // 老闆一律無套，拒絕前戲後直接進入做愛（不問保險套）
        const pool = hole==='vagina' ? bossPool(enemy,'roomNoCondomVagina') : bossPool(enemy,'roomNoCondomAnal');
        addLog(pick(pool).replace(/{E}/g, enemy.name), 'story');
        setEnemy(e=>({...e, foreplayRejected:true, phase:'sex', pendingHole:hole, condomEquipped:false, condomMode:'without'}));
      } else {
        // 客人急著做愛、拒絕繼續前戲 → 直接進入保險套詢問（做愛）
        addLog(`⚠️ ${enemy.name}要求直接進入【${hole==='vagina'?'小穴':'肛門'}】。`,'hint');
        setEnemy(e=>({...e, foreplayRejected:true, phase:'condomAsk', pendingHole:hole}));
      }
      setShowForeplayMenu(false);
      actionRef.current = false;
      return;
    }
    // 脫衣（按層級順序，先脫外層再脫內層）
    let newClothes = {...player.clothes};
    const savedUndress = {...(enemy.undressedDuringForeplay||{})};
    const undressLogs = [];
    // 決定要脫哪幾層
    let slotsToRemove = [];
    if (type==='boob') {
      if (newClothes.top)     slotsToRemove.push('top');
      if (newClothes.bra)     slotsToRemove.push('bra');
    } else if (type==='butt' || type==='leg') {
      if (newClothes.bottom)  slotsToRemove.push('bottom');
      if (newClothes.panties) slotsToRemove.push('panties');
    } else {
      const s = SERVICE_TO_CLOTHING[type];
      if (s && newClothes[s]) slotsToRemove.push(s);
    }
    for (const slot of slotsToRemove) {
      if (!newClothes[slot]) continue;
      const item = newClothes[slot];
      savedUndress[slot] = item;
      newClothes[slot] = null;
      const revealDesc = getRevealDesc({...player, clothes:newClothes}, slot);
      const revealPart = revealDesc ? `，露出了${revealDesc}` : '';
      undressLogs.push(`👗 柯妤潔脫下了【${item.name}】${revealPart}。`);
    }
    // 體毛喜好命中（脫衣後立即檢查）
    const tempPlayerForHair = {...player, clothes:newClothes};
    const hairPart = enemy.hairPref?.part;
    let hairHitJustNow = false;
    if (!enemy.hairPrefSatisfied && hairPart && enemyCanSeeHair(tempPlayerForHair, hairPart)) {
      const lvKey = HAIR_LEVEL_KEYS[player.bodyHair?.[hairPart] ?? 1];
      if (lvKey === enemy.hairPref.level) {
        hairHitJustNow = true;
      }
    }
    // 傷害
    const baseDmg = FOREPLAY_DMG[type]||{player:8,enemy:15};
    const playerDmgMult = calcProfDmgMult(player.prof[type]||0) * dmgVariance();
    const enemyDmgMult  = calcEnemyDmgMult(player.prof[type]||0) * dmgVariance();
    const playerDmg = Math.round(baseDmg.player*playerDmgMult);
    const enemyDmg  = Math.round(baseDmg.enemy*enemyDmgMult);
    // 費用
    const feeBase = FOREPLAY_FEE[type]||15;
    // 同部位只收一次：若已收過此部位則 charge=0
    const loc = gs==='bathroom'?'bath':'room';
    const alreadyChargedFP = (enemy.chargedServices||[]).some(s=>s.type===type&&s.isForeplay&&s.location===loc);
    const isPrefMatch = enemy.revealedPreference && enemy.preference===type;
    const prefMult = isPrefMatch ? 1.2 : 1.0;
    const charge = alreadyChargedFP ? 0 : Math.ceil(calcServiceCharge(feeBase, player.prof[type]||0) * prefMult);
    // 性奮度
    const arousalGain = Math.ceil(calcArousalGain(type, player.prof[type]||0) * prefMult);
    // 體毛喜好命中時額外 +60
    const hairBonus = hairHitJustNow ? 60 : 0;
    const newArousal = Math.min(200, (enemy.arousal||0)+arousalGain+hairBonus);
    // 射精判定
    const effArousal = calcEffectiveArousal({...enemy,arousal:newArousal}, calcCharm(player).total);
    const didOrgasm = Math.random() < calcOrgasmChance(effArousal, 0.35);
    let vol=0, newVol=enemy.semenVolume;
    if (didOrgasm) {
      ({vol,newVol} = calcOrgasmOutput(enemy.semenVolume, newArousal, player.prof[type]||0));
    }
    const didSwallow = didOrgasm && Math.random()<0.5;
    // 文本
    const textPool = isBath ? SCENE_TEXTS.bathForeplay : (enemy.isBoss ? SCENE_TEXTS.shopRestForeplay : (enemy.isBossDate && SCENE_TEXTS.shopDateForeplay ? SCENE_TEXTS.shopDateForeplay : SCENE_TEXTS.roomForeplay));
    let tpl;
    if (didOrgasm) {
      if (type === 'mouth') {
        // 口交例外：吞=射嘴裡當場吞、不吞=退出射臉，兩種射精動作本質不同，維持 swallow/spill 兩分支
        tpl = pick(textPool[type][didSwallow?'swallow':'spill']);
      } else {
        // 其餘部位：一律先走 spill（精液射在身上）；didSwallow(50%) 時再於結尾追加 swallowExtra（柯妤潔把身上精液舔起吞下）
        // bonus（體力恢復/污漬不累積等）一律由 didSwallow 驅動，與本路線無關、數量不變
        tpl = pick(textPool[type].spill);
        const extra = textPool[type].swallowExtra;
        if (didSwallow && extra && extra.length) tpl += pick(extra);
      }
    } else {
      const arousalPool = isBath ? SCENE_TEXTS.bathForeplayArousal : (enemy.isBoss ? SCENE_TEXTS.shopRestForeplayArousal : (enemy.isBossDate && SCENE_TEXTS.shopDateForeplayArousal ? SCENE_TEXTS.shopDateForeplayArousal : SCENE_TEXTS.roomForeplayArousal));
      tpl = pick(arousalPool[type]);
    }
    const text = formatText(tpl, enemy.name, vol, bustDesc(), hipsDesc());
    if (didSwallow) addLog(`柯妤潔吞下了 ${vol}ml 精液，體力值恢復 ${vol} 點。`, 'good');
    // 熟練度
    const {newProf} = gainProf(player.prof, type);
    // 更新
    undressLogs.forEach(l=>addLog(l,'undress'));
    if (isPrefMatch) addLog(`💡 ${enemy.name}對【${SERVICE_NAMES[enemy.preference]||type}】特別有反應。`,'hint');
    // 體毛喜好命中文本（先於主文本顯示）
    if (hairHitJustNow) {
      const pool = HAIR_PREF_HIT_TEXTS[hairPart]?.[HAIR_LEVEL_KEYS[player.bodyHair?.[hairPart] ?? 1]] || [];
      if (pool.length > 0) {
        const hairTpl = pick(pool);
        const hairText = formatText(hairTpl, enemy.name, 0, bustDesc(), hipsDesc());
        addLog(hairText, 'sex');
      }
    }
    addLog(text, 'sex');
    // 費用：不管射精與否都收，同部位只收一次
    // 前戲費用累積，離場結算
    const stainPart = {hand:'hand',mouth:'face',boob:'boob',butt:'butt',leg:'leg'}[type]||'hand';
    if (didOrgasm) {
      if (!didSwallow && gs!=='bathroom') addStainLog(stainPart, vol, addLog, player.semenStains);
    }
    addLog(`📈 ${enemy.name}性奮度上升`,'hint');
    // 清潔口交（射精後50%，退場前執行）
    const cleanupCharge = resolveCleanupFellatio(didOrgasm);
    const swallowHeal = didSwallow ? vol : 0;
    // 射精時客人額外消耗 vol*2 的體力（與服務消耗 enemyDmg 獨立計算）
    const orgasmEnemyHpCost = didOrgasm ? vol * 2 : 0;
    // 個人紀錄「人數」以客人為單位：同一客人此方式首次射精才 +1 人；喝精同理首次才 +1 人
    const firstThisType = didOrgasm && !(enemy.counted?.[type]);
    const firstDrink    = didSwallow && !(enemy.counted?.drink);
    setPlayer(p=>addMinutes({...p,
      hp:Math.min(p.baseHp, Math.max(0,p.hp-playerDmg) + swallowHeal),
      prof:newProf,
      clothes:newClothes,
      semenStains: didOrgasm&&!didSwallow ? {...(p.semenStains||{}), [stainPart]: ((p.semenStains||{})[stainPart]||0)+vol } : p.semenStains,
      record: didOrgasm ? bumpRecord(p.record, {countAct: firstThisType?type:null, semenAct:type, vol, drunk: didSwallow?vol:0, drunkPerson: firstDrink}) : p.record,
    }, 15));
    const newChargedServices = !alreadyChargedFP ? [...(enemy.chargedServices||[]), {type, vol, isForeplay:true, location:loc}] : enemy.chargedServices;
    setEnemy(e=>({...e,
      hp: Math.max(0, e.hp - enemyDmg - orgasmEnemyHpCost),
      arousal: didOrgasm ? Math.ceil(newArousal*0.25) : newArousal,
      maxArousal: Math.max(e.maxArousal||0, newArousal),
      semenVolume: didOrgasm ? newVol : e.semenVolume,
      semenDepleted: didOrgasm && newVol<=0 ? true : e.semenDepleted,
      foreplayCount:(e.foreplayCount||0)+1,
      undressedDuringForeplay:savedUndress,
      chargedServices: newChargedServices,
      accumulatedFee:(e.accumulatedFee||0)+(!alreadyChargedFP&&charge>0?charge:0),
      // 個人紀錄人數去重：標記此客人此方式已計過人數、是否已計過喝精
      counted: (didOrgasm||didSwallow) ? {...(e.counted||{}), ...(didOrgasm?{[type]:true}:{}), ...(didSwallow?{drink:true}:{})} : e.counted,
      // 體毛喜好系統：命中時設 satisfied
      hairPrefSatisfied: hairHitJustNow ? true : e.hairPrefSatisfied,
    }));
    resolvePriority({
      didOrgasm, newVol,
      enemyHpAfter: enemy.hp - enemyDmg - orgasmEnemyHpCost,
      playerHpAfter: player.hp - playerDmg + swallowHeal,
      timeNowAfter: (player.timeMinutes + 15) + player.days*1440,
    });
    actionRef.current = false;
  };

  // ── 邀請沐浴 ─────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────
  // 22.10 浴室動作 — 邀沐浴 / 浴室服務 / 自我清洗
  // ─────────────────────────────────────────────────────────────────
  const doBathInvite = () => {
    addSep();
    if (!enemy) return;
    if (enemy.bathLocked) return; // 被拒後鎖住
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const inviteText = formatText(pick(SCENE_TEXTS.bathInvite), enemy.name, 0, bustDesc(), hipsDesc());
    addLog(inviteText, 'chat');
    // 第一次70%，之後50%
    const inviteCount = enemy.bathInviteCount||0;
    const rejectChance = inviteCount===0 ? 0.30 : 0.50;
    setEnemy(e=>({...e, bathInviteCount:(e.bathInviteCount||0)+1}));
    if (Math.random()<rejectChance) {
      addLog(formatText(pick(SCENE_TEXTS.bathReject), enemy.name, 0,'',''), 'bad');
      setEnemy(e=>({...e, bathLocked:true}));
      actionRef.current = false;
      return;
    }
    addLog(formatText(pick(SCENE_TEXTS.bathAccept), enemy.name, 0,'',''), 'story');
    addLog('🛁 你們一起走向浴室……','hint');
    // 柯妤潔全身脫光（與單人洗澡脫衣邏輯相同：鞋→上著→內衣→下著→內褲→襪）
    const bathUndressSlots = ['shoes','top','bra','bottom','panties','socks'];
    const {logs:bathUndressLogs, newClothes:bathNewClothes} = buildUndressLogs(
      bathUndressSlots.filter(s=>player.clothes[s]), player.clothes, player
    );
    // 體毛喜好命中（一起進浴室、脫衣後立即觸發）
    const tempPlayerForHair = {...player, clothes:bathNewClothes};
    const hairPart = enemy.hairPref?.part;
    let hairHitJustNow = false;
    if (!enemy.hairPrefSatisfied && hairPart && enemyCanSeeHair(tempPlayerForHair, hairPart)) {
      const lvKey = HAIR_LEVEL_KEYS[player.bodyHair?.[hairPart] ?? 1];
      if (lvKey === enemy.hairPref.level) {
        hairHitJustNow = true;
      }
    }
    // 一次輸出：脫衣文本 → 敵人反應 → 幫敵人脫光
    const enterLogs = [
      ...bathUndressLogs,
      [formatText(pick(SCENE_TEXTS.bathEnemyReaction), enemy.name, 0,'',''), 'story'],
      [formatText(pick(SCENE_TEXTS.bathHelpUndress), enemy.name, 0,'',''), 'story'],
    ];
    addLogs(enterLogs);
    // 喜好命中文本（疊加在進浴室文本之後）
    if (hairHitJustNow) {
      const pool = HAIR_PREF_HIT_TEXTS[hairPart]?.[HAIR_LEVEL_KEYS[player.bodyHair?.[hairPart] ?? 1]] || [];
      if (pool.length > 0) {
        const tpl = pick(pool);
        const hairText = formatText(tpl, enemy.name, 0, bustDesc(), hipsDesc());
        addLog(hairText, 'sex');
      }
    }
    setPlayer(p=>({...addMinutes({...p, clothes:bathNewClothes}, 5)}));
    // 命中時 setEnemy 加 60 性奮、設 satisfied flag；setGs 後客人在浴室狀態
    if (hairHitJustNow) {
      setEnemy(e => {
        const newArousal = Math.min(200, (e.arousal||0) + 60);
        return {
          ...e,
          arousal: newArousal,
          maxArousal: Math.max(e.maxArousal||0, newArousal),
          hairPrefSatisfied: true,
        };
      });
    }
    setGs('bathroom');
    actionRef.current = false;

  };

  // ── 幫忙洗澡 ─────────────────────────────────────────────
  const doBathService = () => {
    addSep();
    if (!enemy) return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const bathCount = enemy.bathServiceCount||0;
    if (bathCount>=2) {
      addLog(pick(SCENE_TEXTS.bathServiceRepeat).replace(/{E}/g,enemy.name),'bad');
      setEnemy(e=>({...e,bathedThisVisit:true}));
      actionRef.current = false;
      return;
    }
    // 1. 計算數值
    const gains = [{arousal:[40,60]},{arousal:[20,35]}];
    const g = gains[Math.min(bathCount,1)];
    const arousalGain = g.arousal[0]+Math.floor(Math.random()*(g.arousal[1]-g.arousal[0]));
    const newArousal = Math.min(200,(enemy.arousal||0)+arousalGain);
    const effArousal = calcEffectiveArousal({...enemy,arousal:newArousal}, calcCharm(player).total);
    const didOrgasm = Math.random() < calcOrgasmChance(effArousal, 0.3);
    let vol=0, newVol=enemy.semenVolume;
    if (didOrgasm) ({vol,newVol} = calcOrgasmOutput(enemy.semenVolume, newArousal, player.prof['mouth']||0));
    const {newProf} = gainProf(player.prof, 'mouth');
    // 2. 選文本並輸出
    const text = formatText(pick(SCENE_TEXTS.bathService), enemy.name, vol, bustDesc(), hipsDesc());
    addLog(text,'sex');
    let extraFee = 0;
    if (didOrgasm) {
      addLog(formatText(pick(SCENE_TEXTS.bathServiceOrgasm), enemy.name, vol, bustDesc(), hipsDesc()),'sex');
      if (Math.random()<0.5) {
        addLog(formatText(pick(SCENE_TEXTS.bathServiceCleanup), enemy.name, vol, bustDesc(), hipsDesc()),'sex');
        extraFee = FOREPLAY_FEE.mouth;
      }
    } else {
      addLog(formatText(pick(SCENE_TEXTS.bathServiceArousal), enemy.name, 0, bustDesc(), hipsDesc()),'sex');
    }
    // 3. 更新 state
    const playerDmg = 3;
    const bathServiceFee = 20;
    // 射精時客人額外消耗 vol*2 的體力（與服務消耗獨立計算）
    const orgasmEnemyHpCost = didOrgasm ? vol * 2 : 0;
    const firstMouth = didOrgasm && !(enemy.counted?.mouth);   // 同一客人口交首次射精才 +1 人
    setPlayer(p=>addMinutes({...p,
      hp:Math.max(0,p.hp-playerDmg),
      prof:newProf,
      record: didOrgasm ? bumpRecord(p.record, {countAct: firstMouth?'mouth':null, semenAct:'mouth', vol}) : p.record,
    },15));
    setEnemy(e=>({...e,
      hp: Math.max(0, e.hp - orgasmEnemyHpCost),
      arousal: didOrgasm ? Math.ceil(newArousal*0.25) : newArousal,
      maxArousal: Math.max(e.maxArousal||0, newArousal),
      semenVolume: didOrgasm ? newVol : e.semenVolume,
      semenDepleted: didOrgasm && newVol<=0 ? true : e.semenDepleted,
      counted: didOrgasm ? {...(e.counted||{}), mouth:true} : e.counted,
      accumulatedFee: (e.accumulatedFee||0) + bathServiceFee + extraFee,
      bathServiceCount: (e.bathServiceCount||0)+1,
      bathedThisVisit: bathCount>=1,
    }));
    resolvePriority({
      didOrgasm, newVol,
      enemyHpAfter: enemy.hp - orgasmEnemyHpCost,
      playerHpAfter: player.hp - 3,
      timeNowAfter: (player.timeMinutes + 15) + player.days*1440,
    });
    actionRef.current = false;

  };
  // ── 洗澡（清潔自己）────────────────────────────────────────
  const doBath = () => {
    addSep();
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const stains = player.semenStains||{};
    const dirty = Object.keys(stains).filter(k=>stains[k]>0);
    if (dirty.length===0) {
      addLog('身上沒有需要清洗的部位。','hint');
      actionRef.current = false;
      return;
    }
    const BASE_WASH_TIME = {face:2,hand:2,boob:3,butt:3,leg:3,vagina:7,anal:7};

    // === 決定需要脫哪些衣物 ===
    const needUndressTop    = dirty.some(k=>['boob'].includes(k));
    const needUndressBottom = dirty.some(k=>['butt','leg','vagina','anal'].includes(k));
    let currentClothes = {...player.clothes};
    const allUndressLogs = [];

    if (needUndressTop) {
      const slots = [];
      if (currentClothes.top)     slots.push('top');
      if (currentClothes.bra)     slots.push('bra');
      const {logs, newClothes} = buildUndressLogs(slots, currentClothes, player);
      currentClothes = newClothes;
      allUndressLogs.push(...logs);
    }
    if (needUndressBottom) {
      const slots = [];
      if (currentClothes.shoes)   slots.push('shoes');
      if (currentClothes.bottom)  slots.push('bottom');
      if (currentClothes.panties) slots.push('panties');
      if (currentClothes.socks)   slots.push('socks');
      const {logs, newClothes} = buildUndressLogs(slots, currentClothes, player);
      currentClothes = newClothes;
      allUndressLogs.push(...logs);
    }

    // === 計算清洗時間與文本 ===
    let totalMins = 0;
    const partLogs = [];
    dirty.forEach(k=>{
      const lv = getStainLevel(stains[k]);
      totalMins += (BASE_WASH_TIME[k]||3)+lv+1;
      const washPool = BATH_WASH_TEXTS[k];
      const txt = washPool
        ? (washPool[lv]||washPool[washPool.length-1])
        : `✨ 清洗了${k}。`;
      partLogs.push([txt,'hint']);
    });
    const isFullClean = totalMins >= 30;
    const mins = Math.min(30, totalMins);

    // 全身清洗時額外脫上衣+下著（若尚未脫）
    if (isFullClean) {
      const extraSlots = [];
      if (currentClothes.shoes)   extraSlots.push('shoes');
      if (currentClothes.top)     extraSlots.push('top');
      if (currentClothes.bra)     extraSlots.push('bra');
      if (currentClothes.bottom)  extraSlots.push('bottom');
      if (currentClothes.panties) extraSlots.push('panties');
      if (currentClothes.socks)   extraSlots.push('socks');
      if (extraSlots.length > 0) {
        const {logs, newClothes} = buildUndressLogs(extraSlots, currentClothes, player);
        currentClothes = newClothes;
        allUndressLogs.push(...logs);
      }
    }

    // === 一次輸出：脫衣文本 → 清洗文本 ===
    if (isFullClean) {
      addLogs([...allUndressLogs, [pick(SCENE_TEXTS.bathFullClean),'good']]);
    } else {
      addLogs([...allUndressLogs, ...partLogs, ['🚿 柯妤潔洗淨了身上的精液痕跡。','good']]);
    }
    setPlayer(p=>addMinutes({...p, semenStains:{}, clothes:currentClothes}, mins));
    actionRef.current = false;

  };

  // ── 做愛開始 ─────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────
  // 22.11 做愛動作 — 戴套詢問 / 衝刺 / 死魚
  // ─────────────────────────────────────────────────────────────────
  const doStartSex = (hole) => {
    addSep();
    if (!enemy) return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    // 浴室：沒有保險套，直接進做愛
    if (gs === 'bathroom') {
      // 浴室第一次：用 bathNoCondom 文本（柯妤潔說明套子沒帶進來）；之後用 bathContinueNoCondom
      const isFirstTime = enemy.condomMode !== 'without';
      const pool = isFirstTime
        ? (hole==='vagina' ? SCENE_TEXTS.bathNoCondomVagina : SCENE_TEXTS.bathNoCondomAnal)
        : (hole==='vagina' ? SCENE_TEXTS.bathContinueNoCondomVagina : SCENE_TEXTS.bathContinueNoCondomAnal);
      addLog(pick(pool).replace(/{E}/g, enemy.name), 'story');
      setEnemy(e=>({...e, phase:'sex', pendingHole:hole, condomEquipped:false, condomMode:'without'}));
      actionRef.current = false;
      return;
    }
    // 房間做愛：依序脫上衣 → 內衣 → 下著 → 內褲（已脫的跳過、襪子鞋子不動）
    const sexUndressSlots = ['top','bra','bottom','panties'].filter(s => player.clothes[s]);
    const {logs:sexUndressLogs, newClothes:sexNewClothes} = buildUndressLogs(
      sexUndressSlots, player.clothes, player
    );
    if (sexUndressLogs.length > 0) {
      addLogs(sexUndressLogs);
      setPlayer(p => ({...p, clothes: sexNewClothes}));
    }
    // 老闆(肉償)：一律無套，就算身上有套也直接無套
    if (enemy.isBoss) {
      const first = enemy.condomMode !== 'without';
      const pool = first
        ? bossPool(enemy, hole==='vagina' ? 'roomNoCondomVagina' : 'roomNoCondomAnal')
        : bossPool(enemy, hole==='vagina' ? 'roomContinueNoCondomVagina' : 'roomContinueNoCondomAnal');
      addLog(pick(pool).replace(/{E}/g, enemy.name), 'story');
      setEnemy(e=>({...e, phase:'sex', pendingHole:hole, condomEquipped:false, condomMode:'without'}));
      actionRef.current = false;
      return;
    }
    // 已決定無套（不再詢問，用延續文本）
    if (enemy.condomMode === 'without') {
      const pool = hole==='vagina' ? SCENE_TEXTS.roomContinueNoCondomVagina : SCENE_TEXTS.roomContinueNoCondomAnal;
      addLog(pick(pool).replace(/{E}/g, enemy.name), 'story');
      setEnemy(e=>({...e, phase:'sex', pendingHole:hole, condomEquipped:false}));
      actionRef.current = false;
      return;
    }
    // 已戴套且套還在身上（射精前不再詢問，直接進入做愛，主場景文本由 doSex 處理）
    if (enemy.condomMode === 'with' && enemy.condomEquipped) {
      setEnemy(e=>({...e, phase:'sex', pendingHole:hole}));
      actionRef.current = false;
      return;
    }
    // 沒套:直接無套，設定 condomMode='without'（後續延續用 continueNoCondom 文本）
    if (player.condoms <= 0) {
      const pool = hole==='vagina' ? SCENE_TEXTS.roomNoCondomVagina : SCENE_TEXTS.roomNoCondomAnal;
      addLog(pick(pool).replace(/{E}/g, enemy.name), 'story');
      setEnemy(e=>({...e, phase:'sex', pendingHole:hole, condomEquipped:false, condomMode:'without'}));
      actionRef.current = false;
      return;
    }
    // 有套且未決定：進入詢問流程
    setEnemy(e=>({...e, phase:'condomAsk', pendingHole:hole}));
    const pool = hole==='vagina' ? bossPool(enemy,'roomAskCondomVagina') : bossPool(enemy,'roomAskCondomAnal');
    addLog(pick(pool).replace(/{E}/g, enemy.name), 'story');
    actionRef.current = false;

  };

  const doAskCondom = (useCondom) => {
    if (!enemy || enemy.phase!=='condomAsk') return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    addSep();
    const hole = enemy.pendingHole;
    if (useCondom) {
      // 玩家選戴套：看對方是否接受（前戲被拒後成功率40%，否則70%同意）
      const refuseChance = enemy.foreplayRejected ? 0.6 : 0.3;
      if (Math.random() < refuseChance) {
        // 對方拒絕戴套
        const refPool = hole==='vagina' ? bossPool(enemy,'roomRefuseCondomVagina') : bossPool(enemy,'roomRefuseCondomAnal');
        addLog(pick(refPool).replace(/{E}/g, enemy.name), 'bad');
        // 柯妤潔被迫同意
        const forcePool = hole==='vagina' ? bossPool(enemy,'roomForceAgreeVagina') : bossPool(enemy,'roomForceAgreeAnal');
        addLog(pick(forcePool).replace(/{E}/g, enemy.name), 'story');
        if (enemy.foreplayRejected) {
          // 前戲被拒後扔套：condoms-1
          setPlayer(p=>({...p, condoms:Math.max(0,p.condoms-1)}));
        }
        // 客人拒絕戴套 → 從此無套到底
        setEnemy(e=>({...e, condomEquipped:false, phase:'sex', condomMode:'without'}));
      } else {
        // 對方勉強同意戴套
        const agreePool = hole==='vagina' ? bossPool(enemy,'roomAgreeCondomVagina') : bossPool(enemy,'roomAgreeCondomAnal');
        addLog(pick(agreePool).replace(/{E}/g, enemy.name), 'story');
        setPlayer(p=>({...p, condoms:p.condoms-1}));
        // 戴套成功 → condomMode='with'，射精前不再詢問
        setEnemy(e=>({...e, condomEquipped:true, phase:'sex', condomMode:'with'}));
      }
    } else {
      // 玩家選不戴套
      if (player.condoms > 0) {
        // 有套但選不戴：柯妤潔主動說不用
        const skipPool = hole==='vagina' ? bossPool(enemy,'roomSkipCondomVagina') : bossPool(enemy,'roomSkipCondomAnal');
        addLog(pick(skipPool).replace(/{E}/g, enemy.name), 'story');
      } else {
        // 沒有套：柯妤潔說明沒有套直接來
        const noCondomPool = hole==='vagina' ? bossPool(enemy,'roomNoCondomVagina') : bossPool(enemy,'roomNoCondomAnal');
        addLog(pick(noCondomPool).replace(/{E}/g, enemy.name), 'story');
      }
      // 玩家選不戴套 → 從此無套到底
      setEnemy(e=>({...e, condomEquipped:false, phase:'sex', condomMode:'without'}));
    }
    addLog(`${hole==='vagina'?'🌸':'🔮'} 做愛開始。`,'hint');
    actionRef.current = false;

  };

  // ── 做愛進行 ─────────────────────────────────────────────
  const doSex = () => {
    addSep();
    if (!enemy || enemy.phase!=='sex') return;
    if (leavingRef.current) return;
    if (actionRef.current) return;
    actionRef.current = true;
    const hole = enemy.pendingHole||'vagina';
    const profKey = hole;
    const isBath = gs==='bathroom';
    // 浴室做愛文本池選擇
    const sexFrontPool = isBath ? SCENE_TEXTS.bathSexFront : bossPool(enemy,'roomSexFront');
    const sexBackPool  = isBath ? SCENE_TEXTS.bathSexBack  : bossPool(enemy,'roomSexBack');
    const sexFrontArousalPool = isBath ? SCENE_TEXTS.bathSexFrontArousal : bossPool(enemy,'roomSexFrontArousal');
    const sexBackArousalPool  = isBath ? SCENE_TEXTS.bathSexBackArousal  : bossPool(enemy,'roomSexBackArousal');
    // 傷害
    const playerDmgMult = calcProfDmgMult(player.prof[profKey]||0)*dmgVariance();
    const enemyDmgMult  = calcEnemyDmgMult(player.prof[profKey]||0)*dmgVariance();
    const playerDmg = Math.round(SEX_DMG.player*playerDmgMult);
    const enemyDmg  = Math.round(SEX_DMG.enemy*enemyDmgMult);
    // 費用
    const serviceKey = `${hole}${enemy.condomEquipped?'Condom':'NoCondom'}`;
    const feeBase = SEX_FEE[serviceKey]||25;
    const isMainPrefMatch = enemy.revealedPreference && enemy.mainActPref===hole;
    const mainPrefMult = isMainPrefMatch ? 1.2 : 1.0;
    const charge = Math.ceil(calcServiceCharge(feeBase, player.prof[profKey]||0) * mainPrefMult);
    if (isMainPrefMatch) addLog(`💡 ${enemy.name}對這個部位特別有反應。`,'hint');
    // 體毛喜好命中（做愛時若已可見偏好部位）
    const hairPart = enemy.hairPref?.part;
    let hairHitJustNow = false;
    if (!enemy.hairPrefSatisfied && hairPart && enemyCanSeeHair(player, hairPart)) {
      const lvKey = HAIR_LEVEL_KEYS[player.bodyHair?.[hairPart] ?? 1];
      if (lvKey === enemy.hairPref.level) {
        hairHitJustNow = true;
      }
    }
    // 性奮度
    const arousalGain = Math.ceil((30+Math.floor(Math.random()*20)) * mainPrefMult);
    const hairBonus = hairHitJustNow ? 60 : 0;
    const newArousal = Math.min(200,(enemy.arousal||0)+arousalGain+hairBonus);
    const effArousal = calcEffectiveArousal({...enemy,arousal:newArousal},calcCharm(player).total);
    const didOrgasm = Math.random()<calcOrgasmChance(effArousal, 0.45);
    let vol=0, newVol=enemy.semenVolume;
    if (didOrgasm) ({vol,newVol}=calcOrgasmOutput(enemy.semenVolume,newArousal,player.prof[profKey]||0));
    // 文本
    const isBack = hole==='anal';
    let tpl;
    if (didOrgasm) {
      const finKey = isBath
        ? (isBack ? 'bathFinishBackNoCondom' : 'bathFinishFrontNoCondom')
        : (isBack ? (enemy.condomEquipped?'roomFinishBackCondom':'roomFinishBackNoCondom') : (enemy.condomEquipped?'roomFinishFrontCondom':'roomFinishFrontNoCondom'));
      tpl = formatText(pick(bossPool(enemy,finKey)||SCENE_TEXTS.roomFinishFrontNoCondom), enemy.name, vol, bustDesc(), hipsDesc());
    } else {
      tpl = formatText(pick(isBack?sexBackArousalPool:sexFrontArousalPool), enemy.name, vol, bustDesc(), hipsDesc());
    }
    const mainTpl = formatText(pick(isBack?sexBackPool:sexFrontPool), enemy.name, vol, bustDesc(), hipsDesc());
    // 體毛喜好命中文本（先於主場景文本）
    if (hairHitJustNow) {
      const hairPool = HAIR_PREF_HIT_TEXTS[hairPart]?.[HAIR_LEVEL_KEYS[player.bodyHair?.[hairPart] ?? 1]] || [];
      if (hairPool.length > 0) {
        const hairTpl = pick(hairPool);
        const hairText = formatText(hairTpl, enemy.name, 0, bustDesc(), hipsDesc());
        addLog(hairText, 'sex');
      }
    }
    addLog(mainTpl, 'sex');
    addLog(tpl, 'sex');
    // 收費位置（浴室或房間），提到 if/else 外讓兩條路徑都能讀到
    const sexLoc = isBath?'bath':'room';
    if (didOrgasm) {
      const stainPart = hole==='vagina'?'vagina':'anal';
      let drankThisAct = false;
      if (!enemy.condomEquipped) {
        addStainLog(stainPart, vol, addLog, player.semenStains);
      } else if (Math.random()<0.5) {
        // 有套：柯妤潔偷偷喝掉部分精液（吞精量50%~80%，必定<射精量）
        const drinkVol = Math.ceil(vol * (0.5 + Math.random()*0.3));
        const drinkText = formatText(pick(bossPool(enemy,'roomDrinkCondom')), enemy.name, drinkVol, bustDesc(), hipsDesc());
        addLog(drinkText, 'sex');
        addLog(`柯妤潔吞下了 ${drinkVol}ml 精液，體力值恢復 ${drinkVol} 點。`, 'good');
        const firstDrink = !(enemy.counted?.drink);
        drankThisAct = true;
        setPlayer(p=>({...p, hp:Math.min(p.baseHp, p.hp+drinkVol), record: bumpRecord(p.record, {drunk:drinkVol, drunkPerson:firstDrink})}));
      }
      // 升級收費邏輯
      const cs = enemy.chargedServices||[];
      const alreadyNoCondom = cs.some(s=>s.type===hole&&s.condom===false&&s.location===sexLoc);
      const alreadyCondom   = cs.some(s=>s.type===hole&&s.condom===true&&s.location===sexLoc);
      let actualCharge = charge;
      if (alreadyNoCondom) { actualCharge=0; }
      else if (alreadyCondom&&!enemy.condomEquipped) {
        const prevCharge = calcServiceCharge(SEX_FEE[`${hole}Condom`], player.prof[profKey]||0);
        actualCharge = Math.max(0, charge-prevCharge);
      }
      const newChargedServices=[...cs,{type:hole,condom:enemy.condomEquipped,vol,location:sexLoc}];
      // 熟練度
      const {newProf} = gainProf(player.prof, profKey);
      const getsPregnant = !enemy.condomEquipped && hole==='vagina' && !player.isPregnant && Math.random()<0.3;
      const orgasmEnemyHpCost = vol * 2; // 射精時客人額外消耗的體力（與服務 enemyDmg 獨立）
      const firstThisHole = !(enemy.counted?.[hole]);   // 同一客人此體位首次射精才 +1 人
      setPlayer(p=>addMinutes({...p,
        hp:Math.max(0,p.hp-playerDmg),
        prof:newProf,
        isPregnant: getsPregnant ? true : p.isPregnant,
        seedFather: getsPregnant ? (enemy?.name||'') : p.seedFather,
        semenStains:!enemy.condomEquipped?{...(p.semenStains||{}),[stainPart]:((p.semenStains||{})[stainPart]||0)+vol}:p.semenStains,
        record: bumpRecord(p.record, {countAct: firstThisHole?hole:null, semenAct:hole, vol, preg: getsPregnant?1:0}),
      },15));
      setEnemy(e=>({...e,
        hp:Math.max(0,e.hp-enemyDmg-orgasmEnemyHpCost),
        arousal:Math.ceil(newArousal*0.25),
        maxArousal:Math.max(e.maxArousal||0,newArousal),
        semenVolume:newVol,
        accumulatedFee:(e.accumulatedFee||0)+actualCharge,
        chargedServices:newChargedServices,
        counted: {...(e.counted||{}), [hole]:true, ...(drankThisAct?{drink:true}:{})},   // 標記此體位/喝精已計人數
        bathLocked:false, // 做愛射精後解鎖沐浴邀請
        phase:'combat', // 射精後回到 combat，讓玩家繼續選擇
        condomEquipped:false, // 射精後套子拆掉
        // condomMode 'with' → 重設為 null（下次重新詢問）；'without' 保留
        condomMode: e.condomMode === 'with' ? null : e.condomMode,
        // 體毛喜好系統
        hairPrefSatisfied: hairHitJustNow ? true : e.hairPrefSatisfied,
      }));
      // 做愛清潔口交（射精後50%機率，退場前執行）
      // 戴套：在 drinkCondom 之後；無套：直接執行
      if (Math.random() < 0.5) {
        const sexCleanupPool = isBath
          ? (hole==='vagina' ? SCENE_TEXTS.bathCleanupSexFrontNoCondom : SCENE_TEXTS.bathCleanupSexBackNoCondom)
          : (hole==='vagina'
            ? (enemy.condomEquipped ? SCENE_TEXTS.roomCleanupSexFrontCondom : SCENE_TEXTS.roomCleanupSexFrontNoCondom)
            : (enemy.condomEquipped ? SCENE_TEXTS.roomCleanupSexBackCondom  : SCENE_TEXTS.roomCleanupSexBackNoCondom));
        const sexCleanupFee = isBath ? FOREPLAY_FEE.mouth + 5 + 10 : enemy.condomEquipped
          ? FOREPLAY_FEE.mouth + 5          // 戴套：口交基本+5G = 30G
          : FOREPLAY_FEE.mouth + 5 + 10;   // 無套：口交基本+15G = 40G
        addLog(pick(sexCleanupPool).replace(/{E}/g, enemy.name), 'sex');
        // 做愛清潔口交費用累積，離場結算
        setEnemy(e=>({...e, accumulatedFee:(e.accumulatedFee||0)+sexCleanupFee}));
      }
      if (newVol<=0) {
        setEnemy(e=>({...e, semenDepleted:true}));
      }
      resolvePriority({
        didOrgasm: true, newVol,
        enemyHpAfter: enemy.hp - enemyDmg - orgasmEnemyHpCost,
        playerHpAfter: player.hp - playerDmg,
        timeNowAfter: (player.timeMinutes + 15) + player.days*1440,
      });
      actionRef.current = false;
    } else {
      // 未射精也收費
      const cs2 = enemy.chargedServices||[];
      const alreadyNoCondom2 = cs2.some(s=>s.type===hole&&s.condom===false&&s.location===sexLoc);
      const alreadyCondom2   = cs2.some(s=>s.type===hole&&s.condom===true&&s.location===sexLoc);
      let actualCharge2 = charge;
      if (alreadyNoCondom2) { actualCharge2=0; }
      else if (alreadyCondom2&&!enemy.condomEquipped) {
        const prevCharge2 = calcServiceCharge(SEX_FEE[`${hole}Condom`], player.prof[profKey]||0);
        actualCharge2 = Math.max(0, charge-prevCharge2);
      }
      const newChargedServices2=[...cs2,{type:hole,condom:enemy.condomEquipped,vol:0,location:sexLoc}];
      const {newProf} = gainProf(player.prof, profKey);
      setPlayer(p=>addMinutes({...p, hp:Math.max(0,p.hp-playerDmg), prof:newProf},15));
      setEnemy(e=>({...e,
        hp:Math.max(0,e.hp-enemyDmg),
        arousal:newArousal,
        maxArousal:Math.max(e.maxArousal||0,newArousal),
        accumulatedFee:(e.accumulatedFee||0)+actualCharge2,
        chargedServices:newChargedServices2,
        phase:'combat', // 未射精也回到 combat
        // 體毛喜好系統
        hairPrefSatisfied: hairHitJustNow ? true : e.hairPrefSatisfied,
      }));
      resolvePriority({
        didOrgasm: false, newVol: enemy.semenVolume,
        enemyHpAfter: enemy.hp - enemyDmg,
        playerHpAfter: player.hp - playerDmg,
        timeNowAfter: (player.timeMinutes + 15) + player.days*1440,
      });
      actionRef.current = false;
    }
  };

  // ── 耐力歸零防守失敗 ────────────────────────────────────────
  const resolveSexDefeat = () => {
    if (!enemy) return;
    if (leavingRef.current) return;
    leavingRef.current = true;
    addSep();
    // 中出文本
    const isBathDefeat = gs === 'bathroom';
    const enemyName = enemy?.name||'他';
    if (isBathDefeat) {
      // 浴室死魚：昏倒提示 → 浴室橋接(被全裸拖到房間床上，不含插入) → 串接房間死魚(無套內射昏死)
      addLog('🛁 柯妤潔在浴室昏倒了……', 'bad');
      addLog(pick(SCENE_TEXTS.bathSexDefeated).replace(/{E}/g, enemyName), 'bad');
    }
    addLog(pick(bossPool(enemy,'roomSexDefeated')).replace(/{E}/g, enemyName), 'bad');
    // 起床文本緊接死魚文本（中間不輸出任何柯妤潔主觀視角文本，她已昏倒）
    addLog(pick(SCENE_TEXTS.wakeDefeated), 'story');
    if (enemy?.isBoss || enemy?.isBossDate) addLog('……再次睜開眼，柯妤潔已經回到了娼館，天已大亮。', 'hint');
    if (isBathDefeat || enemy?.isBoss || enemy?.isBossDate) setGs('explore'); // 浴室/休息區昏倒 → 場景切回娼館
    // 戰敗死魚文本一律是「無套內射小穴」，機制強制對齊 vagina（污漬記小穴、可懷孕），
    // 避免客人偏好肛交時出現「文字寫內射子宮、卻記成 anal 又不懷孕」的矛盾。
    const hole = 'vagina';
    const {vol,newVol} = calcOrgasmOutput(enemy.semenVolume, 200, enemy.tierIdx||0);
    const stainPart = 'vagina';
    // addStainLog 不呼叫：污漬文本是柯妤潔主觀視角，昏倒中不合理；數值仍在 setPlayer 累積
    const getsPregnant = !player.isPregnant && hole==='vagina' && Math.random()<0.3;
    const curMins = player.timeMinutes;
    const minsToMorning = curMins <= 540 ? (540 - curMins + 1440) : (1440 - curMins + 540);
    const recoveredHp = Math.floor(player.baseHp * 0.5);
    // 房間死魚才需要脫衣（浴室死魚進浴室時已全裸）
    const strippedClothes = isBathDefeat
      ? player.clothes
      : {
          ...Object.fromEntries(Object.keys(player.clothes||{}).map(k=>[k,null])),
          shoes: (player.clothes||{}).shoes || null,
        };
    setPlayer(p=>({
      ...addMinutes({
        ...p,
        hp: recoveredHp,
        clothes: strippedClothes,
        shopSessionOpen: false,   // 昏倒結算後一律離開商店連續場次（避免營業時段判定殘留）
        district: 'east',         // 昏倒後一律回到娼院（東區）
        semenStains: {...(p.semenStains||{}), [stainPart]:((p.semenStains||{})[stainPart]||0)+vol},
        isPregnant: getsPregnant ? true : p.isPregnant,
        seedFather: getsPregnant ? (enemy?.name||'') : p.seedFather,
        record: bumpRecord(p.record, {countAct:'vagina', semenAct:'vagina', vol, preg: getsPregnant?1:0}),   // 昏倒被無套內射，計入小穴紀錄（客人就此離開，計 1 人）
      }, minsToMorning),
    }));
    leavingRef.current = false;
    setEnemy(null);
    setShowForeplayMenu(false);
    setShowSexMenu(false);
    setShowRestMenu(false);
  };

  // ── 敵人離場 ─────────────────────────────────────────────


  // ── 分娩 ─────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────
  // 22.12 預留：野戰動作（空殼）
  //       未來放：doFieldExplore / doFieldEvent 等場地動作
  // ─────────────────────────────────────────────────────────────────


  // ─────────────────────────────────────────────────────────────────
  // 22.13 UI 渲染 — 分娩 / renderActions / 主 JSX
  // ─────────────────────────────────────────────────────────────────
  const doBirth = () => {
    setGs('birth');
  };

// ──────────────────────────────────────────────────
  // ──────────────────────────────────────────────────────────────────
  // ──────────────────────────────────────────────────────────────────
  // renderActions
// ──────────────────────────────────────────────────
  // 從地點立繪卡「進入」：依地點 id 觸發進場行為（todo 地點僅提示）
  const enterLocation = (id) => {
    const loc = LOC_BY_ID[id];
    if (!loc || loc.todo) { addLog(`🚧 ${loc?.name||'這裡'}還在規劃中，暫時不能進去。`, 'hint'); return; }
    if (id==='brothel') { setGs('explore'); return; }
    if (id==='shop')    { doOpenShop(); return; }
    if (id==='tattoo')  { setPlayer(p=>addMinutes(p,10)); setGs('piercingShop'); return; }
  };

  const renderActions = () => {
  // 浴室場景
  if (gs==='bathroom') {
    return (
      <BathroomPanel
        player={player} enemy={enemy}
        onDoBath={doBath}
        onDoBathService={doBathService}
        onDoForeplay={doForeplay}
        onDoStartSex={doStartSex}
        onDoSex={doSex}
        onResolveSexDefeat={resolveSexDefeat}
        onDoChat={doChat}
        onDoSeduce={doSeduce}
        onDoSendOff={doSendOff}
        onBack={()=>{
          if (enemy) {
            addLog(formatText(pick(SCENE_TEXTS.bathReturnWithEnemy), enemy.name, 0,'',''), 'story');
          } else if (player.bathSavedClothes) {
            setPlayer(p=>({...p, clothes:{...p.bathSavedClothes}, bathSavedClothes:null}));
            addLog('柯妤潔將放在一旁的衣物都穿好後，回到了房間。','story');
          }
          setGs('explore');
        }}
      />
    );
  }
  if (gs==='status') return <StatusPanel player={player} onBack={()=>setGs('explore')} />;
  if (gs==='shop') return <ShopPanel player={player} shop={shop} cart={cart} onToggleCart={toggleCart} onCheckout={doCheckout} onBuyCondom={doBuyCondom}
    area={shopArea} setArea={setShopArea} footTraffic={getFootTraffic(player.timeMinutes)} shopClosed={getFootTrafficValue(player.timeMinutes)===null} nearClose={(Math.floor(player.timeMinutes/60)%24)>=20 && getFootTrafficValue(player.timeMinutes)!==null}
    discount={shopDiscount} services={SHOP_DISCOUNT_SERVICES}
    onAskDiscount={doAskDiscount} onAskService={doAskService} onBossDate={doBossDate} bossOffer={bossOffer} onAcceptOffer={doAcceptOffer} onDeclineOffer={doDeclineOffer}
    bossService={bossService} onServiceStep={doServiceStep} lowStamina={player.hp < player.baseHp*0.2}
    discountLocked={player.discountAttemptDay===player.days} bossSated={player.bossSatedDay===player.days}
    onTalkBoss={()=>addLog(player.bossSatedDay===player.days
      ? `老闆 ${SHOPKEEPER_NAME} 一臉滿足地揮揮手：「我已經爽夠啦，妳這小妮子真夠賤的……下次再跟妳好好爽一場吧。」`
      : `老闆 ${SHOPKEEPER_NAME} 瞇眼笑了笑：「妹妹今天想找點什麼？」（互動開發中……）`,'hint')}
    theftPhase={theftPhase} onLeave={doLeaveShop} onReturnAndLeave={doReturnAndLeave} onAttemptTheft={doAttemptTheft}
    onCancelLeave={()=>setTheftPhase(null)} onCompensate={doCompensate} onMeatComp={doMeatCompensate} onGotoJail={doGotoJail}
    theftFine={theftFine()} meatFailed={meatFailed} onBack={doLeaveShop} />;
  if (gs==='birth') return (
    <div className="space-y-3">
      <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-700/40 text-center">
        <span className="text-4xl">🤱</span>
        <h3 className="text-pink-200 font-bold text-lg mt-2">分娩</h3>
        <p className="text-pink-400 text-sm mt-1">懷孕第 {player.pregnantDays} 天</p>
        {player.pregnantDays >= 270 && (
          <p className="text-yellow-300 text-xs mt-1">⚠️ 即將臨盆</p>
        )}
      </div>
      <button onClick={()=>setGs('explore')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-bold">返回</button>
    </div>
  );
  if (gs==='wardrobe') return <WardrobePanel player={player} onEquip={doEquip} onUnequip={doUnequip} onBack={()=>setGs('explore')}/>;
  if (gs==='piercingShop') return <PiercingShopPanel player={player} tattooDraft={tattooDraft} setTattooDraft={setTattooDraft} onBuyPiercing={doBuyPiercing} onTattoo={doTattoo} onTrimHair={doTrimHair} onBack={()=>setGs('street')}/>;
  // 街道（外出後）：上方即時小地圖定位。先在「目前所在區」才能進該區的店；要去別區先點「前往」走過去。
  // 地點立繪卡：點街道上的地點後，先看場景立繪＋氛圍，再決定進入
  if (gs==='locIntro' && pendingLoc) {
    const loc = LOC_BY_ID[pendingLoc];
    const sh = Math.floor(player.timeMinutes/60)%24;
    const shopClosedNow = pendingLoc==='shop' && !(sh>=9 && sh<21);
    const canEnter = loc && !loc.todo && !shopClosedNow;
    return (
      <div className="space-y-3">
        <LocationArt locId={pendingLoc} />
        <div className="text-slate-300 text-sm leading-relaxed px-1">{LOCATION_FLAVOR[pendingLoc]}</div>
        {loc?.todo && <div className="text-amber-300/80 text-xs px-1">🚧 這個地點還在規劃中，暫時只能在外頭看看。</div>}
        {shopClosedNow && <div className="text-amber-300/80 text-xs px-1">🔒 商店已打烊（營業 09:00–21:00）。</div>}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={()=>{ const id=pendingLoc; setPendingLoc(null); enterLocation(id); }}
            disabled={!canEnter}
            className={`w-full py-2 rounded-lg font-bold ${canEnter?'bg-pink-800 hover:bg-pink-700 text-pink-100':'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
            進入
          </button>
          <button onClick={()=>{ setPendingLoc(null); setGs('street'); }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold">離開</button>
        </div>
      </div>
    );
  }
  if (gs==='street') {
    const sh = Math.floor(player.timeMinutes/60)%24; const shopOpen = sh>=9 && sh<21;
    const curD = player.district || 'east';
    const TINT = {
      brothel:{color:'#e08ab0', borderColor:'#7a2650', borderBottomColor:'#a03070'},
      shop:   {color:'#e0b060', borderColor:'#7a5020', borderBottomColor:'#a07030'},
      tattoo: {color:'#c090e0', borderColor:'#6030a0', borderBottomColor:'#8040c0'},
      police: {color:'#6c9cd8', borderColor:'#26456e', borderBottomColor:'#386090'},
      hospital:{color:'#e88a98', borderColor:'#7a2638', borderBottomColor:'#a03048'},
      toilet: {color:'#a0a8b0', borderColor:'#3a4048', borderBottomColor:'#505860'},
      field:  {color:'#90c878', borderColor:'#3a6020', borderBottomColor:'#508030'},
      home:   {color:'#b0b8c0', borderColor:'#404853', borderBottomColor:'#586068'},
    };
    const curLocs = TOWN_LOCATIONS.filter(l=>l.district===curD);
    const otherDs = DISTRICT_ADJ[curD] || [];   // 只列相鄰可直達的區（依路線圖，外區只通中區）
    return (
      <div className="space-y-2">
        {/* 目前所在區：可進入的店家 */}
        <div className="text-xs font-bold pl-1" style={{color:'#c0a070'}}>📍 {DISTRICTS[curD]?.name}・{DISTRICTS[curD]?.sub}（目前所在）</div>
        <div className="grid grid-cols-2 gap-2">
          {curLocs.map(l=>{
            const closedShop = l.id==='shop' && !shopOpen;
            const sub = l.todo ? '🚧 規劃中' : closedShop ? '已打烊' : '進入';
            const onClick = ()=>{ setPendingLoc(l.id); setGs('locIntro'); };
            return (
              <button key={l.id} onClick={onClick}
                className={`w-full text-sm ${l.todo?BR.dis:BR.ghost}`}
                style={l.todo?BR.disStyle:{...BR.ghostStyle, ...(TINT[l.id]||{})}}>
                {l.icon} {l.name}
                <div className="text-[10px] font-normal" style={{color: l.todo?'#5a5a5a':'#9a8868'}}>{sub}</div>
              </button>
            );
          })}
        </div>
        {/* 前往其他區（跨區移動，扣時間） */}
        <div className="text-xs font-bold pl-1 pt-1" style={{color:'#8a6840'}}>🚶 前往其他區</div>
        <div className="grid grid-cols-2 gap-2">
          {otherDs.map(d=>{
            const dd = DISTRICTS[d];
            const mins = districtMins(curD, d);
            const spots = TOWN_LOCATIONS.filter(l=>l.district===d).map(l=>l.icon).join('');
            return (
              <button key={d} onClick={()=>travelDistrict(d)}
                className={`w-full text-sm ${BR.ghost}`} style={{...BR.ghostStyle, color:'#b0a0c0'}}>
                {dd.name}・{dd.sub} {spots}
                <div className="text-[10px] font-normal" style={{color:'#8a7850'}}>🚶 約 {mins} 分</div>
              </button>
            );
          })}
        </div>
        {/* 小地圖（輔助定位，放最下方） */}
        <div className="text-xs font-bold pl-1 pt-1" style={{color:'#8a6840'}}>🗺 城鎮地圖</div>
        <TownMiniMap districtId={curD} timeMinutes={player.timeMinutes} />
      </div>
    );
  }
  if (gs==='saveLoad') return <SaveLoadPanel slots={SAVE_SLOTS} readMeta={readSaveMeta} onSave={doSave} onLoad={doLoad} onDelete={doDeleteSave} onBack={()=>setGs('explore')} onExport={doExportCurrent} onImport={doImportText}/>;

  // 做愛保險套詢問
  if (enemy?.phase==='condomAsk') {
    return (
      <div className="space-y-3">
        <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-700/40 text-yellow-200 text-sm">
          是否幫 {enemy.name} 戴上保險套？<br/>
          <span className="text-slate-400 text-xs">（保險套：{player.condoms} 個）</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={()=>doAskCondom(true)} disabled={player.condoms<=0}
            className={`${player.condoms<=0 ? BR.dis : BR.primary} w-full`}
            style={player.condoms<=0 ? BR.disStyle : BR.primaryStyle}>🛡 戴套</button>
          <button onClick={()=>doAskCondom(false)} className={BR.rose} style={BR.roseStyle}>⚠ 無套</button>
        </div>
      </div>
    );
  }

  // 做愛進行中
  if (enemy?.phase==='sex') {
    const endPct = enemy.hp/enemy.maxHp*100;
    return (
      <div className="space-y-3">
        <EnemyBar enemy={enemy} endPct={endPct} inSex={true} charmTotal={calcCharm(player).total}/>
        {player.hp<=0 && !enemy?.semenDepleted ? (
          <button onClick={resolveSexDefeat}
            className="w-full py-4 rounded-xl font-bold text-base animate-pulse border-2 border-red-700 text-red-300"
            style={{background:'rgba(60,0,0,0.95)'}}>
            😵 柯妤潔暈了過去……（點此繼續）
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={doSex} className={`w-full py-2.5 col-span-2 font-serif rounded-lg font-bold`} style={BR.roseStyle}>💥 繼續衝刺</button>
            {!enemy.isBoss && <button onClick={doSendOff} className={`col-span-2 font-serif rounded-lg font-bold py-2`} style={BR.ghostStyle}>🚪 送客</button>}
          </div>
        )}
      </div>
    );
  }

  // 有客人時的前戲介面
  if (enemy?.phase==='combat') {
    const endPct = enemy.hp/enemy.maxHp*100;
    // 解鎖判斷用 effArousal（含魅力加成），跟 UI 顯示一致
    const charmTotal = calcCharm(player).total;
    const maxEffArousal = Math.min(200, (enemy.maxArousal||0) + Math.floor(charmTotal*0.3));
    return (
      <div className="space-y-3">
        <EnemyBar enemy={enemy} endPct={endPct} charmTotal={charmTotal}/>
        {enemy.revealedPreference&&(
          <div className="text-xs text-yellow-300 text-center bg-yellow-900/30 rounded-lg py-1">
            ⭐ {enemy.name}喜歡【{SERVICE_NAMES[enemy.preference]||''}】和【{enemy.mainActPref==='vagina'?'小穴':'肛門'}】
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={doChat}   className={BR.rose} style={BR.roseStyle}>💋 淫語</button>
          <button onClick={doSeduce} className={BR.rose} style={BR.roseStyle}>💃 勾引</button>
        </div>
        {enemy.foreplayRejected ? (
          <div className={`${BR.dis} w-full text-center`} style={BR.disStyle}>⛔ 前戲已被拒絕</div>
        ) : !showForeplayMenu ? (
          <button onClick={()=>setShowForeplayMenu(true)} disabled={!(maxEffArousal>=80)}
            className={`w-full py-4 rounded-lg font-bold text-lg font-serif`}
            style={maxEffArousal>=80 ? BR.primaryStyle : BR.disStyle}>
            🖐 前戲{maxEffArousal>=80?'':' (需性奮80+)'}
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(SERVICE_NAMES).filter(([k])=>!['vagina','anal'].includes(k)).map(([k,n])=>(
              <button key={k} onClick={()=>{doForeplay(k);setShowForeplayMenu(false);}}
                className={`py-3 text-sm rounded-lg font-bold font-serif transition-all`}
                style={enemy.revealedPreference&&enemy.preference===k ? BR.prefStyle : BR.ghostStyle}>
                {n}{enemy.revealedPreference&&enemy.preference===k?' ⭐':''}
              </button>
            ))}
          </div>
        )}
        {!showSexMenu ? (
          <button onClick={()=>setShowSexMenu(true)} disabled={!(maxEffArousal>=120)}
            className={`w-full py-4 rounded-lg font-bold text-lg font-serif`}
            style={maxEffArousal>=120 ? BR.roseStyle : BR.disStyle}>
            ❤️ 做愛{maxEffArousal>=120?'':' (需性奮120+)'}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>{doStartSex('vagina');setShowSexMenu(false);}}
              className={`py-4 rounded-lg font-bold text-lg font-serif`}
              style={enemy.revealedPreference&&enemy.mainActPref==='vagina'
                ? {...BR.roseStyle, border:'2px solid #c88838', color:'#f0c850'}
                : BR.roseStyle}>
              小穴{enemy.revealedPreference&&enemy.mainActPref==='vagina'?' ⭐':''}
            </button>
            <button onClick={()=>{doStartSex('anal');setShowSexMenu(false);}}
              className={`py-4 rounded-lg font-bold text-lg font-serif`}
              style={enemy.revealedPreference&&enemy.mainActPref==='anal'
                ? {...BR.roseStyle, border:'2px solid #c88838', color:'#f0c850'}
                : BR.roseStyle}>
              肛門{enemy.revealedPreference&&enemy.mainActPref==='anal'?' ⭐':''}
            </button>
          </div>
        )}
        {enemy.isBossDate ? (
          <button onClick={doSendOff} className={`w-full ${BR.ghost}`} style={BR.ghostStyle}>🚪 沒力了，結束離開（老闆不付錢）</button>
        ) : !enemy.isBoss && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={doBathInvite} disabled={enemy?.bathLocked}
              className={`${enemy?.bathLocked ? BB.dis : BB.primary} w-full`}
              style={enemy?.bathLocked ? BB.disStyle : BB.primaryStyle}>
              {enemy?.bathLocked?'🔒 沐浴邀請':'🛁 邀請沐浴'}
            </button>
            <button onClick={doSendOff} className={BR.ghost} style={BR.ghostStyle}>🚪 送客</button>
          </div>
        )}
      </div>
    );
  }

  // 休息區：無老闆時的肉償起始畫面（接客鈕→肉償；無浴室/更衣室/休息/離開）
  if (gs==='restArea' && !enemy) return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 border border-pink-800/40 text-center" style={{background:'#1c0f16'}}>
        <h3 className="text-pink-300 font-bold mb-1">🚪 休息區</h3>
        <p className="text-pink-200/80 text-sm">老闆 {SHOPKEEPER_NAME} 鎖上了門，色瞇瞇地等著柯妤潔用身體賠罪。</p>
      </div>
      <button onClick={doMeatService} className={`w-full ${BR.primary}`} style={BR.primaryStyle}>💋 肉償（伺候老闆）</button>
    </div>
  );

  // 無客人時的探索介面
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={doExplore} className={BR.primary} style={BR.primaryStyle}>👤 接客</button>
        <button onClick={()=>setShowRestMenu(v=>!v)} className={BR.ghost} style={BR.ghostStyle}>🛌 休息 {showRestMenu?'▴':'▾'}</button>
      </div>
      {showRestMenu && (
        <div className="rounded-xl overflow-hidden mt-2" style={{background:'#1c1108',border:'1px solid #4a2e10'}}>
          <div className="grid grid-cols-3 gap-px" style={{background:'#3a2010'}}>
            {[1,2,3,4,5,6,7,8].map(h=>(
              <button key={h} onClick={()=>{doRest(h);setShowRestMenu(false);}}
                className="py-3 text-sm font-bold font-serif transition-all"
                style={{background:'#1c1108',color:'#c09060'}}>
                {h}小時<div className="text-xs font-normal" style={{color:'#7a5830'}}>+{[6,13,22,34,48,63,80,100][h-1]}%</div>
              </button>
            ))}
            <button onClick={()=>{doRest('morning');setShowRestMenu(false);}}
              className="py-3 text-sm font-bold font-serif col-span-3 transition-all"
              style={{background:'#160e04',color:'#f0d078',borderTop:'1px solid #3a2010'}}>
              🌅 睡到天亮（隔天9:00）
            </button>
          </div>
        </div>
      )}
      <div className="text-xs font-bold pl-1 pt-1" style={{color:'#8a6840'}}>地　點</div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={()=>{setPlayer(p=>({...addMinutes(p,5), bathSavedClothes:{...p.clothes}}));setGs('bathroom');}}
          className={`w-full text-sm ${BR.ghost}`} style={{...BR.ghostStyle, color:'#6cc0d8', borderColor:'#2a5e70', borderBottomColor:'#3a8098'}}>🛁 浴室</button>
        <button onClick={()=>setGs('wardrobe')} className={`w-full text-sm ${BR.ghost}`} style={BR.ghostStyle}>👗 更衣室</button>
        <button onClick={()=>{setPlayer(p=>({...p, district:'east'}));setGs('street');}}
          className={`w-full text-sm ${BR.ghost}`} style={{...BR.ghostStyle, color:'#e0b060', borderColor:'#7a5020', borderBottomColor:'#a07030'}}>🚶 外出（看地圖）</button>
      </div>
      <div className="text-xs font-bold pl-1 pt-1" style={{color:'#8a6840'}}>系　統</div>
      <button onClick={()=>setGs('saveLoad')} className={`w-full ${BR.ghost}`} style={BR.ghostStyle}>💾 存讀檔</button>
    </div>
  );
};

// ──────────────────────────────────────────────────
  // 主 JSX
// ──────────────────────────────────────────────────
  // 起始畫面：整頁取代（不套用狀態列/日誌主版型）
  if (gs==='title') {
    const saved = SAVE_SLOTS.map(s=>({slot:s, meta:readSaveMeta(s)})).filter(x=>x.meta);
    const newest = saved.slice().sort((a,b)=>(((b.meta.day||0)*1440+(b.meta.time||0))-((a.meta.day||0)*1440+(a.meta.time||0))))[0];
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center gap-5 p-6 text-center">
        <div>
          <h1 className="text-4xl font-bold text-rose-400">柯妤潔的娼館</h1>
        </div>
        <div className="w-full max-w-xs space-y-3">
          {newest && (
            <button onClick={()=>doLoad(newest.slot)}
              className="w-full py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg font-bold">
              ▶️ 繼續上次進度
              <span className="block text-xs font-normal opacity-80">{newest.meta.name}・第{newest.meta.day}天　體力{newest.meta.hp}／💰{newest.meta.gold}</span>
            </button>
          )}
          <button onClick={()=>setGs('saveLoad')}
            className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-bold">📂 讀取／匯入存檔</button>
          <button onClick={()=>{ setPlayer(JSON.parse(JSON.stringify(INITIAL_PLAYER))); setEnemy(null); setLogs([{msg:'歡迎來到柯妤潔的娼館。',tag:'hint'}]); setGs('explore'); }}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold">🆕 開新遊戲</button>
        </div>
      </div>
    );
  }

  const {total:charmTotal} = calcCharm(player);
  const {title:fameTitle, color:repColor} = getReputationTitle(player.fame||0);
  const endPct = player.hp/player.baseHp*100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-2">
      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-rose-400">柯妤潔的娼館</h1>
          <div className="flex justify-center gap-4 mt-1">
            <span className="text-yellow-200 text-xl font-bold tracking-wide">第 {player.days} 天</span>
            <span className="text-yellow-400 text-xl font-bold tracking-wide">{formatTime(player.timeMinutes)}</span>
          </div>
        </div>

        {/* 狀態列 */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/60">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-rose-300 font-bold text-base">{player.name}</span>
              {(()=>{
                const meas = getBodyMeasurements(player);
                const cup  = getCurrentCup(player);
                const stage = getPregnancyStage(player);
                const stageLabel = ['著床期','早期','中期','晚期'][stage];
                return (
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    <span className="text-slate-300">胸 <span className="text-rose-300 font-semibold">{meas.bust}公分，{cup}罩杯</span></span>
                    <span className="mx-1 text-slate-600">·</span>
                    <span className="text-slate-300">腰 <span className="text-rose-300 font-semibold">{meas.waist}cm</span></span>
                    <span className="mx-1 text-slate-600">·</span>
                    <span className="text-slate-300">臀 <span className="text-rose-300 font-semibold">{meas.hips}cm</span></span>
                    {player.isPregnant && <div className="text-pink-400 font-semibold mt-0.5">已懷孕{stageLabel}・第{player.pregnantDays}天</div>}
                    {!player.isPregnant && (player.postBirthDays||0)>0 && (player.postBirthDays||0)<=60 && <div className="text-pink-300 font-semibold mt-0.5">🍼 泌乳期</div>}
                  </div>
                );
              })()}
            </div>
            <span className={`text-xs ${repColor}`}>{fameTitle}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
            <div className={S.hpBar} style={{width:`${Math.max(0,endPct)}%`}}/>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-xs">體力值 {player.hp}/{player.baseHp}</span>
            <span className="text-yellow-300 text-2xl font-bold tracking-wide">💰 {player.gold}G</span>
          </div>
          <div className={S.rowXs}>
            <span>✨ 魅惑 {charmTotal}</span>
            <span>🌟 名氣 {player.fame||0}</span>
            <button onClick={()=>setGs('status')} className="text-pink-400 hover:text-pink-300 text-xs font-bold">📋 狀態</button>
          </div>
          {player.condoms>0 && <div className="text-xs text-cyan-500 mt-0.5">🛡 保險套 ×{player.condoms}</div>}
        </div>

        {/* 動作按鈕區 */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/40">
          {renderActions()}
        </div>

        {/* 日誌 */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/40 h-52 overflow-y-auto">
          {logs.filter(e=>(e.tag||'')!=='__CLEAR__').map((entry,i)=>{
            const {msg,tag} = typeof entry==='string'?{msg:entry,tag:'default'}:entry;
            const cls = LOG_COLORS[tag]||LOG_COLORS.default;
            return <p key={i} className={`text-xs mb-1 leading-relaxed ${cls}`}>{msg}</p>;
          })}
        </div>
      </div>
    </div>
  );
};

export default TowerGame;

// ── 純函數具名匯出（供測試用；不影響執行邏輯）─────────────────────────
// 這些都是無副作用、無 React 依賴的純函數，抽出測試以鎖住現有行為（characterization tests）。
export {
  pick, vary, formatTime, getTimePeriod, addMinutes, formatText, formatZhe,
  getStainLevel, gainProf, getPregnancyStage, getBodyMeasurements,
  getCurrentCup, calcCharm, getReputation, getReputationTitle, pickPortrait,
};

