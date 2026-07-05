<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { settings } from '../store'
import { useSession } from '../useSession'
import ExplainCard from '../components/ExplainCard.vue'

// 畫布實際尺寸（顯示大小），圖形幾何以 720×480 邏輯座標定義，繪製時整體放大
const W = 960
const H = 640
const SCALE = W / 720
const CX = 360 // 邏輯中心
const CY = 240

const canvas = ref(null)
let ctx = null
let renderRaf = null

// ==================== 藏輪圖（魚骨輪臂）幾何 ====================
const ARMS = 6      // 粗輪臂數
const THIN = 12     // 細輻線數
const ARM_R = 158   // 輪臂長度
const RING = 200    // 外圈圓點所在半徑

// 單支輪臂的輪廓（沿 +x 軸）：鋸齒經過橫刺、繞末端托架、環繞圓點
function armLocalOutline() {
  const pts = []
  const edge = (r) => 4 + (10 * (r - 26)) / (ARM_R - 26)
  const ticks = [[58, 15], [92, 21], [126, 27]]
  pts.push([26, -4])
  for (const [r, half] of ticks) {
    pts.push([r - 7, -edge(r - 7)], [r, -half], [r + 7, -edge(r + 7)])
  }
  pts.push([ARM_R, -14])
  for (let k = 0; k <= 5; k++) {
    const a = -0.1 - (0.32 * k) / 5
    pts.push([175 * Math.cos(a), 175 * Math.sin(a)])
  }
  for (let k = 0; k <= 5; k++) {
    const a = -0.42 + (0.42 * k) / 5
    pts.push([175 * Math.cos(a), 175 * Math.sin(a)])
  }
  for (let k = 0; k <= 14; k++) {
    const a = Math.PI - (k / 14) * Math.PI * 2
    pts.push([RING + 20 * Math.cos(a), 20 * Math.sin(a)])
  }
  for (let k = 0; k <= 5; k++) {
    const a = (0.42 * k) / 5
    pts.push([175 * Math.cos(a), 175 * Math.sin(a)])
  }
  for (let k = 0; k <= 5; k++) {
    const a = 0.42 - (0.32 * k) / 5
    pts.push([175 * Math.cos(a), 175 * Math.sin(a)])
  }
  pts.push([ARM_R, 14])
  for (const [r, half] of [[126, 27], [92, 21], [58, 15]]) {
    pts.push([r + 7, edge(r + 7)], [r, half], [r - 7, edge(r - 7)])
  }
  pts.push([26, 4])
  return pts
}

function rotated(pts, a) {
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return pts.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos])
}

function wheelOutline() {
  const pts = []
  for (let i = 0; i < ARMS; i++) {
    pts.push(...rotated(armLocalOutline(), -Math.PI / 2 + (i / ARMS) * Math.PI * 2))
  }
  pts.push(pts[0].slice())
  return pts
}

function drawWheelBody(g) {
  // 細輻線
  g.strokeStyle = 'rgba(232, 180, 90, 0.35)'
  g.lineWidth = 1.5
  for (let i = 0; i < THIN; i++) {
    const a = (i / THIN) * Math.PI * 2
    g.beginPath()
    g.moveTo(24 * Math.cos(a), 24 * Math.sin(a))
    g.lineTo(ARM_R * Math.cos(a), ARM_R * Math.sin(a))
    g.stroke()
  }
  // 六支魚骨輪臂
  g.fillStyle = 'rgba(232, 180, 90, 0.88)'
  for (let i = 0; i < ARMS; i++) {
    g.save()
    g.rotate(-Math.PI / 2 + (i / ARMS) * Math.PI * 2)
    drawArm(g)
    g.restore()
  }
  // 中心軸
  g.strokeStyle = 'rgba(232, 180, 90, 0.88)'
  g.lineWidth = 3
  g.beginPath(); g.arc(0, 0, 18, 0, Math.PI * 2); g.stroke()
  g.fillStyle = 'rgba(232, 180, 90, 0.88)'
  g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fill()
}

