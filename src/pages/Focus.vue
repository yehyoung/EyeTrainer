<script setup>
import { ref, computed, watch } from 'vue'
import { beep, speak } from '../store'
import { useSession } from '../useSession'
import ExplainCard from '../components/ExplainCard.vue'

const tab = ref('chart') // chart=對焦調節圖, finger=手指凝視法

// ================= 對焦調節圖 =================
// 目標字母「由大而清晰 → 小而模糊」循環，模擬物體由近到遠，眼睛努力跟隨對焦
const LETTERS = ['E', 'K', '永', 'W', '目', 'R', '光', 'M', '清', 'B']
const cycleT = ref(8) // 一次遠近循環秒數
const chartDuration = ref(60)
const chart = useSession('focus-chart', chartDuration)

const cycleIndex = computed(() => Math.floor(chart.elapsed.value / cycleT.value))
const letter = computed(() => LETTERS[cycleIndex.value % LETTERS.length])
// 0→1→0：0=最近(大而清晰) 1=最遠(小而模糊)
const farness = computed(() => {
  const p = (chart.elapsed.value % cycleT.value) / cycleT.value
  return 0.5 - 0.5 * Math.cos(Math.PI * 2 * p)
})
const letterStyle = computed(() => {
  const f = farness.value
  return {
    fontSize: `${220 - 190 * f}px`,
    filter: `blur(${(3.2 * f).toFixed(2)}px)`,
    opacity: String(1 - 0.25 * f),
  }
})
const phaseLabel = computed(() => (farness.value < 0.5 ? '接近中…保持清晰' : '遠離中…努力對焦'))

// ================= 手指凝視法（離屏遠近交替） =================
const HOLD = 4 // 每階段秒數
const fingerDuration = ref(120)
const finger = useSession('focus-finger', fingerDuration)
const fingerPhase = computed(() => (Math.floor(finger.elapsed.value / HOLD) % 2 === 0 ? 'near' : 'far'))
const phaseRemain = computed(() => Math.ceil(HOLD - (finger.elapsed.value % HOLD)))

watch(fingerPhase, (p) => {
  if (!finger.running.value) return
  if (p === 'near') { beep(880, 0.12); speak('看近') }
  else { beep(520, 0.12); speak('看遠') }
})

function startFinger() {
  speak('準備。先注視螢幕上的圓點')
  finger.start()
}
</script>

