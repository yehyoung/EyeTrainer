<script setup>
import { streak, todaySeconds } from '../store'

// 久坐一天的練習節奏：越上面的越常做，越下面的越偶爾做
const PLAN = [
  {
    when: '每 30 分鐘',
    len: '約 1 分鐘',
    body: '看遠處 20 秒讓睫狀肌放鬆，同時在桌子底下做 20 下腳跟腳尖交替——眼睛和小腿是久坐最先出問題的兩個地方，而且這兩件事可以同時做完。',
    links: [
      { to: '/relax', name: '😌 20-20-20 提醒' },
      { to: '/veins', name: '🩸 坐姿腳跟腳尖交替' },
    ],
  },
  {
    when: '每 2 小時',
    len: '3–5 分鐘',
    body: '離開座位前先用藏輪圖或遠近變焦把眼球與對焦肌群活動開，再用節拍眨眼或掌心熱敷收尾。順手起來走幾步，小腿收縮比什麼都有效。',
    links: [
      { to: '/wheel', name: '☸️ 藏輪圖' },
      { to: '/focus', name: '🎯 遠近變焦' },
      { to: '/relax', name: '🤲 掌心熱敷' },
    ],
  },
  {
    when: '每天一次',
    len: '10–15 分鐘',
    body: '挑一個身體訓練當主餐：想流汗選安靜燃脂，想降血壓選等長運動。安靜燃脂最後的緩和 1 分鐘順手量一次心率恢復，當成長期體能指標。坐著時再補一輪骨盆底肌。',
    links: [
      { to: '/cardio', name: '🔥 安靜燃脂' },
      { to: '/isometric', name: '💪 等長運動' },
      { to: '/pelvic', name: '🌸 骨盆底肌' },
    ],
  },
  {
    when: '傍晚或睡前',
    len: '15–20 分鐘',
    body: '腿最脹的時候抬腿 15 分鐘，腳踝要高過心臟；同時做共振呼吸或 4-7-8，讓交感神經降下來比較好睡。',
    links: [
      { to: '/veins', name: '🛏️ 抬腿休息' },
      { to: '/autonomic', name: '🫁 自律神經調節' },
    ],
  },
  {
    when: '每週幾次',
    len: '各 5 分鐘',
    body: '小腿提踵每週 3 次以上，把肌肉泵真正練強；3D 立體圖讓焦點脫離螢幕平面；暗適應階梯與眩光恢復各留一次紀錄，看自己的夜間視力有沒有在變化。',
    links: [
      { to: '/veins', name: '🧗 小腿提踵' },
      { to: '/stereo', name: '🌀 3D 立體圖' },
      { to: '/dark', name: '🌙 暗適應' },
    ],
  },
]
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

    <h2>🗓️ 建議練習順序</h2>
    <p class="desc" style="margin-top: 0">
      不必全部都做。照這個節奏安排，久坐一天最該補的幾件事就都補到了。
    </p>
    <ol class="plan">
      <li v-for="s in PLAN" :key="s.when">
        <div class="when">
          <strong>{{ s.when }}</strong>
          <span>{{ s.len }}</span>
        </div>
        <div class="what">
          <p>{{ s.body }}</p>
          <p class="links">
            <router-link v-for="l in s.links" :key="l.to" :to="l.to">{{ l.name }}</router-link>
          </p>
        </div>
      </li>
    </ol>

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
      <router-link class="card" to="/dark">
        <div class="icon">🌙</div>
        <h3>暗適應與明暗調節</h3>
        <p>改善暗處看不清、明暗切換慢、夜間被車燈閃到恢復不了：暗適應階梯、明暗交替、餘光偵測與眩光恢復計時。</p>
      </router-link>
    </div>

    <h2>💪 身體訓練</h2>
    <div class="grid">
      <router-link class="card" to="/isometric">
        <div class="icon">💪</div>
        <h3>等長運動</h3>
        <p>靠牆深蹲、棒式、掌心互推等靜態肌力訓練——實證降血壓效果優於有氧與重訓。</p>
      </router-link>
      <router-link class="card" to="/cardio">
        <div class="icon">🔥</div>
        <h3>安靜燃脂</h3>
        <p>無跳躍高強度間歇：在家幾分鐘就讓心跳飆升、流一身汗，而且樓下聽不到。含心率恢復測量。</p>
      </router-link>
      <router-link class="card" to="/veins">
        <div class="icon">🩸</div>
        <h3>腿部靜脈回流</h3>
        <p>小腿肌肉泵訓練：踝泵、提踵、抬腿與伸展，改善久坐造成的腿部痠脹、腫脹與靜脈曲張症狀。</p>
      </router-link>
      <router-link class="card" to="/pelvic">
        <div class="icon">🌸</div>
        <h3>骨盆底肌訓練</h3>
        <p>凱格爾運動節奏引導（慢縮＋快縮），改善漏尿、產後與術後恢復，坐著就能做。</p>
      </router-link>
      <router-link class="card" to="/autonomic">
        <div class="icon">🫁</div>
        <h3>自律神經調節</h3>
        <p>共振呼吸、4-7-8、生理性嘆息、箱式呼吸、哼鳴與漸進式肌肉放鬆，緩解緊繃、心悸與失眠。</p>
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

<style scoped>
.plan {
  list-style: none;
  margin: 14px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.plan li {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
}
.when {
  flex: none;
  width: 110px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.when strong { color: var(--accent); font-size: 1rem; }
.when span { color: var(--text-dim); font-size: 0.82rem; }
.what { flex: 1; min-width: 240px; }
.what p { margin: 0; color: var(--text-dim); font-size: 0.92rem; line-height: 1.75; }
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px !important;
}
.links a {
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 0.85rem;
  color: var(--accent);
  text-decoration: none;
}
.links a:hover { border-color: var(--accent); background: var(--bg-soft); }
</style>
