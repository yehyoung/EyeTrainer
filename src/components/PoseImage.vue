<script setup>
import { ref, watch, onUnmounted } from 'vue'

// 示意圖的字很小，縮圖一定看不清楚，所以每張圖都可以點開看原始尺寸
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  max: { type: Number, default: 320 }, // 縮圖最大寬度（px）
  lazy: { type: Boolean, default: false },
})

defineOptions({ inheritAttrs: false })

const open = ref(false)

function onKey(e) {
  if (e.key === 'Escape') open.value = false
}

watch(open, (v) => {
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})

onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <img
    v-bind="$attrs"
    class="pose-img"
    :src="src"
    :alt="alt"
    :style="{ maxWidth: max + 'px' }"
    :loading="lazy ? 'lazy' : 'eager'"
    title="點擊放大"
    @click="open = true"
  />
  <Teleport to="body">
    <div v-if="open" class="pose-lightbox" @click="open = false">
      <img :src="src" :alt="alt" @click.stop />
      <button class="pose-close" @click="open = false">✕ 關閉</button>
      <div class="pose-cap">{{ alt }}</div>
    </div>
  </Teleport>
</template>

<style scoped>
.pose-img {
  width: 100%;
  display: block;
  border-radius: 10px;
  background: #fff;
  border: 1px solid var(--border);
  cursor: zoom-in;
}
.pose-img:hover { border-color: var(--accent); }
</style>

<style>
.pose-lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  cursor: zoom-out;
}
.pose-lightbox img {
  max-width: min(94vw, 820px);
  max-height: 82vh;
  background: #fff;
  border-radius: 12px;
  cursor: default;
}
.pose-lightbox .pose-cap {
  color: #e8e2d6;
  font-size: 0.95rem;
  text-align: center;
}
.pose-close {
  position: absolute;
  top: 16px;
  right: 18px;
}
</style>
