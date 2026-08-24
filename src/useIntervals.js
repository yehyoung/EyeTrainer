// 通用區間訓練引擎：依序執行步驟清單（準備／用力／休息…），含提示音與語音引導
// 步驟格式：{ kind: 'prep'|'work'|'rest', label, seconds, say?, freq?, vol? }
import { ref, computed, onUnmounted } from 'vue'
import { beep, speak, logSession } from './store'

// opts.onSecond(step, secondsLeft)：每當「剩餘整數秒」變動時呼叫一次，供頁面做語音倒數
export function useIntervals(module, opts = {}) {
  const steps = ref([])
  const index = ref(0)
  const elapsed = ref(0) // 目前步驟已過秒數
  const running = ref(false)
  const done = ref(false)
  let timer = null
  let last = 0
  let spent = 0 // 本次訓練累計秒數（暫停時不計）
  let meta = {}
  let lastLeft = null // 上次回報的剩餘秒數，避免同一秒重複播報

  const current = computed(() => steps.value[index.value] || null)

  const left = computed(() => {
    const c = current.value
    return c ? Math.max(0, Math.ceil(c.seconds - elapsed.value)) : 0
  })

  const progress = computed(() => {
    const c = current.value
    return c && c.seconds > 0 ? Math.min(1, elapsed.value / c.seconds) : 0
  })

  const remaining = computed(() => {
    let s = left.value
    for (let i = index.value + 1; i < steps.value.length; i++) s += steps.value[i].seconds
    return s
  })

  const clock = computed(() => {
    const s = remaining.value
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  })

  function announce(step) {
    if (!step) return
    const freq = step.freq ?? (step.kind === 'work' ? 780 : 480)
    beep(freq, 0.14, step.vol ?? 0.25)
    if (step.say) speak(step.say)
  }

  function tick() {
    const now = performance.now()
    const dt = (now - last) / 1000
    last = now
    elapsed.value += dt
    spent += dt

    // 保留超出的時間再進入下一步，否則每次切換都會丟棄殘餘、整段訓練愈跑愈慢。
    // 分頁切到背景時 setInterval 會被節流到約 1 秒，單次 tick 可能跨越多個步驟，
    // 因此用迴圈追上，並只在最後落點發出提示音（避免補播一連串聲音）。
    let advanced = false
    for (;;) {
      const c = current.value
      if (!c || elapsed.value < c.seconds) break
      elapsed.value -= c.seconds
      if (index.value >= steps.value.length - 1) return finish()
      index.value++
      advanced = true
    }
    if (advanced) announce(current.value)

    // 每秒回呼一次（背景分頁被節流而跨越多秒時，只以最新值回報一次）
    const cur = current.value
    if (cur) {
      const l = Math.max(0, Math.ceil(cur.seconds - elapsed.value))
      if (l !== lastLeft) {
        lastLeft = l
        opts.onSecond && opts.onSecond(cur, l)
      }
    }
  }

  // 傳入 plan 為全新開始；不傳則從暫停處繼續
  function start(plan, info = {}) {
    if (plan) {
      steps.value = plan
      index.value = 0
      elapsed.value = 0
      spent = 0
      meta = info
      done.value = false
      lastLeft = null
    }
    running.value = true
    last = performance.now()
    clearInterval(timer)
    // 50ms：計時精準，同時讓依賴 elapsed 的動畫夠流暢（不依賴 rAF／CSS 動畫）
    timer = setInterval(tick, 50)
    if (plan) announce(current.value)
  }

  function pause() {
    running.value = false
    clearInterval(timer)
  }

  function reset() {
    pause()
    steps.value = []
    index.value = 0
    elapsed.value = 0
    spent = 0
    done.value = false
    lastLeft = null
  }

  function finish() {
    pause()
    done.value = true
    index.value = steps.value.length // current 變為 null，讓畫面切換到完成狀態
    elapsed.value = 0
    if (spent > 5) logSession(module, spent, meta)
    beep(880, 0.15)
    setTimeout(() => beep(1100, 0.22), 170)
    speak('訓練完成，做得好')
  }

  onUnmounted(() => clearInterval(timer))

  return { steps, index, current, elapsed, left, progress, remaining, clock, running, done, start, pause, reset }
}
