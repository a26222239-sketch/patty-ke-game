# 立繪美術工具 (tools/)

一組**獨立於遊戲之外**的離線美術後製小工具。跟遊戲程式(`game.jsx`)完全分開:
遊戲不會 import 它們,它們只負責「產出/改善圖片」,你再把成品圖放進遊戲用。

| 工具 | 功能 | 主要套件 |
|------|------|---------|
| `enhance_art.py` | **畫質增強**:Real-ESRGAN 4x → 縮回原尺寸(去模糊/銳化/去雜訊) | torch |
| `remove_bg.py` | **去背**:輸出透明 PNG(專案預設去背工具) | rembg |
| `skin_transfer.py` | **膚色轉移**:把 A 角色的膚色套到 B 角色(只動皮膚) | opencv |

---

## 安裝

```bash
pip install -r tools/requirements.txt      # 一次裝齊三個工具的套件(CPU 即可)
bash tools/download_weights.sh             # 下載 Real-ESRGAN 權重(不進 git)
```

- 模型權重不進 git:Real-ESRGAN 權重在 `tools/weights/`(gitignore);rembg 模型首次使用
  自動下載到 `~/.u2net`。
- 這是暫時環境的話,新工作階段第一次用會自動重新下載權重(很快)。

---

## 1. 畫質增強 — `enhance_art.py` (Real-ESRGAN)

4x 增強後縮回**原尺寸**,效果是去模糊/銳化/去雜訊,**解析度不變**。自帶 RRDBNet 架構,
不需要 `basicsr`/`realesrgan` 套件。透明背景(alpha)自動保留。

```bash
python tools/enhance_art.py 立繪.png                 # → 立繪_enhanced.png(同尺寸)
python tools/enhance_art.py 立繪.png -o 立繪_hd.png
python tools/enhance_art.py *.png --suffix _hd       # 批次
python tools/enhance_art.py 圖.png --model photo      # 通用/半寫實(預設 anime)
python tools/enhance_art.py 圖.png --keep-4x          # 保留 4 倍大圖(不縮回)
```

- 預設模型 `anime`(`RealESRGAN_x4plus_anime_6B`)對插畫/立繪最好。
- CPU 一張約 1.5–3 分鐘(視尺寸);有 GPU 快很多。

## 2. 去背 — `remove_bg.py` (rembg) ★ 預設去背工具

把角色從背景摳出來,輸出**透明 PNG**。純去背,不改動角色本身。

```bash
python tools/remove_bg.py 立繪.png                   # → 立繪_cutout.png(透明)
python tools/remove_bg.py *.png --suffix _nobg       # 批次
python tools/remove_bg.py 圖.png --check              # 另存棋盤格預覽,檢查透明邊緣
python tools/remove_bg.py 圖.png --model u2net        # 改用通用模型(預設 isnet-anime)
```

- 預設模型 `isnet-anime`(動漫人物專用,去背最乾淨)。CPU 一張幾秒。

## 3. 膚色轉移 — `skin_transfer.py`

讀「參考圖 A」的膚色,套到「目標圖 B」身上,**只改皮膚**(衣服/絲襪/頭髮/背景不動)。
用 LAB 色彩轉移 + 皮膚偵測遮罩。注意:它對齊的是膚色「色調統計」,**不是重打光**
(不會移動高光/陰影位置)。

```bash
# 讓 B 的膚色變成跟 A 一樣
python tools/skin_transfer.py --ref A.png B.png            # → B_skinmatched.png
python tools/skin_transfer.py --ref A.png B.png -o out.png
python tools/skin_transfer.py --ref A.png *.png            # 批次:一個基準套到多張
python tools/skin_transfer.py --ref A.png B.png --strength 0.7   # 較柔的匹配(0~1)
python tools/skin_transfer.py --ref A.png B.png --check    # 另存皮膚遮罩預覽
python tools/skin_transfer.py --ref A.png B.png --region all     # 改成整張色調轉移
```

- `--strength` 控制強度;`--check` 可先確認皮膚遮罩抓得準不準。CPU 一張約 1 秒。

---

## 典型流程(可串接)

```bash
# 統一膚色 → 增強畫質
python tools/skin_transfer.py --ref 基準.png 目標.png -o tmp.png
python tools/enhance_art.py tmp.png -o 成品.png
```
