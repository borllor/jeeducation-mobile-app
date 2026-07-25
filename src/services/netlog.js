// Lightweight in-app network logger.
//
// Captures every axios request/response/error into a reactive ring buffer so
// the traffic can be inspected on-device (e.g. a TestFlight build) without a
// Mac, Safari Web Inspector, or a desktop proxy. Rendered by NetworkLogPanel.vue.
import { reactive } from 'vue'
import appConfig from './appConfig'

const MAX = 120 // keep only the most recent N entries

export const netlog = reactive({
  entries: [], // newest first
  open: false,
})

let seq = 0

function fullUrl(config) {
  const base = (config.baseURL ?? appConfig.getAPIRoot() ?? '').replace(/\/$/, '')
  const url = config.url ?? ''
  if (/^https?:\/\//i.test(url)) return url
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function snippet(data, limit = 4000) {
  if (data == null) return ''
  let s
  try {
    s = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  } catch {
    s = String(data)
  }
  return s.length > limit ? `${s.slice(0, limit)}\n…(truncated)` : s
}

// Called from the request interceptor. Returns the entry so the caller can
// stash it on the axios config and finalize it later.
export function logStart(config) {
  const entry = reactive({
    id: ++seq,
    method: (config.method || 'get').toUpperCase(),
    url: fullUrl(config),
    startedAt: Date.now(),
    status: 'pending', // pending | ok | error
    code: null, // HTTP status code
    ms: null,
    error: null,
    response: null,
  })
  netlog.entries.unshift(entry)
  if (netlog.entries.length > MAX) netlog.entries.length = MAX
  return entry
}

export function logSuccess(entry, response) {
  if (!entry) return
  entry.status = 'ok'
  entry.code = response?.status ?? null
  entry.ms = Date.now() - entry.startedAt
  // response has already been unwrapped to response.data by the time our
  // logging runs after other interceptors, so accept either shape.
  entry.response = snippet(response?.data ?? response)
}

export function logError(entry, error) {
  if (!entry) return
  entry.status = 'error'
  entry.code = error?.response?.status ?? null
  entry.ms = Date.now() - entry.startedAt
  entry.error = error?.message || 'Request failed'
  entry.response = snippet(error?.response?.data)
}

export function clearLog() {
  netlog.entries.splice(0, netlog.entries.length)
}

export function apiRoot() {
  return appConfig.getAPIRoot()
}