<template>
  <div class="page">
    <h1>🎯 遠近變焦訓練（睫狀肌）</h1>
    <p class="desc">
      睫狀肌像相機的自動對焦：看近時收縮、看遠時放鬆。交替遠近對焦能舒緩緊繃的睫狀肌、改善假性近視與疲勞。
    </p>

    <div class="controls">
      <div class="seg">
        <button :class="{ on: tab === 'chart' }" @click="tab = 'chart'">對焦調節圖</button>
        <button :class="{ on: tab === 'finger' }" @click="tab = 'finger'">手指凝視法（看遠引導）</button>
      </div>
    </div>

    <!-- ============ 對焦調節圖 ============ -->
    <template v-if="tab === 'chart'">
      <ExplainCard
        title="對焦調節圖"
        purpose="訓練睫狀肌的「收縮—放鬆」循環，維持水晶體的調節能力，緩解調節痙攣（假性近視）與長時間看螢幕造成的對焦疲勞。"
        principle="看近物時睫狀肌收縮、水晶體變厚；看遠時睫狀肌放鬆、水晶體變薄——就像相機的自動對焦。畫面中的字母「變小＋變模糊」模擬物體遠離，大腦會驅動調節系統努力對焦；「變大＋變清晰」時則放鬆跟隨。反覆循環等於幫睫狀肌做伸展操，臨床研究顯示規律的對焦切換練習可降低調節遲滯、緩解電腦視覺症候群。"
        :method="[
          '距離螢幕 40–60 公分，視線鎖定字母中心。',
          '字母縮小、變模糊（遠離）時，努力想「看清楚它」。',
          '字母變大、變清晰（接近）時，放鬆地跟隨。',
          '每次 1–3 分鐘，速度從「慢」開始，適應後再加快。',
          '結束後看窗外遠方 20 秒，讓睫狀肌徹底放鬆收尾。',
        ]"
      />
      <div class="controls">
        <label>循環速度</label>
        <select v-model.number="cycleT" @change="chart.reset()">
          <option :value="10">慢（10 秒/次）</option>
          <option :value="8">中（8 秒/次）</option>
          <option :value="6">快（6 秒/次）</option>
        </select>
        <label>時長</label>
        <select v-model.number="chartDuration" @change="chart.reset()">
          <option :value="60">1 分鐘</option>
          <option :value="120">2 分鐘</option>
          <option :value="180">3 分鐘</option>
        </select>
        <button v-if="!chart.running.value" class="primary" @click="chart.start">▶ 開始</button>
        <button v-else @click="chart.pause">⏸ 暫停</button>
        <button @click="chart.reset">↺ 重設</button>
      </div>

      <div class="stage" style="height: 480px">
        <div style="text-align: center">
          <div
            style="font-weight: 700; color: var(--text); line-height: 1;
                   display: flex; align-items: center; justify-content: center;
                   height: 380px; transition: none"
            :style="letterStyle"
          >{{ letter }}</div>
          <div v-if="chart.running.value" style="color: var(--text-dim)">{{ phaseLabel }}</div>
        </div>
        <div class="timer-chip">{{ chart.clock.value }}</div>
        <div v-if="chart.done.value" class="overlay">
          <div class="big-guide">✅ 完成！</div>
          <p>接著看窗外遠方 20 秒，讓睫狀肌徹底放鬆。</p>
          <button class="primary" @click="chart.reset(); chart.start()">再來一次</button>
        </div>
      </div>

      <div class="hint">
        💡 字母縮小變模糊時＝物體遠離，請「努力想看清楚它」；變大變清晰時＝物體接近，放鬆跟隨。
        全程視線鎖定字母中心。
      </div>
    </template>

    <!-- ============ 手指凝視法 ============ -->
    <template v-else>
      <ExplainCard
        title="手指凝視法（遠近交替）"
        purpose="用「真實距離」的遠近切換徹底伸展睫狀肌——這是螢幕內模擬無法取代的訓練，也是改善假性近視、舒緩眼睛疲勞最直接的方法。"
        principle="螢幕與眼睛的距離是固定的，真正的「看遠」必須讓視線離開螢幕。近點（螢幕，約 40–60 公分）與遠點（3 公尺以上）交替注視時，睫狀肌會經歷完整的收縮→放鬆循環，調節幅度遠大於任何螢幕內模擬。這正是眼科普遍建議的「遠近交替凝視法」，本工具用提示音與語音幫你維持穩定節奏。"
        :method="[
          '開始前先選好一個遠方目標：窗外的招牌、對面牆上的時鐘（3 公尺以上，越遠越好）。',
          '聽到「看近」：注視螢幕上的圓點 4 秒，看清楚它。',
          '聽到「看遠」：抬頭注視遠方目標 4 秒，努力看清細節。',
          '交替進行 1–3 分鐘，維持自然呼吸、記得眨眼。',
          '每天 2–3 回效果最佳；戴眼鏡者戴著練即可。',
        ]"
      />
      <div class="controls">
        <label>時長</label>
        <select v-model.number="fingerDuration" @change="finger.reset()">
          <option :value="60">1 分鐘</option>
          <option :value="120">2 分鐘</option>
          <option :value="180">3 分鐘</option>
        </select>
        <button v-if="!finger.running.value" class="primary" @click="startFinger">▶ 開始</button>
        <button v-else @click="finger.pause">⏸ 暫停</button>
        <button @click="finger.reset">↺ 重設</button>
      </div>

      <div class="stage" style="height: 480px">
        <template v-if="finger.running.value">
          <div v-if="fingerPhase === 'near'" style="text-align: center">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: #ffd98a;
                        box-shadow: 0 0 30px #e8b45a; margin: 0 auto 24px"></div>
            <div class="big-guide">看近 👀</div>
            <p style="color: var(--text-dim)">注視上方圓點（{{ phaseRemain }}）</p>
          </div>
          <div v-else style="text-align: center">
            <div style="font-size: 3.2rem; margin-bottom: 10px">🏞️</div>
            <div class="big-guide">看遠！</div>
            <p style="color: var(--text-dim)">
              視線離開螢幕，看 3 公尺以外的目標（窗外更好）（{{ phaseRemain }}）
            </p>
          </div>
        </template>
        <div v-else-if="!finger.done.value" class="overlay" style="position: static; background: none">
          <p style="max-width: 460px; color: var(--text-dim)">
            開始後會以提示音與語音引導您：<br />
            「看近」→ 注視螢幕圓點 {{ HOLD }} 秒；「看遠」→ 抬頭看 3 公尺外目標 {{ HOLD }} 秒，來回交替。<br />
            事先選好一個遠方目標（窗外招牌、牆上時鐘）。
          </p>
        </div>
        <div class="timer-chip">{{ finger.clock.value }}</div>
        <div v-if="finger.done.value" class="overlay">
          <div class="big-guide">✅ 完成！</div>
          <p>做得好，睫狀肌獲得了一次完整的伸展。</p>
          <button class="primary" @click="finger.reset(); startFinger()">再來一次</button>
        </div>
      </div>

      <div class="hint">
        💡 真正的「看遠」無法在螢幕上完成——本訓練用聲音節拍引導您在螢幕（近）與真實遠方之間切換，
        效果等同眼科建議的「遠近交替凝視」。
      </div>
    </template>
  </div>
</template>
