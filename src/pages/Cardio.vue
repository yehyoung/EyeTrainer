<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useIntervals } from '../useIntervals'
import { beep, speak, logSession } from '../store'
import ExplainCard from '../components/ExplainCard.vue'
import PoseImage from '../components/PoseImage.vue'
import imgMarch from '../assets/march.webp'
import imgHip from '../assets/hip.webp'
import imgSlowSquat from '../assets/slowsquat.webp'
import imgSquat from '../assets/squat.webp'
import imgSumo from '../assets/sumo.webp'
import imgLunge from '../assets/lunge.webp'
import imgSkater from '../assets/skater.webp'
import imgClimber from '../assets/climber.webp'
import imgBurpee from '../assets/burpee.webp'
import imgPushup from '../assets/pushup.webp'
import imgBear from '../assets/bear.webp'
import imgWorm from '../assets/worm.webp'
import imgPunch from '../assets/punch.webp'
import imgWallSit from '../assets/wall-squat.webp'
import imgBridge from '../assets/bridge.webp'
import imgDeadbug from '../assets/deadbug.webp'
import imgPlank from '../assets/plank.webp'
import imgCool from '../assets/cool.webp'
import imgKnee from '../assets/knee.webp'

// ============================================================
// 動作庫：全部「不跳躍、不跺地」，腳掌永遠有一隻在地面或由雙手承重
// hr = 心跳拉升力道（1 低 / 2 中 / 3 高），用來排課表
// ============================================================
// 動作示意圖：靠牆靜蹲與棒式沿用等長運動頁的同一張圖
const IMG = {
  march: imgMarch, hip: imgHip, slowsquat: imgSlowSquat, squat: imgSquat, sumo: imgSumo,
  lunge: imgLunge, skater: imgSkater, climber: imgClimber, burpee: imgBurpee, pushup: imgPushup,
  bear: imgBear, worm: imgWorm, punch: imgPunch, wallsit: imgWallSit, bridge: imgBridge,
  deadbug: imgDeadbug, plank: imgPlank, cool: imgCool, knee: imgKnee,
}

