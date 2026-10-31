<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { beep, speak, logSession, settings, records } from '../store'
import { useIntervals } from '../useIntervals'
import ExplainCard from '../components/ExplainCard.vue'

const highRisk = computed(() => settings.risk === 'high')

// 讓暗場填滿整個螢幕：環境光與螢幕邊框的亮度會嚴重干擾暗適應
function toggleFull(el) {
  if (!el) return
  if (document.fullscreenElement) document.exitFullscreen()
  else el.requestFullscreen?.()
}

// ============================================================
// A. 暗適應階梯（20 分鐘暗適應引導 ＋ 階梯式閾值檢測）
// ============================================================
// 12 階灰度，近似等比遞減但手動取整，確保每一階都不重複（否則階梯會有一格白費）
const WEDGE = [48, 36, 27, 20, 15, 11, 8, 6, 4, 3, 2, 1]
const CHECK_EVERY = 120 // 每 2 分鐘提示記錄一次

const adaptMin = ref(20)
const preBright = ref(true)
const aPhase = ref('idle') // idle | pre | dark
const aT = ref(0) // 目前階段已過秒數
const aPoints = ref([]) // [{ t: 分鐘, step: 1..12 }]
const aPrompt = ref(false) // 是否正在提示使用者記錄
const aDone = ref(false)
const aStage = ref(null)
const aCurve = ref(null)
let aTimer = null
let aNextCheck = CHECK_EVERY

