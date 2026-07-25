<template>
  <div class="app-layout">
    <div class="page-content">
      <router-view />
    </div>
    <van-tabbar v-model="active" active-color="#C89239" inactive-color="#999" class="app-tabbar">
      <van-tabbar-item name="home" @click="$router.push('/home')">
        <template #icon="{ active }">
          <img :src="active ? navHome : navHomeGrey" class="tab-icon" alt="Home" />
        </template>
        Home
      </van-tabbar-item>
      <van-tabbar-item name="jetree" @click="$router.push('/jetree')">
        <template #icon="{ active }">
          <img :src="active ? navJetree : navJetreeGrey" class="tab-icon" alt="JE Tree" />
        </template>
        JE Tree
      </van-tabbar-item>
      <van-tabbar-item name="class" @click="$router.push('/class')">
        <template #icon="{ active }">
          <img :src="active ? navClass : navClassGrey" class="tab-icon" alt="Class Bubble" />
        </template>
        Class Bubble
      </van-tabbar-item>
      <van-tabbar-item name="me" @click="$router.push('/me')">
        <template #icon="{ active }">
          <img :src="active ? navMe : navMeGrey" class="tab-icon" alt="Me" />
        </template>
        Me
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// Bottom-nav icons: colored (nav-*-icon) for the active tab, grey (nav-*-grey-icon)
// for inactive. JE Tree's active state uses tree-icon (its colored counterpart, as
// there is no nav-jetree-icon).
import navHome from '@/assets/img/nav-homepage-icon.png'
import navHomeGrey from '@/assets/img/nav-homepage-grey-icon.png'
import navJetree from '@/assets/img/tree-icon.png'
import navJetreeGrey from '@/assets/img/nav-jetree-grey-icon.png'
import navClass from '@/assets/img/nav-class-bubble-icon.png'
import navClassGrey from '@/assets/img/nav-class-bubble-grey-icon.png'
import navMe from '@/assets/img/nav-me-icon.png'
import navMeGrey from '@/assets/img/nav-me-grey-icon.png'

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
  /* Keep the bottom nav above popups/overlays — bottom sheets end at its top edge */
  z-index: 3000;
  padding: 4px 0;
}

.tab-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
</style>
