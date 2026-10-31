<script setup>
import { ref, computed } from 'vue'
import { useIntervals } from '../useIntervals'
import { beep, speak } from '../store'
import ExplainCard from '../components/ExplainCard.vue'
import PoseImage from '../components/PoseImage.vue'
import imgPump from '../assets/vein-pump.webp'
import imgAnkle from '../assets/ankle-pump.webp'
import imgDesk from '../assets/desk-pump.webp'
import imgCalf from '../assets/calf-raise.webp'
import imgStretch from '../assets/calf-stretch.webp'
import imgElevate from '../assets/leg-elevate.webp'

// ============================================================
// 練習庫
// foot：是否顯示腳踝動畫（伸展與抬腿不需要）
// ============================================================
const EXERCISES = [
  {
    id: 'ankle',
    emoji: '🦶',
    name: '踝泵運動',
    img: imgAnkle,
    where: '躺著或坐著',
    foot: true,
    cue: { up: '腳尖勾起', down: '腳尖下壓', upWord: '勾起', downWord: '下壓' },
    up: 3, down: 3, reps: 15, sets: 2, rest: 30,
    note: '術後預防血栓最常開的運動處方，躺在床上就能做。動作慢、幅度做到底，比做得快重要得多。',
    steps: [
      '躺下或坐著把腿伸直，膝蓋放鬆、不要用力壓直。',
      '腳尖用力向上勾到底，感覺小腿後側被拉緊。',
      '再用力向下壓到底，感覺小腿肚整個收縮鼓起。',
      '每個方向都做到活動範圍的底端——幅度不夠，泵就打不滿。',
    ],
  },
  {
    id: 'desk',
    emoji: '💺',
    name: '坐姿腳跟腳尖交替',
    img: imgDesk,
    where: '坐在辦公椅上',
    foot: true,
    cue: { up: '腳尖翹高', down: '腳跟抬高', upWord: '翹腳尖', downWord: '抬腳跟' },
    up: 2, down: 2, reps: 20, sets: 2, rest: 20,
    note: '開會、打字時桌子底下就能做，旁人看不出來。久坐族最該養成的習慣：每 30 分鐘做 20 下。',
    steps: [
      '坐正，雙腳平踩地面，大腿後側不要被椅緣壓住。',
      '腳跟踩地、腳尖翹高，停一下。',
      '換成腳尖踩地、腳跟抬高，把小腿肚夾緊。',
      '上半身不要跟著晃，動作只發生在腳踝。',
    ],
  },
  {
    id: 'calf',
    emoji: '🧗',
    name: '小腿提踵',
    img: imgCalf,
    where: '站著，手扶牆或椅背',
    foot: true,
    // 站姿只做蹠屈（踮腳），不會勾腳，腳踝動畫從中立位開始
    plantarOnly: true,
    cue: { up: '腳跟抬高', down: '慢慢放下', upWord: '抬起', downWord: '放下' },
    up: 2, down: 3, reps: 15, sets: 3, rest: 45,
    note: '站姿提踵要對抗全身體重，是把小腿肌肉泵「練強」最有效的動作。放下時刻意放慢，離心階段才是練肌力的重點。',
    steps: [
      '面向牆壁，雙手輕扶牆面保持平衡，雙腳與髖同寬。',
      '腳跟用力抬到最高點，停住一秒。',
      '花 3 秒慢慢放下，腳跟輕輕觸地後再抬起。',
      '膝蓋打直但不鎖死；做到小腿發脹是正常的。',
    ],
  },
  {
    id: 'stretch',
    emoji: '🧘',
    name: '小腿與膝窩伸展',
    img: imgStretch,
    where: '站著扶牆',
    foot: false,
    up: 30, down: 0, reps: 2, sets: 2, rest: 15,
    note: '踝關節活動度變差的人，小腿肌肉泵的效率也會跟著下降。把小腿後側與膝窩附近的張力拉開，前面三個動作才做得出完整幅度。',
    steps: [
      '面向牆壁雙手扶牆，一腳向後踏一大步。',
      '後腳腳跟踩住地面、膝蓋打直，身體慢慢往前靠。',
      '感覺後腳小腿後側與膝窩被拉開，停留住、不要彈動。',
      '換邊。伸展時正常呼吸，拉到緊而不痛的程度就好。',
    ],
  },
  {
    id: 'elevate',
    emoji: '🛏️',
    name: '抬腿休息',
    img: imgElevate,
    where: '躺在床上或地板',
    foot: false,
    up: 0, down: 0, reps: 0, sets: 0, rest: 0,
    note: '腳踝要明顯高過心臟才有意義——坐在沙發上把腳放在矮凳上是不夠的。傍晚腫脹最明顯的時候做，最有感。',
    steps: [
      '平躺，把雙腿放在疊起的枕頭上，或直接靠在牆上。',
      '腳踝高度要明顯高過心臟（大約 15–20 公分以上）。',
      '膝蓋微彎，不要讓膝窩懸空被壓住。',
      '過程中每隔幾分鐘勾放腳踝十下，讓肌肉泵也一起運作。',
    ],
  },
]

