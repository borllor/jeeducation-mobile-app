<template>
  <div v-if="netlog.open" class="nlp">
    <div class="nlp-hd">
      <div class="nlp-title">Network Log</div>
      <div class="nlp-actions">
        <button class="nlp-btn" @click="copyAll">Copy</button>
        <button class="nlp-btn" @click="clearLog">Clear</button>
        <button class="nlp-btn nlp-btn--close" @click="netlog.open = false">✕</button>
      </div>
    </div>

    <div class="nlp-api">API&nbsp;Root:&nbsp;<span class="nlp-api-url">{{ apiRoot() }}</span></div>

    <div class="nlp-list">
      <div v-if="!netlog.entries.length" class="nlp-empty">No requests yet.</div>
      <div v-for="e in netlog.entries" :key="e.id" class="nlp-row" :class="'nlp-row--' + e.status">
        <div class="nlp-line" @click="toggle(e.id)">
          <span class="nlp-dot" :class="'nlp-dot--' + e.status"></span>
          <span class="nlp-method">{{ e.method }}</span>
          <span class="nlp-code">{{ e.code ?? (e.status === 'pending' ? '···' : 'ERR') }}</span>
          <span class="nlp-url">{{ e.url }}</span>
          <span class="nlp-ms">{{ e.ms != null ? e.ms + 'ms' : '' }}</span>
        </div>
        <div v-if="expanded === e.id" class="nlp-detail">
          <div class="nlp-kv"><b>URL</b><pre>{{ e.url }}</pre></div>
          <div v-if="e.error" class="nlp-kv"><b>Error</b><pre>{{ e.error }}</pre></div>
          <div v-if="e.response" class="nlp-kv"><b>Body</b><pre>{{ e.response }}</pre></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showToast } from 'vant'
import { netlog, clearLog, apiRoot } from '@/services/netlog'

const expanded = ref(null)
const toggle = (id) => (expanded.value = expanded.value === id ? null : id)

// Hidden gesture: tap the very top-left corner 6 times within 2s to toggle
// the panel. The listener never calls preventDefault, so underlying buttons
// (e.g. a back button) keep working normally.
let taps = 0
let timer = null
function onTap(ev) {
  const t = ev.touches?.[0] || ev.changedTouches?.[0] || ev
  const x = t.clientX ?? 0
  const y = t.clientY ?? 0
  if (x > 44 || y > 44) { taps = 0; return }
  taps += 1
  clearTimeout(timer)
  timer = setTimeout(() => (taps = 0), 2000)
  if (taps >= 6) {
    taps = 0
    netlog.open = !netlog.open
  }
}

async function copyAll() {
  const text = netlog.entries
    .map(e => `${e.method} ${e.code ?? e.status} ${e.ms ?? '-'}ms ${e.url}` +
      (e.error ? `\n  error: ${e.error}` : '') +
      (e.response ? `\n  body: ${e.response}` : ''))
    .join('\n\n')
  try {
    await navigator.clipboard.writeText(`API Root: ${apiRoot()}\n\n${text}`)
    showToast({ message: 'Copied', type: 'success' })
  } catch {
    showToast({ message: 'Copy failed', type: 'fail' })
  }
}

onMounted(() => {
  document.addEventListener('touchstart', onTap, { capture: true, passive: true })
  document.addEventListener('click', onTap, { capture: true })
})
onBeforeUnmount(() => {
  document.removeEventListener('touchstart', onTap, { capture: true })
  document.removeEventListener('click', onTap, { capture: true })
  clearTimeout(timer)
})
</script>

<style scoped>
.nlp {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  background: #14181f;
  color: #e6e6e6;
  font-family: 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
  font-size: 12px;
  padding: calc(env(safe-area-inset-top) + 8px) 0 env(safe-area-inset-bottom);
}
.nlp-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 8px;
  border-bottom: 1px solid #2a2f3a;
}
.nlp-title { font-weight: 700; font-size: 14px; }
.nlp-actions { display: flex; gap: 8px; }
.nlp-btn {
  background: #2a2f3a;
  color: #e6e6e6;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
}
.nlp-btn--close { background: #3a2a2a; }
.nlp-api {
  padding: 8px 12px;
  color: #9fb0c8;
  border-bottom: 1px solid #2a2f3a;
  white-space: nowrap;
  overflow-x: auto;
}
.nlp-api-url { color: #7fd1ff; }
.nlp-list { flex: 1; overflow-y: auto; }
.nlp-empty { padding: 24px; text-align: center; color: #6b7688; }
.nlp-row { border-bottom: 1px solid #20242c; }
.nlp-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}
.nlp-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.nlp-dot--ok { background: #4caf50; }
.nlp-dot--error { background: #ff5252; }
.nlp-dot--pending { background: #ffb74d; }
.nlp-method { font-weight: 700; width: 46px; flex-shrink: 0; }
.nlp-code { width: 34px; flex-shrink: 0; color: #9fb0c8; }
.nlp-row--error .nlp-code { color: #ff8a8a; }
.nlp-url {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nlp-ms { flex-shrink: 0; color: #6b7688; }
.nlp-detail { padding: 4px 12px 12px; background: #0f1319; }
.nlp-kv { margin-top: 8px; }
.nlp-kv b { color: #9fb0c8; display: block; margin-bottom: 2px; }
.nlp-kv pre {
  margin: 0;
  white-space: pre;
  overflow-x: auto;
  background: #1b2029;
  padding: 8px;
  border-radius: 6px;
  color: #d8e0ea;
}
</style>
