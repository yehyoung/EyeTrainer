<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { beep, logSession, records, todayStr } from '../store'
import ExplainCard from '../components/ExplainCard.vue'

const W = 760
const H = 440
const EYE_SEP = 150 // 模擬雙眼間隔（像素）
const MU = 1 / 3

const canvas = ref(null)
const mode = ref('parallel') // parallel=平行法, cross=交叉法
const showGuide = ref(true)
const showHelp = ref(false)

const BASIC_SHAPES = [
  { id: 'circle', name: '圓形', emoji: '⚪' },
  { id: 'square', name: '正方形', emoji: '⬛' },
  { id: 'triangle', name: '三角形', emoji: '🔺' },
  { id: 'star', name: '星形', emoji: '⭐' },
  { id: 'cross', name: '十字', emoji: '➕' },
  { id: 'heart', name: '心形', emoji: '❤️' },
]
const ADV_SHAPES = [
  { id: 'ring', name: '圓環', emoji: '⭕' },
  { id: 'crescent', name: '月牙', emoji: '🌙' },
  { id: 'arrow', name: '箭頭', emoji: '⬆️' },
  { id: 'diamond', name: '菱形', emoji: '🔷' },
  { id: 'smiley', name: '笑臉', emoji: '🙂' },
  { id: 'bolt', name: '閃電', emoji: '⚡' },
]
const difficulty = ref('basic')
const shapeSet = computed(() => (difficulty.value === 'adv' ? ADV_SHAPES : BASIC_SHAPES))
const allShapes = [...BASIC_SHAPES, ...ADV_SHAPES]

const answer = ref(null) // 本張正確形狀 id
const options = ref([])
const feedback = ref(null) // {correct, name}
let shownAt = 0

// 看出圖案後的「保持融像」倒數：維持融像狀態才是放鬆睫狀肌的主要效益
const holdLeft = ref(0)
let holdInt = null
function startHold() {
  clearInterval(holdInt)
  holdLeft.value = 20
  holdInt = setInterval(() => {
    holdLeft.value--
    if (holdLeft.value <= 0) {
      clearInterval(holdInt)
      beep(880, 0.15)
      setTimeout(() => beep(1100, 0.2), 160)
    }
  }, 1000)
}
onUnmounted(() => clearInterval(holdInt))

