<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">Receipt Details</div>
      <div class="sub-hd-right"></div>
    </div>

    <div class="rcd-scroll">

      <!-- Header section -->
      <div class="rcd-sec-lbl">Header</div>
      <div class="rcd-card">
        <div class="rcd-kv">
          <span class="rcd-k"><van-icon name="contact-o" size="13" /> Bill To</span>
          <span class="rcd-v">{{ form.billTo }}</span>
        </div>
        <div class="rcd-kv">
          <span class="rcd-k"><van-icon name="calendar-o" size="13" /> Bill date</span>
          <span class="rcd-v">{{ formatDate(form.billDate) }}</span>
        </div>
        <div class="rcd-kv">
          <span class="rcd-k"><van-icon name="balance-o" size="13" /> GST Rate(%)</span>
          <span class="rcd-v">{{ form.gst }}</span>
        </div>
        <div class="rcd-kv">
          <span class="rcd-k"><van-icon name="discount" size="13" /> Discount(%)</span>
          <span class="rcd-v">{{ form.discount }}</span>
        </div>
      </div>

      <!-- Discount Items -->
      <template v-if="form.discountItems && form.discountItems.length">
        <div class="rcd-sec-lbl">Discount Items</div>
        <div class="rcd-card">
          <div v-for="item in form.discountItems" :key="item.name" class="rcd-kv">
            <span class="rcd-k"><van-icon name="coupon-o" size="13" /> {{ item.name }}</span>
            <span class="rcd-v">{{ item.discount }}%</span>
          </div>
        </div>
      </template>

      <!-- Points Item to Be Issued -->
      <template v-if="form.pointsItems && form.pointsItems.length">
        <div class="rcd-sec-lbl">Points Item to Be Issued</div>
        <div class="rcd-card">
          <div v-for="item in form.pointsItems" :key="item.name" class="rcd-kv">
            <span class="rcd-k"><van-icon name="gold-coin-o" size="13" /> {{ item.title }}</span>
            <span class="rcd-v">
              {{ item.points }}
              {{ item.issuedType !== 'Normal' ? `${item.issuedType} Points` : 'Points' }}
            </span>
          </div>
        </div>
      </template>

      <!-- Items -->
      <div class="rcd-sec-lbl">Items</div>
      <div v-for="(item, idx) in form.items" :key="idx" class="rcd-card rcd-item-card">
        <div class="rcd-item-title">
          {{ item.title }}{{ item.term ? `, ${item.term}` : '' }}{{ item.comment ? `, ${item.comment}` : '' }}
        </div>
        <div class="rcd-item-grid">
          <div class="rcd-cell">
            <div class="rcd-cell-k">Class Hours</div>
            <div class="rcd-cell-v">{{ item.quantity }}</div>
          </div>
          <div class="rcd-cell">
            <div class="rcd-cell-k">Unit Price</div>
            <div class="rcd-cell-v">{{ item.unitPrice ? formatMoney(item.unitPrice) : '' }}</div>
          </div>
          <div class="rcd-cell">
            <div class="rcd-cell-k">Subtotal (Incl.GST)</div>
            <div class="rcd-cell-v">{{ formatMoney(itemTotal(item)) }}</div>
          </div>
          <div class="rcd-cell">
            <div class="rcd-cell-k">GST</div>
            <div class="rcd-cell-v">{{ formatMoney(itemGST(item)) }}</div>
          </div>
        </div>
      </div>
      <van-empty v-if="!loading && (!form.items || form.items.length === 0)" description="No items" />

      <!-- Summary -->
      <div class="rcd-sec-lbl">Summary</div>
      <div class="rcd-card">
        <div class="rcd-kv">
          <span class="rcd-k">Total Subtotal</span>
          <span class="rcd-v">${{ formatMoney(netTotal) }}</span>
        </div>
        <div class="rcd-kv">
          <span class="rcd-k">Discount</span>
          <span class="rcd-v">${{ formatMoney(discountAmount) }}</span>
        </div>
        <div class="rcd-kv rcd-kv--total">
          <span class="rcd-k">TOTAL (Round Up)</span>
          <span class="rcd-v rcd-v--total">${{ formatMoney(total) }}</span>
        </div>
      </div>

      <div class="list-spacer" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getData } from '@/services/api'
import { showToast } from 'vant'

const route = useRoute()

const loading = ref(true)
const form = ref({
  billTo: '',
  billDate: '',
  gst: 10,
  discount: 0,
  discountItems: [],
  pointsItems: [],
  items: [],
})

// ── Calculations (ported from ReceiptTemplate.vue) ─────────────────────────────
function itemTotal(item) {
  return item.unitPrice * item.quantity
}

function itemGST(item) {
  return item.unitPrice * item.quantity * (0.01 * item.gst)
}

const netTotal = computed(() =>
  (form.value.items || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0)
)

const discountAmount = computed(() =>
  (form.value.items || []).reduce((s, it) =>
    s + it.unitPrice * it.quantity * (0.01 * it.discount) +
    it.unitPrice * it.quantity * (1 - 0.01 * it.discount) * (0.01 * it.successiveDiscount), 0)
)

const total = computed(() =>
  Math.round((form.value.items || []).reduce((s, it) =>
    s + it.unitPrice * it.quantity * (1 - 0.01 * it.discount) * (1 - 0.01 * it.successiveDiscount), 0))
)

// ── Data loading ───────────────────────────────────────────────────────────────
async function loadData() {
  const receiptId = route.query.receiptId
  if (!receiptId) { loading.value = false; return }
  try {
    const res = await getData(`receipt/${receiptId}`)
    if (res?.code === '200' && res?.result) {
      form.value = { ...form.value, ...res.result }
    } else {
      showToast({ message: res?.message || 'Failed to load receipt', type: 'fail' })
    }
  } catch {
    showToast({ message: 'Failed to load receipt', type: 'fail' })
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatMoney(n) {
  return (Number(n) || 0).toFixed(2)
}

onMounted(loadData)
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
.rcd-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 16px 0;
}

/* ── Section labels ── */
.rcd-sec-lbl {
  font-size: 13px;
  font-weight: 700;
  color: #24221F;
  margin: 16px 4px 8px;
}

/* ── Cards ── */
.rcd-card {
  background: #fff;
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

/* Key-value rows */
.rcd-kv {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid #f5f3ef;
}

.rcd-kv:last-child {
  border-bottom: none;
}

.rcd-k {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
}

.rcd-v {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
  text-align: right;
}

.rcd-kv--total .rcd-k {
  font-weight: 700;
  color: #24221F;
}

.rcd-v--total {
  font-size: 16px;
  font-weight: 800;
  color: #C89239;
}

/* ── Item cards ── */
.rcd-item-card {
  padding: 14px 16px;
  margin-bottom: 10px;
}

.rcd-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
  line-height: 1.4;
  margin-bottom: 10px;
}

.rcd-item-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
}

.rcd-cell-k {
  font-size: 11px;
  color: #aaa;
}

.rcd-cell-v {
  font-size: 13px;
  font-weight: 600;
  color: #24221F;
  margin-top: 2px;
}

.list-spacer {
  height: calc(24px + env(safe-area-inset-bottom));
}
</style>
