<script setup>
import { ref, computed } from 'vue'
import { useIntervals } from '../useIntervals'
import ExplainCard from '../components/ExplainCard.vue'

const MODES = [
  { id: 'slow', name: '慢縮（耐力）', desc: '收緊並維持數秒後完全放鬆，訓練骨盆底肌的耐力與支撐力。' },
  { id: 'quick', name: '快縮（反應）', desc: '快速收放，訓練咳嗽、打噴嚏、提重物瞬間的即時收縮反應。' },
  { id: 'full', name: '完整課程', desc: '慢縮 + 快縮各一組，符合臨床建議的完整處方（建議每日 3 回）。' },
]

const mode = ref('full')
const holdSec = ref(5) // 慢縮維持秒數
const reps = ref(10)

const session = useIntervals('pelvic')

function buildPlan() {
  const plan = [
    { kind: 'prep', label: '準備', seconds: 10, say: '準備。找到骨盆底肌，像忍住排氣那樣向上收提，腹部與大腿保持放鬆' },
  ]
  const doSlow = mode.value === 'slow' || mode.value === 'full'
  const doQuick = mode.value === 'quick' || mode.value === 'full'

  if (doSlow) {
    for (let i = 1; i <= reps.value; i++) {
      plan.push({
        kind: 'work',
        label: `慢縮 ${i} / ${reps.value} ‧ 收緊上提`,
        seconds: holdSec.value,
        say: i === 1 ? '收緊，向上提，維持' : null,
      })
      plan.push({
        kind: 'rest',
        label: `慢縮 ${i} / ${reps.value} ‧ 完全放鬆`,
        seconds: holdSec.value,
        say: i === 1 ? '完全放鬆' : null,
      })
    }
  }

  if (doSlow && doQuick) {
    plan.push({ kind: 'rest', label: '組間休息 ‧ 接著做快縮', seconds: 20, say: '休息二十秒，接著做快縮' })
  }

  if (doQuick) {
    for (let i = 1; i <= reps.value; i++) {
      plan.push({
        kind: 'work',
        label: `快縮 ${i} / ${reps.value} ‧ 收`,
        seconds: 1,
        say: i === 1 ? '快速收放，收' : null,
        vol: 0.18,
      })
      plan.push({
        kind: 'rest',
        label: `快縮 ${i} / ${reps.value} ‧ 放`,
        seconds: 2,
        vol: 0.12,
      })
    }
  }
  return plan
}

const paused = computed(() => session.steps.value.length > 0 && !session.done.value)

function onStart() {
  if (paused.value) return session.start() // 從暫停處繼續
  session.start(buildPlan(), {
    mode: MODES.find((m) => m.id === mode.value).name,
    reps: reps.value,
    hold: holdSec.value,
  })
}

const totalMin = computed(() => {
  let s = 10
  const doSlow = mode.value === 'slow' || mode.value === 'full'
  const doQuick = mode.value === 'quick' || mode.value === 'full'
  if (doSlow) s += holdSec.value * 2 * reps.value
  if (doSlow && doQuick) s += 20
  if (doQuick) s += 3 * reps.value
  return Math.round((s / 60) * 10) / 10
})

const kind = computed(() => session.current.value?.kind)
const isWork = computed(() => kind.value === 'work')
const isQuick = computed(() => !!session.current.value?.label?.startsWith('快縮'))

// 圓球上提程度 0→1，由訓練狀態直接驅動（不依賴 CSS 動畫，分頁切回時也不會卡住）
const lift = computed(() => {
  const c = session.current.value
  if (!c) return 0
  const ramp = Math.min(0.85, c.seconds * 0.45) // 上提／下降所需秒數
  const t = Math.min(1, session.elapsed.value / ramp)
  const eased = t * t * (3 - 2 * t) // smoothstep
  if (c.kind === 'work') return eased
  if (c.kind === 'rest') return 1 - eased
  return 0 // 準備階段維持在底部
})

const orbStyle = computed(() => {
  const l = lift.value
  return {
    transform: `translateY(${(-92 * l).toFixed(1)}px) scale(${(1 - 0.28 * l).toFixed(3)})`,
    boxShadow: `0 0 ${(36 + 30 * l).toFixed(0)}px rgba(232, 180, 90, ${(0.35 + 0.4 * l).toFixed(2)})`,
  }
})
</script>

