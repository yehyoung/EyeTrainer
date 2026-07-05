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