const MOVES = {
  march: {
    emoji: '🚶', name: '原地踏步加速', hr: 1,
    quiet: '腳掌「放」下去而不是「踩」下去，前腳掌先著地。',
    steps: ['站直、核心收緊，雙臂自然擺動。', '交替抬膝到腰高，腳掌輕輕放回地面。', '越做越快，但落地聲音要越來越小。'],
  },
  hip: {
    emoji: '🔄', name: '髖關節繞環', hr: 1,
    quiet: '完全靜音，雙腳不離地。',
    steps: ['雙手插腰、雙腳與肩同寬。', '骨盆畫大圓，順時針 10 圈再逆時針 10 圈。', '上半身盡量不動，只動髖關節。'],
  },
  slowsquat: {
    emoji: '🪑', name: '慢速深蹲（暖身）', hr: 1,
    quiet: '完全靜音。',
    steps: ['雙腳與肩同寬、腳尖略外開。', '想像坐椅子，臀部向後向下，花 3 秒蹲、3 秒起。', '膝蓋對準腳尖方向，不要內夾。'],
  },
  squat: {
    emoji: '🦵', name: '深蹲', hr: 3,
    quiet: '腳掌全程貼地，零衝擊。',
    steps: ['雙腳與肩同寬，腳尖略外開 15–30 度。', '臀部向後坐、蹲到大腿接近與地面平行。', '腳跟推地站起，起身時吐氣、夾緊臀部。', '速度加快但不要用「彈」的——靠肌肉控制，不靠慣性。'],
  },
  sumo: {
    emoji: '🤸', name: '相撲深蹲脈衝', hr: 2,
    quiet: '腳不離地，只有肌肉在動。',
    steps: ['雙腳站寬約 1.5 倍肩寬，腳尖外開 45 度。', '蹲到大腿平行後「停在下面」。', '在最低點做小幅度上下脈衝，幅度約 10 公分。', '大腿內側會發燙，那就對了。'],
  },
  lunge: {
    emoji: '🏃', name: '後退弓箭步', hr: 3,
    quiet: '向後「踏」不是向後「跳」，後腳前掌輕點地。',
    steps: ['站直，一腳向後踏一大步，前腳掌先著地。', '下蹲到兩膝都接近 90 度，前膝不超過腳尖。', '前腳用力推回站姿，換腳。', '重心放在前腳，上半身保持直立。'],
  },
  skater: {
    emoji: '⛸️', name: '滑冰者側移（不跳）', hr: 3,
    quiet: '橫向「跨步」取代跳躍，始終有一腳在地。',
    steps: ['右腳向右跨一大步，左腳順勢交叉到右腳後方點地。', '同時右手向右前方伸、身體微微轉向。', '換邊，像滑冰一樣左右來回。', '速度越快心跳升越快，但不要讓腳重重落地。'],
  },
  climber: {
    emoji: '🧗', name: '登山者', hr: 3,
    quiet: '雙手承重，腳只輕點地；鋪上瑜珈墊幾乎無聲。',
    steps: ['高棒式起始：雙手在肩膀正下方，身體一直線。', '交替把膝蓋拉向胸口，腳尖輕點地面。', '臀部不要翹高，核心全程收緊。', '加快節奏，但腳尖是「點」地不是「踩」地。'],
  },
  burpee: {
    emoji: '🔥', name: '踏步波比（不跳）', hr: 3,
    quiet: '去掉起跳與落地，改成逐腳踏出、踏回。',
    steps: ['站姿 → 蹲下雙手撐地。', '一腳一腳向後踏成高棒式（不要雙腳同時跳出去）。', '做一下伏地挺身（可省略或跪姿）。', '一腳一腳踏回、站起，雙手向上延伸但不跳起。'],
  },
  pushup: {
    emoji: '💪', name: '伏地挺身', hr: 2,
    quiet: '完全靜音。做不動就跪姿，再不行就推牆。',
    steps: ['雙手略寬於肩，身體從頭到腳跟一直線。', '手肘約 45 度向後彎，胸口下到接近地面。', '推起時吐氣，臀部與核心全程收緊。', '退階：跪姿伏地挺身 → 推牆伏地挺身。'],
  },
  bear: {
    emoji: '🐻', name: '熊式撐體肩膀輕點', hr: 2,
    quiet: '膝蓋離地懸空，完全靜音。',
    steps: ['四足跪姿，手在肩下、膝在髖下。', '腳尖撐地，膝蓋離地約 3 公分懸空。', '輪流抬一手輕點對側肩膀，身體盡量不左右晃。', '核心會發抖，那就是練到了。'],
  },
  worm: {
    emoji: '🐛', name: '蟲爬延展', hr: 2,
    quiet: '手腳交替移動，完全靜音。',
    steps: ['站姿前彎，雙手撐地（膝蓋可微彎）。', '雙手往前走到高棒式位置。', '雙手原路走回，站起來。', '全身延展＋核心，很適合排在高強度動作之後。'],
  },
  punch: {
    emoji: '🥊', name: '快速直拳連打', hr: 2,
    quiet: '零落地、零接觸，只有空氣。公寓首選。',
    steps: ['雙腳前後開立成拳擊預備式，膝蓋微彎。', '左右手交替快速出直拳，收拳要快。', '出拳時腰髖跟著轉，不要只用手臂。', '全程不要鎖死手肘，保持呼吸節奏。'],
  },
  wallsit: {
    emoji: '🧱', name: '靠牆靜蹲脈衝', hr: 2,
    quiet: '靠在牆上完全不動，零音量。',
    steps: ['背貼牆下滑到大腿與地面平行。', '維持姿勢，同時做小幅度上下脈衝。', '雙手可平舉增加難度。', '大腿發抖正常，但膝蓋痛就站起來。'],
  },
  bridge: {
    emoji: '🌉', name: '臀橋行進', hr: 1,
    quiet: '整個人躺在墊子上，樓下不可能聽見。',
    steps: ['仰躺屈膝，腳跟靠近臀部。', '夾緊臀部把骨盆推高成一直線。', '維持高度，輪流把膝蓋拉向胸口（像走路）。', '骨盆不要左右掉下來。'],
  },
  deadbug: {
    emoji: '🪲', name: '死蟲式快版', hr: 1,
    quiet: '躺姿，完全靜音。',
    steps: ['仰躺，雙手朝天花板、髖膝各彎 90 度。', '對側手腳同時向外延伸，貼近地面但不碰地。', '下背全程貼地，不要拱起來。', '加快速度但維持下背貼地才算數。'],
  },
  plank: {
    emoji: '🧘', name: '棒式撐體', hr: 1,
    quiet: '完全靜音。',
    steps: ['前臂撐地，手肘在肩膀正下方。', '頭、肩、臀、腳踝一直線，臀部與腹部同時收緊。', '正常呼吸，不要憋氣。', '退階：膝蓋著地。'],
  },
  cool: {
    emoji: '🚶', name: '原地慢走與深呼吸', hr: 1,
    quiet: '完全靜音。',
    steps: [
      '在房間裡慢慢走動，不要立刻坐下或躺下——突然靜止容易頭暈。',
      '鼻子吸氣 4 秒、嘴巴吐氣 6 秒，讓心跳慢慢降下來。',
      '順便伸展剛才用力的部位：大腿前側、小腿、胸口各 20 秒。',
      '這段慢走正好對應心率恢復研究中的「走路緩和」——現在就可以開始下方的 HRR₁ 測量。',
    ],
  },
  knee: {
    emoji: '🙆', name: '站姿提膝轉體', hr: 2,
    quiet: '一腳永遠在地面，腳掌輕放。',
    steps: ['雙手抱頭，站直。', '抬右膝、同時上半身轉向右，用左手肘靠近右膝。', '放下時腳掌輕放，換邊。', '速度加快，但靠腹部轉體而不是甩手肘。'],
  },
}