// ---- 深度圖：黑底白形狀（白=浮起），進階圖案含鏤空（黑）區域 ----
function makeDepthMap(shapeId) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.fillStyle = '#000'
  g.fillRect(0, 0, W, H)
  g.fillStyle = '#fff'
  const cx = W / 2
  const cy = H / 2
  const s = 130
  const poly = (pts) => {
    g.beginPath()
    pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)))
    g.closePath()
    g.fill()
  }
  switch (shapeId) {
    case 'circle':
      g.beginPath(); g.arc(cx, cy, s, 0, Math.PI * 2); g.fill()
      break
    case 'square':
      g.fillRect(cx - s, cy - s * 0.85, s * 2, s * 1.7)
      break
    case 'triangle':
      poly([[cx, cy - s], [cx + s * 1.1, cy + s * 0.8], [cx - s * 1.1, cy + s * 0.8]])
      break
    case 'star': {
      const pts = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? s * 1.15 : s * 0.48
        const a = -Math.PI / 2 + (i / 10) * Math.PI * 2
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
      }
      poly(pts)
      break
    }
    case 'cross': {
      const a = s * 0.42
      g.fillRect(cx - a, cy - s * 1.05, a * 2, s * 2.1)
      g.fillRect(cx - s * 1.05, cy - a, s * 2.1, a * 2)
      break
    }
    case 'heart':
      g.beginPath()
      g.moveTo(cx, cy + s * 0.95)
      g.bezierCurveTo(cx - s * 1.7, cy - s * 0.35, cx - s * 0.7, cy - s * 1.25, cx, cy - s * 0.45)
      g.bezierCurveTo(cx + s * 0.7, cy - s * 1.25, cx + s * 1.7, cy - s * 0.35, cx, cy + s * 0.95)
      g.fill()
      break
    // ---- 進階圖案 ----
    case 'ring':
      g.beginPath(); g.arc(cx, cy, s * 1.15, 0, Math.PI * 2); g.fill()
      g.fillStyle = '#000'
      g.beginPath(); g.arc(cx, cy, s * 0.55, 0, Math.PI * 2); g.fill()
      break
    case 'crescent':
      g.beginPath(); g.arc(cx, cy, s * 1.1, 0, Math.PI * 2); g.fill()
      g.fillStyle = '#000'
      g.beginPath(); g.arc(cx + s * 0.55, cy - s * 0.2, s * 0.95, 0, Math.PI * 2); g.fill()
      break
    case 'arrow':
      poly([
        [cx, cy - s * 1.1], [cx + s, cy], [cx + s * 0.45, cy],
        [cx + s * 0.45, cy + s * 1.05], [cx - s * 0.45, cy + s * 1.05],
        [cx - s * 0.45, cy], [cx - s, cy],
      ])
      break
    case 'diamond':
      poly([[cx, cy - s * 1.15], [cx + s * 0.8, cy], [cx, cy + s * 1.15], [cx - s * 0.8, cy]])
      break
    case 'smiley':
      g.beginPath(); g.arc(cx, cy, s * 1.1, 0, Math.PI * 2); g.fill()
      g.fillStyle = '#000'
      g.beginPath(); g.arc(cx - s * 0.42, cy - s * 0.38, s * 0.17, 0, Math.PI * 2); g.fill()
      g.beginPath(); g.arc(cx + s * 0.42, cy - s * 0.38, s * 0.17, 0, Math.PI * 2); g.fill()
      g.strokeStyle = '#000'
      g.lineWidth = s * 0.18
      g.beginPath(); g.arc(cx, cy + s * 0.1, s * 0.6, Math.PI * 0.15, Math.PI * 0.85); g.stroke()
      break
    case 'bolt':
      poly([
        [cx + s * 0.4, cy - s * 1.1], [cx - s * 0.6, cy + s * 0.18], [cx - s * 0.08, cy + s * 0.18],
        [cx - s * 0.4, cy + s * 1.1], [cx + s * 0.6, cy - s * 0.12], [cx + s * 0.08, cy - s * 0.12],
      ])
      break
  }
  const img = g.getImageData(0, 0, W, H).data
  // 灰階 → 深度 0~1
  const depth = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) depth[i] = img[i * 4] / 255
  return depth
}

function separation(z) {
  return Math.round(((1 - MU * z) * EYE_SEP) / (2 - MU * z))
}

// ---- 隨機點立體圖（SIRDS，Thimbleby–Inglis–Witten 完整演算法） ----
// 簡化版的 same[right]=left 直接覆寫會產生形狀輪廓的週期性鬼影（看起來像星芒）；
// 這裡以「排序鏈結插入」正確合併等色約束，並做遮蔽面檢查。
const DEPTH_Z = 0.8 // 形狀浮起高度（加大深度對比，形狀更易辨識）

