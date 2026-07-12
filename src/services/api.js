import axios from 'axios'
import appConfig from './appConfig'
import { useAuthStore } from '@/stores/auth'
import { showLoadingToast, closeToast } from 'vant'
import router from '@/router'

const http = axios.create({
  baseURL: appConfig.getAPIRoot(),
  timeout: appConfig.getTimeout(),
})

http.interceptors.request.use((config) => {
  if (config.showLoading !== false) {
    showLoadingToast({ message: 'Loading...', forbidClick: true, duration: 0 })
  }

  const isExempt = appConfig.exemptPaths.some(p => config.url?.includes(p))
  if (!isExempt) {
    const auth = useAuthStore()
    if (!auth.isAccessTokenValid) {
      closeToast()
      return Promise.reject(new Error('SESSION_EXPIRED'))
    }
    config.headers['Authorization'] = `Bearer ${auth.accessToken}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    closeToast()
    return response.data
  },
  (error) => {
    closeToast()
    if (error.response?.status === 401 || error.message === 'SESSION_EXPIRED') {
      const auth = useAuthStore()
      auth.signOut()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export const getData = (url, params, config = {}) =>
  http.get(url, { params, showLoading: config.isShowLoading !== false, ...config })

export const postData = (url, data, config = {}) =>
  http.post(url, data, { showLoading: config.isShowLoading !== false, ...config })

export default http
