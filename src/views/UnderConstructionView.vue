<template>
  <div class="uc-page">

    <!-- Header -->
    <div class="uc-header">
      <div class="uc-hd-left">
        <img :src="jetreeIcon" class="uc-brand-ico" alt="" />
      </div>
      <div class="uc-hd-center">{{ pageTitle }}</div>
      <div class="uc-hd-right"></div>
    </div>

    <!-- Content -->
    <div class="uc-body">
      <van-empty description="Coming Soon">
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
import jetreeIcon from '@/assets/img/jetree-icon.png'

const route = useRoute()

const pageTitle = computed(() => {
  const titles = {
    class: 'Class Bubble',
    me: 'Me',
  }
  return titles[route.name] || 'Coming Soon'
})
</script>

<style scoped>
.uc-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.uc-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 11px 16px;
  padding-top: calc(11px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.uc-hd-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
}

.uc-brand-ico {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.uc-hd-center {
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

.uc-hd-right {
  margin-left: auto;
  width: 26px;
  flex-shrink: 0;
  z-index: 1;
}

.uc-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.uc-title {
  font-size: 18px;
  font-weight: 700;
  color: #24221F;
  margin-bottom: 6px;
}

.uc-sub {
  font-size: 14px;
  color: #999;
}
</style>
