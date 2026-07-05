// 共用訓練計時器：控制開始/暫停/結束，結束時記錄並提示
import { ref, computed, onUnmounted } from 'vue'
import { beep, logSession } from './store'

export function useSession(module, durationRef, { onComplete, onFrame } = {}) {
  const running = ref(false)
  const elapsed = ref(0) // 秒
  const done = ref(false)
  // 用 setInterval + performance.now 而非 rAF：分頁被節流或短暫失焦時計時仍正確
  let intervalId = null
  let lastTs = null

  function tick() {
    if (!running.value) return
    const now = performance.now()
    elapsed.value += (now - lastTs) / 1000
    lastTs = now
    if (elapsed.value >= durationRef.value) {
      elapsed.value = durationRef.value
      finish()
      return
    }
    onFrame && onFrame(elapsed.value)
  }

  function start() {
    if (done.value) reset()
    running.value = true
    lastTs = performance.now()
    intervalId = setInterval(tick, 100)
  }

  function pause() {
    running.value = false
    lastTs = null
    clearInterval(intervalId)
  }

  function reset() {
    pause()
    elapsed.value = 0
    done.value = false
  }

  function finish() {
    running.value = false
    done.value = true
    clearInterval(intervalId)
    logSession(module, elapsed.value)
    beep(660, 0.15)
    setTimeout(() => beep(880, 0.25), 180)
    onComplete && onComplete()
  }

  const remaining = computed(() => Math.max(0, Math.ceil(durationRef.value - elapsed.value)))
  const clock = computed(() => {
    const s = remaining.value
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  })

  onUnmounted(pause)

  return { running, elapsed, done, remaining, clock, start, pause, reset }
}
