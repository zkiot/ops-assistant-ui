import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'

// ── 类型定义 ─────────────────────────────────────
export interface Message {
  role:     'user' | 'ai'
  content:  string
  time:     string
  elapsed?: number
  tools?:   string[]
}

export interface Session {
  id:   string
  name: string
  time: string
}

export const useChatStore = defineStore('chat', () => {

  // ── 状态 ──────────────────────────────────────────────────
  const sessions      = ref<Session[]>([{ id: 'default', name: '默认会话', time: now() }])
  const currentId     = ref<string>('default')
  const messageStore  = ref<Record<string, Message[]>>({ default: [] })
  const loading       = ref<boolean>(false)
  const apiStatus     = ref<'ok' | 'error' | 'checking'>('checking')
  const totalRequests = ref<number>(0)


  // ── 计算属性 ───────────────────────────────────────────────
  const currentMessages = computed<Message[]>(
    () => messageStore.value[currentId.value] || []
  )

  // ── 工具函数 ───────────────────────────────────────────────
  function now(): string {
    return new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  function ensureSession(id: string): void {
    if (!messageStore.value[id]) messageStore.value[id] = []
  }

  // ── 会话操作 ───────────────────────────────────────────────
  function newSession(): void {
    const id   = `session_${Date.now()}`
    const name = `会话 ${sessions.value.length + 1}`
    sessions.value.unshift({ id, name, time: now() })
    messageStore.value[id] = []
    currentId.value = id
  }

  function switchSession(id: string): void {
    currentId.value = id
    ensureSession(id)
  }


  async function clearSession(): Promise<void> {
    messageStore.value[currentId.value] = []
    try { await api.clearSession(currentId.value) } catch {}
  }

  // ── 发送消息 ───────────────────────────────────────────────
  async function sendMessage(text: string): Promise<void> {
    if (!text?.trim() || loading.value) return

    ensureSession(currentId.value)
    const msgs = messageStore.value[currentId.value]

    // 首条消息更新会话名
    const session = sessions.value.find(s => s.id === currentId.value)
    if (session && msgs.length === 0) {
      session.name = text.slice(0, 18) + (text.length > 18 ? '…' : '')
    }

    msgs.push({ role: 'user', content: text, time: now() })
    loading.value = true

    try {
      const data = await api.chat(currentId.value, text)
      msgs.push({
        role:    'ai',
        content: data.message,
        time:    now(),
        elapsed: data.elapsed_ms,
        tools:   data.tools_used ?? []
      })
      totalRequests.value++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知错误'
      msgs.push({ role: 'ai', content: `⚠️ 请求失败：${msg}`, time: now() })
    } finally {
      loading.value = false
    }
  }

  // ── API 状态 ───────────────────────────────────────────────
  async function checkHealth(): Promise<void> {
    try {
      const data = await api.health()
      apiStatus.value     = data.status === 'ok' ? 'ok' : 'error'
      totalRequests.value = data.request_count ?? 0
    } catch {
      apiStatus.value = 'error'
    }
  }

  return {
    sessions, currentId, currentMessages,
    loading, apiStatus, totalRequests,
    newSession, switchSession, clearSession,
    sendMessage, checkHealth,
  }
})