<script setup>
import { settings } from './store'
import SafetyModal from './components/SafetyModal.vue'
</script>

<template>
  <nav class="nav">
    <router-link to="/" class="brand">👁️ EyeTrainer</router-link>
    <router-link to="/wheel" class="link">藏輪圖</router-link>
    <router-link to="/focus" class="link">遠近變焦</router-link>
    <router-link to="/stereo" class="link">3D 立體圖</router-link>
    <router-link to="/relax" class="link">放鬆休息</router-link>
    <router-link to="/dark" class="link">暗適應</router-link>
    <span class="nav-sep"></span>
    <router-link to="/isometric" class="link">等長運動</router-link>
    <router-link to="/pelvic" class="link">骨盆底肌</router-link>
    <router-link to="/autonomic" class="link">自律神經</router-link>
    <span class="nav-sep"></span>
    <router-link to="/progress" class="link">進度</router-link>
    <router-link to="/about" class="link">說明</router-link>
  </nav>

  <router-view />

  <footer class="footer">
    本網站訓練僅供眼部放鬆與保健參考，無法治療近視、老花或任何眼疾，亦不能取代眼科診療。
    高度近視或視網膜病變者請避免快速眼球運動；訓練中若出現閃光、飛蚊突增、視野缺損，請立即停止並就醫。
  </footer>

  <SafetyModal v-if="settings.risk === null" />
</template>
