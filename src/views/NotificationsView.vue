<template>
  <div class="notif-page">

    <!-- Header -->
    <div class="notif-header">
      <div class="notif-back" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <span class="notif-title">Notifications</span>
      <span
        v-if="unreadCount > 0"
        class="notif-mark-all"
        @click="markAllRead"
      >Mark all read</span>
      <span v-else class="notif-mark-all notif-mark-all--ghost"></span>
    </div>

    <!-- Pull-to-refresh + infinite list -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="notif-scroll">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="You're all caught up ✓"
        @load="onLoad"
      >
        <!-- Empty state (only after first load completes with no data) -->
        <van-empty
          v-if="notifications.length === 0 && finished"
          image="search"
          description="No notifications"
          class="notif-empty"
        />

        <!-- Notification cards -->
        <div
          v-for="notif in notifications"
          :key="notif.notificationId"
          class="notif-card"
          :class="{ 'notif-card--unread': notif.status === 4 }"
          @click="toggleNotification(notif)"
        >
          <div class="notif-row">
            <span
              class="notif-dot"
              :class="notif.status === 4 ? 'notif-dot--unread' : 'notif-dot--read'"
            ></span>
            <div class="notif-main">
              <div class="notif-subject">{{ notif.subject }}</div>
              <div class="notif-time">{{ formatTime(notif.updatedTime) }}</div>
            </div>
            <van-icon
              :name="notif._expanded ? 'arrow-up' : 'arrow-down'"
              color="#ccc"
              size="14"
              style="flex-shrink: 0; margin-top: 3px;"
            />
          </div>
          <div v-if="notif._expanded" class="notif-body" v-html="notif.body"></div>
        </div>

        <!-- Bottom padding inside list -->
        <div class="list-bottom-spacer" />
      </van-list>
    </van-pull-refresh>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getData, postData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const PAGE_SIZE = 20
const page = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const notifications = ref([])

const unreadCount = computed(() => notifications.value.filter(n => n.status === 4).length)

async function onLoad() {
  page.value++
  try {
    const res = await getData(
      `notification/getNotificationsFor/${auth.username}`,
      { page: page.value, pageSize: PAGE_SIZE },
      { isShowLoading: false }
    )
    if (res?.code === '200' && Array.isArray(res?.result)) {
      const items = res.result.map(n => ({ ...n, _expanded: false }))
      notifications.value.push(...items)
      // If fewer results than page size, there's no more data
      if (items.length < PAGE_SIZE) finished.value = true
    } else {
      finished.value = true
    }
  } catch {
    finished.value = true
  }
  loading.value = false
}

async function onRefresh() {
  page.value = 0
  notifications.value = []
  finished.value = false
  await onLoad()
  refreshing.value = false
}

async function toggleNotification(notif) {
  notif._expanded = !notif._expanded
  if (notif._expanded && notif.status === 4) {
    notif.status = 64
    try {
      await postData('notification/mark', {
        recordList: [{
          notificationId: notif.notificationId,
          receiverId: auth.username,
          receiverName: auth.username,
          status: 64,
        }]
      }, { isShowLoading: false })
    } catch { /* silent */ }
  }
}

async function markAllRead() {
  const unread = notifications.value.filter(n => n.status === 4)
  if (!unread.length) return
  unread.forEach(n => { n.status = 64 })
  try {
    await postData('notification/mark', {
      recordList: unread.map(n => ({
        notificationId: n.notificationId,
        receiverId: auth.username,
        receiverName: auth.username,
        status: 64,
      }))
    }, { isShowLoading: false })
  } catch { /* silent */ }
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}
</script>

<style scoped>
.notif-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #f7f6f3;
  overflow: hidden;
}

/* ── Header ── */
.notif-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.notif-back {
  width: 80px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.notif-title {
  flex: 1;
  font-family: Georgia, serif;
  font-size: 17px;
  font-weight: 700;
  color: #24221F;
  text-align: center;
}

.notif-mark-all {
  width: 80px;
  text-align: right;
  font-size: 13px;
  color: #C89239;
  cursor: pointer;
  white-space: nowrap;
}

.notif-mark-all--ghost {
  pointer-events: none;
  opacity: 0;
}

/* ── Scroll area ── */
.notif-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── Cards ── */
.notif-card {
  background: #fff;
  margin: 10px 16px 0;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: box-shadow 0.15s;
}

.notif-card:active {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.notif-card--unread {
  border-left: 3px solid #C89239;
}

.notif-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

.notif-dot--unread {
  background: #C89239;
}

.notif-dot--read {
  background: #ddd;
}

.notif-main {
  flex: 1;
  min-width: 0;
}

.notif-subject {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
  line-height: 1.4;
}

.notif-time {
  font-size: 11px;
  color: #999;
  margin-top: 3px;
}

.notif-body {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0ede6;
  font-size: 13px;
  color: #555;
  line-height: 1.6;
}

/* ── Vant list overrides ── */
:deep(.van-list__finished-text),
:deep(.van-list__loading) {
  padding: 20px 0;
  font-size: 13px;
  color: #bbb;
}

.notif-empty {
  margin-top: 80px;
}

.list-bottom-spacer {
  height: calc(24px + env(safe-area-inset-bottom));
}
</style>
