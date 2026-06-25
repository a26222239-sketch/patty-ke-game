# 立繪畫質增強 (Real-ESRGAN)

用 Real-ESRGAN 4x 模型增強角色立繪畫質,再縮回**原本尺寸**——效果是去模糊 / 銳化 /
去雜訊,**解析度不變**,適合修整 AI 生成圖的軟邊與壓縮雜訊。

## 安裝(每台機器一次)

```bash
pip install torch torchvision numpy pillow   # CPU 即可,有 GPU 會更快
bash tools/download_weights.sh               # 下載模型權重(不進 git)
```

> 腳本自帶 RRDBNet 架構,**不需要** `basicsr` / `realesrgan` 套件。

## 使用

```bash
# 單張(輸出 xxx_enhanced.png,同尺寸)
python tools/enhance_art.py 立繪.png

# 指定輸出檔名
python tools/enhance_art.py 立繪.png -o 立繪_hd.png

# 批次處理多張
python tools/enhance_art.py *.png --suffix _hd

# 通用 / 半寫實模型(預設是動漫插畫模型 anime)
python tools/enhance_art.py 圖.png --model photo

# 真的要放大 4 倍、不縮回(輸出會很大)
python tools/enhance_art.py 圖.png --keep-4x
```

- 預設模型 `anime`(`RealESRGAN_x4plus_anime_6B`)對插畫/立繪效果最好。
- 透明背景(alpha)會自動保留。
- CPU 上一張約 1.5 分鐘(視尺寸);有 GPU 會快很多。