const aBest = computed(() => aPoints.value.reduce((m, p) => Math.max(m, p.step), 0))
const aClock = computed(() => {
  const s = aPhase.value === 'pre' ? Math.max(0, 30 - Math.floor(aT.value)) : Math.floor(aT.value)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

function startAdapt() {
  aPoints.value = []
  aPrompt.value = false
  aDone.value = false
  aNextCheck = CHECK_EVERY
  aT.value = 0
  aPhase.value = preBright.value ? 'pre' : 'dark'
  speak(
    preBright.value
      ? '先看著亮畫面三十秒，讓兩眼的起點一致，之後畫面會轉黑'
      : '畫面即將轉黑，放鬆地看著畫面，不要用力盯',
  )
  clearInterval(aTimer)
  aTimer = setInterval(tickAdapt, 1000)
}

function tickAdapt() {
  aT.value++
  if (aPhase.value === 'pre') {
    if (aT.value >= 30) {
      aPhase.value = 'dark'
      aT.value = 0
      beep(420, 0.2)
      speak('開始暗適應')
    }
    return
  }
  if (aT.value >= aNextCheck) {
    aNextCheck += CHECK_EVERY
    aPrompt.value = true
    beep(520, 0.12, 0.18)
    speak('請點選你剛好還看得見的最暗一格')
  }
  if (aT.value >= adaptMin.value * 60) finishAdapt()
}

function pickStep(i) {
  if (aPhase.value !== 'dark') return
  aPoints.value = [...aPoints.value, { t: aT.value / 60, step: i + 1 }]
  aPrompt.value = false
  beep(820, 0.07, 0.12)
}

function finishAdapt() {
  clearInterval(aTimer)
  const spent = aT.value
  aPhase.value = 'idle'
  aPrompt.value = false
  aDone.value = true
  if (spent > 30) {
    logSession('dark-adapt', spent, { minutes: Math.round(spent / 60), best: aBest.value })
  }
  beep(880, 0.15)
  setTimeout(() => beep(1100, 0.22), 170)
  speak('暗適應完成，慢慢把視線移開，不要馬上看亮光')
}

function stopAdapt() {
  clearInterval(aTimer)
  const spent = aPhase.value === 'dark' ? aT.value : 0
  aPhase.value = 'idle'
  aPrompt.value = false
  if (spent > 30) {
    logSession('dark-adapt', spent, { minutes: Math.round(spent / 60), best: aBest.value })
  }
}

function drawCurve() {
  const cv = aCurve.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  const W = cv.width
  const H = cv.height
  const L = 46
  const R = 14
  const T = 14
  const B = 30
  ctx.fillStyle = '#0d0c09'
  ctx.fillRect(0, 0, W, H)
  const maxT = adaptMin.value
  const px = (m) => L + ((W - L - R) * Math.min(m, maxT)) / maxT
  const py = (s) => H - B - ((H - T - B) * (s - 1)) / 11
  ctx.font = '11px "Microsoft JhengHei", sans-serif'

  // 格線
  ctx.strokeStyle = '#2b2721'
  ctx.fillStyle = '#6d6554'
  ctx.lineWidth = 1
  for (let s = 1; s <= 12; s += 2) {
    ctx.beginPath()
    ctx.moveTo(L, py(s))
    ctx.lineTo(W - R, py(s))
    ctx.stroke()
    ctx.textAlign = 'right'
    ctx.fillText(`第 ${s} 格`, L - 6, py(s) + 4)
  }
  ctx.textAlign = 'center'
  for (let m = 0; m <= maxT; m += 5) {
    ctx.beginPath()
    ctx.moveTo(px(m), T)
    ctx.lineTo(px(m), H - B)
    ctx.stroke()
    ctx.fillText(`${m} 分`, px(m), H - B + 16)
  }

  // 視錐→視桿轉折（約 5–10 分鐘）
  if (maxT >= 7) {
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#8a6d35'
    ctx.beginPath()
    ctx.moveTo(px(7), T)
    ctx.lineTo(px(7), H - B)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#8a6d35'
    ctx.textAlign = 'left'
    ctx.fillText('視錐→視桿轉折', px(7) + 5, T + 12)
  }

  // 資料點
  const pts = aPoints.value
  if (!pts.length) {
    ctx.fillStyle = '#6d6554'
    ctx.textAlign = 'center'
    ctx.fillText('開始訓練後，每 2 分鐘記錄一次，曲線會在這裡長出來', W / 2, H / 2)
    return
  }
  ctx.strokeStyle = '#e8b45a'
  ctx.lineWidth = 2
  ctx.beginPath()
  pts.forEach((p, i) => (i ? ctx.lineTo(px(p.t), py(p.step)) : ctx.moveTo(px(p.t), py(p.step))))
  ctx.stroke()
  ctx.fillStyle = '#e8b45a'
  for (const p of pts) {
    ctx.beginPath()
    ctx.arc(px(p.t), py(p.step), 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

watch([aPoints, adaptMin, aPhase, aCurve], () => nextTick(drawCurve), { immediate: true })

// ============================================================
// B. 明暗交替適應（調節靈活度 ＋ 瞳孔反射）
// ============================================================
const BRIGHT_BG = { low: '#9b8d6e', mid: '#cdbb93', high: '#f3e4c2' }
const bReps = ref(5)
const bBright = ref(15)
const bDark = ref(30)
const bLevel = ref(highRisk.value ? 'low' : 'mid')
const bTarget = ref('')
const bAnswer = ref('')
const bStage = ref(null)

function onBSecond(step, left) {
  // 亮相最後 3 秒倒數，讓使用者先閉好準備（而不是突然轉黑才反應）
  if (step.kind === 'bright' && left <= 3 && left >= 1 && left < Math.floor(step.seconds)) {
    beep(760, 0.08, 0.18)
    speak(String(left))
  }
}
const switcher = useIntervals('dark-switch', { onSecond: onBSecond })

function startSwitch() {
  const plan = []
  for (let i = 0; i < bReps.value; i++) {
    plan.push({ kind: 'bright', label: '☀️ 亮適應', seconds: bBright.value, say: '亮', freq: 720 })
    plan.push({ kind: 'dark', label: '🌙 暗適應・找出數字', seconds: bDark.value, say: '暗', freq: 420 })
  }
  bAnswer.value = ''
  switcher.start(plan, { reps: bReps.value, bright: bBright.value, dark: bDark.value })
}

watch(switcher.index, () => {
  const c = switcher.current.value
  if (c && c.kind === 'dark') {
    bAnswer.value = ''
    bTarget.value = String(1 + Math.floor(Math.random() * 9))
  } else {
    bAnswer.value = bTarget.value // 轉亮（或結束）時揭曉上一輪的數字
    bTarget.value = ''
  }
})

// 暗相的最後 2 秒把數字調亮，立刻給回饋又不至於破壞暗適應
const bReveal = computed(
  () => switcher.current.value?.kind === 'dark' && switcher.left.value <= 2,
)
const bBg = computed(() =>
  switcher.current.value?.kind === 'bright' ? BRIGHT_BG[bLevel.value] : '#000',
)

// ============================================================
// C. 餘光偵測（周邊視覺・偏斜視 averted vision）
// ============================================================
const DIR_NAMES = ['右', '右下', '下', '左下', '左', '左上', '上', '右上']
const C_TRIALS = 20
const cCanvas = ref(null)
const cRunning = ref(false)
const cTrial = ref(0)
const cCorrect = ref(0)
const cLevel = ref(70) // 目前亮點灰度，愈小愈難
const cBest = ref(null) // 真正「答對過」的最暗灰階；起始值沒答對前不算數
const cAwait = ref(false)
const cMsg = ref('')
let cDir = 0
let cShown = false
let cMark = -1 // 回饋時標示的正確方向
let cT0 = 0
let cTimers = []

function clearCTimers() {
  cTimers.forEach(clearTimeout)
  cTimers = []
}
function later(fn, ms) {
  cTimers.push(setTimeout(fn, ms))
}

function drawPeriph() {
  const cv = cCanvas.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  const W = cv.width
  const H = cv.height
  const cx = W / 2
  const cy = H / 2
  const R = 150
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)

  // 深紅色注視十字：紅光幾乎不會漂白視桿細胞的視紫質
  ctx.strokeStyle = '#6e1410'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 10, cy)
  ctx.lineTo(cx + 10, cy)
  ctx.moveTo(cx, cy - 10)
  ctx.lineTo(cx, cy + 10)
  ctx.stroke()

  if (cShown) {
    const a = (cDir * Math.PI) / 4
    const v = cLevel.value
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 9, 0, Math.PI * 2)
    ctx.fill()
  }
  if (cMark >= 0) {
    const a = (cMark * Math.PI) / 4
    ctx.strokeStyle = '#e8b45a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 16, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function startPeriph() {
  clearCTimers()
  cRunning.value = true
  cTrial.value = 0
  cCorrect.value = 0
  cLevel.value = 70
  cBest.value = null
  cMsg.value = ''
  cT0 = performance.now()
  speak('視線固定在中央紅色十字，不要移動眼睛。用餘光察覺亮點出現在哪個方向，然後點該方向')
  later(nextTrial, 2500)
}

function nextTrial() {
  if (!cRunning.value) return
  if (cTrial.value >= C_TRIALS) return finishPeriph()
  cTrial.value++
  cMark = -1
  cAwait.value = false
  cShown = false
  drawPeriph()
  later(() => {
    if (!cRunning.value) return
    cDir = Math.floor(Math.random() * 8)
    cShown = true
    drawPeriph()
    later(() => {
      if (!cRunning.value) return
      cShown = false
      cAwait.value = true
      drawPeriph()
    }, 900)
  }, 900 + Math.random() * 700)
}

function onPeriphClick(e) {
  if (!cAwait.value) return
  const cv = cCanvas.value
  const r = cv.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * cv.width - cv.width / 2
  const y = ((e.clientY - r.top) / r.height) * cv.height - cv.height / 2
  if (Math.hypot(x, y) < 30) return // 點在注視點附近不算答案
  let d = Math.round(Math.atan2(y, x) / (Math.PI / 4))
  d = ((d % 8) + 8) % 8
  cAwait.value = false
  const ok = d === cDir
  if (ok) {
    cCorrect.value++
    // 先記錄「這一題的亮點灰階」再調暗——答對的那一階才是真正偵測到的極限
    cBest.value = cBest.value === null ? cLevel.value : Math.min(cBest.value, cLevel.value)
    cLevel.value = Math.max(3, Math.round(cLevel.value * 0.75))
    cMsg.value = `✅ ${DIR_NAMES[cDir]}——再調暗一點`
    beep(880, 0.07, 0.14)
  } else {
    cLevel.value = Math.min(170, Math.round(cLevel.value * 1.7))
    cMsg.value = `❌ 實際在${DIR_NAMES[cDir]}（你點了${DIR_NAMES[d]}）——調亮一點`
    beep(320, 0.1, 0.14)
  }
  cMark = cDir
  drawPeriph()
  later(nextTrial, 1100)
}

function finishPeriph() {
  clearCTimers()
  cRunning.value = false
  cShown = false
  cMark = -1
  drawPeriph()
  const spent = (performance.now() - cT0) / 1000
  cMsg.value =
    cBest.value === null
      ? `完成 ${C_TRIALS} 回：一次都沒答對。先把房間關暗、確認視線真的固定在中央十字上再試一次。`
      : `完成 ${C_TRIALS} 回：答對 ${cCorrect.value} 次，最暗偵測到灰階 ${cBest.value}（數字愈小愈好）`
  if (spent > 5) {
    logSession('dark-periph', spent, {
      trials: C_TRIALS,
      correct: cCorrect.value,
      threshold: cBest.value,
    })
  }
  beep(880, 0.15)
  setTimeout(() => beep(1100, 0.22), 170)
  speak('完成')
}

function stopPeriph() {
  clearCTimers()
  cRunning.value = false
  cAwait.value = false
  cShown = false
  cMark = -1
  drawPeriph()
}

watch(cCanvas, () => nextTick(drawPeriph))

// ============================================================
// D. 眩光恢復計時（photostress recovery）
// ============================================================
const gPhase = ref('idle') // idle | flash | recover | result
const gLeft = ref(0)
const gSecs = ref(0)
const gResult = ref(null)
const gDigit = ref('')
let gTimer = null
let gT0 = 0

const GLARE_MAX = 90
const gFlashR = computed(() => (highRisk.value ? 70 : 110))

const gVerdict = computed(() => {
  const s = gResult.value
  if (s === null) return null
  if (s >= GLARE_MAX) return { tone: 'bad', text: '超過 90 秒仍看不清——請確認房間夠暗、螢幕亮度正常後再試一次；若重複皆如此，建議告訴眼科醫師。' }
  if (s < 15) return { tone: 'good', text: '恢復很快。' }
  if (s < 30) return { tone: 'good', text: '在一般範圍內。' }
  if (s < 50) return { tone: 'dim', text: '偏慢。注意睡眠、用眼時數與營養，一週後同條件再測一次。' }
  return { tone: 'bad', text: '明顯偏長。若在同樣條件下重測仍如此，或兩眼差異很大，請在眼科回診時提出。' }
})

const gHistory = computed(() =>
  records
    .filter((r) => r.module === 'dark-glare')
    .slice(-6)
    .reverse(),
)

function startGlare() {
  gResult.value = null
  gSecs.value = 0
  gLeft.value = 5
  gDigit.value = String(1 + Math.floor(Math.random() * 9))
  gPhase.value = 'flash'
  speak('注視中央亮點五秒')
  clearInterval(gTimer)
  gTimer = setInterval(() => {
    if (gPhase.value === 'flash') {
      gLeft.value--
      if (gLeft.value <= 0) {
        gPhase.value = 'recover'
        gT0 = performance.now()
        beep(420, 0.18)
        speak('看得清楚數字就按按鈕')
      }
      return
    }
    gSecs.value = (performance.now() - gT0) / 1000
    if (gSecs.value >= GLARE_MAX) {
      gResult.value = GLARE_MAX
      gPhase.value = 'result'
      clearInterval(gTimer)
    }
  }, 1000)
}

function gotIt() {
  if (gPhase.value !== 'recover') return
  clearInterval(gTimer)
  const s = Math.round(((performance.now() - gT0) / 1000) * 10) / 10
  gResult.value = s
  gPhase.value = 'result'
  beep(880, 0.14)
  logSession('dark-glare', s, { recovery: s, digit: gDigit.value })
}

function stopGlare() {
  clearInterval(gTimer)
  gPhase.value = 'idle'
  gResult.value = null
}

onUnmounted(() => {
  clearInterval(aTimer)
  clearInterval(gTimer)
  clearCTimers()
})

// ============================================================
// 生活建議
// ============================================================
const LIFESTYLE = [
  {
    icon: '🥕',
    title: '飲食',
    good: [
      '深綠葉菜：菠菜、羽衣甘藍、地瓜葉、青花菜——葉黃素與玉米黃素的最佳來源，沉積在視網膜中心形成「天然濾鏡」',
      '蛋黃：葉黃素含量不算最高，但因為有脂質包裹，人體吸收率是所有食物裡最好的',
      '橘黃色蔬菜：紅蘿蔔、地瓜、南瓜——β-胡蘿蔔素在體內轉成維生素 A，是視紫質的原料',
      '動物性維生素 A：肝臟、全脂乳製品、蛋（肝臟每 1–2 週一次就足夠，不需天天吃）',
      '深海魚：鮭魚、鯖魚、秋刀魚——DHA 是感光細胞外節細胞膜的主要成分',
      '鋅：牡蠣、紅肉、南瓜籽——維生素 A 要從肝臟運送到視網膜需要鋅參與',
      '每一份都配一點油脂：維生素 A 與葉黃素都是脂溶性，水煮青菜不加油吸收率會打折',
    ],
    bad: [
      '長期極低脂飲食：脂溶性營養素吸收不足，是容易被忽略的暗視力殺手',
      '以保健食品取代蔬菜：葉黃素的實證劑量是每天 10 mg 左右，但整體蔬果攝取的保護力更明確',
      '吸菸者服用高劑量 β-胡蘿蔔素補充劑：ATBC 與 CARET 兩個大型試驗顯示會增加肺癌風險——吸菸者請從食物攝取，不要吃單方高劑量',
      '過量酒精：干擾肝臟的維生素 A 代謝與運送',
    ],
  },
  {
    icon: '🌃',
    title: '用眼習慣',
    good: [
      '夜間開車前 20 分鐘不要盯亮螢幕——這段時間正好是暗適應最關鍵的爬升期',
      '夜間把手機、螢幕亮度降到最低並開暖色；需要照明時改用紅光（紅光幾乎不會漂白視紫質）',
      '暗處要看清東西時，刻意把視線移開目標一點，用餘光去看',
      '儀表板與中控螢幕調暗；擋風玻璃內外與眼鏡鏡片保持乾淨——刮痕與油膜是夜間眩光的主因',
      '對向遠光燈來時看自己車道的右側邊線，不要直視燈源',
      '白天戶外戴太陽眼鏡：減少累積的光傷害，長期有助維持視網膜功能',
      '每 1–2 年驗光一次，並請驗光師確認「夜間度數」——瞳孔放大時會出現約 0.5 度的夜間近視',
    ],
    bad: [
      '夜間戴深色太陽眼鏡或所謂「夜視黃鏡」開車：減少進光量只會更危險，美國眼科學會明確不建議',
      '吸菸：是年齡相關性巨斑部病變（AMD）最強的可改變風險因子，而 AMD 最早期的表現之一就是暗適應變慢',
      '隱形眼鏡戴過久造成乾澀缺氧：淚膜一破裂，夜間眩光與光暈會明顯加重',
      '長時間在全黑房間滑手機：畫面是唯一光源時明暗落差最大，眼睛最累',
    ],
  },
  {
    icon: '🩺',
    title: '該就醫的警訊',
    good: [
      '暗適應變慢若來自用眼疲勞或營養，通常調整幾週就會改善',
      '把每次「眩光恢復計時」的秒數記下來，回診時能提供醫師有用的資訊',
      '糖尿病、高血壓患者定期做眼底檢查，很多早期變化只有醫師看得到',
    ],
    bad: [
      '暗處視力明顯變差或走進暗室久久看不見（夜盲）：可能是視網膜色素病變、維生素 A 缺乏或早期 AMD',
      '看路燈、車燈出現強烈星芒或光暈：常見於白內障、角膜問題或度數未矯正',
      '視野周邊缺損、像從管子裡看東西：青光眼與視網膜色素病變的典型表現',
      '突然飛蚊暴增、閃光感、視野出現黑幕：視網膜剝離的急症，請立刻就醫',
      '兩眼的暗適應或眩光恢復速度差很多：單眼病變的線索，不要自己觀察就算了',
    ],
  },
]
</script>

<template>
  <div class="page">
    <h1>🌙 暗適應與明暗調節</h1>
    <p class="desc">
      從亮處走進暗處看不見、夜間開車被車燈閃到久久恢復不了——這些都和視網膜的
      <strong>暗適應</strong>有關。這一頁用四個練習處理它：建立暗適應的耐心、訓練明暗交替的切換、
      學會用真正能看見暗處的<strong>餘光</strong>，並量化你的眩光恢復速度。
    </p>

    <div class="warn">
      ⚠️ 先把期待說清楚：暗適應的速度主要由<strong>視紫質（rhodopsin）再生的化學反應</strong>決定，
      約需 20–30 分鐘完成，這個生理速度<strong>無法靠練習加快</strong>。
      本頁真正能改變的是三件事：①<strong>用對方法</strong>（餘光、避免自己破壞暗適應）；
      ②<strong>提供原料</strong>（維生素 A、葉黃素、鋅的飲食）；
      ③<strong>早期發現問題</strong>（暗適應變慢是早期 AMD、視網膜色素病變與維生素 A 缺乏的共同徵兆）。
      若你的夜間視力是<strong>近期才明顯變差</strong>，請先看眼科，不要只靠練習。
    </div>

    <h2>🌑 一、暗適應階梯（核心練習）</h2>
    <ExplainCard
      title="暗適應階梯"
      :open="false"
      purpose="完整走過一次 20 分鐘的暗適應歷程，親眼看見自己的敏感度一路爬升，並建立「暗處要給眼睛時間」的習慣——大多數人抱怨的「暗處看不見」，其實是只等了 30 秒就放棄。"
      principle="視網膜有兩套感光細胞：視錐細胞負責明亮與顏色，約 5–10 分鐘就達到最佳狀態；視桿細胞負責微光，必須等視紫質重新合成，敏感度會一路爬升到 20–30 分鐘，最終比剛進暗室時高出數萬倍。兩段曲線交接處的轉折點稱為「rod–cone break」，大約落在 5–10 分鐘。畫面上 12 階灰度就是一把尺：你能看見愈後面（愈暗）的格，代表視桿細胞的閾值降得愈低。"
      :method="[
        '把房間燈關掉或調到最暗，拉上窗簾，按「⛶ 全螢幕」讓黑畫面填滿螢幕。',
        '可先開「30 秒亮適應」把兩次測試的起點拉成一致（想比較不同日期時建議開啟）。',
        '畫面轉黑後放鬆地看著灰階條，不要用力瞪。訣竅：視線略偏一側、用餘光看，會比直視更容易看見。',
        '每 2 分鐘聽到提示音與語音時，點選「你剛好還看得見的最暗一格」，下方曲線就會多一個點。',
        '做完 20 分鐘後不要馬上開燈或看亮螢幕——一次亮光就會把剛累積的暗適應全部清零。',
      ]"
    />

    <div class="controls">
      <label>
        時長
        <select v-model.number="adaptMin" :disabled="aPhase !== 'idle'">
          <option :value="10">10 分鐘（只到轉折點）</option>
          <option :value="20">20 分鐘（建議）</option>
          <option :value="30">30 分鐘（完整）</option>
        </select>
      </label>
      <label>
        <input type="checkbox" v-model="preBright" :disabled="aPhase !== 'idle'" />
        先做 30 秒亮適應（統一起點）
      </label>
      <button v-if="aPhase === 'idle'" class="primary" @click="startAdapt">▶ 開始</button>
      <button v-else @click="stopAdapt">■ 結束</button>
      <button @click="toggleFull(aStage)">⛶ 全螢幕</button>
      <span v-if="aPhase !== 'idle'" style="color: var(--accent); font-weight: 700">
        {{ aPhase === 'pre' ? '☀️ 亮適應' : '🌑 暗適應' }} {{ aClock }}
      </span>
      <span v-if="aBest" style="color: var(--text-dim)">目前最暗：第 {{ aBest }} 格</span>
      <span v-if="aDone && aPhase === 'idle'" style="color: var(--good); font-weight: 700">
        ✅ 完成——先別開燈
      </span>
    </div>

    <div
      ref="aStage"
      class="dark-stage"
      :style="{ background: aPhase === 'pre' ? BRIGHT_BG[bLevel] : '#000' }"
    >
      <div v-if="aPhase === 'pre'" class="pre-note">
        ☀️ 亮適應中，看著畫面…… {{ aClock }}
      </div>
      <template v-else>
        <div class="wedge-hint" :class="{ on: aPrompt }">
          {{
            aPrompt
              ? '👉 點選你還看得見的最暗一格'
              : aPhase === 'dark'
                ? '視線略偏一側，用餘光看'
                : '關燈、全螢幕，按「開始」後計時'
          }}
        </div>
        <div class="wedge" :class="{ prompt: aPrompt }">
          <button
            v-for="(v, i) in WEDGE"
            :key="i"
            class="patch"
            :style="{ background: `rgb(${v},${v},${v})` }"
            :title="`第 ${i + 1} 格`"
            @click="pickStep(i)"
          ></button>
        </div>
        <div class="fix-dot"></div>
      </template>
    </div>

    <canvas ref="aCurve" class="curve" width="900" height="240"></canvas>
    <div class="hint">
      💡 曲線向上代表「看得見愈暗的格」。理想的形狀是前 5–10 分鐘快速上升（視錐），
      接著出現一個小轉折，之後繼續緩慢爬升到 20 分鐘以後（視桿）。
      若 10 分鐘之後幾乎不再上升，可以在下次眼科回診時提一下。
    </div>

    <h2>🔄 二、明暗交替適應</h2>
    <ExplainCard
      title="明暗交替適應"
      :open="false"
      purpose="訓練「亮→暗」切換時的反應：瞳孔迅速放大、調節放鬆、以及主動去搜尋微弱目標的習慣。進隧道、走出賣場、夜間從路燈下轉進暗巷時，吃虧的往往不是眼睛不夠好，而是沒有立刻開始找。"
      principle="瞳孔對光反射由虹膜的瞳孔括約肌與放大肌控制，從亮到暗放大只需幾秒；視錐細胞的適應約數十秒。因此在明暗之間「立刻能找回多少視覺」，取決於瞳孔反射與視錐適應，而非需要 20 分鐘的視桿。亮暗各維持 10 秒以上是緩慢交替、不是閃爍，不會造成閃光刺激。"
      :method="[
        '關燈、按「⛶ 全螢幕」，坐在手臂長的距離。',
        '聽到「亮」時正常看著亮畫面；最後 3 秒會倒數，準備切換。',
        '聽到「暗」時立刻開始找畫面中央那個很暗的數字——不要等，愈快讀出愈好。',
        '每個暗相的最後 2 秒會把數字調亮揭曉答案，自己核對是否讀對。',
        '覺得亮相太刺眼就把亮度調成「低」；有光敏性體質或偏頭痛請直接略過這個練習。',
      ]"
    />

    <div class="controls">
      <label>
        回數
        <select v-model.number="bReps" :disabled="switcher.running.value">
          <option :value="3">3 回</option>
          <option :value="5">5 回</option>
          <option :value="8">8 回</option>
        </select>
      </label>
      <label>
        亮相
        <select v-model.number="bBright" :disabled="switcher.running.value">
          <option :value="10">10 秒</option>
          <option :value="15">15 秒</option>
          <option :value="20">20 秒</option>
        </select>
      </label>
      <label>
        暗相
        <select v-model.number="bDark" :disabled="switcher.running.value">
          <option :value="20">20 秒</option>
          <option :value="30">30 秒</option>
          <option :value="45">45 秒</option>
        </select>
      </label>
      <label>
        亮度
        <span class="seg">
          <button
            v-for="(l, k) in { low: '低', mid: '中', high: '高' }"
            :key="k"
            :class="{ on: bLevel === k }"
            @click="bLevel = k"
          >
            {{ l }}
          </button>
        </span>
      </label>
      <button v-if="!switcher.running.value" class="primary" @click="startSwitch">▶ 開始</button>
      <button v-else @click="switcher.pause">⏸ 暫停</button>
      <button @click="toggleFull(bStage)">⛶ 全螢幕</button>
    </div>

    <div ref="bStage" class="dark-stage switch-stage" :style="{ background: bBg }">
      <template v-if="switcher.current.value">
        <div
          class="switch-label"
          :style="{ color: switcher.current.value.kind === 'bright' ? '#4a3a1c' : '#5a5243' }"
        >
          {{ switcher.current.value.label }}　{{ switcher.left.value }}
        </div>
        <div v-if="switcher.current.value.kind === 'bright'" class="bright-fix"></div>
        <div
          v-else
          class="dim-digit"
          :style="{ color: bReveal ? '#9a9a9a' : 'rgb(34,34,34)' }"
        >
          {{ bTarget }}
        </div>
      </template>
      <div v-else-if="switcher.done.value" class="pre-note">✅ 完成，慢慢讓眼睛回到室內光線</div>
      <div v-else class="pre-note">按「開始」後畫面會在亮與暗之間緩慢交替</div>
    </div>
    <div class="hint">
      {{ bAnswer ? `👁️ 上一輪的數字是 ${bAnswer}` : '暗相結束後會在這裡公布上一輪的數字。' }}
    </div>

    <h2>👀 三、餘光偵測（偏斜視）</h2>
    <ExplainCard
      title="餘光偵測"
      :open="false"
      purpose="學會天文觀星者所說的「averted vision（偏斜視）」——暗處要看清東西，必須刻意不去直視它。這是本頁唯一真正能靠練習進步的技能，而且立刻就能用在夜路、停車場與露營。"
      principle="視桿細胞（負責微光）在視網膜中心的小凹（foveola）幾乎沒有分布，密度高峰落在離中心約 15–20 度的位置；而視錐細胞剛好相反，集中在中心卻在微光下幾乎沒有輸出。所以在暗處「直視」某個物體，等於把它放在視網膜最不敏感的地方。把視線移開一點、讓影像落在旁邊的視桿密集區，能看見的微弱光點會明顯增加。注視十字刻意用深紅色，因為視桿細胞對長波紅光幾乎沒有反應，不會因此被漂白。"
      :method="[
        '關燈，坐在手臂長的距離（約 50–60 公分）。',
        '視線「固定」在中央深紅色十字上，整場不要移動眼睛——這是練習的重點。',
        '用餘光察覺微弱亮點出現在哪個方向，然後用滑鼠點那個方向的位置。',
        '答對亮點就變更暗，答錯就變亮；共 20 回，程式會找出你的偵測極限。',
        '記下「最暗偵測到的灰階」，數字愈小愈好，可以隔幾週在同一台螢幕上比較。',
      ]"
    />

    <div class="controls">
      <button v-if="!cRunning" class="primary" @click="startPeriph">▶ 開始 20 回</button>
      <button v-else @click="stopPeriph">■ 結束</button>
      <span v-if="cRunning" style="color: var(--accent); font-weight: 700">
        第 {{ cTrial }} / {{ C_TRIALS }} 回
      </span>
      <span v-if="cRunning" style="color: var(--text-dim)">
        答對 {{ cCorrect }}｜目前灰階 {{ cLevel }}
      </span>
      <span v-if="cAwait" style="color: var(--good); font-weight: 700">👉 點出剛才的方向</span>
    </div>

    <div class="stage">
      <canvas
        ref="cCanvas"
        width="720"
        height="440"
        style="cursor: crosshair"
        @click="onPeriphClick"
      ></canvas>
    </div>
    <div class="hint">{{ cMsg || '視線固定在中央紅色十字，整場都不要移動眼睛——只用餘光判斷方向。' }}</div>

    <h2>💡 四、眩光恢復計時</h2>
    <ExplainCard
      title="眩光恢復計時（photostress recovery）"
      :open="false"
      purpose="量化「被強光閃到之後多久才能看清東西」。這就是夜間開車遇到對向遠光燈時最危險的那幾秒；它同時是視網膜中心功能的一個敏感指標，自己留下基準線，日後變化才看得出來。"
      principle="強光會漂白中央視錐細胞的視色素，必須經由視網膜色素上皮的視循環（retinoid cycle）重新補充 11-順式視網醛才能恢復靈敏度。巨斑部的葉黃素與玉米黃素（巨斑色素）會先過濾掉部分短波光，雙盲隨機對照試驗（Eye and Vision 2016，59 位健康年輕人、為期 12 個月）顯示補充葉黃素與玉米黃素可縮短眩光恢復時間、改善眩光下的視覺表現——不過該試驗由補充劑廠商資助、受試者都是健康年輕人，別把效果想得太大。相反地，恢復時間異常延長是早期年齡相關性巨斑部病變的已知徵兆。"
      :method="[
        '關燈，螢幕亮度維持在你平常的設定（亮度會影響結果，每次要一致）。',
        '按「開始」後注視中央亮點 5 秒，不要閉眼也不要移開視線。',
        '亮點消失後畫面轉黑，中央會出現一個很暗的數字——看清楚的那一刻立刻按「看清楚了」。',
        '核對程式公布的數字是否與你讀到的相同；不同就重做一次。',
        '只拿自己的紀錄跟自己比：同一台螢幕、同樣的房間亮度、同樣的時間，才有比較意義。',
      ]"
    />

    <div v-if="highRisk" class="warn">
      ⚠️ 你在安全問卷中選擇了高風險選項，本練習已自動縮小亮點面積。
      若有視網膜病變、偏頭痛畏光、近期眼部手術或正在使用光敏感藥物，請略過這個項目。
    </div>

    <div class="controls">
      <button v-if="gPhase === 'idle'" class="primary" @click="startGlare">▶ 開始測量</button>
      <button v-else @click="stopGlare">■ 取消</button>
      <button
        v-if="gPhase === 'recover'"
        class="primary"
        style="font-size: 1.05rem; padding: 10px 24px"
        @click="gotIt"
      >
        👁️ 看清楚了！
      </button>
      <span v-if="gPhase === 'recover'" style="color: var(--accent); font-weight: 700">
        {{ gSecs.toFixed(0) }} 秒
      </span>
    </div>

    <div class="dark-stage glare-stage">
      <template v-if="gPhase === 'flash'">
        <div
          class="glare-disc"
          :style="{ width: gFlashR * 2 + 'px', height: gFlashR * 2 + 'px' }"
        ></div>
        <div class="glare-count">{{ gLeft }}</div>
      </template>
      <div v-else-if="gPhase === 'recover'" class="dim-digit" style="color: rgb(34, 34, 34)">
        {{ gDigit }}
      </div>
      <div v-else-if="gPhase === 'result'" class="glare-result">
        <div class="big-guide">{{ gResult >= GLARE_MAX ? '> 90' : gResult }} 秒</div>
        <div :class="gVerdict.tone === 'good' ? 'ok' : gVerdict.tone === 'bad' ? 'ng' : 'mid'">
          {{ gVerdict.text }}
        </div>
        <div style="color: var(--text-dim); font-size: 0.9rem">
          剛才的數字是 <strong style="color: var(--accent)">{{ gDigit }}</strong
          >——如果和你讀到的不一樣，請再測一次。
        </div>
      </div>
      <div v-else class="pre-note">按「開始測量」後注視中央亮點 5 秒</div>
    </div>

    <div v-if="gHistory.length" class="controls" style="gap: 14px">
      <span style="color: var(--text-dim)">最近紀錄：</span>
      <span v-for="r in gHistory" :key="r.ts" style="color: var(--accent); font-weight: 700">
        {{ r.extra?.recovery ?? r.seconds }} 秒
        <span style="color: var(--text-dim); font-weight: 400">（{{ r.date.slice(5) }}）</span>
      </span>
    </div>
    <div class="hint">
      💡 這不是臨床檢查——螢幕亮度、房間光線、年齡與疲勞都會改變結果，絕對不能用來自我診斷。
      它的價值在於<strong>趨勢</strong>：固定條件下每隔幾週測一次，若逐漸變慢或兩眼差異明顯，
      就是值得告訴醫師的資訊。
    </div>

    <h2>🌱 生活調整建議</h2>
    <p class="desc">
      暗視力有一半不在練習、在補給與習慣：視紫質的原料是維生素 A，而巨斑色素（葉黃素、玉米黃素）
      是人體完全無法自行合成、只能從食物取得的天然濾鏡。
    </p>

    <div class="life-grid">
      <div v-for="g in LIFESTYLE" :key="g.title" class="life-card">
        <h3>{{ g.icon }} {{ g.title }}</h3>
        <div class="life-label good">{{ g.title === '該就醫的警訊' ? '✅ 可以先自己觀察' : '✅ 多做 / 多吃' }}</div>
        <ul class="good">
          <li v-for="(t, i) in g.good" :key="i">{{ t }}</li>
        </ul>
        <div class="life-label bad">{{ g.title === '該就醫的警訊' ? '🚨 請就醫檢查' : '❌ 少做 / 少吃' }}</div>
        <ul class="bad">
          <li v-for="(t, i) in g.bad" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>

    <div class="hint">
      💡 建議的練習組合：每天 2–3 分鐘的「餘光偵測」培養習慣；每週一次完整的
      20 分鐘「暗適應階梯」；需要夜間開車的前一天做一次「眩光恢復計時」留下紀錄。
      飲食與用眼習慣的改變通常需要 2–3 個月才看得出差異，別急。
    </div>
  </div>
