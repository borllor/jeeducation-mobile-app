<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">{{ pageTitle }}</div>
      <div class="sub-hd-right"></div>
    </div>

    <!-- Body -->
    <div class="sub-body">
      <van-empty description="">
        <template #description>
          <div class="uc-desc">
            <div class="uc-title">Under Construction</div>
            <div class="uc-sub">This feature will be available soon.</div>
          </div>
        </template>
      </van-empty>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => route.meta?.title || 'Coming Soon')
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.uc-title {
  font-size: 18px;
  font-weight: 700;
  color: #24221F;
  margin-bottom: 6px;
  text-align: center;
}

.uc-sub {
  font-size: 14px;
  color: #999;
  text-align: center;
}
</style>
