<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">My Receipts</div>
      <div class="sub-hd-right"></div>
    </div>

    <!-- Receipt list -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="rcp-scroll">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="All receipts loaded ✓"
        @load="onLoad"
      >
        <van-empty
          v-if="receipts.length === 0 && finished"
          image="search"
          description="No receipts"
          class="rcp-empty"
        />

        <div v-for="r in receipts" :key="r.receiptId" class="rcp-card">
          <!-- Row 1: Date + Total + View -->
          <div class="rcp-row1">
            <div class="rcp-meta">
              <span class="rcp-lbl">Date:</span>
              <span class="rcp-val">{{ formatDate(r.billDate) }}</span>
              <span class="rcp-lbl rcp-lbl--total">Total:</span>
              <span class="rcp-val rcp-val--total">${{ formatMoney(r.total) }}</span>
            </div>
            <button class="rcp-view-btn" @click="viewReceipt(r)">View</button>
          </div>
          <!-- Row 2: Items -->
          <div class="rcp-row2">
            <div v-for="(line, i) in parseItems(r.description)" :key="i" class="rcp-item-line">{{ line }}</div>
          </div>
        </div>

        <div class="list-spacer" />
      </van-list>
    </van-pull-refresh>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const PAGE_SIZE = 20
const page = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const receipts = ref([])

async function onLoad() {
  page.value++
  try {
    const res = await getData('receipt', {
      studentId: auth.username,
      orderBy: 'CreatedTime',
      orderDirection: 'DESC',
      pageIndex: page.value,
      pageSize: PAGE_SIZE,
    }, { isShowLoading: false })
    if (res?.code === '200' && res?.result?.list) {
      receipts.value.push(...res.result.list)
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
  receipts.value = []
  finished.value = false
  await onLoad()
  refreshing.value = false
}

function viewReceipt(r) {
  router.push({ name: 'me-receipt-detail', query: { receiptId: r.receiptId } })
}

function parseItems(description) {
  if (!description) return []
  return description.split('|').map(s => s.trim()).filter(Boolean)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatMoney(n) {
  return (Number(n) || 0).toFixed(2)
}
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

/* ── Scroll ── */
.rcp-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── Receipt card ── */
.rcp-card {
  background: #fff;
  margin: 10px 16px 0;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

/* Row 1: Date + Total + View */
.rcp-row1 {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rcp-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 5px;
}

.rcp-lbl {
  font-size: 12px;
  color: #aaa;
  font-weight: 500;
}

.rcp-lbl--total {
  margin-left: 10px;
}

.rcp-val {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
}

.rcp-val--total {
  color: #C89239;
  font-weight: 700;
}

.rcp-view-btn {
  flex-shrink: 0;
  background: #C89239;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.rcp-view-btn:active {
  opacity: 0.85;
}

/* Row 2: Items */
.rcp-row2 {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f3ef;
}

.rcp-item-line {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.rcp-empty {
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
