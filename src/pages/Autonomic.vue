<script setup>
import { ref, computed } from 'vue'
import { useIntervals } from '../useIntervals'
import ExplainCard from '../components/ExplainCard.vue'

// 每種技巧：一個循環的步驟樣板（kind 決定圓球大小與提示音）
const METHODS = [
  {
    id: 'resonance',
    name: '共振呼吸',
    emoji: '🌊',
    desc: '以每分鐘約 6 次的節奏均勻呼吸，是提升心率變異度（HRV）與迷走神經張力實證最強的方式。',
    cycle: (s) => [
      { kind: 'in', label: '吸氣', seconds: s.a, freq: 620 },
      { kind: 'out', label: '吐氣', seconds: s.b, freq: 440 },
    ],
    presets: [
      { name: '入門（7 次/分）', a: 4, b: 4.5 },
      { name: '標準（6 次/分）', a: 5, b: 5 },
      { name: '深度（5 次/分）', a: 6, b: 6 },
    ],
    note: '吸吐等長、不憋氣，是最適合每天固定練習的基礎款。',
  },
  {
    id: '478',
    name: '4-7-8 呼吸',
    emoji: '🌙',
    desc: '吸 4 秒、屏息 7 秒、吐 8 秒。吐氣遠長於吸氣，能明顯偏向副交感神經。',
    cycle: () => [
      { kind: 'in', label: '吸氣', seconds: 4, freq: 620 },
      { kind: 'hold', label: '屏息', seconds: 7, freq: 540 },
      { kind: 'out', label: '緩緩吐氣', seconds: 8, freq: 440 },
    ],
    note: '睡前躺著做效果最好。屏息若不適，可自行縮短或略過。',
  },
  {
    id: 'sigh',
    name: '生理性嘆息',
    emoji: '💨',
    desc: '連吸兩口氣再長長吐掉。研究顯示這是最快降低即時焦慮與生理喚起的呼吸法。',
    cycle: () => [
      { kind: 'in', label: '吸氣', seconds: 2, freq: 620 },
      { kind: 'in2', label: '再補吸一小口', seconds: 1, freq: 700 },
      { kind: 'out', label: '長長吐氣', seconds: 6, freq: 440 },
      { kind: 'holdout', label: '停', seconds: 1, freq: 400 },
    ],
    note: '緊張、心悸、上台前做 3～5 次即可，不需要做很久。',
  },
  {
    id: 'box',
    name: '箱式呼吸',
    emoji: '⬜',
    desc: '吸 4、停 4、吐 4、停 4。節奏規律，用於維持冷靜與專注。',
    cycle: () => [
      { kind: 'in', label: '吸氣', seconds: 4, freq: 620 },
      { kind: 'hold', label: '屏息', seconds: 4, freq: 540 },
      { kind: 'out', label: '吐氣', seconds: 4, freq: 440 },
      { kind: 'holdout', label: '停', seconds: 4, freq: 400 },
    ],
    note: '軍警與急救人員常用的穩定法，適合工作中隨時做。',
  },
  {
    id: 'hum',
    name: '哼鳴呼吸',
    emoji: '🐝',
    desc: '吸氣後閉嘴發出「嗯——」的哼聲吐氣，靠喉部振動直接刺激迷走神經。',
    cycle: () => [
      { kind: 'in', label: '吸氣', seconds: 4, freq: 620 },
      { kind: 'out', label: '哼鳴吐氣（嗯——）', seconds: 8, freq: 300 },
    ],
    note: '源自瑜伽的蜂鳴式呼吸。感覺胸口與臉部有振動就對了。',
  },
  {
    id: 'pmr',
    name: '漸進式肌肉放鬆',
    emoji: '🫱',
    desc: '依序收緊再放鬆各部位肌肉，讓長期緊繃的身體重新學會什麼是真正的放鬆。',
    groups: ['雙手握拳', '前臂與上臂', '肩膀上提', '臉部與眉頭', '腹部收緊', '大腿', '小腿與腳掌'],
    note: '收緊時約七成力、不要用到疼痛；放鬆時刻意感受鬆開的落差。',
  },
]


