<template>
  <div class="me-page">

    <!-- Header -->
    <div class="me-header">
      <div class="me-hd-left">
        <img :src="jetreeIcon" class="me-brand-ico" alt="" />
      </div>
      <div class="me-hd-center">Me</div>
      <div class="me-hd-right">
        <van-badge :content="unreadCount" :show-zero="false" color="#e55" @click="$router.push('/notifications')">
          <van-icon name="bell" size="22" color="#C89239" class="me-bell-icon" />
        </van-badge>
      </div>
    </div>

    <!-- Body -->
    <div class="me-body">

      <!-- Profile Card -->
      <div class="me-profile-card">
        <div class="me-avatar-wrap">
          <img
            v-if="!imgError"
            :src="profileImgUrl"
            class="me-avatar-img"
            @error="imgError = true"
          />
          <div v-else class="me-avatar-init">{{ initials }}</div>
        </div>
        <div class="me-profile-info">
          <div class="me-profile-name">{{ studentName || auth.username }}</div>
          <div class="me-profile-id">ID: {{ auth.username }}</div>
          <div class="me-profile-pts">
            <img :src="pointsIcon" class="me-pts-ico" alt="" />
            <span class="me-pts-val">{{ totalPoints }}</span>
            <span class="me-pts-lbl">JE Points</span>
          </div>
        </div>
      </div>

      <!-- Group 1: My Profile + My Progress -->
      <div class="me-group">
        <div class="me-menu-item" @click="$router.push('/me/profile')">
          <div class="me-ico-wrap" style="background: #fef3e2;">
            <van-icon name="contact" size="20" color="#C89239" />
          </div>
          <div class="me-menu-body">
            <div class="me-menu-title">My Profile</div>
            <div class="me-menu-sub">Personal information &amp; account</div>
          </div>
          <van-icon name="arrow" color="#ccc" size="14" />
        </div>
        <div class="me-divider"></div>
        <div class="me-menu-item" @click="$router.push('/me/progress')">
          <div class="me-ico-wrap" style="background: #e8f4ff;">
            <van-icon name="chart-trending-o" size="20" color="#448BE9" />
          </div>
          <div class="me-menu-body">
            <div class="me-menu-title">My Progress</div>
            <div class="me-menu-sub">Lessons, homework &amp; quiz summary</div>
          </div>
          <van-icon name="arrow" color="#ccc" size="14" />
        </div>
      </div>

      <!-- Group 2: JE Points + My Classes -->
      <div class="me-group">
        <div class="me-menu-item" @click="$router.push('/me/points')">
          <div class="me-ico-wrap" style="background: #fff8e6;">
            <van-icon name="gold-coin-o" size="20" color="#E6A23C" />
          </div>
          <div class="me-menu-body">
            <div class="me-menu-title">JE Points</div>
            <div class="me-menu-sub">Points balance &amp; transaction history</div>
          </div>
          <span class="me-menu-badge">{{ totalPoints }}</span>
          <van-icon name="arrow" color="#ccc" size="14" />
        </div>
        <div class="me-divider"></div>
        <div class="me-menu-item" @click="$router.push('/me/classes')">
          <div class="me-ico-wrap" style="background: #e8f7e8;">
            <van-icon name="records-o" size="20" color="#67C23A" />
          </div>
          <div class="me-menu-body">
            <div class="me-menu-title">My Classes</div>
            <div class="me-menu-sub">View and manage your class schedules</div>
          </div>
          <van-icon name="arrow" color="#ccc" size="14" />
        </div>
        <div class="me-divider"></div>
        <div class="me-menu-item" @click="$router.push('/me/receipts')">
          <div class="me-ico-wrap" style="background: #ede8ff;">
            <van-icon name="bill-o" size="20" color="#7C5FD4" />
          </div>
          <div class="me-menu-body">
            <div class="me-menu-title">My Receipts</div>
            <div class="me-menu-sub">Your payment receipts</div>
          </div>
          <van-icon name="arrow" color="#ccc" size="14" />
        </div>
      </div>

      <!-- Settings -->
      <div class="me-group-label">Settings</div>
      <div class="me-group">
        <div class="me-menu-item" @click="$router.push('/me/help')">
          <div class="me-ico-wrap" style="background: #f5f5f5;">
            <van-icon name="question-o" size="20" color="#888" />
          </div>
          <div class="me-menu-body">
            <div class="me-menu-title">Help &amp; Support</div>
          </div>
          <van-icon name="arrow" color="#ccc" size="14" />
        </div>
        <div class="me-divider"></div>
        <div class="me-menu-item" @click="$router.push('/me/about')">
          <div class="me-ico-wrap" style="background: #fef3e2;">
            <van-icon name="info-o" size="20" color="#C89239" />
          </div>
          <div class="me-menu-body">
            <div class="me-menu-title">About JE Education</div>
          </div>
          <van-icon name="arrow" color="#ccc" size="14" />
        </div>
      </div>

      <!-- Sign Out -->
      <div class="me-group me-group--last">
        <div class="me-menu-item" @click="handleSignOut">
          <div class="me-ico-wrap" style="background: #fff0f0;">
            <van-icon name="exchange" size="20" color="#ee0a24" />
          </div>
          <div class="me-menu-body">
            <div class="me-menu-title me-menu-title--red">Sign Out</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { getData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import appConfig from '@/services/appConfig'
import jetreeIcon from '@/assets/img/jetree-icon.png'
import pointsIcon from '@/assets/img/points.png'

const auth = useAuthStore()
const router = useRouter()

const studentName = ref('')
const totalPoints = ref(0)
const imgError = ref(false)
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => n.status === 4).length)

