<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { beep, speak } from '../store'
import { useSession } from '../useSession'
import ExplainCard from '../components/ExplainCard.vue'

// ============ 20-20-20 護眼提醒 ============
const WORK_MIN = 20
const phase = ref('idle') // idle | work | break
const remain = ref(WORK_MIN * 60)
let timer = null

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
function startTwenty() {
  phase.value = 'work'
  remain.value = WORK_MIN * 60
  clearInterval(timer)
  timer = setInterval(() => {
    remain.value--
    if (remain.value > 0) return
    if (phase.value === 'work') {
      phase.value = 'break'
      remain.value = 20
      beep(520, 0.3)
      speak('休息時間，請看向 6 公尺外的遠方 20 秒')
    } else {
      phase.value = 'work'
      remain.value = WORK_MIN * 60
      beep(880, 0.2)
      speak('休息結束')
    }
  }, 1000)
}
function stopTwenty() {
  clearInterval(timer)
  phase.value = 'idle'
}
onUnmounted(() => clearInterval(timer))

// ============ 節拍眨眼 ============
const blinkDur = ref(30)
const blink = useSession('relax-blink', blinkDur)
const blinkOn = ref(false)
watch(blink.elapsed, (t) => {
  const on = Math.floor(t / 0.9) % 2 === 0
  if (on !== blinkOn.value) {
    blinkOn.value = on
    if (on && blink.running.value) beep(700, 0.06, 0.15)
  }
})

// ============ 掌心熱敷 palming ============
const palmDur = ref(90)
const palm = useSession('relax-palm', palmDur)
function startPalm() {
  speak('雙手快速摩擦生熱，輕輕覆蓋閉上的雙眼，不要壓迫眼球。慢慢深呼吸。')
  palm.start()
}
</script>

<template>
  <div class="page">
    <h1>😌 放鬆休息</h1>
    <p class="desc">眼科醫師一致認同：讓眼睛休息、看遠、多眨眼，是最有效的護眼方式。</p>

    <h2>⏰ 20-20-20 護眼提醒</h2>
    <ExplainCard
      title="20-20-20 法則"
      :open="false"
      purpose="預防電腦視覺症候群（CVS），定時打斷睫狀肌長時間的持續緊繃，這是眼科醫師共識度最高的護眼習慣。"
      principle="美國眼科學會（AAO）建議：近距離用眼每 20 分鐘，看 20 英尺（約 6 公尺）外的物體 20 秒，讓調節系統「歸零」。研究顯示規律的用眼休息能顯著降低眼睛疲勞、乾澀與視力模糊的發生。"
      :method="[
        '按「啟動提醒」後保持此分頁開啟，繼續你的工作。',
        '20 分鐘後聽到提示音與語音：起身或抬頭，看向 6 公尺外的物體 20 秒。',
        '再次提示後回到工作，計時自動重新開始，循環進行。',
      ]"
    />
    <div class="controls">
      <template v-if="phase === 'idle'">
        <span style="color: var(--text-dim)">每工作 20 分鐘，提醒你看 6 公尺（20 英尺）外 20 秒。開著這個分頁即可。</span>
        <button class="primary" @click="startTwenty">▶ 啟動提醒</button>
      </template>
      <template v-else>
        <span class="big-guide" style="font-size: 1.5rem">
          {{ phase === 'work' ? '💻 工作中' : '🏞️ 看遠方！' }} {{ fmt(remain) }}
        </span>
        <button @click="stopTwenty">停止</button>
      </template>
    </div>

    <h2>👁️ 節拍眨眼（改善乾眼）</h2>
    <ExplainCard
      title="節拍眨眼"
      :open="false"
      purpose="改善螢幕用眼造成的乾眼與眼睛灼熱感，恢復淚膜的完整與穩定。"
      principle="專注看螢幕時，眨眼頻率會從每分鐘 15–20 次降到 5 次以下，而且多半是「不完全眨眼」（眼皮沒有完全閉合），淚膜提早破裂造成乾澀。刻意的完整眨眼能重新鋪勻淚膜，並擠壓瞼板腺分泌油脂層，減緩淚液蒸發。"
      :method="[
        '跟著節拍完整閉眼、再張開，動作確實但不用力。',
        '持續 30 秒；乾澀嚴重時可加做「輕閉眼 2 秒再張開」數次。',
        '建議每工作 1 小時做一輪，配合 20-20-20 效果更好。',
      ]"
    />
    <div class="controls">
      <button v-if="!blink.running.value" class="primary" @click="blink.start">▶ 開始 30 秒</button>
      <button v-else @click="blink.pause">⏸ 暫停</button>
      <span v-if="blink.running.value" class="big-guide" :style="{ opacity: blinkOn ? 1 : 0.25 }">
        眨眼 👀
      </span>
      <span v-if="blink.done.value" style="color: var(--good); font-weight: 700">✅ 完成！</span>
      <span style="color: var(--text-dim)">跟著節拍完整閉眼再張開，讓淚液均勻濕潤眼球。</span>
    </div>

    <h2>🤲 掌心熱敷（Palming）</h2>
    <ExplainCard
      title="掌心熱敷"
      :open="false"
      purpose="讓視覺系統獲得完全的休息，放鬆眼周肌肉與調節系統，舒緩眼壓感與疲勞。"
      principle="手掌摩擦生熱後覆蓋雙眼，溫熱能促進眼周血液循環；完全遮光的環境下沒有任何光線輸入，瞳孔肌、睫狀肌與外眼肌都能同時放鬆——這是各種眼球放鬆法中最被廣泛採用的一式，眼科醫師也認同「閉眼不讓光源進入」是最好的眼睛休息。"
      :method="[
        '雙手手掌快速摩擦約 10 秒，直到掌心發熱。',
        '手掌呈杯狀輕輕覆蓋閉上的雙眼——蓋住但不壓迫眼球。',
        '在黑暗中緩慢深呼吸，想像遠方的風景，維持 90 秒直到提示音。',
      ]"
    />
    <div class="controls">
      <button v-if="!palm.running.value" class="primary" @click="startPalm">▶ 開始 90 秒</button>
      <button v-else @click="palm.pause">⏸ 暫停</button>
      <span v-if="palm.running.value" class="big-guide" style="font-size: 1.5rem">{{ palm.clock.value }}</span>
      <span v-if="palm.done.value" style="color: var(--good); font-weight: 700">✅ 完成！</span>
    </div>
    <div class="hint">
      1️⃣ 雙手手掌快速摩擦 10 秒生熱 → 2️⃣ 手掌呈杯狀輕蓋閉上的雙眼（勿壓眼球）→
      3️⃣ 全黑環境中深呼吸，想像遠方風景，直到提示音響起。
    </div>
  </div>
</template>
