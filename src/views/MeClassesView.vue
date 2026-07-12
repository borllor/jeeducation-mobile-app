<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">My Classes</div>
      <div class="sub-hd-right"></div>
    </div>

    <!-- Body -->
    <div class="sub-body">
      <van-loading v-if="loading" class="cls-loading" color="#C89239" />

      <van-empty
        v-else-if="classes.length === 0"
        image="search"
        description="No active classes"
        class="cls-empty"
      />

      <div v-else>
        <div v-for="item in classes" :key="item.classRoom.roomId" class="cls-card">
          <div class="cls-card-top">
            <div class="cls-name">{{ item.classRoom.name }}</div>
            <van-tag
              :color="statusColor(item.classRoom.activeStatus)"
              text-color="#fff"
              size="small"
            >
              {{ statusLabel(item.classRoom.activeStatus) }}
            </van-tag>
          </div>
          <div class="cls-meta">
            <span class="cls-meta-item">
              <van-icon name="label-o" size="12" color="#C89239" />
              {{ formatGrade(item.classRoom.grade) }}
            </span>
            <span class="cls-meta-sep">·</span>
            <span class="cls-meta-item">{{ formatTerm(item.classRoom.term) }}</span>
          </div>
          <div v-if="item.classRoom.startDate || item.classRoom.endDate" class="cls-dates">
            {{ formatDate(item.classRoom.startDate) }}
            <span v-if="item.classRoom.startDate && item.classRoom.endDate"> – </span>
            {{ formatDate(item.classRoom.endDate) }}
          </div>
        </div>
      </div>

      <div class="bottom-spacer" />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '@/services/api'

const loading = ref(true)
const classes = ref([])

function formatGrade(g) {
  const n = String(g || '').replace(/\D/g, '')
  return n ? `Year ${n}` : g
}
function formatTerm(t) {
  return String(t || '').replace(/^term\s*/i, 'Term ')
}
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}
function statusLabel(status) {
  if (status === 2048) return 'Active'
  if (status >= 1024) return 'Upcoming'
  return 'Completed'
}
function statusColor(status) {
  if (status === 2048) return '#C89239'
  if (status >= 1024) return '#448BE9'
  return '#aaa'
}

onMounted(async () => {
  try {
    const res = await getData('classRoom/getEngagedClassRoomsForCurrentStudent', null, { isShowLoading: false })
    if (res?.code === '200' && res?.result?.list) {
      let list = res.result.list
      list = list.filter(e => e.classRoom.activeStatus >= 1024)
      list.sort((a, b) => b.classRoom.activeStatus - a.classRoom.activeStatus)
      classes.value = list
    }
  } catch { /* silent */ }
  finally {
    loading.value = false
  }
})
</script>

<style scoped>
.sub-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #f7f6f3;
}

.sub-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 11px 16px;
  padding-top: calc(11px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.sub-hd-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
  cursor: pointer;
  padding: 4px;
  margin: -4px;
}

.sub-hd-center {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-family: Georgia, serif;
  font-size: 17px;
  font-weight: 800;
  background: linear-gradient(135deg, #C89239, #b8860b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  pointer-events: none;
}

.sub-hd-right {
  margin-left: auto;
  width: 28px;
  flex-shrink: 0;
}

.sub-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 0;
  -webkit-overflow-scrolling: touch;
}

.cls-loading {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

.cls-empty {
  margin-top: 60px;
}

/* ── Class Card ── */
.cls-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
}

.cls-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.cls-name {
  font-size: 15px;
  font-weight: 700;
  color: #24221F;
  flex: 1;
  min-width: 0;
}

.cls-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.cls-meta-item {
  font-size: 13px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 3px;
}

.cls-meta-sep {
  color: #ddd;
  font-size: 12px;
}

.cls-dates {
  font-size: 12px;
  color: #bbb;
}

.bottom-spacer {
  height: calc(16px + env(safe-area-inset-bottom));
}
</style>