<template>
  <div class="page">
    <h1>🌸 骨盆底肌訓練（凱格爾）</h1>
    <p class="desc">
      坐著、站著、通勤時都能做，旁人完全看不出來。改善漏尿、產後恢復、攝護腺術後控制與核心穩定。
    </p>

    <ExplainCard
      title="骨盆底肌訓練"
      purpose="強化承托膀胱、子宮／攝護腺與直腸的骨盆底肌群，改善應力性尿失禁（咳嗽、打噴嚏、大笑時漏尿）、產後鬆弛、攝護腺手術後的控尿能力，並提升核心穩定與性功能。"
      principle="骨盆底肌像一張吊床，從下方托住骨盆腔器官，並與尿道、肛門括約肌共同控制排泄。懷孕生產、老化、慢性咳嗽、久坐與肥胖都會使其鬆弛無力，導致腹壓上升時來不及收縮而漏尿。反覆的收縮—放鬆訓練能增加肌纖維力量與神經徵召速度：慢縮訓練耐力與靜態支撐，快縮訓練腹壓瞬間上升時的反射性收縮。這是國際指引一致列為應力性尿失禁的第一線治療，通常需持續 3 個月以上才會有明顯改善。"
      :method="[
        '找到正確肌肉：想像正在忍住排氣、同時把陰道／會陰向上提，會感覺骨盆底有「提起」的感覺。',
        '收縮時腹部、大腿、臀部都要保持放鬆——只收縮骨盆底肌，可把手放在肚子上確認腹部沒有繃緊。',
        '全程正常呼吸，絕對不要憋氣；跟著畫面的圓圈上提與下降即可。',
        '慢縮：收緊維持數秒再完全放鬆，放鬆時間至少與收縮一樣長。快縮：快速收放，訓練反應速度。',
        '臨床建議劑量：慢縮與快縮各 10 次為一回，每天 3 回，持續至少 3 個月。',
      ]"
    />

    <div class="warn">
      ⚠️ 請勿以「中斷尿流」當作日常練習方式（偶爾確認肌肉位置可以，反覆練習會造成排尿不完全與感染風險）。
      放鬆與收縮同樣重要——過度訓練可能造成骨盆底肌過度緊繃，反而引起疼痛、頻尿或排便困難。
      若有骨盆疼痛、持續漏尿、產後或術後復健需求，請諮詢醫師或骨盆底物理治療師。
    </div>

    <div class="controls">
      <label>課程</label>
      <div class="seg">
        <button v-for="m in MODES" :key="m.id" :class="{ on: mode === m.id }" @click="mode = m.id; session.reset()">
          {{ m.name }}
        </button>
      </div>
    </div>

    <div class="controls">
      <label>慢縮維持</label>
      <select v-model.number="holdSec" @change="session.reset()">
        <option :value="3">3 秒（初學）</option>
        <option :value="5">5 秒</option>
        <option :value="8">8 秒</option>
        <option :value="10">10 秒（進階）</option>
      </select>
      <label>次數</label>
      <select v-model.number="reps" @change="session.reset()">
        <option v-for="n in [5, 8, 10, 12]" :key="n" :value="n">{{ n }} 次</option>
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

    <div class="stage-pelvic">
      <div class="orb-area">
        <div class="orb" :class="{ up: isWork }" :style="orbStyle">
          <span v-if="session.current.value && kind !== 'prep'">{{ isWork ? '收緊 ↑' : '放鬆 ↓' }}</span>
          <span v-else-if="session.done.value">✅</span>
          <span v-else>🌸</span>
        </div>
        <div class="floor-line"></div>
      </div>

      <div class="phase-label">
        <template v-if="session.current.value">
          <div class="big" :class="{ work: isWork }">
            {{ session.current.value.label }}
          </div>
          <div class="secs">{{ session.left.value }} 秒</div>
        </template>
        <template v-else-if="session.done.value">
          <div class="big">✅ 完成！記得每天做 3 回</div>
        </template>
        <template v-else>
          <div class="big">{{ MODES.find((m) => m.id === mode).desc }}</div>
        </template>
      </div>
    </div>

    <div v-if="session.running.value" class="hint">
      🫁 正常呼吸、不要憋氣｜腹部・大腿・臀部保持放鬆，只收縮骨盆底肌
    </div>
  </div>
</template>

<style scoped>
.stage-pelvic {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px 20px;
  margin: 14px 0;
}
.orb-area {
  position: relative;
  height: 240px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 34px;
}
.orb {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #ffd98a, #b7823a);
  box-shadow: 0 0 36px rgba(232, 180, 90, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #1a1508;
  font-size: 1.05rem;
  /* transform / box-shadow 由 Vue 狀態逐幀驅動，此處僅過渡配色 */
  transition: background 0.3s ease;
}
.orb.up {
  background: radial-gradient(circle at 38% 32%, #fff0c8, #e8b45a);
}
.floor-line {
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 30px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-soft), transparent);
}
.phase-label { text-align: center; margin-top: 6px; }
.phase-label .big {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-dim);
}
.phase-label .big.work { color: var(--accent); }
.phase-label .secs {
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text);
  margin-top: 4px;
}
</style>