const exId = ref('ankle')
const ex = computed(() => EXERCISES.find((e) => e.id === exId.value))

const reps = ref(EXERCISES[0].reps)
const sets = ref(EXERCISES[0].sets)
const elevateMin = ref(15)

function pick(e) {
  exId.value = e.id
  reps.value = e.reps
  sets.value = e.sets
  session.reset()
}

// 抬腿時每 3 分鐘提醒動一次腳踝，不然只是單純躺著
const ELEVATE_REMIND = 180

function onSecond(step, left) {
  const first = left >= Math.floor(step.seconds) // 開場語音還在講，先別插話
  if (step.kind === 'hold') {
    const passed = Math.round(step.seconds - left)
    if (!first && passed > 0 && passed % ELEVATE_REMIND === 0) {
      beep(560, 0.08, 0.16)
      speak('勾放腳踝十下')
    }
    return
  }
  if (step.kind === 'stretch' && !first && left === 10) {
    beep(560, 0.08, 0.16)
    speak('還有十秒')
    return
  }
  // 一上一下只有 2–3 秒，逐秒報數會蓋掉節奏音，只有長步驟才倒數
  if (step.seconds >= 8 && left <= 3 && left >= 1) {
    beep(740, 0.09, 0.2)
    speak(String(left))
  }
}

const session = useIntervals('veins', { onSecond })

function buildPlan() {
  const e = ex.value

  if (e.id === 'elevate') {
    return [
      {
        kind: 'prep', label: '擺好姿勢', seconds: 15, freq: 520,
        say: '平躺下來，把雙腿抬高放在枕頭上，腳踝要高過心臟',
      },
      {
        kind: 'hold', label: `抬腿休息 ‧ ${elevateMin.value} 分鐘`,
        seconds: elevateMin.value * 60, say: '開始，放鬆呼吸', freq: 600,
      },
    ]
  }

  if (e.id === 'stretch') {
    const plan = [
      { kind: 'prep', label: '準備', seconds: 8, say: '面向牆壁扶好，一腳向後踏一大步', freq: 520 },
    ]
    for (let s = 1; s <= sets.value; s++) {
      const sides = ['左腳', '右腳']
      sides.forEach((side, i) => {
        plan.push({
          kind: 'stretch',
          label: `第 ${s} / ${sets.value} 組 ‧ ${side}在後`,
          seconds: e.up,
          say: s === 1 && i === 0 ? `${side}向後，腳跟踩地，身體前靠` : `換${side}`,
          freq: 700,
        })
      })
      if (s < sets.value) {
        plan.push({ kind: 'rest', label: '放鬆', seconds: e.rest, say: '放鬆', freq: 440 })
      }
    }
    return plan
  }

  // 踝泵 / 坐姿交替 / 提踵：一上一下算一次
  const { up: upSay, down: downSay, upWord, downWord } = e.cue
  const plan = [
    { kind: 'prep', label: '準備', seconds: 8, say: `準備${e.name}。${e.where}`, freq: 520 },
  ]
  for (let s = 1; s <= sets.value; s++) {
    for (let i = 1; i <= reps.value; i++) {
      plan.push({
        kind: 'up',
        label: `第 ${s} / ${sets.value} 組 ‧ ${i} / ${reps.value} ‧ ${upWord}`,
        seconds: e.up,
        // 只有每組第一次報口令，其餘靠提示音帶節奏，否則語音會一直蓋過去
        say: i === 1 ? (s === 1 ? `開始，${upSay}` : `第 ${s} 組，${upSay}`) : null,
        freq: 780, vol: 0.16,
      })
      plan.push({
        kind: 'down',
        label: `第 ${s} / ${sets.value} 組 ‧ ${i} / ${reps.value} ‧ ${downWord}`,
        seconds: e.down,
        say: i === 1 && s === 1 ? downSay : null,
        freq: 520, vol: 0.12,
      })
    }
    if (s < sets.value) {
      plan.push({
        kind: 'rest', label: `休息 ‧ 下一組 ${s + 1} / ${sets.value}`,
        seconds: e.rest, say: '放鬆休息', freq: 440,
      })
    }
  }
  return plan
}