function drawArm(g) {
  g.beginPath()
  g.moveTo(26, -4)
  g.lineTo(ARM_R, -14)
  g.lineTo(ARM_R, 14)
  g.lineTo(26, 4)
  g.closePath()
  g.fill()
  const ticks = [58, 92, 126]
  ticks.forEach((r, i) => {
    const half = 15 + i * 6
    const th = 5 + i * 1.5
    g.beginPath()
    g.moveTo(r - th, -half * 0.72)
    g.lineTo(r + th, -half)
    g.lineTo(r + th, half)
    g.lineTo(r - th, half * 0.72)
    g.closePath()
    g.fill()
  })
  const a = 0.42
  g.beginPath()
  g.arc(0, 0, 182, -a, a)
  g.arc(0, 0, 168, a, -a, true)
  g.closePath()
  g.fill()
  g.beginPath()
  g.arc(RING, 0, 12, 0, Math.PI * 2)
  g.fill()
}

// ==================== 雪花圖 ====================
function snowOutline() {
  const pts = []
  const branch = []
  branch.push([20, 0])
  for (const [r, l] of [[70, 26], [110, 34], [150, 42]]) {
    branch.push([r, 0], [r + l * 0.7, -l * 0.7], [r, 0], [r + l * 0.7, l * 0.7], [r, 0])
  }
  // 尖端小菱形
  branch.push([176, 0], [184, -7], [192, 0], [184, 7], [176, 0])
  branch.push([20, 0]) // 沿主枝折返
  for (let i = 0; i < 6; i++) {
    pts.push(...rotated(branch, -Math.PI / 2 + (i / 6) * Math.PI * 2))
  }
  pts.push(pts[0].slice())
  return pts
}

// ==================== 星芒圖（八角星） ====================
function burstOutline() {
  const pts = []
  for (let i = 0; i <= 16; i++) {
    const r = i % 2 === 0 ? 195 : 82
    const a = -Math.PI / 2 + (i / 16) * Math.PI * 2
    pts.push([r * Math.cos(a), r * Math.sin(a)])
  }
  return pts
}

// ==================== 花瓣圖（五瓣玫瑰線） ====================
function roseOutline() {
  const pts = []
  for (let j = 0; j <= 300; j++) {
    const th = (j / 300) * Math.PI
    const r = 195 * Math.cos(5 * th)
    pts.push([r * Math.cos(th - Math.PI / 2), r * Math.sin(th - Math.PI / 2)])
  }
  pts.push(pts[0].slice())
  return pts
}

// ==================== 迷宮圖（方形螺旋，進去再出來） ====================
function mazeOutline() {
  const s = 160
  const g = 36
  const dirs = [[1, 0], [0, -1], [-1, 0], [0, 1]] // 右、上、左、下
  const pts = [[-s, s]]
  let x = -s
  let y = s
  let len = 2 * s
  let di = 0
  let step = 0
  while (len > g) {
    x += dirs[di][0] * len
    y += dirs[di][1] * len
    pts.push([x, y])
    di = (di + 1) % 4
    step++
    if (step >= 2) len -= g / 2 // 每走一段略縮，形成螺旋
  }
  // 由內折返出來
  for (let i = pts.length - 2; i >= 0; i--) pts.push(pts[i].slice())
  return pts
}

function strokeOutline(g, pts) {
  g.strokeStyle = 'rgba(232, 180, 90, 0.8)'
  g.lineWidth = 2.5
  g.lineJoin = 'round'
  g.beginPath()
  pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)))
  g.stroke()
  // 中心參考點
  g.fillStyle = 'rgba(232, 180, 90, 0.6)'
  g.beginPath(); g.arc(0, 0, 4, 0, Math.PI * 2); g.fill()
}

