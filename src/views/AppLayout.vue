<template>
  <div class="app-layout">
    <div class="page-content">
      <router-view />
    </div>
    <van-tabbar v-model="active" active-color="#C89239" inactive-color="#999" class="app-tabbar">
      <van-tabbar-item name="home" @click="$router.push('/home')">
        <template #icon="{ active }">
          <van-icon :name="active ? 'wap-home' : 'home-o'" size="22" />
        </template>
        Home
      </van-tabbar-item>
      <van-tabbar-item name="jetree" @click="$router.push('/jetree')">
        <template #icon="{ active }">
          <img :src="active ? jetreeIcon : jetreeIconGray" class="tab-icon" alt="JE Tree" />
        </template>
        JE Tree
      </van-tabbar-item>
      <van-tabbar-item name="class" @click="$router.push('/class')">
        <template #icon="{ active }">
          <van-icon :name="active ? 'friends' : 'friends-o'" size="22" />
        </template>
        Class Bubble
      </van-tabbar-item>
      <van-tabbar-item name="me" @click="$router.push('/me')">
        <template #icon="{ active }">
          <van-icon :name="active ? 'contact' : 'contact-o'" size="22" />
        </template>
        Me
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import jetreeIcon from '@/assets/img/jetree-icon.png'
import jetreeIconGray from '@/assets/img/jetree-icon-gray.png'

const route = useRoute()
const active = ref(route.name || 'home')

watch(() => route.name, (name) => {
  active.value = name || 'home'
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.app-tabbar {
  flex-shrink: 0;
  border-top: 1px solid #eee;
}

.tab-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

:deep(.van-tabbar-item--active .van-icon) {
  color: #C89239;
}

:deep(.van-tabbar-item:not(.van-tabbar-item--active) .van-icon) {
  color: #999;
}
</style>
