// src/api/index.ts  ← 改成 .ts 后缀
import axios from 'axios'

// ── 接口返回类型定义 ──────────────────────────────
export interface HealthResponse {
  status:          string
  uptime_seconds:  number
  request_count:   number
  session_count:   number
  knowledge_base:  string
}

export interface ChatResponse {
  session_id:  string
  message:     string
  elapsed_ms:  number
  history_len: number
  tools_used:  string[]
}

export interface Ticket {
  id:         string
  server_ip:  string
  title:      string
  severity:   string
  status:     string
  created_at: string
}

export interface TicketListResponse {
  total:   number
  tickets: Ticket[]
}

export interface StatsResponse {
  uptime_seconds:  number
  total_requests:  number
  active_sessions: number
  total_messages:  number
  tools_available: string[]
}

// ── Axios 实例 ────────────────────────────────────
const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.response.use(
  res  => res.data,
  err  => {
    const msg = err.response?.data?.detail || err.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

// ── API 方法（带返回类型）────────────────────────────
export const api = {
  health:  ()                          => http.get<HealthResponse>('/health'),
  stats:   ()                          => http.get<StatsResponse>('/stats'),

  chat:    (session_id: string, message: string) =>
             http.post<ChatResponse>('/chat', { session_id, message }),

  getSession:   (id: string)           => http.get(`/session/${id}`),
  clearSession: (id: string)           => http.delete(`/session/${id}`),

  queryKnowledge: (question: string)   =>
    http.post(`/knowledge/query?question=${encodeURIComponent(question)}`),

  listTickets: (limit = 10)            =>
    http.get<TicketListResponse>(`/tickets?limit=${limit}`),
}