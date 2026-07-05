import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './', // 相對路徑：可部署在 GitHub Pages 子路徑或任何靜態主機
  server: { port: 5173 },
})
