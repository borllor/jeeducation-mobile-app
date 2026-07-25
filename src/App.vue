<template>
  <router-view />
  <NetworkLogPanel />
</template>

<script setup>
import NetworkLogPanel from '@/components/NetworkLogPanel.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  background: #f5f5f5;
}

:root {
  --je-gold: #C89239;
  --je-gold-dark: #b8860b;
  --je-gold-light: #d4af5a;
  --je-black: #24221F;
  --je-card-radius: 16px;
}

/* Vant toasts default to word-break: break-all, which splits words mid-letter
   (e.g. "conn-ect"). Wrap at spaces instead so whole words stay intact. */
.van-toast {
  max-width: 260px !important;
  word-break: normal !important;
  overflow-wrap: break-word !important;
  line-height: 1.4 !important;
}
</style>
