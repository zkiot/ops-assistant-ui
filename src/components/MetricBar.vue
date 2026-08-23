<template>
  <div class="metric-row">
    <span class="metric-label">{{ label }}</span>
    <div class="metric-bar">
      <div class="metric-fill" :class="colorClass" :style="{ width: value + '%' }"></div>
    </div>
    <span class="metric-value">{{ value }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ← 用 interface 定义 Props
interface Props {
  label: string
  value: number
}
const props = defineProps<Props>()

const colorClass = computed<string>(() => {
  if (props.value > 85) return 'fill-red'
  if (props.value > 65) return 'fill-yellow'
  return 'fill-green'
})
</script>

<style scoped>
.metric-row   { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-secondary); }
.metric-label { width: 36px; flex-shrink: 0; }
.metric-bar   { flex: 1; height: 4px; background: var(--bg-input); border-radius: 2px; overflow: hidden; }
.metric-fill  { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.metric-value { width: 30px; text-align: right; }
.fill-green   { background: var(--green); }
.fill-yellow  { background: var(--yellow); }
.fill-red     { background: var(--red); }
</style>