// ==================== 圖形註冊表 ====================
const FIGURES = [
  { id: 'wheel', name: '藏輪圖', outline: wheelOutline, draw: drawWheelBody, anchorR: RING,
    hint: '經典藏輪圖：沿魚骨輪臂的橫刺、末端托架與外圈圓點描邊。' },
  { id: 'snow', name: '雪花圖', outline: snowOutline, draw: (g) => strokeOutline(g, snowOutline()), anchorR: 192,
    hint: '雪花圖：沿六支主枝與側芽逐一描繪，練習小幅、精準的眼球移動。' },
  { id: 'burst', name: '星芒圖', outline: burstOutline, draw: (g) => strokeOutline(g, burstOutline()), anchorR: 195,
    hint: '星芒圖：沿十六個內外尖角大幅掃視，鍛鍊眼球快速變向。' },
  { id: 'rose', name: '花瓣圖', outline: roseOutline, draw: (g) => strokeOutline(g, roseOutline()), anchorR: 195,
    hint: '花瓣圖：平滑曲線追視，每片花瓣之間都會經過中心，幅度大小交替。' },
  { id: 'maze', name: '迷宮圖', outline: mazeOutline, draw: (g) => strokeOutline(g, mazeOutline()), anchorR: 160 * Math.SQRT2,
    hint: '迷宮圖：沿方形螺旋由外而內、再由內而外，訓練長時間持續的專注追視。' },
]

const MODES = [
  { id: 'trace', name: '描邊' },
  { id: 'rotate', name: '旋轉' },
  { id: 'breathe', name: '呼吸' },
  { id: 'traj', name: '軌跡追蹤' },
]

const TRAJS = [
  { id: 'eight', name: '8 字', hint: '眼睛跟隨亮點畫 ∞ 字，活動上下斜方向的眼外肌。' },
  { id: 'star', name: '星形', hint: '沿五角星路徑做大幅度的定向掃視。' },
  { id: 'wave', name: '波浪', hint: '左右來回的波浪運動，訓練水平追視與上下微調。' },
  { id: 'spiral', name: '螺旋', hint: '由內向外再向內的螺旋，漸進擴大眼球運動範圍。' },
]

const mode = ref('trace')
const figure = ref('wheel')
const traj = ref('eight')

const curFigure = computed(() => FIGURES.find((f) => f.id === figure.value))
const hint = computed(() => {
  if (mode.value === 'trace') return curFigure.value.hint
  if (mode.value === 'rotate') return '整個圖形緩慢旋轉，眼睛鎖定外圈亮點跟著轉動。'
  if (mode.value === 'breathe') return '圖形如呼吸般縮放，眼睛跟隨亮點遠近移動，兼練對焦。'
  return TRAJS.find((p) => p.id === traj.value).hint
})

const isHighRisk = computed(() => settings.risk === 'high')
const speed = ref(isHighRisk.value ? 'slow' : 'med')
const speedFactor = computed(() => ({ slow: 0.55, med: 1, fast: 1.6 })[speed.value])
watch(isHighRisk, (v) => { if (v) speed.value = 'slow' })

const duration = ref(60)
const session = useSession('wheel', duration)

watch([mode, figure, traj], () => session.reset())

// ==================== 描邊路徑（等速沿輪廓） ====================
const _paths = {}
function tracePath(fig) {
  if (_paths[fig.id]) return _paths[fig.id]
  const pts = fig.outline().map(([x, y]) => [CX + x, CY + y])
  const cum = [0]
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  }
  _paths[fig.id] = { pts, cum, total: cum[cum.length - 1] }
  return _paths[fig.id]
}

function tracePos(t) {
  const path = tracePath(curFigure.value)
  const dist = (t * 120) % path.total
  let lo = 1
  let hi = path.cum.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    path.cum[mid] < dist ? (lo = mid + 1) : (hi = mid)
  }
  const d0 = path.cum[lo - 1]
  const d1 = path.cum[lo]
  const f = d1 > d0 ? (dist - d0) / (d1 - d0) : 0
  const [x1, y1] = path.pts[lo - 1]
  const [x2, y2] = path.pts[lo]
  return { x: x1 + (x2 - x1) * f, y: y1 + (y2 - y1) * f }
}

