// 極簡 localStorage 狀態層：設定、安全問卷結果、訓練紀錄
import { reactive, watch } from 'vue'

const SETTINGS_KEY = 'eyetrainer.settings'
const RECORDS_KEY = 'eyetrainer.records'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const settings = reactive(
  load(SETTINGS_KEY, {
    risk: null, // null=未回答, 'normal', 'high'
    sound: true,
    voice: true,
  }),
)

watch(settings, (v) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(v)), { deep: true })

// records: [{ date:'2026-07-04', module:'wheel', seconds:60, extra:{...} }]
export const records = reactive(load(RECORDS_KEY, []))

export function clearRecords() {
  records.splice(0, records.length)
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function logSession(module, seconds, extra = {}) {
  records.push({ date: todayStr(), module, seconds: Math.round(seconds), extra, ts: Date.now() })
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function todayStr(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function trainedDates() {
  return [...new Set(records.map((r) => r.date))].sort()
}

// 連續訓練天數（含今天；若今天尚未練，從昨天往回算）
export function streak() {
  const dates = new Set(trainedDates())
  let count = 0
  const d = new Date()
  if (!dates.has(todayStr(d))) d.setDate(d.getDate() - 1)
  while (dates.has(todayStr(d))) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

export function todaySeconds() {
  return records.filter((r) => r.date === todayStr()).reduce((s, r) => s + r.seconds, 0)
}

// --- 音效 ---
let audioCtx = null
export function beep(freq = 880, dur = 0.12, vol = 0.25) {
  if (!settings.sound) return
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)()
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.frequency.value = freq
    o.connect(g)
    g.connect(audioCtx.destination)
    g.gain.setValueAtTime(vol, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur)
    o.start()
    o.stop(audioCtx.currentTime + dur)
  } catch {}
}

export function speak(text) {
  if (!settings.voice || !window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'zh-TW'
  u.rate = 1.05
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
