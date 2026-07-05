# EyeTrainer 👁️ 眼睛保健訓練網頁

訓練眼睛遠近變焦（睫狀肌）、眼球運動（外眼肌）與視覺放鬆的網頁應用。
純前端、零後端，可離線使用；規劃詳見 [PLAN.md](PLAN.md)。

**🌐 線上使用：https://yehyoung.github.io/EyeTrainer/**

## 功能

### ☸️ 動態藏輪圖（眼球運動）
- **五種圖形**：藏輪圖（魚骨輪臂）、雪花圖、星芒圖、花瓣圖、迷宮圖
- **四種模式**：描邊（亮點沿圖形輪廓等速行進）、旋轉、呼吸縮放、軌跡追蹤（8字／星形／波浪／螺旋）
- 960×640 大畫布，速度三段可調

### 🎯 遠近變焦訓練（睫狀肌）
- **對焦調節圖**：字母「大而清晰 ↔ 小而模糊」循環，模擬物體遠近，訓練對焦
- **手指凝視法**：提示音＋中文語音引導「看近（螢幕）／看遠（3 公尺外）」交替

### 🌀 3D 立體圖（Magic Eye）
- Canvas 即時生成隨機點立體圖（SIRDS，Thimbleby–Inglis–Witten 完整演算法，無鬼影）
- **基本／進階兩種難度共 12 種隱藏圖案**（進階含圓環、月牙、笑臉等鏤空圖形）
- 平行法／交叉法、對焦輔助點、答題驗證、答對後「保持融像 20 秒」倒數

### 😌 放鬆休息
- 20-20-20 護眼提醒（循環計時＋語音）、節拍眨眼、掌心熱敷（palming）引導

### 其他
- 每個練習附「🎯 目的・🔬 原理・📋 方法」說明卡
- 📈 訓練進度：連續天數、累計時間、立體圖答對率（localStorage）
- ⚠️ 安全機制：首次使用安全問卷，高度近視者鎖定慢速模式；全站免責聲明
- 深色琥珀低藍光主題

## 本機開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 輸出 dist/（純靜態）
```

## 部署到 GitHub Pages

本倉庫已內建自動部署（[.github/workflows/deploy.yml](.github/workflows/deploy.yml)）：

1. push 到 `main` 分支即自動觸發：安裝依賴 → `vite build` → 部署 `dist/` 到 GitHub Pages
2. 首次部署會自動啟用 Pages（Source: GitHub Actions）
3. 網址格式：`https://<帳號>.github.io/<倉庫名>/`

`vite.config.js` 已設定 `base: './'`（相對路徑）＋ hash 路由，因此也可直接部署到 Cloudflare Pages、Netlify 或任何靜態主機，無需額外設定。

## 技術

Vue 3 + Vite + vue-router（hash 模式）、Canvas 2D、Web Audio、SpeechSynthesis、localStorage。

## 免責聲明

本工具僅供眼部放鬆與保健參考，無法治療近視、老花或任何眼疾，不能取代眼科診療。
高度近視（600 度以上）或視網膜病變者請避免快速眼球運動，並先諮詢眼科醫師。
訓練中若出現閃光感、飛蚊突增、視野缺損，請立即停止並就醫。
