<template>
  <header class="topbar">
    <div class="topbar-logo">
      <div class="logo-dot"></div>
      智能运维助手
    </div>
    <div class="topbar-divider"></div>
    <div class="status-badge">
      <div class="status-dot" :class="store.apiStatus === 'ok' ? 'ok' : 'error'"></div>
      {{ store.apiStatus === 'ok' ? 'API 正常' : 'API 离线' }}
    </div>
    <div class="topbar-right">
      <span class="stat-chip">会话 {{ store.sessions.length }}</span>
      <span class="stat-chip">请求 {{ store.totalRequests }}</span>
      <el-button size="small" @click="store.checkHealth">刷新状态</el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
const store = useChatStore()
</script>

<style scoped>
.topbar {
  grid-column: 1 / -1;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  height: 52px;
}
.topbar-logo {
  display: flex; align-items: center; gap: 8px;
  font-weight: 600; font-size: 15px; letter-spacing: -0.3px;
}
.logo-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
.topbar-divider { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }
.status-badge   { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-secondary); }
.status-dot     { width: 6px; height: 6px; border-radius: 50%; }
.status-dot.ok  { background: var(--green); }
.status-dot.error { background: var(--red); }
.topbar-right   { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.stat-chip {
  font-size: 11px; color: var(--text-secondary);
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 20px; padding: 3px 10px;
}
</style>
