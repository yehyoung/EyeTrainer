<script setup>
import { streak, todaySeconds } from '../store'
</script>

<template>
  <div class="page">
    <h1>久坐族保健訓練</h1>
    <p class="desc">
      每天 3～10 分鐘，在座位上就能完成：放鬆睫狀肌、活動眼球，並強化久坐最容易退化的肌群。
    </p>

    <div class="stats">
      <div class="stat">
        <div class="num">{{ streak() }} 天</div>
        <div class="lbl">連續訓練</div>
      </div>
      <div class="stat">
        <div class="num">{{ Math.round(todaySeconds() / 60 * 10) / 10 }} 分</div>
        <div class="lbl">今日訓練時間</div>
      </div>
    </div>

    <h2>👁️ 眼睛訓練</h2>
    <div class="grid">
      <router-link class="card" to="/wheel">
        <div class="icon">☸️</div>
        <h3>動態藏輪圖</h3>
        <p>眼睛沿輪圖與軌跡移動，同時鍛鍊外眼肌與對焦的睫狀肌。含 8 字、星形、波浪、螺旋軌跡。</p>
      </router-link>
      <router-link class="card" to="/focus">
        <div class="icon">🎯</div>
        <h3>遠近變焦訓練</h3>
        <p>對焦調節圖（遠近焦點模擬）＋手指凝視法引導，訓練睫狀肌的遠近對焦能力。</p>
      </router-link>
      <router-link class="card" to="/stereo">
        <div class="icon">🌀</div>
        <h3>3D 立體圖</h3>
        <p>程式即時生成 Magic Eye 立體圖，讓焦點脫離螢幕平面，深度放鬆調節系統。</p>
      </router-link>
      <router-link class="card" to="/relax">
        <div class="icon">😌</div>
        <h3>放鬆休息</h3>
        <p>20-20-20 護眼提醒、節拍眨眼訓練、掌心熱敷（palming）引導。</p>
      </router-link>
    </div>

    <h2>💪 身體訓練</h2>
    <div class="grid">
      <router-link class="card" to="/isometric">
        <div class="icon">💪</div>
        <h3>等長運動</h3>
        <p>靠牆深蹲、棒式、掌心互推等靜態肌力訓練——實證降血壓效果優於有氧與重訓。</p>
      </router-link>
      <router-link class="card" to="/pelvic">
        <div class="icon">🌸</div>
        <h3>骨盆底肌訓練</h3>
        <p>凱格爾運動節奏引導（慢縮＋快縮），改善漏尿、產後與術後恢復，坐著就能做。</p>
      </router-link>
    </div>

    <h2>📊 紀錄與說明</h2>
    <div class="grid">
      <router-link class="card" to="/progress">
        <div class="icon">📈</div>
        <h3>訓練進度</h3>
        <p>每日訓練紀錄、連續天數、各模組統計。</p>
      </router-link>
      <router-link class="card" to="/about">
        <div class="icon">📖</div>
        <h3>原理與說明</h3>
        <p>訓練原理、注意事項、參考資料與安全設定。</p>
      </router-link>
    </div>

    <div class="hint">
      💡 建議：每 30 分鐘用眼後休息 5–10 分鐘；訓練時保持身體與頭部不動、只動眼睛，效果最佳。
    </div>
  </div>
</template>