// ============================================================
// 課表
// ============================================================
const PROGRAMMES = [
  {
    id: 'tabata',
    emoji: '🔥',
    name: '四分鐘 Tabata',
    work: 20, rest: 10, rounds: 4,
    moves: ['squat', 'climber'],
    desc: '最短也最喘：8 個 20 秒的全力區間，中間只休息 10 秒。沒時間時就做這個。',
    note: 'Tabata 原始研究（1996）是在固定式腳踏車上以 170% VO₂max 進行，不是徒手動作——徒手版是沿用它的時間結構，效果不能直接畫上等號。但 20 秒全力／10 秒休息這個節奏確實能在 4 分鐘內把心跳推到很高。',
  },
  {
    id: 'full7',
    emoji: '⚡',
    name: '七分鐘全身',
    work: 40, rest: 20, rounds: 1,
    moves: ['squat', 'pushup', 'lunge', 'climber', 'punch', 'skater', 'bear'],
    desc: '七個動作各 40 秒、休息 20 秒，上下半身交替輪流，流汗但不會太痛苦。',
    note: '上下半身交替是刻意的安排：讓剛操過的肌群在下一個動作休息，心跳卻一路維持在高檔，這樣才能在短時間內累積足夠的運動量。',
  },
  {
    id: 'burn12',
    emoji: '💦',
    name: '十二分鐘燃脂',
    work: 45, rest: 15, rounds: 2,
    moves: ['squat', 'climber', 'lunge', 'punch', 'burpee', 'bear'],
    desc: '六個動作跑兩輪，含踏步波比。想真正流一身汗就選這個。',
    note: '休息只有 15 秒，心跳在整段課表中幾乎不會掉下來。第二輪會明顯變難——撐不住就降速，但不要停下來站著不動。',
  },
  {
    id: 'night',
    emoji: '🌙',
    name: '深夜零落地',
    work: 45, rest: 15, rounds: 2,
    moves: ['bridge', 'deadbug', 'plank', 'punch', 'wallsit', 'pushup'],
    desc: '全部動作都在墊子上或靠牆完成，腳完全不離地也不落地。半夜想動一下就用這個。',
    note: '強度不如前三個課表，但心跳一樣會上來，而且樓下真的聽不到。躺姿動作建議鋪瑜珈墊，手肘與尾椎才不會痛。',
  },
]