const paused = computed(() => session.steps.value.length > 0 && !session.done.value)

function onStart() {
  if (paused.value) return session.start() // 從暫停處繼續
  const e = ex.value
  session.start(buildPlan(), {
    exercise: e.name,
    reps: e.id === 'elevate' || e.id === 'stretch' ? 0 : reps.value,
    sets: e.id === 'elevate' ? 0 : sets.value,
    minutes: e.id === 'elevate' ? elevateMin.value : 0,
  })
}

const totalMin = computed(() => {
  const e = ex.value
  if (e.id === 'elevate') return elevateMin.value
  const s =
    e.id === 'stretch'
      ? 8 + e.up * 2 * sets.value + e.rest * (sets.value - 1)
      : 8 + (e.up + e.down) * reps.value * sets.value + e.rest * (sets.value - 1)
  return Math.round((s / 60) * 10) / 10
})

// ============================================================
// 腳踝動畫：角度直接由訓練狀態推算，分頁切回來也不會卡住
// 負角＝腳尖向上勾（背屈），正角＝腳尖向下壓（蹠屈）
// 提踵是站姿，不會做背屈，所以下限用中立位 0 度
// ============================================================
const DORSI = -24
const PLANTAR = 38

const footAngle = computed(() => {
  const c = session.current.value
  if (!c || (c.kind !== 'up' && c.kind !== 'down')) return 0
  const ramp = Math.min(0.9, c.seconds * 0.5) // 轉到定位所需秒數
  const t = Math.min(1, session.elapsed.value / ramp)
  const eased = t * t * (3 - 2 * t) // smoothstep
  const plantarOnly = !!ex.value.plantarOnly
  const lo = plantarOnly ? 0 : DORSI
  // 「上」對提踵是踮起（蹠屈），對踝泵與坐姿交替則是勾腳（背屈），方向相反
  const top = plantarOnly ? PLANTAR : lo
  const bottom = plantarOnly ? lo : PLANTAR
  const from = c.kind === 'up' ? bottom : top
  const to = c.kind === 'up' ? top : bottom
  return from + (to - from) * eased
})

const footLabel = computed(() => {
  const k = session.current.value?.kind
  const cue = ex.value.cue
  if (cue && k === 'up') return `⬆️ ${cue.up}`
  if (cue && k === 'down') return `⬇️ ${cue.down}`
  return '跟著節奏做，幅度做到底'
})

const R = 88
const C = 2 * Math.PI * R
const dash = computed(() => C * (1 - session.progress.value))
const phaseColor = computed(() => {
  const k = session.current.value?.kind
  if (k === 'up' || k === 'stretch') return 'var(--accent)'
  if (k === 'down') return 'var(--good)'
  if (k === 'hold') return 'var(--accent-soft)'
  return 'var(--text-dim)'
})

