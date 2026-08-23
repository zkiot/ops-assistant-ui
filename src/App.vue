<template>
  <div class="layout">
    <TopBar />
    <SideBar @quick="handleQuick" />
    <ChatArea ref="chatRef" @quick="handleQuick" />
    <RightPanel ref="panelRef" @quick="handleQuick" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import TopBar    from '@/components/TopBar.vue'
import SideBar   from '@/components/SideBar.vue'
import ChatArea  from '@/components/ChatArea.vue'
import RightPanel from '@/components/RightPanel.vue'

const store    = useChatStore()
const chatRef  = ref<InstanceType<typeof ChatArea> | null>(null)
const panelRef = ref<InstanceType<typeof RightPanel> | null>(null)

// 快捷问题：左侧或右侧触发，转发给 ChatArea 发送
const handleQuick = async (text: string) => {
  await chatRef.value?.sendText(text)
  // 发完刷新工单面板
  panelRef.value?.loadTickets()
}

onMounted(() => {
  store.checkHealth()
  setInterval(() => store.checkHealth(), 60000)
})
</script>
<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  grid-template-rows: 52px 1fr;
  height: 100vh;
}
</style>