const WARM = ['march', 'hip', 'slowsquat']

const progId = ref('full7')
const prog = computed(() => PROGRAMMES.find((p) => p.id === progId.value))
const work = ref(PROGRAMMES[1].work)
const rest = ref(PROGRAMMES[1].rest)
const rounds = ref(PROGRAMMES[1].rounds)
const warmUp = ref(true)
const coolDown = ref(true)

function pick(p) {
  progId.value = p.id
  work.value = p.work
  rest.value = p.rest
  rounds.value = p.rounds
  session.reset()
}

// ============================================================
// 計時引擎
// ============================================================
function onSecond(step, left) {
  const first = left >= Math.floor(step.seconds) // 開場語音還在講，先別插話
  if (step.kind === 'work') {
    if (!first && left === 10 && step.seconds >= 30) {
      beep(560, 0.08, 0.16)
      speak('還有十秒')
    } else if (left <= 3 && left >= 1) {
      beep(820, 0.09, 0.2)
      speak(String(left))
    }
    return
  }
  if (left <= 3 && left >= 1) {
    beep(700, 0.09, 0.18)
    speak(String(left))
  }
}

const session = useIntervals('cardio', { onSecond })

function buildPlan() {
  const plan = []
  const list = prog.value.moves
  if (warmUp.value) {
    WARM.forEach((id, i) => {
      plan.push({
        kind: 'warm', moveId: id, label: `暖身 ${i + 1} / ${WARM.length}`,
        seconds: 20, say: i === 0 ? `暖身，${MOVES[id].name}` : MOVES[id].name, freq: 520,
      })
    })
  }
  for (let r = 1; r <= rounds.value; r++) {
    list.forEach((id, i) => {
      const last = r === rounds.value && i === list.length - 1
      plan.push({
        kind: 'work', moveId: id, round: r,
        label: `第 ${r} / ${rounds.value} 輪 ‧ ${i + 1} / ${list.length}`,
        seconds: work.value, say: MOVES[id].name, freq: 820,
      })
      if (!last) {
        const nextId = i + 1 < list.length ? list[i + 1] : list[0]
        plan.push({
          kind: 'rest', moveId: nextId,
          label: `休息 ‧ 下一個 ${MOVES[nextId].name}`,
          seconds: rest.value,
          // 休息時就先報下一個動作，使用者才來得及換姿勢
          say: `休息，下一個 ${MOVES[nextId].name}`,
          freq: 440,
        })
      }
    })
  }
  if (coolDown.value) {
    plan.push({
      kind: 'cool', moveId: 'cool', label: '緩和 ‧ 原地慢走、深呼吸', seconds: 60,
      say: '結束，原地慢走深呼吸，不要馬上坐下', freq: 400,
    })
  }
  return plan
}

const paused = computed(() => session.steps.value.length > 0 && !session.done.value)

function onStart() {
  if (paused.value) return session.start()
  session.start(buildPlan(), {
    programme: prog.value.name, work: work.value, rest: rest.value, rounds: rounds.value,
  })
}

const totalMin = computed(() => {
  const n = prog.value.moves.length * rounds.value
  let s = n * work.value + (n - 1) * rest.value
  if (warmUp.value) s += WARM.length * 20
  if (coolDown.value) s += 60
  return Math.round((s / 60) * 10) / 10
})

const moveId = computed(() => session.current.value?.moveId || prog.value.moves[0])
const move = computed(() => MOVES[moveId.value])

// 休息時側欄顯示的是「下一個」動作，標題要講清楚
const sideTitle = computed(() => {
  const k = session.current.value?.kind
  if (k === 'rest') return '下一個動作'
  if (k === 'warm') return '暖身動作'
  if (k === 'cool') return '緩和'
  return '目前動作'
})

const R = 88
const C = 2 * Math.PI * R
const dash = computed(() => C * (1 - session.progress.value))
const phaseColor = computed(() => {
  const k = session.current.value?.kind
  if (k === 'work') return 'var(--accent)'
  if (k === 'rest') return 'var(--good)'
  if (k === 'warm') return 'var(--accent-soft)'
  return 'var(--text-dim)'
})

