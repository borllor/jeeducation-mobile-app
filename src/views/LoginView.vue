<template>
  <div
    class="login-wrap"
    :class="isDaylight ? 'login-wrap--day' : 'login-wrap--night'"
    :style="{ backgroundImage: `url(${isDaylight ? bgDay : bgNight})` }"
  >
    <!-- Dev theme toggle -->
    <button v-if="isDev" class="theme-toggle" @click="isDaylight = !isDaylight">
      {{ isDaylight ? '🌙 Night' : '☀️ Day' }}
    </button>

    <!-- Quote -->
    <div class="quote" :class="isDaylight ? 'quote--day' : 'quote--night'">
      <div class="quote-text">"Mathematics reveals the hidden structure of the world."</div>
      <div class="quote-attr">— JE Philosophy</div>
    </div>

    <!-- Login card -->
    <div class="card" :class="isDaylight ? 'card--day' : 'card--night'">

      <!-- Header -->
      <div class="card-hd">
        <div class="card-hd-row">
          <img :src="jetreeIcon" class="logo" alt="JE" />
          <div class="brand">JE Education</div>
        </div>
        <div class="tagline">Enter the Tree</div>
      </div>

      <!-- Student ID -->
      <div class="field" :class="{ 'field--err': errors.username }">
        <span class="field-side">
          <img :src="usernameIcon1" class="ficon" alt="" />
        </span>
        <input
          v-model="form.username"
          class="finput"
          :class="isDaylight ? 'finput--day' : 'finput--night'"
          placeholder="Student ID"
          autocomplete="username"
          inputmode="text"
          @keyup.enter="focusPassword"
        />
        <span class="field-side">
          <img :src="usernameIcon2" class="ficon" alt="" />
        </span>
      </div>
      <div v-if="errors.username" class="err-msg">{{ errors.username }}</div>

      <!-- Password -->
      <div class="field" :class="{ 'field--err': errors.password }">
        <span class="field-side">
          <img :src="passwordIcon1" class="ficon" alt="" />
        </span>
        <input
          ref="passwordInput"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          class="finput"
          :class="isDaylight ? 'finput--day' : 'finput--night'"
          placeholder="Password"
          autocomplete="current-password"
          @keyup.enter="signIn"
        />
        <span class="field-side field-side--btn" @click="showPassword = !showPassword">
          <img :src="passwordIcon2" class="ficon" alt="" />
        </span>
      </div>
      <div v-if="errors.password" class="err-msg">{{ errors.password }}</div>

      <!-- Forgot password -->
      <div class="forgot">
        <span class="forgot-link" :class="isDaylight ? 'forgot-link--day' : 'forgot-link--night'">
          Forgot Password?
        </span>
      </div>

      <!-- Submit button -->
      <button class="submit-btn" :disabled="loading" @click="signIn">
        <img :src="isDaylight ? btnDay : btnNight" alt="Enter the Tree" class="submit-img" />
      </button>

      <!-- Online count -->
      <div class="online" :class="isDaylight ? 'online--day' : 'online--night'">
        <span class="online-dot"></span>
        <span>{{ onlineCount }} students currently online</span>
      </div>

    </div>

    <!-- Bottom tagline (night mode only) -->
    <div v-if="!isDaylight" class="bottom-tag">
      <span>✦ Learn · Explore · Grow ✦</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { postData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import appConfig from '@/services/appConfig'

import bgDay from '@/assets/img/login-background-daylight.png'
import bgNight from '@/assets/img/login-background-night.png'
import btnDay from '@/assets/img/login-button-daylight.png'
import btnNight from '@/assets/img/login-button-night.png'
import jetreeIcon from '@/assets/img/jetree-icon.png'
import usernameIcon1 from '@/assets/img/login-username-icon1.png'
import usernameIcon2 from '@/assets/img/login-username-icon2.png'
import passwordIcon1 from '@/assets/img/login-password-icon1.png'
import passwordIcon2 from '@/assets/img/login-password-icon2.png'

const router = useRouter()
const auth = useAuthStore()

const hour = new Date().getHours()
const isDaylight = ref(hour >= 6 && hour < 18)
const isDev = import.meta.env.DEV

const form = ref({ username: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errors = ref({ username: '', password: '' })
const onlineCount = ref(Math.floor(Math.random() * 81) + 20)
const passwordInput = ref(null)

const focusPassword = () => passwordInput.value?.focus()

function validate() {
  errors.value = { username: '', password: '' }
  let ok = true
  if (!form.value.username.trim()) {
    errors.value.username = 'Please enter your Student ID.'
    ok = false
  }
  if (!form.value.password) {
    errors.value.password = 'Please enter your password.'
    ok = false
  }
  return ok
}

async function signIn() {
  if (!validate() || loading.value) return
  loading.value = true
  try {
    const res = await postData('/login', {
      appId: appConfig.getAppId(),
      username: form.value.username.trim(),
      password: form.value.password,
    }, { isShowLoading: false })

    if (res?.code === '200' && res?.result) {
      auth.signIn({
        appId: appConfig.getAppId(),
        userId: res.result.user.userId,
        username: form.value.username.trim(),
        userRole: res.result.user.userRole,
        accessToken: res.result.accessToken,
        refreshToken: res.result.refreshToken,
        accessTokenExpiredInMinutes: res.result.accessTokenExpiredInMinutes,
        refreshTokenExpiredInMinutes: res.result.refreshTokenExpiredInMinutes,
      })
      router.push('/home')
    } else {
      showToast({ message: res?.message || 'Login failed', type: 'fail' })
    }
  } catch {
    showToast({ message: 'Unable to connect. Please try again.', type: 'fail' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (auth.isLoggedIn) router.replace('/home')
})
</script>

<style scoped>
.login-wrap {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif;
}

/* ── Quote ── */
.quote {
  position: absolute;
  top: 52px;
  left: 0;
  right: 0;
  text-align: center;
  padding: 0 24px;
}

.quote-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 3px;
}

.quote-attr {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 12px;
}

.quote--day .quote-text,
.quote--day .quote-attr {
  color: rgba(100, 75, 20, 0.9);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.4);
}

.quote--night .quote-text,
.quote--night .quote-attr {
  color: rgba(212, 175, 90, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
}

/* ── Card ── */
.card {
  width: calc(100% - 48px);
  max-width: 360px;
  border-radius: 20px;
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;
  opacity: 0.73; /* 27% transparent */
}

.card--day {
  background: rgba(255, 252, 245, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 40px rgba(180, 140, 40, 0.2);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.card--night {
  background: rgba(18, 12, 6, 0.78);
  border: 1.5px solid rgba(212, 175, 90, 0.4);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

/* ── Header ── */
.card-hd {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.card-hd-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.brand {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #d4af5a 0%, #b8860b 60%, #e8c97a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.03em;
}

.tagline {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 20px;
  background: linear-gradient(135deg, #d4af5a 0%, #b8860b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Fields ── */
.field {
  display: flex;
  align-items: center;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
}

.card--day .field {
  border: 1.5px solid #e0d0a0;
  background: #fff;
}

.card--night .field {
  border: 1.5px solid rgba(212, 175, 90, 0.35);
  background: rgba(255, 255, 255, 0.06);
}

.field--err {
  border-color: #e55 !important;
}

.field-side {
  width: 42px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card--day .field-side {
  background: rgba(212, 175, 90, 0.08);
}

.card--night .field-side {
  background: rgba(14, 8, 3, 0.7);
}

.field-side--btn {
  cursor: pointer;
  user-select: none;
}

.ficon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.finput {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 10px;
  font-size: 16px;
  height: 100%;
}

.finput--day {
  color: #333;
}

.finput--day::placeholder {
  color: #bba878;
}

.finput--night {
  color: #e8d9a0;
}

.finput--night::placeholder {
  color: rgba(212, 175, 90, 0.5);
}

/* ── Error ── */
.err-msg {
  font-size: 12px;
  color: #e55;
  margin-top: -6px;
  padding-left: 4px;
}

/* ── Forgot ── */
.forgot {
  text-align: right;
  margin-top: -4px;
}

.forgot-link {
  font-size: 13px;
  cursor: pointer;
}

.forgot-link--day {
  color: #b8860b;
}

.forgot-link--night {
  color: #d4af5a;
}

/* ── Submit ── */
.submit-btn {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-img {
  width: 100%;
  height: auto;
  display: block;
}

/* ── Online ── */
.online {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
}

.online-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4caf50;
  flex-shrink: 0;
}

.online--day {
  color: #7a6840;
}

.online--night {
  color: rgba(212, 175, 90, 0.7);
}

/* ── Bottom tag ── */
.bottom-tag {
  position: absolute;
  bottom: calc(16px + env(safe-area-inset-bottom));
  font-size: 12px;
  color: rgba(212, 175, 90, 0.6);
  letter-spacing: 0.08em;
}

/* ── Dev toggle ── */
.theme-toggle {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 100;
  padding: 5px 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  backdrop-filter: blur(4px);
}
</style>