function renderStereogram(depth) {
  const ctx = canvas.value.getContext('2d')
  const out = ctx.createImageData(W, H)
  const px = out.data
  const same = new Int32Array(W)
  const colors = new Uint8Array(W)
  const zRow = new Float32Array(W)

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let z = depth[y * W + x] * DEPTH_Z
      if (mode.value === 'cross') z = DEPTH_Z - z // 交叉法：深度反轉
      zRow[x] = z
      same[x] = x
    }
    for (let x = 0; x < W; x++) {
      const z = zRow[x]
      const s = separation(z)
      let left = x - (s >> 1)
      let right = left + s
      if (left < 0 || right >= W) continue
      // 遮蔽面檢查：更近的表面會擋住這組對應點
      let visible = true
      let t = 1
      let zt
      do {
        zt = z + (2 * (2 - MU * z) * t) / (MU * EYE_SEP)
        visible = zRow[x - t] < zt && zRow[x + t] < zt
        t++
      } while (visible && zt < 1 && x - t >= 0 && x + t < W)
      if (!visible) continue
      // 排序鏈結插入：維持 same[] 為「右側最近等色點」的遞增鏈
      for (;;) {
        const l = same[left]
        if (l === left) { same[left] = right; break }
        if (l === right) break
        if (l < right) { left = l }
        else { same[left] = right; left = right; right = l }
      }
    }
    // 由右向左上色（same[x] >= x，右側先決定）
    for (let x = W - 1; x >= 0; x--) {
      colors[x] = same[x] === x ? (Math.random() < 0.5 ? 0 : 1) : colors[same[x]]
      const i = (y * W + x) * 4
      if (colors[x]) {
        // 暖白點（低藍光）
        px[i] = 232; px[i + 1] = 214; px[i + 2] = 176
      } else {
        px[i] = 22; px[i + 1] = 20; px[i + 2] = 15
      }
      px[i + 3] = 255
    }
  }
  ctx.putImageData(out, 0, 0)

  // 輔助點：間距 = 背景深度的分離距離，重影合一即對焦成功
  if (showGuide.value) {
    const s = separation(mode.value === 'cross' ? DEPTH_Z : 0)
    ctx.fillStyle = '#e8b45a'
    for (const dx of [-s / 2, s / 2]) {
      ctx.beginPath()
      ctx.arc(W / 2 + dx, 18, 7, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function newImage() {
  feedback.value = null
  clearInterval(holdInt)
  holdLeft.value = 0
  const set = shapeSet.value
  const pick = set[Math.floor(Math.random() * set.length)]
  answer.value = pick.id
  // 出 4 個選項（含正解）
  const rest = set.filter((s) => s.id !== pick.id).sort(() => Math.random() - 0.5).slice(0, 3)
  options.value = [pick, ...rest].sort(() => Math.random() - 0.5)
  renderStereogram(makeDepthMap(pick.id))
  shownAt = performance.now()
}

function guess(shape) {
  if (feedback.value) return
  const correct = shape.id === answer.value
  feedback.value = { correct, name: allShapes.find((s) => s.id === answer.value).name }
  const seconds = Math.min(300, (performance.now() - shownAt) / 1000)
  logSession('stereo', seconds, { correct, shape: answer.value, difficulty: difficulty.value })
  beep(correct ? 880 : 220, 0.2)
  if (correct) startHold()
}

const todayStats = computed(() => {
  const list = records.filter((r) => r.module === 'stereo' && r.date === todayStr())
  const ok = list.filter((r) => r.extra?.correct).length
  return { total: list.length, ok }
})

onMounted(newImage)
</script>

<template>
  <div class="page">
    <h1>🌀 3D 立體圖（Magic Eye）</h1>
    <p class="desc">
      讓焦點脫離螢幕平面，是螢幕上少數能真正改變對焦距離的訓練。看出隱藏圖形後選出答案，驗證你真的「對到焦」了。
    </p>

    <ExplainCard
      title="3D 立體圖（Magic Eye）"
      purpose="讓對焦點真正離開螢幕平面，深度放鬆睫狀肌與聚散（雙眼內聚／外展）系統，同時訓練雙眼融像能力——是螢幕上少數能實際改變對焦距離的練習。"
      principle="隨機點立體圖（SIRDS）在雜訊圖樣中藏入左右眼視差：用「平行法」觀看時，兩眼視線近乎平行、對焦點落在螢幕後方，調節系統進入「看遠」的放鬆狀態；「交叉法」則相反，焦點落在螢幕前方。看出圖案後持續保持融像，等於讓對焦系統停留在脫離螢幕的狀態（主要放鬆效益）；換新圖重新對焦，則訓練聚散調節的靈活度。"
      :method="[
        '距離螢幕 40–60 公分。平行法：放空視線、想像看穿螢幕到遠方。',
        '盯著上方兩個輔助點：出現重影並合成「三個點」時，代表對焦成功。',
        '維持這個狀態，立體圖案會浮現——從選項中選出你看到的形狀驗證。',
        '答對後跟著倒數保持融像 20 秒，再眨眼休息幾秒、換下一張。',
        '一組 3–5 張，單次不超過 5 分鐘；頭暈或複視不退請立即停止。',
      ]"
    />

    <div class="controls">
      <label>觀看法</label>
      <div class="seg">
        <button :class="{ on: mode === 'parallel' }" @click="mode = 'parallel'; newImage()">平行法（望遠）</button>
        <button :class="{ on: mode === 'cross' }" @click="mode = 'cross'; newImage()">交叉法（鬥雞眼）</button>
      </div>
      <label>難度</label>
      <div class="seg">
        <button :class="{ on: difficulty === 'basic' }" @click="difficulty = 'basic'; newImage()">基本</button>
        <button :class="{ on: difficulty === 'adv' }" @click="difficulty = 'adv'; newImage()">進階</button>
      </div>
      <label><input type="checkbox" v-model="showGuide" @change="newImage()" /> 輔助點</label>
      <button class="primary" @click="newImage">🔄 換一張</button>
      <button :disabled="holdLeft > 0" @click="startHold">⏱ 保持融像 20 秒</button>
      <button @click="showHelp = !showHelp">{{ showHelp ? '收合教學' : '📖 怎麼看？' }}</button>
    </div>

    <div v-if="showHelp" class="hint">
      <strong>平行法（建議先學）：</strong>想像視線「穿透」螢幕看向遠方，眼睛放空。上方兩個輔助點會出現重影，
      當重影變成「三個點」且中間點穩定時，立體圖形就會浮現。<br />
      <strong>交叉法：</strong>視線交叉在螢幕前方（像看鼻尖），同樣讓輔助點合成三點。交叉法看到的深度與平行法相反。<br />
      <strong>小技巧：</strong>臉靠近螢幕讓視線放空，再緩慢後退；或先隔著螢幕反光看自己的倒影，再不動眼睛注意圖案。
      初學需要幾分鐘，看不出來很正常，休息再試。<br />
      <strong>持續看 vs 多換圖？</strong>兩者練的能力不同——看出圖案後<strong>保持融像 20–30 秒</strong>，
      是讓對焦系統持續停留在「脫離螢幕」狀態的主要放鬆效益；<strong>換新圖重新對焦</strong>則訓練
      聚散調節的靈活度（每次都要重新「找到」立體感）。建議循環：看出 → 保持 20–30 秒（答對後有倒數）→
      眨眼休息幾秒 → 換一張，重複 3–5 次，單次總長不超過 5 分鐘。
    </div>

    <div class="stage">
      <canvas ref="canvas" :width="W" :height="H"></canvas>
    </div>

    <div class="controls">
      <label>你看到什麼形狀？</label>
      <button v-for="o in options" :key="o.id" @click="guess(o)">{{ o.emoji }} {{ o.name }}</button>
      <span v-if="feedback" :style="{ color: feedback.correct ? 'var(--good)' : 'var(--bad)', fontWeight: 700 }">
        {{ feedback.correct ? '✅ 正確！你成功對焦了' : `❌ 答案是「${feedback.name}」，再試一次` }}
      </span>
      <span v-if="holdLeft > 0" style="color: var(--accent); font-weight: 700">
        ✨ 繼續保持立體感 {{ holdLeft }} 秒——維持融像才是放鬆的關鍵
      </span>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="num">{{ todayStats.ok }} / {{ todayStats.total }}</div>
        <div class="lbl">今日答對率</div>
      </div>
    </div>

    <div class="warn">
      ⚠️ 觀看立體圖若出現頭暈、複視持續不退，請立即停止。斜視、弱視或雙眼視差大者可能難以看出，屬正常現象。
      單次觀看建議不超過 5 分鐘。
    </div>
  </div>
</template>