// ============================================================
// 一分鐘心率恢復（HRR₁）
// ============================================================
const hrrPhase = ref('idle') // idle | c1 | in1 | wait | c2 | in2 | done
const hrrLeft = ref(0)
const beats1 = ref('')
const beats2 = ref('')
const hr1 = ref(0)
const hr2 = ref(0)
let hrrTimer = null

const drop = computed(() => hr1.value - hr2.value)
const hrrVerdict = computed(() => {
  const d = drop.value
  if (d >= 20) return { tone: 'ok', text: '恢復得很快，是心肺體能與副交感神經反應良好的表現。' }
  if (d >= 12) return { tone: 'ok', text: '落在一般認為正常的範圍（1 分鐘下降 12 下以上）。' }
  if (d >= 0) return { tone: 'ng', text: '下降幅度偏小。可能只是這次運動強度不夠高、剛吃飽、睡不好或喝了咖啡——先在固定條件下多測幾次看趨勢，持續偏低再諮詢醫師。' }
  return { tone: 'ng', text: '心跳不降反升，通常代表量測方式有誤（數錯、沒有真正停下來）。請休息後重測。' }
})

function runCount(sec, then) {
  hrrLeft.value = sec
  beep(880, 0.12)
  clearInterval(hrrTimer)
  hrrTimer = setInterval(() => {
    hrrLeft.value--
    if (hrrLeft.value <= 3 && hrrLeft.value >= 1) beep(700, 0.07, 0.15)
    if (hrrLeft.value <= 0) {
      clearInterval(hrrTimer)
      beep(1100, 0.2)
      then()
    }
  }, 1000)
}

function startHrr() {
  beats1.value = ''
  beats2.value = ''
  hrrPhase.value = 'c1'
  speak('開始數 15 秒脈搏')
  runCount(15, () => {
    hrrPhase.value = 'in1'
    speak('停，請輸入剛才數到的次數')
  })
}

function submit1() {
  const n = Number(beats1.value)
  if (!n) return
  hr1.value = n * 4
  hrrPhase.value = 'wait'
  speak('休息，一分鐘後再量一次')
  runCount(60, () => {
    hrrPhase.value = 'c2'
    speak('開始數 15 秒脈搏')
    runCount(15, () => {
      hrrPhase.value = 'in2'
      speak('停，請輸入次數')
    })
  })
}

function submit2() {
  const n = Number(beats2.value)
  if (!n) return
  hr2.value = n * 4
  hrrPhase.value = 'done'
  logSession('cardio-hrr', 90, { hr1: hr1.value, hr2: hr2.value, drop: hr1.value - hr2.value })
}

function resetHrr() {
  clearInterval(hrrTimer)
  hrrPhase.value = 'idle'
}

onUnmounted(() => clearInterval(hrrTimer))
</script>

