<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">My Profile</div>
      <div class="sub-hd-right"></div>
    </div>

    <!-- Body -->
    <div class="sub-body">
      <!-- Avatar -->
      <div class="prof-avatar-wrap">
        <img
          v-if="!imgError"
          :src="profileImgUrl"
          class="prof-avatar-img"
          @error="imgError = true"
        />
        <div v-else class="prof-avatar-init">{{ initials }}</div>
      </div>

      <!-- Info card -->
      <div class="prof-card">
        <div class="prof-row">
          <span class="prof-label">Full Name</span>
          <span class="prof-value">{{ fullName || '—' }}</span>
        </div>
        <div class="prof-divider"></div>
        <div class="prof-row">
          <span class="prof-label">Student No.</span>
          <span class="prof-value">{{ auth.username }}</span>
        </div>
        <div class="prof-divider"></div>
        <div class="prof-row">
          <span class="prof-label">Email</span>
          <span class="prof-value prof-value--wrap">{{ email || '—' }}</span>
        </div>
        <div class="prof-divider"></div>
        <div class="prof-row">
          <span class="prof-label">Mobile No.</span>
          <span class="prof-value">{{ mobile || '—' }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import appConfig from '@/services/appConfig'

const auth = useAuthStore()

const fullName = ref('')
const email = ref('')
const mobile = ref('')
const imgError = ref(false)

const profileImgUrl = computed(
  () => `${appConfig.getAPIRoot()}/file/profile/${auth.username}?token=${auth.accessToken}`
)

const initials = computed(() => {
  const n = fullName.value || auth.username || ''
  return n.charAt(0).toUpperCase()
})

onMounted(async () => {
  try {
    const res = await getData(`/student/${auth.username}`, null, { isShowLoading: false })
    if (res?.code === '200' && res?.result) {
      const r = res.result
      fullName.value = [r.firstName, r.lastName].filter(Boolean).join(' ') || r.username || ''
      email.value = r.email || ''
      mobile.value = r.mobileNo || ''
    }
  } catch { /* silent */ }
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
  padding: 24px 16px calc(24px + env(safe-area-inset-bottom));
  -webkit-overflow-scrolling: touch;
}

/* ── Avatar ── */
.prof-avatar-wrap {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 24px;
  border: 3px solid #f0e8d0;
}

.prof-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.prof-avatar-init {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #C89239, #b8860b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  font-weight: 800;
  color: #fff;
  font-family: Georgia, serif;
}

/* ── Info Card ── */
.prof-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.prof-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 18px;
  gap: 12px;
}

.prof-divider {
  height: 1px;
  background: #f5f3ef;
  margin-left: 18px;
}

.prof-label {
  font-size: 14px;
  color: #aaa;
  flex-shrink: 0;
  min-width: 90px;
}

.prof-value {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
  text-align: right;
}

.prof-value--wrap {
  word-break: break-all;
}
</style>
