<script setup>
import { streak, todaySeconds } from '../store'
</script>

<template>
  <div class="page">
    <h1>眼睛保健訓練</h1>
    <p class="desc">每天 3～10 分鐘，放鬆睫狀肌、活動眼球、舒緩 3C 疲勞。</p>

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