// ============================================================
// 日常對策與警訊
// ============================================================
const HABITS = [
  {
    icon: '⏱️',
    title: '每 30 分鐘動一次腳踝',
    body: '久坐時小腿幾乎完全不收縮，血液就停在小腿與膝窩。不必站起來——桌子底下做 20 下腳跟腳尖交替，就能把肌肉泵重新啟動一次。設個鬧鐘比靠記性可靠。',
  },
  {
    icon: '🪑',
    title: '不要讓椅緣壓住膝窩',
    body: '椅子太高或坐太深時，椅面前緣會直接壓在大腿後側與膝窩，正好壓在小隱靜脈匯入深層靜脈的位置。調整椅高讓腳掌能踩平、大腿後側留一指空隙；翹二郎腿也是同樣的問題。',
  },
  {
    icon: '🧦',
    title: '彈性襪要在「還沒腫」時穿',
    body: '醫療級漸進式壓力襪從外部補足靜脈壓力，多數人穿起來確實比較不脹——不過 Cochrane 回顧認為「把彈性襪當成靜脈曲張唯一且初始的治療」證據品質並不足夠，它處理的是症狀。早上下床前就穿、睡前脫；等腿已經腫起來再穿，效果大打折扣。壓力等級與尺寸請讓醫師或藥師量過再買，不要自己猜。',
  },
  {
    icon: '🛏️',
    title: '一天累積 30 分鐘抬腿',
    body: '腳踝高過心臟時，回流靠的是重力而不是肌肉，靜脈壓會明顯下降。傍晚腫脹最明顯時抬 15 分鐘，比睡前才抬更有感。睡覺時把床墊腿側墊高 10 公分也有幫助。',
  },
  {
    icon: '🚶',
    title: '走路比站著好，站著比坐著更糟',
    body: '靜脈曲張最怕的是「不動的直立姿勢」——久站時的靜脈壓其實比久坐更高。需要久站時，不時踮踮腳、重心左右換腳，讓小腿一直有收縮。',
  },
  {
    icon: '⚖️',
    title: '體重、便秘、憋氣提重物',
    body: '腹壓升高會一路往下傳到下肢靜脈。肥胖、長期便秘用力、經常憋氣搬重物都會讓靜脈壓更高。減重與足夠的纖維、水分，對腿的幫助比多數人想像的大。',
  },
]

const REDFLAGS = [
  '單側小腿突然腫脹、發熱、壓痛，壓小腿肚會痛——可能是深層靜脈栓塞（DVT）。請立刻就醫，不要按摩、不要先做運動。',
  '膝窩摸到明顯腫塊——膝窩的腫塊不一定是靜脈曲張。貝克氏囊腫、小隱靜脈瘤、膕動脈瘤都長在同一個位置，光靠摸分不出來，需要超音波。',
  '腳踝內側皮膚變硬、變褐色、反覆濕疹，或出現不容易癒合的傷口——這是慢性靜脈功能不全的晚期變化，請掛心臟血管外科。',
  '曲張的血管破皮出血，或摸起來像一條硬硬的、紅腫壓痛的繩索（表淺靜脈炎）。',
  '長途飛行或長途車程後出現單側腿腫，合併胸悶或喘——立即就醫。',
]
</script>