// 生活調整建議（呼吸練習之外，影響自律神經最大的三件事）
const LIFESTYLE = [
  {
    icon: '🥦',
    title: '飲食',
    good: [
      '深綠色蔬菜：青花菜、菠菜、地瓜葉——富含鎂與葉酸，鎂是穩定神經的關鍵礦物質',
      '深海魚：鮭魚、鯖魚、秋刀魚——Omega-3 攝取與較高的心率變異度相關',
      '堅果種子：杏仁、腰果、南瓜子，補鎂最方便的零食',
      '全穀與豆類：血糖上升平緩，避免忽高忽低反覆刺激交感神經',
      '發酵食品與高纖蔬果：腸道菌相會透過腸腦軸影響情緒與自律神經',
      '喝足水：脫水本身就會讓心跳加快、交感興奮',
    ],
    bad: [
      '炸雞、鹽酥雞等油炸與高度加工食品：促進發炎，長期不利自律神經',
      '含糖飲料與精緻甜點：血糖劇烈震盪會引發腎上腺素分泌，造成心悸與疲倦',
      '過量咖啡因：直接刺激交感神經。一天不超過 2 杯，中午過後不再喝',
      '酒精：入睡變快，但會明顯降低夜間 HRV 與深層睡眠，隔天更累',
      '睡前 3 小時內的大餐與宵夜',
    ],
  },
  {
    icon: '🏃',
    title: '運動',
    good: [
      '中低強度有氧：快走、慢跑、游泳、騎車，每週累積 150 分鐘',
      '瑜伽、太極、伸展：結合呼吸與緩慢動作，對自律神經的實證特別好',
      '本站的等長運動與呼吸練習，坐著就能補上一段',
      '每坐 30–60 分鐘起身活動 2–3 分鐘，別讓身體整天定格',
    ],
    bad: [
      '長期過度的高強度訓練：交感會持續亢奮，HRV 反而下降',
      '睡前 2 小時內的激烈運動',
    ],
  },
  {
    icon: '😴',
    title: '睡眠與作息',
    good: [
      '固定起床時間（比固定就寢更重要），假日別差超過 1 小時',
      '起床後 30 分鐘內曬 10 分鐘自然光，校準生理時鐘',
      '睡前 1 小時離開螢幕，改用暖色低亮度照明',
      '睡前溫水泡澡或泡腳 10–15 分鐘',
    ],
    bad: [
      '熬夜與睡眠不足：會直接壓低隔天的心率變異度',
      '在床上滑手機、追劇、處理公事',
    ],
  },
]

const methodId = ref('resonance')
const method = computed(() => METHODS.find((m) => m.id === methodId.value))
const presetIdx = ref(1)
const minutes = ref(3)

const session = useIntervals('autonomic')

function pick(m) {
  methodId.value = m.id
  presetIdx.value = m.id === 'resonance' ? 1 : 0
  session.reset()
}

function buildPlan() {
  const m = method.value
  const plan = [{ kind: 'prep', label: '準備', seconds: 6, freq: 500, say: `準備${m.name}，跟著畫面呼吸` }]

  if (m.id === 'pmr') {
    // 每個部位：收緊 5 秒 → 放鬆 15 秒
    for (const g of m.groups) {
      plan.push({ kind: 'tense', label: `${g} ‧ 收緊`, seconds: 5, freq: 700, say: `${g}，收緊` })
      plan.push({ kind: 'release', label: `${g} ‧ 放鬆`, seconds: 15, freq: 420, say: '放鬆' })
    }
    return plan
  }

  const preset = m.presets ? m.presets[presetIdx.value] : {}
  const cycle = m.cycle(preset)
  const cycleLen = cycle.reduce((s, p) => s + p.seconds, 0)
  const reps = Math.max(1, Math.round((minutes.value * 60) / cycleLen))
  for (let i = 0; i < reps; i++) {
    for (const p of cycle) {
      plan.push({ ...p, say: i === 0 ? p.label : null })
    }
  }
  return plan
}

const paused = computed(() => session.steps.value.length > 0 && !session.done.value)

function onStart() {
  if (paused.value) return session.start()
  const m = method.value
  session.start(buildPlan(), {
    method: m.name,
    preset: m.presets ? m.presets[presetIdx.value].name : null,
  })
}

const totalMin = computed(() => {
  if (method.value.id === 'pmr') {
    return Math.round((6 + method.value.groups.length * 20) / 6) / 10
  }
  return minutes.value
})

const kind = computed(() => session.current.value?.kind)

