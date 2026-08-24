<script setup>
import { ref, computed } from 'vue'
import { useIntervals } from '../useIntervals'
import { beep, speak } from '../store'
import ExplainCard from '../components/ExplainCard.vue'
import imgWallSquat from '../assets/wall-squat.webp'
import imgPlank from '../assets/plank.webp'
import imgChestPress from '../assets/chest-press.webp'
import imgNeck from '../assets/neck-iso.webp'
import imgGlute from '../assets/glute.webp'
import imgGrip from '../assets/grip.webp'

const EXERCISES = [
  {
    id: 'wall-squat',
    name: '靠牆深蹲',
    emoji: '🧱',
    img: imgWallSquat,
    hold: 120,
    sets: 4,
    rest: 120,
    note: '降血壓實證最強的項目。研究方案：每週 3 次，每次 2 分鐘 × 4 組、組間休息 1–2 分鐘。',
    steps: [
      '背部平貼牆面，雙腳向前踏出約一步半、與肩同寬。',
      '沿牆面下滑，直到大腿與地面平行（膝蓋約 90 度，膝蓋不超過腳尖）。',
      '雙手自然垂放或交叉於胸前，維持姿勢不動。',
      '大腿發抖是正常現象；膝蓋不適就減少下蹲幅度。',
    ],
  },
  {
    id: 'plank',
    name: '棒式',
    emoji: '🧘',
    img: imgPlank,
    hold: 30,
    sets: 3,
    rest: 60,
    note: '強化核心與下背，改善久坐造成的核心無力。從 20–30 秒開始即可。',
    steps: [
      '前臂與腳尖撐地，手肘位於肩膀正下方。',
      '頭、肩、臀、腳踝維持一直線，腹部與臀部同時收緊。',
      '不要塌腰或翹臀，視線看向雙手前方地面。',
      '若下背不適，改做跪姿棒式（膝蓋著地）。',
    ],
  },
  {
    id: 'chest-press',
    name: '掌心互推',
    emoji: '🙏',
    img: imgChestPress,
    hold: 30,
    sets: 3,
    rest: 30,
    note: '坐在辦公椅上就能做，完全不需器材、旁人也看不出來。',
    steps: [
      '雙手合十於胸前，手肘向兩側打開與肩同高。',
      '雙掌用力互推，感覺胸部與肩膀出力，但手不移動。',
      '約使用七成力量，全程正常呼吸。',
    ],
  },
  {
    id: 'neck',
    name: '頸部等長',
    emoji: '🙆',
    img: imgNeck,
    hold: 15,
    sets: 4,
    rest: 15,
    note: '針對低頭族的頸部無力與痠痛；四組可依序做前、後、左、右四個方向。',
    steps: [
      '掌心抵住額頭，頭部向前輕推、手掌給予相同阻力，頭不移動。',
      '下一組換成雙手抱後腦，頭向後推。',
      '再來左右各一組：手掌抵住同側太陽穴，頭向手掌方向推。',
      '力量約三到五成即可，切勿用力過猛。',
    ],
  },
  {
    id: 'glute',
    name: '臀部收縮',
    emoji: '🪑',
    img: imgGlute,
    hold: 20,
    sets: 4,
    rest: 20,
    note: '久坐會讓臀肌「失憶」，這是坐著就能喚醒臀肌的方式。',
    steps: [
      '坐姿或站姿皆可，雙腳平踏地面。',
      '用力夾緊臀部肌肉，感覺身體被微微推高。',
      '維持收縮，腹部放鬆、正常呼吸。',
    ],
  },
  {
    id: 'grip',
    name: '握力維持',
    emoji: '✊',
    img: imgGrip,
    hold: 120,
    sets: 4,
    rest: 60,
    note: '握力訓練同樣有降血壓實證，可用握力器或捲起的毛巾。約使用三成最大力量。',
    steps: [
      '單手握住握力器或捲緊的毛巾。',
      '以約三成力量持續握緊，不要用盡全力。',
      '每組可左右手交替進行。',
    ],
  },
]

const exId = ref('wall-squat')
const ex = computed(() => EXERCISES.find((e) => e.id === exId.value))

const hold = ref(EXERCISES[0].hold)
const sets = ref(EXERCISES[0].sets)
const rest = ref(EXERCISES[0].rest)

function pick(e) {
  exId.value = e.id
  hold.value = e.hold
  sets.value = e.sets
  rest.value = e.rest
  session.reset()
}

// 語音倒數：長時間維持時每隔一段報一次剩餘秒數，最後 3 秒逐秒倒數
const MILESTONES = [90, 60, 50, 40, 30, 20, 10]