<template>
  <div class="page">
    <h1>🩸 腿部靜脈回流（小腿肌肉泵）</h1>
    <p class="desc">
      改善久坐造成的腿部<strong>痠脹、沉重、傍晚腫脹</strong>與夜間抽筋，
      針對小腿與<strong>膝窩一帶</strong>的靜脈回流做訓練。桌子底下、床上都能做。
    </p>

    <div class="warn">
      ⚠️ 先把期待講清楚：<strong>運動無法讓已經曲張的血管消失</strong>。靜脈瓣膜一旦被撐壞是結構性損傷，
      不會因為訓練而復原——訓練能做的是讓肌肉泵更有力、症狀更輕、惡化得更慢。
      若出現<strong>單側小腿突然腫脹、發熱、壓痛</strong>（可能是深層靜脈栓塞），
      請立即就醫，<strong>不要按摩也不要先做運動</strong>。
      膝窩摸到腫塊、皮膚變硬變色或有傷口，請直接掛心臟血管外科做超音波。
    </div>

    <ExplainCard
      title="小腿肌肉泵訓練"
      purpose="改善久坐久站造成的腿部痠脹、沉重、傍晚腫脹與夜間抽筋，提升小腿與膝窩一帶的靜脈回流效率。對已經形成的靜脈曲張，目標是減輕症狀、延緩惡化，而不是讓曲張的血管消失。"
      principle="血液送到腳底之後，回程要逆著重力往上走，而這一段幾乎不靠心臟——靠的是「小腿肌肉泵」。小腿肌肉每收縮一次就把深層靜脈擠扁、把血往上推；靜脈內每隔一段距離有一組單向瓣膜，肌肉放鬆時瓣膜關閉，血液就不會往下掉。久坐久站時小腿長時間不收縮，血液滯留、靜脈壓持續偏高，管壁被撐大、瓣膜關不緊，血液逆流回小腿，壓力又更高——這是一個會自我強化的惡性循環，也就是靜脈曲張的成因。膝窩之所以常見，是因為小隱靜脈正好在這裡匯入深層的膕靜脈，本身就是壓力集中的轉折點，再加上坐姿時椅緣常壓在大腿後側與膝窩，回流更容易受阻。訓練的效果有實證但有限：Padberg 等人 2004 年的隨機對照試驗讓慢性靜脈功能不全的患者做 6 個月小腿肌力訓練，小腿泵的射出分率與肌力都顯著改善，但靜脈逆流本身沒有改變，生活品質與疾病嚴重度評分也沒有跟著進步。2023 年的 Cochrane 回顧收了 5 篇隨機對照試驗、共 146 人，結論更保守：目前的證據還不足以判定運動對慢性靜脈疾病到底有多少好處。所以請把它當成每天的保養，而不是治療——它便宜、沒有副作用、順便練到小腿肌力，但不要指望它取代醫療處置。"
      :method="[
        '選一個練習，跟著畫面的腳踝動畫與提示音做——幅度做到底比做得快重要。',
        '踝泵與坐姿交替每天都能做，建議久坐時每 30 分鐘來一組。',
        '小腿提踵每週 3 次以上，放下時刻意放慢，這是練肌力的關鍵。',
        '傍晚腿最脹的時候抬腿 15 分鐘，腳踝要明顯高過心臟。',
        '有醫師開立的彈性襪請照常穿；運動是補充，不是替代。',
        '任何動作做起來會痛，或腿正在腫脹發熱，就停下來先就醫。',
      ]"
    />

    <figure class="fig">
      <PoseImage
        :src="imgPump"
        alt="小腿肌肉泵與靜脈瓣：肌肉收縮把血液往上推，瓣膜關不緊時血液逆流"
        :max="620"
      />
      <figcaption>
        左：小腿肌肉收縮時瓣膜打開、血液被往上擠。右：瓣膜關不緊時血液往下逆流，靜脈被撐大變彎曲。
      </figcaption>
    </figure>

    <h2>選擇練習</h2>
    <div class="controls">
      <div class="seg">
        <button v-for="e in EXERCISES" :key="e.id" :class="{ on: exId === e.id }" @click="pick(e)">
          {{ e.emoji }} {{ e.name }}
        </button>
      </div>
    </div>

    <div class="controls">
      <template v-if="ex.id === 'elevate'">
        <label>抬腿時間</label>
        <select v-model.number="elevateMin" @change="session.reset()">
          <option v-for="n in [10, 15, 20, 30]" :key="n" :value="n">{{ n }} 分鐘</option>
        </select>
      </template>
      <template v-else-if="ex.id === 'stretch'">
        <label>每邊 {{ ex.up }} 秒，組數</label>
        <select v-model.number="sets" @change="session.reset()">
          <option v-for="n in [1, 2, 3]" :key="n" :value="n">{{ n }} 組</option>
        </select>
      </template>
      <template v-else>
        <label>次數</label>
        <select v-model.number="reps" @change="session.reset()">
          <option v-for="n in [10, 15, 20, 25, 30]" :key="n" :value="n">{{ n }} 次</option>
        </select>
        <label>組數</label>
        <select v-model.number="sets" @change="session.reset()">
          <option v-for="n in [1, 2, 3, 4]" :key="n" :value="n">{{ n }} 組</option>
        </select>
      </template>
      <span style="color: var(--text-dim)">總長約 {{ totalMin }} 分鐘</span>
    </div>

    <div class="controls">
      <button v-if="!session.running.value" class="primary" @click="onStart">
        {{ paused ? '▶ 繼續' : '▶ 開始練習' }}
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
            <div class="phase">完成！起身走幾步更好</div>
          </template>
          <template v-else>
            <div class="count" style="font-size: 2.6rem">{{ ex.emoji }}</div>
            <div class="phase">按「開始練習」</div>
          </template>
        </div>
      </div>

      <div class="side">
        <div class="side-head">
          <h2 style="margin: 0">{{ ex.emoji }} {{ ex.name }}</h2>
          <span class="where">{{ ex.where }}</span>
        </div>
        <div class="side-body">
          <PoseImage :src="ex.img" :alt="`${ex.name}動作示意圖`" :max="340" class="pose" />
          <ol class="howto">
            <li v-for="(s, i) in ex.steps" :key="i">{{ s }}</li>
          </ol>
        </div>
        <div v-if="ex.foot" class="foot-anim">
          <svg viewBox="0 0 220 140" class="foot">
            <!-- 小腿與腳掌整體偏右，往左挪一點才會落在畫面中央 -->
            <g transform="translate(-32 8)">
              <rect x="92" y="6" width="34" height="86" rx="16" fill="var(--accent-soft)" opacity="0.45" />
              <g :transform="`rotate(${footAngle} 109 92)`">
                <path
                  d="M109 80 q-7 12 -3 21 l76 6 q11 1 11 -8 q0 -8 -12 -10 l-43 -8 q-14 -3 -18 -12 z"
                  fill="var(--accent)"
                />
              </g>
              <circle cx="109" cy="92" r="6" fill="var(--text-dim)" />
            </g>
          </svg>
          <div class="foot-label">{{ footLabel }}</div>
        </div>
        <div class="hint" style="margin-bottom: 0">💡 {{ ex.note }}</div>
      </div>
    </div>

    <h2>🪑 久坐族的日常對策</h2>
    <div class="habit-grid">
      <div class="habit" v-for="h in HABITS" :key="h.title">
        <h3>{{ h.icon }} {{ h.title }}</h3>
        <p>{{ h.body }}</p>
      </div>
    </div>

    <h2>🚨 這些情況請先就醫，不要先練</h2>
    <ul class="redflags">
      <li v-for="(r, i) in REDFLAGS" :key="i">{{ r }}</li>
    </ul>

    <div class="hint">
      💡 靜脈曲張的嚴重度（CEAP 分級）從只有蜘蛛網狀血管到皮膚潰瘍共分六級，真正需要處理的是症狀與併發症，
      而不是外觀。但如果痠脹腫脹已經影響生活，現在的射頻、雷射與泡沫硬化治療多半是局部麻醉、當天就能走路回家，
      不必拖到皮膚變色才去看。
    </div>
  </div>
