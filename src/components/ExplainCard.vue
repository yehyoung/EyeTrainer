<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '訓練說明' },
  purpose: { type: String, required: true },
  principle: { type: String, required: true },
  method: { type: Array, required: true }, // 步驟字串陣列
  open: { type: Boolean, default: true },
})
const show = ref(props.open)
</script>

<template>
  <div class="explain">
    <button class="explain-toggle" @click="show = !show">
      📖 {{ title }}｜目的・原理・方法
      <span class="arrow">{{ show ? '▲' : '▼' }}</span>
    </button>
    <div v-if="show" class="explain-body">
      <p><span class="tag">🎯 目的</span>{{ purpose }}</p>
      <p><span class="tag">🔬 原理</span>{{ principle }}</p>
      <div>
        <span class="tag">📋 方法</span>
        <ol>
          <li v-for="(m, i) in method" :key="i">{{ m }}</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explain {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 12px 0;
  overflow: hidden;
}
.explain-toggle {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: 0;
  padding: 10px 16px;
  font-weight: 700;
  color: var(--accent);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.explain-toggle:hover { background: var(--bg-soft); }
.arrow { color: var(--text-dim); font-size: 0.8rem; }
.explain-body {
  padding: 4px 16px 14px;
  color: var(--text-dim);
  font-size: 0.92rem;
}
.explain-body p { margin: 8px 0; }
.tag {
  display: inline-block;
  color: var(--text);
  font-weight: 700;
  margin-right: 8px;
  white-space: nowrap;
}
.explain-body ol {
  margin: 6px 0 0 26px;
}
.explain-body li { margin: 3px 0; }
</style>