<template>
  <div class="page">
    <h1>🔥 安靜燃脂（無跳躍間歇）</h1>
    <p class="desc">
      在家、不需器材、<strong>完全沒有跳躍與跺地</strong>的高強度間歇訓練。
      幾分鐘內就能把心跳推上去、流一身汗，而樓下住戶聽不到。
    </p>

    <div class="warn">
      ⚠️ 這是真正的高強度運動，和本站其他項目不同。有高血壓（未控制）、心血管疾病、近期手術、
      懷孕、膝踝或下背舊傷者，請先諮詢醫師再開始，並從「深夜零落地」這種低衝擊課表起步。
      過程中若出現<strong>胸痛、胸悶、心悸、頭暈、冒冷汗、呼吸困難</strong>，請立刻停止並就醫。
      用力時吐氣、放鬆時吸氣，<strong>不要憋氣</strong>。
    </div>

    <ExplainCard
      title="無跳躍高強度間歇"
      purpose="在最短的時間內把心跳推進高心率區間、讓身體真正流汗，同時完全避開會傳到樓下的衝擊噪音；順便補足久坐族最缺乏的下肢肌力與心肺耐力。"
      principle="心跳拉升的關鍵不是「跳」，而是「短時間內徵召大量肌肉」。深蹲、弓箭步動用的股四頭肌與臀肌是全身最大的肌群，一旦快速反覆收縮，心臟必須立刻提高輸出才供得上氧氣，心跳自然竄高——不需要雙腳離地。高強度間歇的另一半是「不完全恢復」：休息短到心跳來不及降下來，下一個區間又開始，於是整段課表都維持在高心率。至於噪音，傳到樓下的主要是跳躍落地產生的「衝擊音（固體傳音）」，它直接沿著樓板結構傳遞，一般瑜珈墊只能衰減有限；真正有效的做法是從一開始就不要產生衝擊。"
      :method="[
        '選一個課表，第一次做建議先從「七分鐘全身」或「深夜零落地」開始。',
        '鋪一張瑜珈墊，清出約一個瑜珈墊大小的空間，旁邊放一杯水。',
        '暖身 1 分鐘後開始：動作期間盡全力、但動作品質先於速度。',
        '聽語音提示換動作——休息時間會先報出下一個動作，趁這 15–20 秒換好姿勢。',
        '結束後務必做緩和：原地慢走 1 分鐘，不要立刻坐下或躺下。',
        '每週 2–3 次就夠，中間至少隔一天；高強度訓練需要恢復才會進步。',
      ]"
    />

    <h2>選擇課表</h2>
    <div class="controls">
      <div class="seg">
        <button v-for="p in PROGRAMMES" :key="p.id" :class="{ on: progId === p.id }" @click="pick(p)">
          {{ p.emoji }} {{ p.name }}
        </button>
      </div>
    </div>
    <div class="hint">{{ prog.desc }}</div>

    <div class="controls">
      <label>動作時間</label>
      <select v-model.number="work" @change="session.reset()">
        <option v-for="n in [20, 30, 40, 45, 60]" :key="n" :value="n">{{ n }} 秒</option>
      </select>
      <label>休息</label>
      <select v-model.number="rest" @change="session.reset()">
        <option v-for="n in [10, 15, 20, 30]" :key="n" :value="n">{{ n }} 秒</option>
      </select>
      <label>輪數</label>
      <select v-model.number="rounds" @change="session.reset()">
        <option v-for="n in [1, 2, 3, 4]" :key="n" :value="n">{{ n }} 輪</option>
      </select>
      <label><input type="checkbox" v-model="warmUp" @change="session.reset()" /> 暖身 1 分鐘</label>
      <label><input type="checkbox" v-model="coolDown" @change="session.reset()" /> 緩和 1 分鐘</label>
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
            <div class="phase">完成！記得補水</div>
          </template>
          <template v-else>
            <div class="count" style="font-size: 2.6rem">{{ prog.emoji }}</div>
            <div class="phase">按「開始訓練」</div>
          </template>
        </div>
      </div>

      <div class="side">
        <div class="side-head">
          <span class="side-tag">{{ sideTitle }}</span>
          <span class="hr-dots" :title="`心跳拉升力道 ${move.hr} / 3`">
            <i v-for="n in 3" :key="n" :class="{ on: n <= move.hr }"></i>
          </span>
        </div>
        <h2 style="margin-top: 4px">{{ move.emoji }} {{ move.name }}</h2>
        <div class="side-body">
          <PoseImage :src="IMG[moveId]" :alt="`${move.name}動作示意圖`" :max="340" class="pose" />
          <ol class="howto">
            <li v-for="(s, i) in move.steps" :key="i">{{ s }}</li>
          </ol>
        </div>
        <div class="quiet-tip">🔇 {{ move.quiet }}</div>
      </div>
    </div>

    <div v-if="session.current.value?.kind === 'work'" class="breathe">
      🫁 用力時吐氣 ‧ 不要憋氣
    </div>
    <div class="hint">💡 {{ prog.note }}</div>

    <h2>🔇 不吵到樓下的三個重點</h2>
    <div class="quiet-grid">
      <div class="quiet-card">
        <h3>① 不要產生衝擊</h3>
        <p>
          傳到樓下的是<strong>衝擊音</strong>——跳躍落地的力量直接沿樓板結構傳遞，和音量大小無關。
          本頁所有動作都已經把跳躍拿掉：波比改成踏步、滑冰者改成跨步、高抬腿改成輕放的踏步。
          台灣 2021 年起才對新建案要求樓板衝擊音隔音，老公寓幾乎沒有任何隔音層，所以「源頭不產生衝擊」是唯一可靠的做法。
        </p>
      </div>
      <div class="quiet-card">
        <h3>② 墊子只是輔助</h3>
        <p>
          瑜珈墊能吸收一部分高頻與手腳接觸聲，對登山者、伏地挺身、臀橋這類動作很有幫助，
          但<strong>擋不住跳躍的低頻衝擊</strong>。把它想成「讓安靜的動作更安靜」，而不是「讓吵的動作變安靜」。
          厚一點（6 mm 以上）或加一層軟墊效果更好。
        </p>
      </div>
      <div class="quiet-card">
        <h3>③ 避開敏感時段</h3>
        <p>
          各縣市依噪音管制法公告的夜間管制時段不同，但實務上<strong>晚上 10 點後</strong>就該切到「深夜零落地」課表：
          全程躺在墊子上或靠牆，腳完全不離地。另外注意腳底不要在地板上拖、摩擦，
          以及器材（啞鈴、水瓶）不要放下時撞到地板。
        </p>
      </div>
    </div>

    <h2>🗂️ 動作圖鑑</h2>
    <p class="desc" style="margin-top: 0">
      開始前先掃一遍，訓練中就不用停下來看文字。紅點是心跳拉升的力道。<strong>點任何一張圖可以放大看清楚標註</strong>。
    </p>
    <div class="gallery">
      <figure v-for="(m, id) in MOVES" :key="id" class="g-card">
        <PoseImage :src="IMG[id]" :alt="`${m.name}動作示意圖`" :max="420" lazy />
        <figcaption>
          <strong>{{ m.emoji }} {{ m.name }}</strong>
          <span class="hr-dots">
            <i v-for="n in 3" :key="n" :class="{ on: n <= m.hr }"></i>
          </span>
        </figcaption>
        <p>🔇 {{ m.quiet }}</p>
      </figure>
    </div>

    <h2>❤️ 一分鐘心率恢復（HRR₁）</h2>
    <ExplainCard
      title="一分鐘心率恢復"
      :open="false"
      purpose="運動一停下來，心跳掉得多快，反映的是副交感神經「踩煞車」的能力與心肺體能。把它當成自己的長期追蹤指標，比單看運動時的最高心跳更有意義。"
      principle="運動時交感神經興奮、迷走神經被抑制；一停下來，迷走神經會立刻重新接管，心跳迅速下降。Cole 等人 1999 年發表於新英格蘭醫學期刊的研究追蹤 2,428 人六年，發現運動後 1 分鐘心跳下降「12 下以內」的人死亡風險明顯較高。要注意的是：那個 12 下的門檻來自標準跑步機運動測試、且結束後有走路緩和，和你在家徒手做完的情況並不相同——所以請把它當成「跟自己比」的趨勢指標，不要當成診斷。"
      :method="[
        '最後一個動作結束、畫面進入「緩和」的那一刻就開始，不要先去喝水或滑手機。',
        '按「開始測量」，在手腕橈動脈或頸部摸到脈搏，跟著 15 秒倒數數心跳次數。',
        '輸入次數（程式會自動 ×4 換算成每分鐘心跳）。',
        '接著的 1 分鐘原地慢走（就是畫面上的緩和段），不要坐下或躺下——研究中的緩和期也是走路。',
        '1 分鐘後再數 15 秒、輸入第二次，就會得到你的心率恢復值。',
        '固定在同一個課表、同樣的強度之後測量，數字才有可比性。',
      ]"
    />

    <div class="hrr">
      <template v-if="hrrPhase === 'idle'">
        <button class="primary" @click="startHrr">▶ 開始測量</button>
        <span style="color: var(--text-dim)">最後一個動作一結束就按，先摸到脈搏再開始。</span>
      </template>

      <template v-else-if="hrrPhase === 'c1' || hrrPhase === 'c2'">
        <div class="big-guide">{{ hrrLeft }}</div>
        <span style="color: var(--accent); font-weight: 700">數心跳中……聽到高音就停</span>
        <button @click="resetHrr">取消</button>
      </template>

      <template v-else-if="hrrPhase === 'in1'">
        <label>15 秒內數到</label>
        <input v-model="beats1" type="number" min="1" max="99" class="beats" @keyup.enter="submit1" />
        <span style="color: var(--text-dim)">下</span>
        <button class="primary" @click="submit1">確定</button>
      </template>

      <template v-else-if="hrrPhase === 'wait'">
        <div class="big-guide">{{ hrrLeft }}</div>
        <span style="color: var(--good); font-weight: 700">
          休息中，原地慢走不要坐下（運動後心跳 {{ hr1 }}）
        </span>
        <button @click="resetHrr">取消</button>
      </template>

      <template v-else-if="hrrPhase === 'in2'">
        <label>這次 15 秒數到</label>
        <input v-model="beats2" type="number" min="1" max="99" class="beats" @keyup.enter="submit2" />
        <span style="color: var(--text-dim)">下</span>
        <button class="primary" @click="submit2">確定</button>
      </template>

      <template v-else>
        <div class="big-guide">↓ {{ drop }}</div>
        <div class="hrr-detail">
          <div>運動後 <strong>{{ hr1 }}</strong> → 一分鐘後 <strong>{{ hr2 }}</strong>（下降 {{ drop }} 下／分）</div>
          <div :class="hrrVerdict.tone">{{ hrrVerdict.text }}</div>
        </div>
        <button @click="resetHrr">↺ 再測一次</button>
      </template>
    </div>

    <div class="hint">
      💡 徒手測脈搏本來就有誤差，一次的數字不用太認真；連續幾週在相同課表後測量，
      看<strong>趨勢</strong>有沒有往上才是重點。體能進步時，同樣的課表會讓你心跳恢復得更快。
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
.side-head { display: flex; align-items: center; gap: 12px; }
.side-tag {
  font-size: 0.8rem; font-weight: 700; color: var(--text-dim);
  border: 1px solid var(--border); border-radius: 20px; padding: 2px 10px;
}
.hr-dots { display: inline-flex; gap: 4px; }
.hr-dots i {
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--border); display: block;
}
.hr-dots i.on { background: var(--bad); }
.side-body {
  display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; margin-top: 8px;
}
.pose { width: 340px; max-width: 100%; flex: none; }
.howto {
  flex: 1; min-width: 220px;
  margin: 0 0 12px 20px;
  color: var(--text-dim);
  font-size: 0.92rem;
}
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 14px;
  margin: 14px 0;
}
.g-card {
  margin: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px;
}
.g-card figcaption {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  margin: 8px 2px 4px; font-size: 0.95rem;
}
.g-card p {
  margin: 0 2px; color: var(--text-dim); font-size: 0.85rem; line-height: 1.6;
}
.howto li { margin: 5px 0; }
.quiet-tip {
  background: var(--bg-soft); border-left: 3px solid var(--good);
  border-radius: 0 8px 8px 0; padding: 8px 12px;
  color: var(--text-dim); font-size: 0.88rem;
}
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

.quiet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 16px;
  margin: 14px 0;
}
.quiet-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px 18px;
}
.quiet-card h3 { margin: 0 0 8px; color: var(--accent); font-size: 1rem; }
.quiet-card p { color: var(--text-dim); font-size: 0.89rem; }

.hrr {
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px 18px; margin: 14px 0;
  min-height: 76px;
}
.hrr label { color: var(--text-dim); font-size: 0.9rem; }
.beats {
  width: 84px; background: var(--bg-soft); color: var(--text);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 7px 10px; font-size: 1.1rem; font-family: inherit;
  text-align: center; font-variant-numeric: tabular-nums;
}
.hrr-detail { display: flex; flex-direction: column; gap: 4px; font-size: 0.92rem; color: var(--text-dim); }
.hrr-detail .ok { color: var(--good); font-weight: 700; }
.hrr-detail .ng { color: var(--bad); font-weight: 700; max-width: 560px; }
</style>
