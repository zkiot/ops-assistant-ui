<template>
  <main class="chat-area">

    <!-- 欢迎屏 -->
    <div v-if="store.currentMessages.length === 0" class="welcome">
      <div class="welcome-icon">🤖</div>
      <div class="welcome-title">智能运维助手</div>
      <div class="welcome-sub">
        基于 LangChain + LlamaIndex 构建，支持故障排查、资产查询、工单创建等运维场景
      </div>
      <div class="welcome-suggestions">
        <button
          v-for="s in suggestions" :key="s.text"
          class="suggestion-btn"
          @click="emit('quick', s.text)"
        >
          <div class="s-icon">{{ s.icon }}</div>
          <div class="s-text">{{ s.text }}</div>
        </button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div v-else class="chat-messages" ref="msgContainer">
      <div
        v-for="(msg, i) in store.currentMessages"
        :key="i"
        class="msg-row"
        :class="msg.role"
      >
        <div class="msg-avatar" :class="msg.role">
          {{ msg.role === 'ai' ? '🤖' : '👤' }}
        </div>
        <div class="msg-body">
          <div class="msg-meta">
            <span>{{ msg.role === 'ai' ? '运维助手' : '你' }}</span>
            <span>{{ msg.time }}</span>
            <span v-if="msg.elapsed" class="elapsed">{{ msg.elapsed }}ms</span>
          </div>
          <div class="msg-bubble">{{ msg.content }}</div>
          <div v-if="msg.tools?.length" class="tool-tags">
            <span v-for="t in msg.tools" :key="t" class="tool-tag">
              🔧 {{ t }}
            </span>
          </div>
        </div>
      </div>

      <!-- 打字动画 -->
      <div v-if="store.loading" class="msg-row ai">
        <div class="msg-avatar ai">🤖</div>
        <div class="msg-body">
          <div class="msg-meta"><span>运维助手</span></div>
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <div class="input-wrapper" :class="{ focused: isFocused }">
        <textarea
          class="input-textarea"
          v-model="inputText"
          placeholder="向运维助手提问，例如：192.168.1.100 CPU 告警了怎么处理？"
          @keydown.enter.exact.prevent="handleSend"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @input="autoResize"
          ref="inputEl"
          rows="1"
        ></textarea>
        <div class="input-toolbar">
          <span class="input-hint">Enter 发送 · Shift+Enter 换行</span>
          <el-button size="small" text @click="store.clearSession">清空</el-button>
          <button
            class="send-btn"
            @click="handleSend"
            :disabled="!inputText.trim() || store.loading"
          >
            发送 ↑
          </button>
        </div>
      </div>
    </div>

  </main>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'

const store        = useChatStore()
const emit         = defineEmits<{
  (e: 'quick', text: string): void
}>()

const inputText    = ref<string>('')
const isFocused    = ref<boolean>(false)
const msgContainer = ref<HTMLDivElement | null>(null)   // ← DOM ref 加类型
const inputEl      = ref<HTMLTextAreaElement | null>(null)

const suggestions: Array<{ icon: string; text: string }> = [
  { icon: '🚨', text: '192.168.1.100 CPU告警，帮我排查' },
  { icon: '📖', text: 'Redis 内存不足怎么处理？' },
]

const autoResize = (): void => {
  if (!inputEl.value) return
  inputEl.value.style.height = 'auto'
  inputEl.value.style.height =
    Math.min(inputEl.value.scrollHeight, 140) + 'px'
}
const scrollBottom = async (): Promise<void> => {
      await nextTick()
      if (msgContainer.value)
        msgContainer.value.scrollTop = msgContainer.value.scrollHeight
}

// 消息或加载状态变化时自动滚到底部（含首条消息从欢迎屏切换到消息列表的场景）
watch(
  [() => store.currentMessages.length, () => store.loading.valueOf()],
  () => { scrollBottom() }
)

const handleSend = async (): Promise<void> => {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  await store.sendMessage(text)
}

defineExpose({
  sendText: async (text: string): Promise<void> => {
    inputText.value = text
    await handleSend()
  }
})
</script>

<style scoped>
.chat-area { display: flex; flex-direction: column; overflow: hidden; }

/* 欢迎屏 */
.welcome {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 24px; padding: 40px;
}
.welcome-icon  { font-size: 48px; }
.welcome-title { font-size: 22px; font-weight: 600; color: var(--text-primary); text-align: center; }
.welcome-sub   { font-size: 13px; color: var(--text-secondary); text-align: center; max-width: 380px; line-height: 1.7; }
.welcome-suggestions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; max-width: 460px; }
.suggestion-btn {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 10px 14px;
  cursor: pointer; text-align: left; transition: all 0.15s;
}
.suggestion-btn:hover { border-color: var(--accent); background: var(--accent-dim); }
.s-icon { font-size: 16px; margin-bottom: 4px; }
.s-text { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }

/* 消息列表 */
.chat-messages {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
}
.chat-messages::-webkit-scrollbar       { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* 消息行 */
.msg-row      { display: flex; gap: 10px; animation: slideIn 0.2s ease-out; }
.msg-row.user { flex-direction: row-reverse; }
@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.msg-avatar {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.msg-avatar.ai   { background: var(--accent-dim); border: 1px solid rgba(0,180,216,0.3); }
.msg-avatar.user { background: var(--bg-card); border: 1px solid var(--border); }

.msg-body { max-width: 72%; display: flex; flex-direction: column; gap: 4px; }
.msg-row.user .msg-body { align-items: flex-end; }

.msg-meta    { font-size: 11px; color: var(--text-muted); display: flex; gap: 6px; align-items: center; }
.elapsed     { color: var(--accent); }

.msg-bubble  { padding: 10px 14px; border-radius: var(--radius-lg); font-size: 13.5px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; }
.msg-row.ai   .msg-bubble { background: var(--bg-card); border: 1px solid var(--border); border-top-left-radius: 4px; }
.msg-row.user .msg-bubble { background: var(--accent-dim); border: 1px solid rgba(0,180,216,0.3); border-top-right-radius: 4px; }

.tool-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.tool-tag  { font-size: 11px; background: rgba(0,180,216,0.08); border: 1px solid rgba(0,180,216,0.2); color: var(--accent); border-radius: 4px; padding: 2px 7px; }

/* 打字动画 */
.typing-indicator { display: flex; gap: 4px; align-items: center; padding: 12px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); border-top-left-radius: 4px; width: fit-content; }
.typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: typing 1.2s ease-in-out infinite; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%            { transform: translateY(-6px); opacity: 1; }
}

/* 输入区 */
.input-area { padding: 12px 20px 16px; border-top: 1px solid var(--border); background: var(--bg-panel); }
.input-wrapper { background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: border-color 0.15s; }
.input-wrapper.focused { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
.input-textarea { width: 100%; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 13.5px; padding: 12px 14px 4px; resize: none; font-family: inherit; min-height: 44px; max-height: 140px; }
.input-textarea::placeholder { color: var(--text-muted); }
.input-toolbar { display: flex; align-items: center; padding: 6px 10px; gap: 6px; }
.input-hint    { font-size: 11px; color: var(--text-muted); margin-right: auto; }
.send-btn { background: var(--accent); border: none; border-radius: 6px; color: #000; font-weight: 600; font-size: 12px; padding: 6px 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: opacity 0.15s; }
.send-btn:hover    { opacity: 0.85; }
.send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