function onSecond(step, left) {
  const first = left >= Math.floor(step.seconds) // 步驟剛開始的那一秒，讓開場語音先講完
  if (step.kind === 'prep') {
    if (left <= 3 && left >= 1) {
      beep(760, 0.09, 0.2)
      speak(String(left))
    }
    return
  }
  if (step.kind === 'work') {
    if (!first && MILESTONES.includes(left)) {
      beep(560, 0.08, 0.16)
      speak(`還有 ${left} 秒`)
    } else if (left <= 3 && left >= 1) {
      beep(760, 0.09, 0.2)
      speak(String(left))
    }
    return
  }
  if (step.kind === 'rest') {
    if (!first && left === 10) {
      beep(500, 0.08, 0.16)
      speak('還有十秒')
    } else if (left <= 3 && left >= 1) {
      beep(700, 0.09, 0.2)
      speak(String(left))
    }
  }
}

const session = useIntervals('isometric', { onSecond })

function buildPlan() {
  const name = ex.value.name
  const plan = [{ kind: 'prep', label: '準備', seconds: 8, say: `準備${name}` }]
  for (let i = 1; i <= sets.value; i++) {
    plan.push({
      kind: 'work',
      label: `第 ${i} / ${sets.value} 組 ‧ 用力維持`,
      seconds: hold.value,
      say: i === 1 ? '開始，持續呼吸' : `第 ${i} 組`,
    })
    if (i < sets.value) {
      plan.push({
        kind: 'rest',
        label: `休息 ‧ 下一組 ${i + 1} / ${sets.value}`,
        seconds: rest.value,
        say: '放鬆休息',
      })
    }
  }
  return plan
}

const paused = computed(() => session.steps.value.length > 0 && !session.done.value)

function onStart() {
  if (paused.value) return session.start() // 從暫停處繼續
  session.start(buildPlan(), { exercise: ex.value.name, hold: hold.value, sets: sets.value })
}

const totalMin = computed(() => {
  const s = 8 + hold.value * sets.value + rest.value * (sets.value - 1)
  return Math.round((s / 60) * 10) / 10
})

// 進度環
const R = 88
const C = 2 * Math.PI * R
const dash = computed(() => C * (1 - session.progress.value))

const phaseColor = computed(() => {
  const k = session.current.value?.kind
  if (k === 'work') return 'var(--accent)'
  if (k === 'rest') return 'var(--good)'
  return 'var(--text-dim)'
})
</script>