</template>

<style scoped>
.fig {
  margin: 14px 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
}
.fig :deep(.pose-img) { margin: 0 auto; }
.fig figcaption {
  color: var(--text-dim);
  font-size: 0.88rem;
  margin-top: 10px;
}
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
.side { flex: 1; min-width: 280px; }
.side-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.where {
  font-size: 0.8rem; font-weight: 700; color: var(--text-dim);
  border: 1px solid var(--border); border-radius: 20px; padding: 2px 10px;
}
.side-body { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; margin-top: 10px; }
.pose { width: 340px; max-width: 100%; flex: none; }
.howto {
  flex: 1; min-width: 220px;
  margin: 2px 0 10px 20px;
  color: var(--text-dim); font-size: 0.92rem;
}
.howto li { margin: 5px 0; }
.foot-anim {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px 12px 10px;
  margin-bottom: 12px;
  text-align: center;
}
.foot { width: 100%; max-width: 260px; height: auto; }
.foot-label { color: var(--text-dim); font-size: 0.9rem; font-weight: 700; }
.habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  margin: 14px 0;
}
.habit {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
}
.habit h3 { margin: 0 0 6px; font-size: 1rem; }
.habit p { margin: 0; color: var(--text-dim); font-size: 0.9rem; line-height: 1.7; }
.redflags {
  margin: 12px 0 12px 22px;
  color: var(--text-dim);
  font-size: 0.92rem;
  line-height: 1.8;
}
.redflags li { margin: 6px 0; }
</style>