</template>

<style scoped>
/* 暗場舞台：訓練時要能全螢幕，且背景必須是純黑而非主題色 */
.dark-stage {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 14px 0;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  overflow: hidden;
  padding: 24px 16px;
}
.dark-stage:fullscreen {
  border: none;
  border-radius: 0;
  min-height: 100vh;
  justify-content: center;
}
.pre-note {
  color: #6d6554;
  font-size: 0.95rem;
  text-align: center;
}

/* --- 灰階階梯 --- */
.wedge-hint {
  color: #4a443a;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.wedge-hint.on {
  color: var(--accent);
  font-weight: 700;
}
.wedge {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 6px;
  border-radius: 10px;
}
.wedge.prompt {
  outline: 1px dashed var(--accent-soft);
}
.patch {
  width: 58px;
  height: 58px;
  border: none;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
}
.patch:hover {
  outline: 1px solid var(--accent-soft);
}
.fix-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6e1410; /* 深紅：不會漂白視桿細胞 */
}

.curve {
  display: block;
  width: 100%;
  height: auto;
  max-width: 900px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #0d0c09;
}

/* --- 明暗交替 --- */
.switch-stage {
  min-height: 320px;
  transition: background 0.4s;
}
.switch-label {
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.bright-fix {
  width: 18px;
  height: 18px;
  background: #4a3a1c;
  border-radius: 4px;
}
.dim-digit {
  font-size: 5rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* --- 眩光恢復 --- */
.glare-stage {
  background: #000;
  min-height: 320px;
}
.glare-disc {
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 60px 20px rgba(255, 255, 255, 0.5);
}
.glare-count {
  position: absolute;
  bottom: 14px;
  color: #6d6554;
  font-weight: 700;
}
.glare-result {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.glare-result .ok {
  color: var(--good);
  font-weight: 700;
}
.glare-result .mid {
  color: var(--accent);
  font-weight: 700;
}
.glare-result .ng {
  color: var(--bad);
  font-weight: 700;
  max-width: 520px;
}

/* --- 生活建議 --- */
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
.life-card h3 {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 1.05rem;
}
.life-label {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 12px 0 4px;
}
.life-label.good {
  color: var(--good);
}
.life-label.bad {
  color: var(--bad);
}
.life-card ul {
  margin: 0 0 0 20px;
  color: var(--text-dim);
  font-size: 0.88rem;
}
.life-card li {
  margin: 5px 0;
}
.life-card ul.good li::marker {
  color: var(--good);
}
.life-card ul.bad li::marker {
  color: var(--bad);
}
</style>
