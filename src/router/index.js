import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/views/NotificationsView.vue'),
  },
  {
    path: '/resource',
    name: 'resource',
    component: () => import('@/views/ResourceView.vue'),
  },

  // Me sub-pages (outside AppLayout — no tab bar)
  {
    path: '/me/profile',
    name: 'me-profile',
    component: () => import('@/views/MeProfileView.vue'),
  },
  {
    path: '/me/progress',
    name: 'me-progress',
    component: () => import('@/views/MeProgressView.vue'),
  },
  {
    path: '/me/points',
    name: 'me-points',
    component: () => import('@/views/MePointsView.vue'),
  },
  {
    path: '/me/classes',
    name: 'me-classes',
    component: () => import('@/views/MeClassesView.vue'),
  },
  {
    path: '/me/receipts',
    name: 'me-receipts',
    component: () => import('@/views/MeReceiptsView.vue'),
  },
  {
    path: '/me/receipts/detail',
    name: 'me-receipt-detail',
    component: () => import('@/views/MeReceiptDetailView.vue'),
  },
  {
    path: '/me/account',
    name: 'me-account',
    component: () => import('@/views/MeSubUCView.vue'),
    meta: { title: 'Account & Security' },
  },
  {
    path: '/me/privacy',
    name: 'me-privacy',
    component: () => import('@/views/MeSubUCView.vue'),
    meta: { title: 'Privacy' },
  },
  {
    path: '/me/help',
    name: 'me-help',
    component: () => import('@/views/MeHelpView.vue'),
  },
  {
    path: '/me/about',
    name: 'me-about',
    component: () => import('@/views/MeAboutView.vue'),
  },

  {
    path: '/',
    component: () => import('@/views/AppLayout.vue'),
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
      },
      {
        path: 'jetree',
        name: 'jetree',
        component: () => import('@/views/JETreeView.vue'),
      },
      {
        path: 'class',
        name: 'class',
        component: () => import('@/views/UnderConstructionView.vue'),
      },
      {
        path: 'me',
        name: 'me',
        component: () => import('@/views/MeView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return { name: 'login' }
  }
})

export default router
