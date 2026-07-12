import { defineStore } from 'pinia'
import { Base64 } from 'js-base64'
import axios from 'axios'
import appConfig from '@/services/appConfig'

const SESSION_KEY = 'je_mobile_user'

function loadSession() {
  try {
    const b64 = localStorage.getItem(SESSION_KEY)
    if (!b64) return null
    return JSON.parse(Base64.decode(b64))
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function saveSession(data) {
  localStorage.setItem(SESSION_KEY, Base64.encode(JSON.stringify(data)))
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const s = loadSession()
    return {
      appId: s?._appId || '',
      userId: s?._userId || '',
      username: s?._username || '',
      userRole: s?._userRole || '',
      accessToken: s?._accessToken || '',
      refreshToken: s?._refreshToken || '',
      expiredMinutes: s?._expiredMinutes || 0,
      refreshExpiredMinutes: s?._refreshExpiredMinutes || 0,
      signInAt: s?._signInAt || 0,
      points: 0,
    }
  },

  getters: {
    isAccessTokenValid: (state) =>
      !!(state.accessToken &&
        state.accessToken.length === 22 &&
        state.signInAt + state.expiredMinutes * 60000 > Date.now()),

    isRefreshTokenValid: (state) =>
      !!(state.refreshToken &&
        state.refreshToken.length === 22 &&
        state.signInAt + state.refreshExpiredMinutes * 60000 > Date.now()),

    isLoggedIn: (state) =>
      !!(state.username && state.accessToken && state.accessToken.length === 22),
  },

  actions: {
    signIn(payload) {
      this.appId = payload.appId
      this.userId = payload.userId
      this.username = payload.username
      this.userRole = payload.userRole
      this.accessToken = payload.accessToken
      this.refreshToken = payload.refreshToken
      this.expiredMinutes = payload.accessTokenExpiredInMinutes
      this.refreshExpiredMinutes = payload.refreshTokenExpiredInMinutes
      this.signInAt = Date.now()
      this._persist()
    },

    signOut() {
      localStorage.removeItem(SESSION_KEY)
      this.$reset()
    },

    _persist() {
      saveSession({
        _appId: this.appId,
        _userId: this.userId,
        _username: this.username,
        _userRole: this.userRole,
        _accessToken: this.accessToken,
        _refreshToken: this.refreshToken,
        _expiredMinutes: this.expiredMinutes,
        _refreshExpiredMinutes: this.refreshExpiredMinutes,
        _signInAt: this.signInAt,
      })
    },

    async tryRefreshToken() {
      if (!this.isRefreshTokenValid) return false
      try {
        const res = await axios.post(
          `${appConfig.getAPIRoot()}/login/exchangeAccessToken`,
          { appId: this.appId, accessToken: this.accessToken, refreshToken: this.refreshToken },
          { timeout: appConfig.getTimeout() }
        )
        if (res.data?.code === '200' && res.data?.result) {
          const r = res.data.result
          this.accessToken = r.accessToken
          this.refreshToken = r.refreshToken
          this.expiredMinutes = r.accessTokenExpiredInMinutes
          this.refreshExpiredMinutes = r.refreshTokenExpiredInMinutes
          this.signInAt = Date.now()
          this._persist()
          return true
        }
      } catch {
        // ignore
      }
      return false
    },
  },
})
