<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">JE Points</div>
      <div class="sub-hd-right"></div>
    </div>

    <!-- Total points banner -->
    <div class="pts-banner">
      <img :src="pointsIcon" class="pts-banner-ico" alt="" />
      <span class="pts-banner-val">{{ totalPoints.toLocaleString() }}</span>
      <span class="pts-banner-lbl">Total JE Points</span>
    </div>

    <!-- Records list -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pts-scroll">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="All records loaded ✓"
        @load="onLoad"
      >
        <van-empty
          v-if="records.length === 0 && finished"
          image="search"
          description="No points records"
          class="pts-empty"
        />

        <div
          v-for="(rec, i) in records"
          :key="i"
          class="pts-row"
        >
          <div class="pts-row-main">
            <div class="pts-row-title">{{ rec.title }}</div>
            <div v-if="rec.comment" class="pts-row-comment">{{ rec.comment }}</div>
            <div class="pts-row-time">{{ formatTime(rec.createdTime) }}</div>
          </div>
          <div :class="['pts-row-pts', rec.points >= 0 ? 'pts-pos' : 'pts-neg']">
            {{ rec.points >= 0 ? '+' : '' }}{{ rec.points }}
            <span v-if="rec.issuedType && rec.issuedType !== 'Normal'" class="pts-type">
              {{ rec.issuedType }}
            </span>
          </div>
        </div>

        <div class="list-spacer" />
      </van-list>
    </van-pull-refresh>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import pointsIcon from '@/assets/img/points.png'

const auth = useAuthStore()

const PAGE_SIZE = 20
const page = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const records = ref([])
const totalPoints = ref(0)

async function loadTotal() {
  try {
    const res = await getData(`points/student/${auth.username}`, null, { isShowLoading: false })
    if (res?.code === '200' && res?.result) {
      totalPoints.value = res.result.points || 0
    }
  } catch { /* silent */ }
}

async function onLoad() {
  page.value++
  try {
    const res = await getData('points', {
      studentId: auth.username,
      orderBy: 'CreatedTime',
      orderDirection: 'DESC',
      pageIndex: page.value,
      pageSize: PAGE_SIZE,
    }, { isShowLoading: false })
    if (res?.code === '200' && res?.result?.list) {
      records.value.push(...res.result.list)
      if (res.result.list.length < PAGE_SIZE) finished.value = true
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
  records.value = []
  finished.value = false
  await Promise.all([loadTotal(), onLoad()])
  refreshing.value = false
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

loadTotal()
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

/* ── Points Banner ── */
.pts-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 20px;
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.pts-banner-ico {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.pts-banner-val {
  font-size: 28px;
  font-weight: 800;
  color: #C89239;
  line-height: 1;
}

.pts-banner-lbl {
  font-size: 13px;
  color: #aaa;
  font-weight: 500;
}

/* ── Scroll ── */
.pts-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── Records ── */
.pts-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  margin: 10px 16px 0;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.pts-row-main {
  flex: 1;
  min-width: 0;
}

.pts-row-title {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
  line-height: 1.3;
}

.pts-row-comment {
  font-size: 12px;
  color: #888;
  margin-top: 3px;
}

.pts-row-time {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
}

.pts-row-pts {
  font-size: 17px;
  font-weight: 700;
  flex-shrink: 0;
  text-align: right;
  line-height: 1.2;
}

.pts-pos {
  color: #67C23A;
}

.pts-neg {
  color: #ee0a24;
}

.pts-type {
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: #aaa;
  text-align: right;
}

.pts-empty {
  margin-top: 80px;
}

.list-spacer {
  height: calc(24px + env(safe-area-inset-bottom));
}

:deep(.van-list__finished-text),
:deep(.van-list__loading) {
  padding: 20px 0;
  font-size: 13px;
  color: #bbb;
}
</style>
