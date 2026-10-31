import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './pages/Home.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/wheel', component: () => import('./pages/Wheel.vue') },
  { path: '/focus', component: () => import('./pages/Focus.vue') },
  { path: '/stereo', component: () => import('./pages/Stereo.vue') },
  { path: '/relax', component: () => import('./pages/Relax.vue') },
  { path: '/dark', component: () => import('./pages/Dark.vue') },
  { path: '/isometric', component: () => import('./pages/Isometric.vue') },
  { path: '/pelvic', component: () => import('./pages/Pelvic.vue') },
  { path: '/autonomic', component: () => import('./pages/Autonomic.vue') },
  { path: '/progress', component: () => import('./pages/Progress.vue') },
  { path: '/about', component: () => import('./pages/About.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