const profileImgUrl = computed(
  () => `${appConfig.getAPIRoot()}/file/profile/${auth.username}?token=${auth.accessToken}`
)

const initials = computed(() => {
  const n = studentName.value || auth.username || ''
  return n.charAt(0).toUpperCase()
})

async function loadData() {
  try {
    const [profileRes, pointsRes, notifRes] = await Promise.all([
      getData(`/student/${auth.username}`, null, { isShowLoading: false }),
      getData(`points/student/${auth.username}`, null, { isShowLoading: false }),
      getData(`notification/getNotificationsFor/${auth.username}`, null, { isShowLoading: false }),
    ])
    if (profileRes?.code === '200' && profileRes?.result) {
      const r = profileRes.result
      studentName.value = [r.firstName, r.lastName].filter(Boolean).join(' ')
    }
    if (pointsRes?.code === '200' && pointsRes?.result) {
      totalPoints.value = pointsRes.result.points || 0
    }
    if (notifRes?.code === '200' && Array.isArray(notifRes?.result)) {
      notifications.value = notifRes.result
    }
  } catch { /* silent */ }
}

async function handleSignOut() {
  try {
    await showConfirmDialog({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmButtonText: 'Sign Out',
      confirmButtonColor: '#ee0a24',
    })
    auth.signOut()
    router.replace({ name: 'login' })
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>

<style scoped>
.me-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f6f3;
}

/* ── Header ── */
.me-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 11px 16px;
  padding-top: calc(11px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.me-hd-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
}

.me-brand-ico {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.me-hd-center {
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

.me-hd-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
}

.me-bell-icon {
  cursor: pointer;
}

/* ── Body ── */
.me-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px calc(68px + env(safe-area-inset-bottom));
  -webkit-overflow-scrolling: touch;
}

/* ── Profile Card ── */
.me-profile-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.me-avatar-wrap {
  flex: 0 0 calc(40% - 20px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f0e8d0;
}

.me-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.me-avatar-init {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #C89239, #b8860b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 800;
  color: #fff;
  font-family: Georgia, serif;
}

.me-profile-info {
  flex: 1;
  min-width: 0;
}

.me-profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #24221F;
  margin-bottom: 3px;
}

.me-profile-id {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 10px;
}

.me-profile-pts {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(200, 146, 57, 0.1);
  border-radius: 20px;
  padding: 5px 12px;
}

.me-pts-ico {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.me-pts-val {
  font-size: 14px;
  font-weight: 700;
  color: #C89239;
}

.me-pts-lbl {
  font-size: 12px;
  color: #C89239;
  font-weight: 500;
}

/* ── Groups ── */
.me-group-label {
  font-size: 12px;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 6px 4px 8px;
}

.me-group {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 14px;
  overflow: hidden;
}

.me-group--last {
  margin-bottom: 0;
}

.me-divider {
  height: 1px;
  background: #f5f3ef;
  margin-left: 68px;
}

.me-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.1s;
}

.me-menu-item:active {
  background: #fafaf9;
}

.me-ico-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.me-menu-body {
  flex: 1;
  min-width: 0;
}

.me-menu-title {
  font-size: 15px;
  font-weight: 600;
  color: #24221F;
  line-height: 1.3;
}

.me-menu-title--red {
  color: #ee0a24;
}

.me-menu-sub {
  font-size: 12px;
  color: #bbb;
  margin-top: 2px;
}

.me-menu-badge {
  font-size: 13px;
  font-weight: 700;
  color: #C89239;
  margin-right: 4px;
}
</style>
