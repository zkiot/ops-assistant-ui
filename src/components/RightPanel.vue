<template>
  <aside class="right-panel">
    <div class="panel-tabs">
      <div
        v-for="tab in tabs" :key="tab.label"
        class="panel-tab"
        :class="{ active: activeTab === tab.label }"
        @click="switchTab(tab)"
      >{{ tab.label }}</div>
    </div>

    <div class="panel-content">

      <!-- 服务器 -->
      <template v-if="activeTab === '服务器'">
        <div
          v-for="s in servers" :key="s.ip"
          class="server-card"
          @click="emit('quick', `查询服务器 ${s.ip} 的详情和处理建议`)"
        >
          <div class="server-header">
            <span class="server-ip">{{ s.ip }}</span>
            <span class="server-status" :class="isAlert(s) ? 'alert' : 'ok'">
              {{ isAlert(s) ? '告警' : '正常' }}
            </span>
          </div>
          <div class="server-metrics">
            <MetricBar label="CPU"  :value="s.cpu" />
            <MetricBar label="内存" :value="s.memory" />
            <MetricBar label="磁盘" :value="s.disk" />
          </div>
        </div>
        <el-button size="small" style="width:100%;margin-top:4px" @click="loadServers" :loading="loadingServers">
          刷新状态
        </el-button>
      </template>

      <!-- 工单 -->
      <template v-else-if="activeTab === '工单'">
        <div v-if="tickets.length === 0" class="empty">暂无工单</div>
        <div v-for="t in tickets" :key="t.id" class="ticket-item">
          <div class="ticket-header">
            <span class="ticket-id">{{ t.id }}</span>
            <span class="severity-tag" :class="'sev-' + t.severity.toLowerCase()">{{ t.severity }}</span>
          </div>
          <div class="ticket-title">{{ t.title }}</div>
          <div class="ticket-meta">{{ t.server_ip }} · {{ t.status }} · {{ t.created_at?.slice(0, 16) }}</div>
        </div>
        <el-button size="small" style="width:100%;margin-top:4px" @click="loadTickets">刷新工单</el-button>
      </template>

      <!-- 统计 -->
      <template v-else-if="activeTab === '统计'">
        <div class="stat-grid">
          <div v-for="item in statsItems" :key="item.label" class="stat-card">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value">{{ item.value }}</div>
          </div>
        </div>
      </template>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import MetricBar from './MetricBar.vue'

const emit = defineEmits(['quick'])

const activeTab     = ref('服务器')
const servers       = ref([])
const tickets       = ref([])
const statsItems    = ref([])
const loadingServers = ref(false)

const tabs = [
  { label: '服务器', load: () => loadServers() },
  { label: '工单',   load: () => loadTickets() },
  { label: '统计',   load: () => loadStats() },
]

const switchTab = (tab) => {
  activeTab.value = tab.label
  tab.load()
}

const isAlert = (s) => s.cpu > 85 || s.memory > 80

const loadServers = async () => {
  loadingServers.value = true
  // Mock 数据（实际项目接 /chat 或新增 /servers 接口）
  servers.value = [
    { ip: '192.168.1.100', cpu: 92, memory: 78, disk: 65 },
    { ip: '192.168.1.101', cpu: 35, memory: 52, disk: 40 },
    { ip: '192.168.1.102', cpu: 15, memory: 88, disk: 30 },
  ]
  loadingServers.value = false
}

const loadTickets = async () => {
  try {
    const data = await api.listTickets()
    tickets.value = data.tickets || []
  } catch {
    tickets.value = []
  }
}

const loadStats = async () => {
  try {
    const data = await api.stats()
    statsItems.value = [
      { label: '运行时长（秒）',  value: data.uptime_seconds  ?? '--' },
      { label: '累计请求数',      value: data.total_requests  ?? '--' },
      { label: '活跃会话数',      value: data.active_sessions ?? '--' },
      { label: '累计消息数',      value: data.total_messages  ?? '--' },
    ]
  } catch {
    statsItems.value = []
  }
}

// 外部刷新工单（发送消息后调用）
defineExpose({ loadTickets })

onMounted(loadServers)
setInterval(loadServers, 30000)
</script>

<style scoped>
.right-panel { background: var(--bg-panel); border-left: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
.panel-tabs  { display: flex; border-bottom: 1px solid var(--border); }
.panel-tab   { flex: 1; padding: 12px 8px; text-align: center; font-size: 12px; cursor: pointer; color: var(--text-muted); border-bottom: 2px solid transparent; transition: all 0.15s; }
.panel-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.panel-content { flex: 1; overflow-y: auto; padding: 16px; }
.panel-content::-webkit-scrollbar       { width: 3px; }
.panel-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.empty { text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 13px; }

.server-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-bottom: 8px; cursor: pointer; transition: border-color 0.15s; }
.server-card:hover { border-color: var(--accent); }
.server-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.server-ip     { font-size: 13px; font-weight: 500; font-family: 'SF Mono', monospace; }
.server-status { font-size: 11px; padding: 2px 7px; border-radius: 10px; font-weight: 500; }
.server-status.ok    { background: rgba(63,185,80,0.15);  color: var(--green); }
.server-status.alert { background: rgba(248,81,73,0.15);  color: var(--red); }
.server-metrics { display: flex; flex-direction: column; gap: 6px; }

.ticket-item   { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; margin-bottom: 8px; }
.ticket-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.ticket-id     { font-size: 11px; color: var(--text-muted); font-family: monospace; }
.ticket-title  { font-size: 12px; color: var(--text-primary); margin-bottom: 4px; }
.ticket-meta   { font-size: 11px; color: var(--text-muted); }
.severity-tag  { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
.sev-p0, .sev-p1 { background: rgba(248,81,73,0.15); color: var(--red); }
.sev-p2           { background: rgba(210,153,34,0.15); color: var(--yellow); }
.sev-p3           { background: rgba(63,185,80,0.15);  color: var(--green); }

.stat-grid { display: flex; flex-direction: column; gap: 10px; }
.stat-card  { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; }
.stat-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
.stat-value { font-size: 20px; font-weight: 600; color: var(--accent); }
</style>
