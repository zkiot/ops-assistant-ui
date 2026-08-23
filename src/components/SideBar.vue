<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <button class="new-chat-btn" @click="store.newSession()">
        <el-icon><Plus /></el-icon> 新建会话
      </button>
      <div class="sidebar-label">历史会话</div>
    </div>

    <div class="session-list">
      <div
        v-for="s in store.sessions"
        :key="s.id"
        class="session-item"
        :class="{ active: store.currentId === s.id }"
        @click="store.switchSession(s.id)"
      >
        <el-icon class="session-icon"><ChatDotRound /></el-icon>
        <div class="session-info">
          <div class="session-name">{{ s.name }}</div>
          <div class="session-time">{{ s.time }}</div>
        </div>
      </div>
    </div>

    <div class="quick-tools">
      <div class="sidebar-label">快捷查询</div>
      <button
        v-for="t in quickTools"
        :key="t.label"
        class="tool-btn"
        @click="$emit('quick', t.prompt)"
      >
        <span>{{ t.icon }}</span>{{ t.label }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'

const store = useChatStore()
defineEmits(['quick'])

const quickTools = [
  { icon: '🔍', label: '查询服务器状态',  prompt: '帮我查询 192.168.1.100 的实时状态' },
  { icon: '📋', label: '查 CMDB 信息',    prompt: '查询 192.168.1.102 的资产信息和负责人' },
  { icon: '🚨', label: '创建告警工单',    prompt: '服务器192.168.1.100 CPU持续告警，帮我创建P1工单' },
  { icon: '📖', label: 'Redis 故障处理',  prompt: 'Redis 内存不足应该怎么处理？' },
  { icon: '🗄️', label: 'MySQL 故障处理', prompt: 'MySQL 连接数耗尽了怎么解决？' },
  { icon: '📊', label: '巡检规范查询',    prompt: '生产环境的巡检频率和告警阈值是多少？' },
]
</script>

<style scoped>
.sidebar {
  background: var(--bg-panel);
  grid-column: 1;    /* 固定放在第1列 */
  grid-row: 2;       /* 固定放在第2行 */
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.sidebar-section { padding: 16px 12px 8px; }
.sidebar-label {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.8px; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 8px; padding: 0 4px;
}
.new-chat-btn {
  width: 100%;
  background: var(--accent-dim);
  border: 1px solid rgba(0,180,216,0.3);
  color: var(--accent); border-radius: var(--radius);
  padding: 8px 12px; cursor: pointer;
  font-size: 13px; display: flex; align-items: center; gap: 8px;
  transition: all 0.15s; margin-bottom: 12px;
}
.new-chat-btn:hover { background: rgba(0,180,216,0.2); }
.session-list { overflow-y: auto; flex: 1; padding: 0 12px 12px; }
.session-item {
  padding: 8px 10px; border-radius: var(--radius);
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: background 0.1s; margin-bottom: 2px;
  border: 1px solid transparent;
}
.session-item:hover  { background: var(--bg-card); }
.session-item.active {
  background: var(--accent-dim);
  border-color: rgba(0,180,216,0.25);
}
.session-icon { font-size: 14px; flex-shrink: 0; color: var(--text-muted); }
.session-info { flex: 1; min-width: 0; }
.session-name {
  font-size: 13px; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.session-time { font-size: 11px; color: var(--text-muted); }
.quick-tools  { padding: 12px; border-top: 1px solid var(--border); }
.tool-btn {
  width: 100%; background: transparent;
  border: 1px solid var(--border); color: var(--text-secondary);
  border-radius: var(--radius); padding: 7px 10px;
  cursor: pointer; font-size: 12px;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.1s; margin-bottom: 6px; text-align: left;
}
.tool-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
</style>