<template>
  <div class="page">
    <h1>💪 等長運動（Isometric）</h1>
    <p class="desc">
      肌肉出力但關節不動的靜態訓練。久坐時就能做，並且是目前實證中降血壓效果最佳的運動形式。
    </p>

    <ExplainCard
      title="等長運動"
      purpose="在不移動關節的情況下強化肌力、改善久坐造成的核心與臀部無力，並幫助降低靜態血壓——研究顯示其降壓效果優於有氧運動與重量訓練。"
      principle="等長收縮時肌肉持續出力、長度不變，血管在收縮期間受到壓迫，放鬆後血流大量湧入，反覆刺激會促進血管內皮功能改善與自律神經調節，因而降低靜態血壓。一項涵蓋 270 篇隨機對照試驗、近 1.6 萬人的統合分析發現，等長運動（尤其是靠牆深蹲）平均可降低收縮壓約 8–10 mmHg，效果優於慢跑與重訓。同時，靜態維持姿勢也能有效徵召深層穩定肌群，適合彌補久坐族的肌力缺口。"
      :method="[
        '選擇項目後依畫面步驟擺好姿勢，8 秒準備時間後開始。',
        '「用力維持」期間保持姿勢不動、肌肉持續出力，強度約為最大力量的 30–70%。',
        '⚠️ 全程正常呼吸、絕對不要憋氣——憋氣（伐氏操作）會使血壓瞬間飆升。',
        '「休息」期間完全放鬆，讓血流回灌，這是產生降壓效果的關鍵環節。',
        '降血壓建議劑量：靠牆深蹲 2 分鐘 × 4 組，每週 3 次，持續 8 週以上。',
      ]"
    />

    <div class="warn">
      ⚠️ 有高血壓、心血管疾病、青光眼或視網膜病變者，等長運動期間血壓會短暫升高，請先諮詢醫師再開始，
      並務必保持呼吸順暢。過程中若出現頭暈、胸悶、心悸、頭痛或關節疼痛，請立即停止。
    </div>

    <div class="controls">
      <label>項目</label>
      <div class="seg">
        <button v-for="e in EXERCISES" :key="e.id" :class="{ on: exId === e.id }" @click="pick(e)">
          {{ e.emoji }} {{ e.name }}
        </button>
      </div>
    </div>

    <div class="controls">
      <label>維持</label>
      <select v-model.number="hold" @change="session.reset()">
        <option :value="15">15 秒</option>
        <option :value="20">20 秒</option>
        <option :value="30">30 秒</option>
        <option :value="45">45 秒</option>
        <option :value="60">1 分鐘</option>
        <option :value="120">2 分鐘</option>
      </select>
      <label>組數</label>
      <select v-model.number="sets" @change="session.reset()">
        <option v-for="n in [2, 3, 4, 5, 6]" :key="n" :value="n">{{ n }} 組</option>
      </select>
      <label>休息</label>
      <select v-model.number="rest" @change="session.reset()">
        <option :value="15">15 秒</option>
        <option :value="20">20 秒</option>
        <option :value="30">30 秒</option>
        <option :value="60">1 分鐘</option>
        <option :value="120">2 分鐘</option>
      </select>
      <span style="color: var(--text-dim)">總長約 {{ totalMin }} 分鐘</span>
    </div>

    <div class="controls">
      <button v-if="!session.running.value" class="primary" @click="onStart">
        {{ paused ? '▶ 繼續' : '▶ 開始訓練' }}
      </button>
      <button v-else @click="session.pause">⏸ 暫停</button>
      <button @click="session.reset">↺ 重設</button>
      <span v-if="session.steps.value.length" style="color: var(--text-dim)">
        剩餘總時間 {{ session.clock.value }}
      </span>
    </div>

    <div class="trainer">
      <div class="ring-wrap">
        <svg viewBox="0 0 200 200" class="ring">
          <circle cx="100" cy="100" :r="R" fill="none" stroke="var(--border)" stroke-width="12" />
          <circle
            cx="100" cy="100" :r="R" fill="none"
            :stroke="phaseColor" stroke-width="12" stroke-linecap="round"
            :stroke-dasharray="C" :stroke-dashoffset="dash"
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div class="ring-center">
          <template v-if="session.current.value">
            <div class="count" :style="{ color: phaseColor }">{{ session.left.value }}</div>
            <div class="phase">{{ session.current.value.label }}</div>
          </template>
          <template v-else-if="session.done.value">
            <div class="count" style="font-size: 2.4rem">✅</div>
            <div class="phase">完成！</div>
          </template>
          <template v-else>
            <div class="count" style="font-size: 2.6rem">{{ ex.emoji }}</div>
            <div class="phase">按「開始訓練」</div>
          </template>
        </div>
      </div>

      <div class="side">
        <h2 style="margin-top: 0">{{ ex.emoji }} {{ ex.name }}</h2>
        <div class="howto-row">
          <img :src="ex.img" :alt="`${ex.name}姿勢示意圖`" class="pose" />
          <ol class="howto">
            <li v-for="(s, i) in ex.steps" :key="i">{{ s }}</li>
          </ol>
        </div>
        <div class="hint" style="margin-bottom: 0">💡 {{ ex.note }}</div>
      </div>
    </div>

    <div v-if="session.current.value?.kind === 'work'" class="breathe">
      🫁 持續呼吸 ‧ 不要憋氣
    </div>
  </div>
</template>

<style scoped>
.trainer {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
  align-items: flex-start;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin: 14px 0;
}
.ring-wrap { position: relative; width: 240px; height: 240px; flex: none; }
.ring { width: 100%; height: 100%; }
.ring circle { transition: stroke 0.3s; }
.ring-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 0 24px;
}
.count {
  font-size: 3.6rem; font-weight: 700; line-height: 1;
  font-variant-numeric: tabular-nums; color: var(--accent);
}
.phase { color: var(--text-dim); font-size: 0.9rem; margin-top: 8px; }
.side { flex: 1; min-width: 260px; }
.howto-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
.pose {
  width: 210px;
  flex: none;
  border-radius: 10px;
  background: #fff;
  border: 1px solid var(--border);
}
.howto {
  flex: 1;
  min-width: 220px;
  margin: 4px 0 12px 20px;
  color: var(--text-dim);
  font-size: 0.92rem;
}
.howto li { margin: 5px 0; }
.breathe {
  text-align: center; font-size: 1.15rem; font-weight: 700;
  color: var(--accent); background: var(--bg-card);
  border: 1px solid var(--accent-soft); border-radius: 12px;
  padding: 14px; animation: pulse 3s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
</style>
