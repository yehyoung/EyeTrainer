<script setup>
import { settings } from '../store'

function answer(risk) {
  settings.risk = risk
}
</script>

<template>
  <div class="modal-mask">
    <div class="modal">
      <h2>開始前的安全確認</h2>
      <p>
        您是否有<strong>高度近視（600 度以上）</strong>、視網膜病變病史，
        或曾被醫師告知有視網膜剝離風險？
      </p>
      <div class="opts">
        <button @click="answer('normal')">❌ 沒有以上情況</button>
        <button @click="answer('high')">⚠️ 有（或不確定）——啟用慢速安全模式</button>
      </div>
      <p style="color: var(--text-dim); font-size: 0.85rem">
        高度近視者快速轉動眼球有視網膜剝離風險。安全模式會將所有眼球運動鎖定為慢速，
        並建議您先諮詢眼科醫師再進行訓練。此設定可隨時在「說明」頁重新調整。
      </p>
    </div>
  </div>
</template>