// 圓球大小 0→1，由訓練狀態逐幀驅動（不依賴 CSS 動畫）
const level = computed(() => {
  const c = session.current.value
  if (!c) return 0
  const p = Math.min(1, session.elapsed.value / c.seconds)
  const eased = p * p * (3 - 2 * p)
  switch (c.kind) {
    case 'in': return eased * 0.75
    case 'in2': return 0.75 + eased * 0.25
    case 'hold': return 1
    case 'out': return 1 - eased
    case 'tense': return eased
    case 'release': return 1 - eased
    default: return 0 // holdout / prep
  }
})

const orbStyle = computed(() => {
  const l = level.value
  return {
    transform: `scale(${(0.45 + 0.55 * l).toFixed(3)})`,
    boxShadow: `0 0 ${(24 + 46 * l).toFixed(0)}px rgba(232, 180, 90, ${(0.28 + 0.45 * l).toFixed(2)})`,
  }
})

const phaseColor = computed(() => {
  if (['in', 'in2', 'tense'].includes(kind.value)) return 'var(--accent)'
  if (['out', 'release'].includes(kind.value)) return 'var(--good)'
  return 'var(--text-dim)'
})
</script>

<template>
  <div class="page">
    <h1>🫁 自律神經調節</h1>
    <p class="desc">
      用呼吸節奏與肌肉放鬆把「油門」（交感）踩輕、把「煞車」（副交感）踩實，
      緩解緊繃、心悸、失眠與久坐帶來的持續壓力反應。
    </p>

    <ExplainCard
      title="自律神經調節"
      purpose="提升副交感神經活性與心率變異度（HRV），緩解自律神經失調常見的心悸、胸悶、肩頸緊繃、腸胃不適、焦慮與入睡困難，並在壓力當下快速把生理喚起降下來。"
      principle="自律神經由交感（油門）與副交感（煞車）組成，長期壓力與久坐會讓交感持續過度活躍。呼吸是少數能被意識直接控制、又能立即影響自律神經的功能：吐氣時心跳自然變慢，因此把吐氣拉長就會偏向副交感。當呼吸放慢到每分鐘約 6 次（0.1 Hz）時，心跳與呼吸進入共振，壓力感受器反射被放大到最強，HRV 振幅顯著提升——這正是 HRV 生理回饋訓練的核心原理，長期練習可提升迷走神經張力並降低血壓與焦慮。哼鳴則透過喉部振動直接刺激行經該處的迷走神經；漸進式肌肉放鬆利用「收緊後放鬆」的對比，讓長期緊繃到失去感覺的肌肉重新學會鬆開。"
      :method="[
        '坐正或躺下，肩頸放鬆，用鼻子吸氣、緩緩吐氣。',
        '把手放在肚子上：吸氣時肚子鼓起、胸口盡量不動，這才是腹式呼吸。',
        '跟著畫面的圓球呼吸——圓球變大時吸氣、變小時吐氣，不要搶拍。',
        '全程輕柔，不要用力猛吸或刻意加快，感覺舒服比做滿更重要。',
        '每天 5–10 分鐘、持續數週效果最明顯；急性緊張時做「生理性嘆息」3–5 次即可。',
      ]"
    />

    <div class="warn">
      ⚠️ 出現頭暈、手腳發麻或刺痛，代表換氣過度，請立即停止並回到自然呼吸。
      含屏息的技巧（4-7-8、箱式呼吸）若您懷孕、有心血管疾病、高血壓、癲癇病史或正在恐慌發作，
      請縮短或略過屏息段落，並先諮詢醫師。<br /><br />
      本頁練習屬保健輔助，無法取代診斷與治療。自律神經失調的症狀與心臟、甲狀腺等疾病高度重疊，
      若有持續心悸、胸痛、暈厥或嚴重失眠，請務必就醫檢查。
    </div>

    <div class="controls">
      <label>技巧</label>
      <div class="seg">
        <button v-for="m in METHODS" :key="m.id" :class="{ on: methodId === m.id }" @click="pick(m)">
          {{ m.emoji }} {{ m.name }}
        </button>
      </div>
    </div>

    <div class="controls">
      <template v-if="method.presets">
        <label>節奏</label>
        <div class="seg">
          <button
            v-for="(p, i) in method.presets" :key="p.name"
            :class="{ on: presetIdx === i }"
            @click="presetIdx = i; session.reset()"
          >{{ p.name }}</button>
        </div>
      </template>
      <template v-if="method.id !== 'pmr'">
        <label>時長</label>
        <select v-model.number="minutes" @change="session.reset()">
          <option :value="2">2 分鐘</option>
          <option :value="3">3 分鐘</option>
          <option :value="5">5 分鐘</option>
          <option :value="10">10 分鐘</option>
        </select>
      </template>
      <span style="color: var(--text-dim)">總長約 {{ totalMin }} 分鐘</span>
      <button v-if="!session.running.value" class="primary" @click="onStart">
        {{ paused ? '▶ 繼續' : '▶ 開始' }}
      </button>
      <button v-else @click="session.pause">⏸ 暫停</button>
      <button @click="session.reset">↺ 重設</button>
    </div>

    <div class="breath-stage">
      <div class="orb-holder">
        <div class="ring-guide"></div>
        <div class="breath-orb" :style="orbStyle">
          <span v-if="session.done.value">✅</span>
          <span v-else-if="!session.current.value">{{ method.emoji }}</span>
        </div>
      </div>

      <div class="phase-info">
        <template v-if="session.current.value">
          <div class="phase-name" :style="{ color: phaseColor }">{{ session.current.value.label }}</div>
          <div class="phase-secs">{{ session.left.value }}</div>
          <div class="phase-total">剩餘總時間 {{ session.clock.value }}</div>
        </template>
        <template v-else-if="session.done.value">
          <div class="phase-name">✅ 完成</div>
          <div class="phase-total">感覺一下現在的呼吸與心跳，是不是比開始前慢了？</div>
        </template>
        <template v-else>
          <div class="phase-name">{{ method.emoji }} {{ method.name }}</div>
          <div class="phase-total">{{ method.desc }}</div>
        </template>
      </div>
    </div>

    <div class="hint">💡 {{ method.note }}</div>
    <div v-if="method.id === 'pmr'" class="hint">
      依序進行 7 個部位：{{ method.groups.join('、') }}——每個部位收緊 5 秒後放鬆 15 秒。
    </div>

    <h2>🌱 生活調整建議</h2>
    <p class="desc">
      呼吸練習能立即把交感神經降下來，但要真正改善體質，飲食、運動與睡眠的影響更大。
      以下是對自律神經影響最明確的幾件事——不必一次做到，先挑一兩項固定下來就會有感。
    </p>

    <div class="life-grid">
      <div v-for="g in LIFESTYLE" :key="g.title" class="life-card">
        <h3>{{ g.icon }} {{ g.title }}</h3>
        <div class="life-label good">✅ 多做 / 多吃</div>
        <ul class="good">
          <li v-for="(t, i) in g.good" :key="i">{{ t }}</li>
        </ul>
        <div class="life-label bad">❌ 少做 / 少吃</div>
        <ul class="bad">
          <li v-for="(t, i) in g.bad" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>

    <div class="hint">
      💡 自律神經的恢復通常以「週」為單位——規律比強度重要。若已在服藥或接受治療，
      請把這些調整當作輔助，不要自行停藥。
    </div>
  </div>
</template>

<style scoped>
.breath-stage {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 26px 20px;
  margin: 14px 0;
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.orb-holder {
  position: relative;
  width: 260px;
  height: 260px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring-guide {
  position: absolute;
  inset: 0;
  border: 2px dashed var(--border);
  border-radius: 50%;
}
.breath-orb {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle at 36% 30%, #ffd98a, #b7823a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
}
.phase-info { flex: 1; min-width: 240px; text-align: center; }
.phase-name { font-size: 1.7rem; font-weight: 700; color: var(--accent); }
.phase-secs {
  font-size: 3.4rem;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}
.phase-total { color: var(--text-dim); font-size: 0.92rem; margin-top: 6px; }

.life-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin: 14px 0;
}
.life-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
}
.life-card h3 { margin: 0 0 10px; color: var(--accent); font-size: 1.05rem; }
.life-label {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 12px 0 4px;
}
.life-label.good { color: var(--good); }
.life-label.bad { color: var(--bad); }
.life-card ul {
  margin: 0 0 0 20px;
  color: var(--text-dim);
  font-size: 0.88rem;
}
.life-card li { margin: 5px 0; }
.life-card ul.good li::marker { color: var(--good); }
.life-card ul.bad li::marker { color: var(--bad); }
</style>