// ==================== 軌跡追蹤 ====================
function trajPos(t) {
  switch (traj.value) {
    case 'eight': {
      const th = ((Math.PI * 2) / 10) * t
      return { x: CX + 260 * Math.sin(th), y: CY + 150 * Math.sin(2 * th) }
    }
    case 'star': {
      const pts = [0, 2, 4, 1, 3].map((k) => {
        const a = -Math.PI / 2 + (k / 5) * Math.PI * 2
        return [CX + 190 * Math.cos(a), CY + 190 * Math.sin(a)]
      })
      const p = ((t / 12) % 1) * 5
      const i = Math.floor(p)
      const f = p - i
      const [x1, y1] = pts[i % 5]
      const [x2, y2] = pts[(i + 1) % 5]
      return { x: x1 + (x2 - x1) * f, y: y1 + (y2 - y1) * f }
    }
    case 'wave': {
      const p = (t / 10) % 1
      const u = p < 0.5 ? -1 + 4 * p : 3 - 4 * p
      return { x: CX + 300 * u, y: CY + 120 * Math.sin(u * Math.PI * 2.5) }
    }
    case 'spiral': {
      const p = (t / 16) % 1
      const tri = p < 0.5 ? p * 2 : 2 - p * 2
      const a = -Math.PI / 2 + tri * Math.PI * 6
      const r = 15 + 175 * tri
      return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
    }
  }
}

