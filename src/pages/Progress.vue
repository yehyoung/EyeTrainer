<script setup>
import { computed } from 'vue'
import { records, streak, trainedDates, clearRecords } from '../store'

const MODULE_NAMES = {
  wheel: '☸️ 藏輪圖',
  'focus-chart': '🎯 對焦調節圖',
  'focus-finger': '🎯 手指凝視法',
  stereo: '🌀 3D 立體圖',
  'relax-blink': '👁️ 節拍眨眼',
  'relax-palm': '🤲 掌心熱敷',
  'dark-adapt': '🌑 暗適應階梯',
  'dark-switch': '🔄 明暗交替',
  'dark-periph': '👀 餘光偵測',
  'dark-glare': '💡 眩光恢復',
  isometric: '💪 等長運動',
  cardio: '🔥 安靜燃脂',
  'cardio-hrr': '❤️ 心率恢復',
  veins: '🩸 靜脈回流',
  pelvic: '🌸 骨盆底肌',
  autonomic: '🫁 自律神經',
}

const totalMinutes = computed(() =>
  Math.round(records.reduce((s, r) => s + r.seconds, 0) / 60),
)
const stereoAcc = computed(() => {
  const list = records.filter((r) => r.module === 'stereo')
  if (!list.length) return '—'
  const ok = list.filter((r) => r.extra?.correct).length
  return `${Math.round((ok / list.length) * 100)}%`
})
const recent = computed(() => [...records].sort((a, b) => b.ts - a.ts).slice(0, 30))

function fmtTime(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function confirmClear() {
  if (confirm('確定要清除所有訓練紀錄嗎？此動作無法復原。')) clearRecords()
}
</script>

<template>
  <div class="page">
    <h1>📈 訓練進度</h1>
    <p class="desc">持之以恆最重要——每天幾分鐘，比偶爾練很久有效。</p>

    <div class="stats">
      <div class="stat">
        <div class="num">{{ streak() }} 天</div>
        <div class="lbl">連續訓練</div>
      </div>
      <div class="stat">
        <div class="num">{{ trainedDates().length }} 天</div>
        <div class="lbl">累計訓練日</div>
      </div>
      <div class="stat">
        <div class="num">{{ totalMinutes }} 分</div>
        <div class="lbl">累計時間</div>
      </div>
      <div class="stat">
        <div class="num">{{ stereoAcc }}</div>
        <div class="lbl">立體圖答對率</div>
      </div>
    </div>

    <h2>最近紀錄</h2>
    <table class="rec" v-if="recent.length">
      <thead>
        <tr><th>日期</th><th>時間</th><th>項目</th><th>時長 / 結果</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in recent" :key="r.ts">
          <td>{{ r.date }}</td>
          <td>{{ fmtTime(r.ts) }}</td>
          <td>{{ MODULE_NAMES[r.module] || r.module }}</td>
          <td>
            <template v-if="r.module === 'stereo'">
              {{ r.extra?.correct ? '✅ 答對' : '❌ 答錯' }}（{{ r.seconds }} 秒）
            </template>
            <template v-else-if="r.module === 'isometric' && r.extra?.exercise">
              {{ r.extra.exercise }} {{ r.extra.hold }}秒 × {{ r.extra.sets }}組（{{ r.seconds }} 秒）
            </template>
            <template v-else-if="r.module === 'pelvic' && r.extra?.mode">
              {{ r.extra.mode }} × {{ r.extra.reps }} 次（{{ r.seconds }} 秒）
            </template>
            <template v-else-if="r.module === 'cardio' && r.extra?.programme">
              {{ r.extra.programme }} {{ r.extra.work }}/{{ r.extra.rest }} 秒 ×
              {{ r.extra.rounds }} 輪（{{ Math.round(r.seconds / 60 * 10) / 10 }} 分）
            </template>
            <template v-else-if="r.module === 'veins' && r.extra?.exercise">
              {{ r.extra.exercise }}{{ r.extra.minutes ? ' ' + r.extra.minutes + ' 分鐘'
                : r.extra.reps ? ' ' + r.extra.reps + ' 次 × ' + r.extra.sets + ' 組' : '' }}（{{ r.seconds }} 秒）
            </template>
            <template v-else-if="r.module === 'cardio-hrr'">
              {{ r.extra?.hr1 }} → {{ r.extra?.hr2 }}，一分鐘下降 {{ r.extra?.drop }} 下
            </template>
            <template v-else-if="r.module === 'dark-adapt'">
              暗適應 {{ r.extra?.minutes }} 分鐘，最暗看到第 {{ r.extra?.best || '—' }} 格
            </template>
            <template v-else-if="r.module === 'dark-periph'">
              答對 {{ r.extra?.correct }}/{{ r.extra?.trials }}，偵測極限灰階 {{ r.extra?.threshold ?? '—' }}
            </template>
            <template v-else-if="r.module === 'dark-glare'">
              眩光恢復 {{ r.extra?.recovery ?? r.seconds }} 秒
            </template>
            <template v-else-if="r.module === 'autonomic' && r.extra?.method">
              {{ r.extra.method }}{{ r.extra.preset ? '・' + r.extra.preset : '' }}（{{ r.seconds }} 秒）
            </template>
            <template v-else>{{ r.seconds }} 秒</template>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else style="color: var(--text-dim)">還沒有紀錄，去完成第一次訓練吧！</p>

    <div class="controls" v-if="records.length">
      <button @click="confirmClear">🗑️ 清除所有紀錄</button>
    </div>
  </div>
</template>
