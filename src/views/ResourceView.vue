<template>
  <div class="res-page">

    <!-- Header -->
    <div class="res-header">
      <div class="res-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="res-hd-center">{{ title }}</div>
      <div class="res-hd-right"></div>
    </div>

    <!-- Content -->
    <div class="res-body">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        class="res-iframe"
        frameborder="0"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      ></iframe>
      <van-empty v-else description="Resource unavailable" />
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => route.query.title || 'Resource')

const embedUrl = computed(() => {
  const raw = route.query.url
  if (!raw) return ''

  // YouTube: watch?v=ID or youtu.be/ID
  const ytWatch = raw.match(/[?&]v=([^&]+)/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?rel=0`
  const ytShort = raw.match(/youtu\.be\/([^?]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?rel=0`

  // Google Drive file: /file/d/ID/...
  const driveFile = raw.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`

  // Google Drive open?id=ID
  const driveOpen = raw.match(/drive\.google\.com\/open\?.*[?&]id=([^&]+)/)
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`

  // Fallback: Google Docs viewer
  return `https://docs.google.com/viewer?url=${encodeURIComponent(raw)}&embedded=true`
})
</script>

<style scoped>
.res-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: #000;
}

.res-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 11px 16px;
  padding-top: calc(11px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.res-hd-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
  cursor: pointer;
  padding: 4px;
  margin: -4px;
}

.res-hd-center {
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

.res-hd-right {
  margin-left: auto;
  width: 28px;
  flex-shrink: 0;
}

.res-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.res-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
}
</style>