function drawTrajGuide() {
  ctx.strokeStyle = 'rgba(232, 180, 90, 0.18)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  const T = { eight: 10, star: 12, wave: 20, spiral: 32 }[traj.value]
  for (let i = 0; i <= 400; i++) {
    const { x, y } = trajPos((i / 400) * T)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()
}

// ==================== 主繪製 ====================
function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  ctx.save()
  ctx.scale(SCALE, SCALE) // 之後全部以邏輯座標繪製
  const t = session.elapsed.value * speedFactor.value
  let dot
  let dotR = 10

  if (mode.value === 'traj') {
    drawTrajGuide()
    dot = trajPos(t)
  } else {
    const fig = curFigure.value
    let rot = 0
    let scl = 1
    if (mode.value === 'trace') {
      dot = tracePos(t)
    } else if (mode.value === 'rotate') {
      rot = ((Math.PI * 2) / 22) * t
      const a = -Math.PI / 2 + rot
      const r = Math.min(fig.anchorR, 215)
      dot = { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
    } else {
      scl = 0.55 + 0.45 * Math.sin(((Math.PI * 2) / 8) * t - Math.PI / 2)
      dot = { x: CX, y: CY - Math.min(fig.anchorR, 215) * scl }
      dotR = 6 + 8 * scl
    }
    ctx.save()
    ctx.translate(CX, CY)
    ctx.rotate(rot)
    ctx.scale(scl, scl)
    fig.draw(ctx)
    ctx.restore()
  }

  ctx.save()
  ctx.shadowColor = '#e8b45a'
  ctx.shadowBlur = 26
  ctx.fillStyle = '#ffd98a'
  ctx.beginPath()
  ctx.arc(dot.x, dot.y, dotR, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.restore() // 還原整體縮放
}

function renderLoop() {
  draw()
  renderRaf = requestAnimationFrame(renderLoop)
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  renderLoop()
})
onUnmounted(() => cancelAnimationFrame(renderRaf))
</script>

<template>
  <div class="page">
    <h1>☸️ 動態藏輪圖</h1>
    <p class="desc">
      身體與頭部保持不動、只移動眼球，讓視線緊跟亮點。同時鍛鍊移動眼球的外眼肌與負責對焦的睫狀肌。
    </p>

    <ExplainCard
      title="藏輪圖／眼球運動訓練"
      purpose="活化控制眼球轉動的六條外眼肌，改善眼球運動的靈活度與追視穩定性，同時帶動睫狀肌做微幅對焦調節，緩解長時間近距離用眼造成的僵硬感。"
      principle="眼球由上直肌、下直肌、內直肌、外直肌、上斜肌、下斜肌六條外眼肌共同控制。長時間盯著螢幕時，眼球幾乎固定不動、只使用極小的視野範圍，外眼肌因此僵化。讓視線沿複雜圖形的輪廓精確移動，會依序徵召不同方向的外眼肌（平滑追視＋快速掃視交替）；描繪橫刺、托架等細節時，睫狀肌也需要不斷微調焦距。此練習源自日本眼科醫「30 日活化眼球訓練操」的轉輪圖（藏輪圖）。"
      :method="[
        '距離螢幕 40–60 公分，身體與頭部保持不動，全程只移動眼球。',
        '選擇模式與圖形：初學建議「描邊＋藏輪圖」，熟練後換雪花、星芒、花瓣、迷宮增加變化。',
        '按「開始」後，視線緊跟亮點，盡量不脫隊、不跳躍。',
        '每種圖形 30 秒～3 分鐘；眼睛痠脹就停下閉眼休息。',
        '高度近視（600 度以上）者務必使用慢速，出現閃光感或飛蚊增加立即停止並就醫。',
      ]"
    />

    <div v-if="isHighRisk" class="warn">
      ⚠️ 安全模式：因您有高度近視／視網膜風險，速度已鎖定為慢速。請以輕鬆、不勉強的幅度進行，出現不適立即停止。
    </div>

    <div class="controls">
      <label>模式</label>
      <div class="seg">
        <button v-for="m in MODES" :key="m.id" :class="{ on: mode === m.id }" @click="mode = m.id">
          {{ m.name }}
        </button>
      </div>
      <template v-if="mode !== 'traj'">
        <label>圖形</label>
        <div class="seg">
          <button v-for="f in FIGURES" :key="f.id" :class="{ on: figure === f.id }" @click="figure = f.id">
            {{ f.name }}
          </button>
        </div>
      </template>
      <template v-else>
        <label>軌跡</label>
        <div class="seg">
          <button v-for="p in TRAJS" :key="p.id" :class="{ on: traj === p.id }" @click="traj = p.id">
            {{ p.name }}
          </button>
        </div>
      </template>
    </div>

    <div class="controls">
      <label>速度</label>
      <div class="seg">
        <button :class="{ on: speed === 'slow' }" @click="speed = 'slow'">慢</button>
        <button :class="{ on: speed === 'med' }" :disabled="isHighRisk" @click="speed = 'med'">中</button>
        <button :class="{ on: speed === 'fast' }" :disabled="isHighRisk" @click="speed = 'fast'">快</button>
      </div>
      <label>時長</label>
      <select v-model.number="duration" @change="session.reset()">
        <option :value="30">30 秒</option>
        <option :value="60">1 分鐘</option>
        <option :value="180">3 分鐘</option>
      </select>
      <button v-if="!session.running.value" class="primary" @click="session.start">▶ 開始</button>
      <button v-else @click="session.pause">⏸ 暫停</button>
      <button @click="session.reset">↺ 重設</button>
    </div>

    <div class="stage">
      <canvas ref="canvas" :width="W" :height="H"></canvas>
      <div class="timer-chip">{{ session.clock.value }}</div>
      <div v-if="session.done.value" class="overlay">
        <div class="big-guide">✅ 完成！</div>
        <p>閉眼休息 10 秒，或換一種圖形繼續。</p>
        <button class="primary" @click="session.reset(); session.start()">再來一次</button>
      </div>
    </div>

    <div class="hint">💡 {{ hint }}</div>
    <div class="hint">
      建議距離螢幕 40–60 公分。每種圖形 30 秒～3 分鐘即可，感到痠脹就休息，切勿勉強。
    </div>
  </div>
</template>
