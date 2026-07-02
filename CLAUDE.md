# 專案規則(CLAUDE.md)

## 圖片 Prompt 生成規則(重要,必遵守)

當使用者要求「生產/撰寫圖片 prompt」時,**依主體類型自動選擇目標繪圖工具**,並輸出符合該工具語法習慣的 prompt。不要問使用者用哪個工具——依下列規則自行判斷,但要在回覆開頭標明「本 prompt 適用工具」。

### 判斷規則

| 主體類型 | 目標工具 | Prompt 形式 |
|---|---|---|
| **人物類**(角色立繪、表情差分、姿勢、服裝、NSFW 立繪等,畫面以人為主體) | **ComfyUI + SDXL 系模型** | Tag 式正/反提示詞 + 參數建議 |
| **非人物類**(場景背景、道具、地圖、UI 素材等,畫面無人) | **ChatGPT**(GPT-4o / DALL·E 生圖) | 自然語言敘述式 prompt |

### A. 人物類 → ComfyUI + SDXL(必含以下全部)

1. **Positive prompt**:tag 式(逗號分隔英文 tag),品質 tag 開頭(如 `masterpiece, best quality`),再依序:人物特徵 → 服裝 → 表情/姿勢 → 構圖鏡頭 → 光線 → 畫風。
2. **Negative prompt**:必附。基底如 `lowres, bad anatomy, bad hands, extra digits, missing fingers, worst quality, low quality, jpeg artifacts, signature, watermark, text, username, blurry`,再依該圖需求增補(例如全身圖加 `cropped legs`)。
3. **智能比例控制**:依構圖選 SDXL 原生解析度,並說明理由:
   - 全身/站立立繪:直式 `832×1216` 或 `768×1344`
   - 半身/胸上:`896×1152` 或 `1024×1024`
   - 橫式場景中的人物:`1216×832` 或 `1344×768`
4. **權重控制**:對必須命中的關鍵特徵用 `(tag:1.1)`~`(tag:1.3)` 加權、易跑掉的干擾元素在反向詞加權;權重要克制,超過 1.4 容易畫面崩壞,並簡述為何這樣配重。
5. **建議參數**:Sampler(預設 `DPM++ 2M Karras`)、Steps(25–35)、CFG(5–8,寫實偏低、動漫可略高)、必要時建議 Hires fix / Refiner 與 denoise 值。若角色需跨圖一致,提醒使用固定 seed 或 LoRA/IPAdapter。

### B. 非人物類 → ChatGPT(GPT-4o / DALL·E)

1. 用**完整自然語言段落**描述:場景內容、年代、材質、光線、色溫、鏡頭視角、畫風。**不要**用 tag 堆疊、**不要**用 `(word:1.2)` 權重語法(ChatGPT 不支援)。
2. 不需要的元素以敘述排除(如 "no people, no text, no watermark"),因為沒有獨立的 negative prompt 欄位。
3. 比例以文字指定(如 "16:9 wide landscape format")。

### C. 通用要求

- 本專案的場景/人物風格**必須先讀 `docs/ART_BIBLE.md`** 再寫 prompt:韓系成人 manhwa 細線稿+柔順漸層上色、現代亞洲小城世界觀、場景圖完全無人、圖內禁止任何文字/浮水印。
- 場景背景圖的交付規格(16:9、最終 768×432、檔名 `loc_<id>.png`)依 ART_BIBLE 第 5 節。
- 每次輸出 prompt 時的固定格式:目標工具 → 正向提示詞 →(SDXL 才有)反向提示詞 → 比例/解析度與理由 →(SDXL 才有)參數建議。
