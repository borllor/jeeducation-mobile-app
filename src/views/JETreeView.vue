<template>
  <div class="jetree-page" :style="{ backgroundImage: `url(${bgLight})` }">

    <!-- Fixed top: header + hero + filter (over the golden tree background) -->
    <div class="jt-top">

      <!-- Header -->
      <div class="jt-header">
        <div class="jt-brand">
          <img :src="brandLogo" class="jt-brand-ico" alt="JE" />
          <span class="jt-brand-title">JE Education</span>
        </div>
        <div class="jt-points">
          <img :src="pointsIcon" class="jt-points-ico" alt="" />
          <span class="jt-points-val">{{ totalPoints }}</span>
          <span class="jt-points-unit">pts</span>
        </div>
      </div>

      <!-- Hero -->
      <div class="jt-hero">
        <div class="jt-hero-left">
          <div class="jt-hero-title">JE Tree</div>
          <div class="jt-hero-sub">
            <span>Your learning path</span>
            <img :src="sprigImg" class="jt-hero-sprig" alt="" />
          </div>
        </div>
        <button v-if="currentGrade" class="jt-return-btn" @click="jumpToCurrentClassroom"
          aria-label="Return to current lesson">
          <img :src="returnIcon" class="jt-return-ico" alt="" />
        </button>
      </div>

      <!-- Selection row: Lesson Type · Year · Term -->
      <div class="jt-filter-bar">
        <button class="jt-filter-pill" @click="showTypePicker = true">
          <img :src="typeSelIcon" class="jt-filter-ico" alt="" />
          <span class="jt-filter-txt">{{ activeTypeLabel }}</span>
          <van-icon name="arrow-down" size="12" color="#b9a98a" />
        </button>
        <button class="jt-filter-pill" @click="showYearPicker = true">
          <img :src="yearSelIcon" class="jt-filter-ico" alt="" />
          <span class="jt-filter-txt">{{ formatGrade(selectedGrade) || 'Year' }}</span>
          <van-icon name="arrow-down" size="12" color="#b9a98a" />
        </button>
        <button class="jt-filter-pill" @click="showTermPicker = true">
          <img :src="termSelIcon" class="jt-filter-ico" alt="" />
          <span class="jt-filter-txt">{{ formatTerm(selectedTerm) || 'Term' }}</span>
          <van-icon name="arrow-down" size="12" color="#b9a98a" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="jt-loading">
      <van-loading color="#C89239" size="30" />
      <div class="jt-loading-txt">Loading your learning path…</div>
    </div>

    <!-- Empty state -->
    <div v-else-if="lessons.length === 0" class="jt-empty">
      <van-empty image="search" description="No lessons found for this course type" />
    </div>

    <!-- Week list -->
    <div v-else class="jt-scroll" ref="treeScroll">
      <div class="jt-list">
        <div v-for="(lesson, idx) in lessons" :key="lesson.lessonId" class="jt-row" :data-lid="lesson.lessonId">
          <!-- Trunk line + status leaf badge -->
          <div class="jt-trunk-col">
            <span class="jt-trunk-line"
              :class="{ 'jt-trunk-line--first': idx === 0, 'jt-trunk-line--last': idx === lessons.length - 1 }"></span>
            <span class="jt-badge">
              <img :src="statusBg(lesson)" class="jt-badge-bg" alt="" />
              <img :src="statusIcon(lesson)" class="jt-badge-ico" alt="" />
            </span>
          </div>

          <!-- Leaf card (border contains the expanded resource panel) -->
          <div class="jt-leaf"
            :class="{ 'jt-leaf--expanded': isExpanded(lesson), 'jt-leaf--current': lesson.lessonId === currentLesson?.lessonId }">
            <div class="jt-leaf-head">
              <span class="jt-week">W{{ lesson.displayOrder }}</span>
              <span class="jt-name" @click="openLeaf(lesson)">{{ lesson.name }}</span>
              <span v-if="scopeTitle(lesson)" class="jt-scope" :style="{ color: scopeColor(lesson) }">{{
                scopeTitle(lesson) }}</span>
              <button class="jt-chev" @click="toggleExpand(lesson)" aria-label="Toggle resources">
                <van-icon :name="isExpanded(lesson) ? 'arrow-up' : 'arrow-down'" size="16" color="#a89a80" />
              </button>
            </div>

            <!-- Animated learning-resource panel -->
            <div class="jt-res-wrap" :class="{ 'jt-res-wrap--open': isExpanded(lesson) }">
              <div class="jt-res-inner">
                <div v-if="leafResources(lesson).length" class="jt-res-grid">
                  <div v-for="r in leafResources(lesson)" :key="r.name" class="jt-rcard"
                    :class="{ 'jt-rcard--lock': !r.unlocked }" @click="onResourceClick(lesson, r)">
                    <div class="jt-rcard-ico">
                      <img :src="r.icon" alt="" />
                      <span v-if="!r.unlocked" class="jt-rcard-lockbadge">
                        <van-icon name="lock" size="10" color="#fff" />
                      </span>
                    </div>
                    <div class="jt-rcard-txt">
                      <div class="jt-rcard-name">{{ r.name }}</div>
                      <div v-if="r.unlocked" class="jt-rcard-sub">{{ r.subtitle }}</div>
                      <div v-else-if="r.pending" class="jt-rcard-sub">Unlocks after lesson</div>
                      <div v-else-if="r.priceNow > 0" class="jt-rcard-price">
                        <span v-if="r.priceWas > r.priceNow" class="jt-price-was">{{ r.priceWas }}</span>
                        <span class="jt-price-now">{{ r.priceNow }}</span>
                        <span class="jt-price-unit">pts</span>
                      </div>
                      <div v-else class="jt-rcard-sub">Tap to unlock</div>
                    </div>
                  </div>
                </div>
                <div v-else class="jt-res-empty">No resources available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Year picker -->
    <van-popup v-model:show="showYearPicker" position="bottom" round teleport="body" class="jt-above-nav"
      :style="{ bottom: navHeight + 'px' }">
      <van-picker :columns="gradeOptions" :default-index="gradeOptions.findIndex(g => g.value === selectedGrade)"
        @confirm="onYearConfirm" @cancel="showYearPicker = false" title="Select Level" confirm-button-text="Confirm"
        cancel-button-text="Cancel" />
    </van-popup>

    <!-- Term picker -->
    <van-popup v-model:show="showTermPicker" position="bottom" round teleport="body" class="jt-above-nav"
      :style="{ bottom: navHeight + 'px' }">
      <van-picker :columns="termOptions" :default-index="termOptions.findIndex(t => t.value === selectedTerm)"
        @confirm="onTermConfirm" @cancel="showTermPicker = false" title="Select Term" confirm-button-text="Confirm"
        cancel-button-text="Cancel" />
    </van-popup>

    <!-- Lesson Type picker -->
    <van-popup v-model:show="showTypePicker" position="bottom" round teleport="body" class="jt-above-nav"
      :style="{ bottom: navHeight + 'px' }">
      <van-picker :columns="courseTypeOptions" :default-index="courseTypeOptions.findIndex(t => t.value === activeType)"
        @confirm="onTypeConfirm" @cancel="showTypePicker = false" title="Lesson Type" confirm-button-text="Confirm"
        cancel-button-text="Cancel" />
    </van-popup>

    <!-- Lesson detail dialog: full name + description (no resources) -->
    <van-popup v-model:show="showLeafPopup" position="bottom" round teleport="body" class="jt-above-nav"
      :style="{ maxHeight: '70%', bottom: navHeight + 'px' }">
      <div class="jt-dlg" v-if="dlgLeaf">
        <div class="jt-dlg-handle"></div>
        <div class="jt-dlg-hd">
          <div class="jt-dlg-title">{{ dlgLeaf.name }}</div>
          <div class="jt-dlg-sub">
            <span class="jt-dlg-week">Week {{ dlgLeaf.displayOrder }}</span>
            <template v-if="scopeTitle(dlgLeaf)">
              <span class="jt-dlg-dot">●</span>
              <span class="jt-dlg-scope" :style="{ color: scopeColor(dlgLeaf) }">{{ scopeTitle(dlgLeaf) }}</span>
            </template>
          </div>
        </div>
        <div class="jt-dlg-scroll">
          <div class="jt-sec-hd">Description &amp; Objectives</div>
          <div v-if="dlgLeaf.description" class="jt-desc" v-html="dlgLeaf.description"></div>
          <van-empty v-else description="No description available" />
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getData, postData } from '@/services/api'
import formatter from '@/services/formatter'
import { useAuthStore } from '@/stores/auth'
import { showConfirmDialog, showToast, showDialog } from 'vant'

import bgLight from '@/assets/img/new/jetree-light-bg.png'
import brandLogo from '@/assets/img/new/jeeducation-icon.png'
import pointsIcon from '@/assets/img/new/points-icon.png'
import sprigImg from '@/assets/img/new/your-learning-path-icon.png'
import returnIcon from '@/assets/img/new/return-to-current-lesson-icon.png'
import typeSelIcon from '@/assets/img/new/lesson-type-icon.png'
import yearSelIcon from '@/assets/img/new/year-select-icon.png'
import termSelIcon from '@/assets/img/new/term-select-icon.png'
import lockIconImg from '@/assets/img/new/lock-icon.png'
import unlockIconImg from '@/assets/img/new/unlock-icon.png'
import halfLockIconImg from '@/assets/img/new/half-lock-icon.png'
import lockBgImg from '@/assets/img/new/lock-icon-bg.png'
import unlockBgImg from '@/assets/img/new/unlock-icon-bg.png'
import halfLockBgImg from '@/assets/img/new/half-lock-icon-bg.png'
import replayAImg from '@/assets/img/new/replay-a-icon.png'
import replayBImg from '@/assets/img/new/replay-b-icon.png'
import homeworkImg from '@/assets/img/new/homework-icon.png'
import homeworkAnswersImg from '@/assets/img/new/homework-anwers-icon.png'
import extraFoundationImg from '@/assets/img/new/extra-foundation-icon.png'
import extraDevelopmentImg from '@/assets/img/new/extra-development-icon.png'
import extraEnrichmentImg from '@/assets/img/new/extra-enrichment-icon.png'
import revisionExerciseImg from '@/assets/img/new/revision-exercise-icon.png'

const auth = useAuthStore()
const router = useRouter()

// ── State ──────────────────────────────────────────────────────────────────────
const loading = ref(true)
const tableData = ref({})
const studentInClassRooms = ref([])
const scopeConfig = ref({})
const purchasedRecords = ref([])
const courseList = ref([])
const globalConfigKV = ref([])
const activeType = ref('HSC_Course_Advanced')
const treeScroll = ref(null)
const totalPoints = ref(0)
// Bottom-nav height, measured at runtime so bottom sheets end at the nav's top edge
const navHeight = ref(58)

// Student's active classroom — used ONLY for unlock logic, never changes after init
const currentGrade = ref('')
const currentTerm = ref('')
const currentWeek = ref(0)

// Filter selection — what the user is currently browsing
const selectedGrade = ref('')
const selectedTerm = ref('')

// Picker visibility
const showYearPicker = ref(false)
const showTermPicker = ref(false)
const showTypePicker = ref(false)

// Lesson detail dialog + expanded leaves
const showLeafPopup = ref(false)
const dlgLeaf = ref(null)
const expandedIds = ref(new Set())

// ── Course types ───────────────────────────────────────────────────────────────
const courseTypes = [
  { value: 'Junior_Course', label: 'Junior' },
  { value: 'HSC_Course_Advanced', label: 'Advanced' },
  { value: 'HSC_Course_Extension_1', label: 'Extension 1' },
  { value: 'HSC_Course_Extension_2', label: 'Extension 2' },
]
const courseTypeOptions = courseTypes.map(t => ({ text: t.label, value: t.value }))
const activeTypeLabel = computed(
  () => courseTypes.find(t => t.value === activeType.value)?.label ?? 'Type'
)

// ── Unlock logic (ported from JETreeV2) ───────────────────────────────────────
const activeGTs = computed(() => {
  const s = new Set()
  for (const cr of studentInClassRooms.value) {
    if (cr.classRoom.activeStatus === 2048)
      s.add(`${cr.classRoom.grade.toLowerCase()}-${cr.classRoom.term.toLowerCase()}`)
  }
  return s
})

const latestActiveGT = computed(() => {
  const actives = studentInClassRooms.value.filter(cr => cr.classRoom.activeStatus === 2048)
  if (!actives.length) return null
  const latest = [...actives].sort((a, b) =>
    (b.classRoom.gradeValue * 10 + b.classRoom.termValue) -
    (a.classRoom.gradeValue * 10 + a.classRoom.termValue)
  )[0]
  return `${latest.classRoom.grade.toLowerCase()}-${latest.classRoom.term.toLowerCase()}`
})

const isNextLessonPreviewDay = computed(() => {
  const actives = studentInClassRooms.value.filter(cr => cr.classRoom.activeStatus === 2048)
  if (actives.length) {
    const latest = [...actives].sort((a, b) =>
      (b.classRoom.gradeValue * 10 + b.classRoom.termValue) -
      (a.classRoom.gradeValue * 10 + a.classRoom.termValue)
    )[0]
    if (latest.classRoom.startDate) {
      const s = new Date(latest.classRoom.startDate)
      const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getDay()
      const unlockDay = (startDay + 1) % 7
      const today = new Date().getDay()
      return (today - unlockDay + 7) % 7 < 6
    }
  }
  const day = new Date().getDay()
  return day === 0 || day >= 4
})

const currentAccessibleWeek = computed(() =>
  isNextLessonPreviewDay.value ? currentWeek.value : Math.max(0, currentWeek.value - 1)
)

function isUnlocked(lesson) {
  const gt = `${lesson.grade.toLowerCase()}-${lesson.term.toLowerCase()}`
  if (gt === latestActiveGT.value) {
    if (lesson.displayOrder < currentWeek.value) return true
    if (lesson.displayOrder === currentWeek.value && isNextLessonPreviewDay.value) return true
    return false
  }
  if (activeGTs.value.has(gt)) return true
  return false
}

// Locked lesson in the student's current grade-term: not purchasable,
// unlocks automatically after the lesson is taught
function isPendingCurrentTerm(lesson) {
  const gt = `${lesson.grade.toLowerCase()}-${lesson.term.toLowerCase()}`
  return gt === latestActiveGT.value && !isUnlocked(lesson)
}

// ── Filter options derived from tableData keys ─────────────────────────────────
const gradeOptions = computed(() => {
  const grades = new Map()
  for (const key of Object.keys(tableData.value || {})) {
    const allLessons = tableData.value[key] || []
    if (!allLessons.some(l => l.lessonType === activeType.value)) continue
    const first = allLessons[0]
    const g = first.grade
    const gv = first.gradeValue ?? parseInt(g.replace(/\D/g, '') || '0')
    if (!grades.has(g)) grades.set(g, gv)
  }
  return [...grades.entries()]
    // Sort by the displayed Level number (formatGrade2 maps years -> Level 1..4),
    // falling back to grade value so ties keep a stable order.
    .sort((a, b) => levelNum(a[0]) - levelNum(b[0]) || a[1] - b[1])
    .map(([g]) => ({ text: formatGrade(g), value: g }))
})

const termOptions = computed(() => {
  const terms = new Map()
  for (const key of Object.keys(tableData.value || {})) {
    const allLessons = tableData.value[key] || []
    if (!allLessons.length) continue
    const g = allLessons[0].grade
    if (g !== selectedGrade.value) continue
    if (!allLessons.some(l => l.lessonType === activeType.value)) continue
    const t = allLessons[0].term
    const tv = allLessons[0].termValue ?? parseInt(t.replace(/\D/g, '') || '0')
    if (!terms.has(t)) terms.set(t, tv)
  }
  return [...terms.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([t]) => ({ text: formatTerm(t), value: t }))
})

// ── Lessons for selected grade/term + activeType ───────────────────────────────
const lessons = computed(() => {
  if (!selectedGrade.value || !selectedTerm.value || !tableData.value) return []
  const keyLower = `${selectedGrade.value}-${selectedTerm.value}`.toLowerCase()
  const matchingKey = Object.keys(tableData.value).find(k => k.toLowerCase() === keyLower)
  if (!matchingKey) return []
  return (tableData.value[matchingKey] || [])
    .filter(l => l.lessonType === activeType.value)
    .sort((a, b) => b.displayOrder - a.displayOrder)
})

// currentLesson: lesson matching the student's actual active week, only when viewing active grade/term.
const currentLesson = computed(() => {
  const isViewingActiveGT =
    selectedGrade.value.toLowerCase() === currentGrade.value.toLowerCase() &&
    selectedTerm.value.toLowerCase() === currentTerm.value.toLowerCase()
  if (!isViewingActiveGT || !lessons.value.length) return null
  const maxWeek = lessons.value[0].displayOrder // lessons sorted descending
  const week = Math.min(Math.max(currentAccessibleWeek.value, 1), maxWeek)
  return lessons.value.find(l => l.displayOrder === week) || null
})

// ── Data loading ───────────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    const studentId = auth.username
    const [lessonsRes, crRes, configRes, courseRes, prRes] = await Promise.all([
      getData('lesson/getAllLessonsInGradeAndTermDictionary', studentId ? { studentId } : {}),
      studentId ? getData(`classRoom/getAllActiveClassRoomsForStudent/${studentId}`) : Promise.resolve(null),
      getData('common/GetGlobalConfig', null, { isShowLoading: false }),
      getData('course', { pageIndex: 1, pageSize: 9999999, orderBy: 'CreatedTime', orderDirection: 'ASC' }, { isShowLoading: false }),
      studentId ? getData('/student/getAllPurchaseRecords', { studentId, objectType: 'Lesson', startExpiryTime: new Date() }, { isShowLoading: false }) : Promise.resolve(null),
    ])

    if (lessonsRes?.result) tableData.value = lessonsRes.result

    if (configRes?.code === '200' && configRes?.result?.scopeList) {
      const map = {}
      for (const s of configRes.result.scopeList) map[s.name] = s
      scopeConfig.value = map
    }

    if (configRes?.code === '200' && configRes?.result) {
      globalConfigKV.value = configRes.result.keyValues?.items || []
    }

    if (courseRes?.code === '200' && courseRes?.result) courseList.value = courseRes.result.list || []
    if (prRes?.code === '200' && Array.isArray(prRes?.result)) purchasedRecords.value = prRes.result

    if (crRes?.result) {
      const rooms = Array.isArray(crRes.result) ? crRes.result : (crRes.result.list || [])
      studentInClassRooms.value = rooms
      initClassroom(rooms)
    }

    // No active class → default the filter to the first grade-term in the data
    if (!selectedGrade.value || !selectedTerm.value) {
      const first = Object.values(tableData.value || {})
        .filter(arr => arr?.length)
        .map(arr => arr[0])
        .sort((a, b) => (a.gradeValue * 10 + a.termValue) - (b.gradeValue * 10 + b.termValue))[0]
      if (first) {
        selectedGrade.value = first.grade
        selectedTerm.value = first.term
      }
    }

    await nextTick()
    ensureActiveTypeHasLessons()
  } catch (e) {
    console.error('JETree load error:', e)
  } finally {
    loading.value = false
    await nextTick()
    if (currentLesson.value) {
      // Expand the current lesson's resource panel by default, then reveal it.
      expandedIds.value = new Set([currentLesson.value.lessonId])
      nextTick(() => setTimeout(() => scrollExpandedIntoView(currentLesson.value, true), 420))
    }
  }
}

async function loadPoints() {
  try {
    const res = await getData(`points/student/${auth.username}`, null, { isShowLoading: false })
    if (res?.code === '200' && res?.result) totalPoints.value = res.result.points || 0
  } catch { /* silent */ }
}

function initClassroom(rooms) {
  let active = rooms.find(c => c.classRoom.activeStatus === 2048)
  if (!active && rooms.length) {
    active = [...rooms].sort((a, b) =>
      (b.classRoom.gradeValue * 10 + b.classRoom.termValue) -
      (a.classRoom.gradeValue * 10 + a.classRoom.termValue)
    )[0]
  }
  if (active) {
    currentGrade.value = active.classRoom.grade
    currentTerm.value = active.classRoom.term
    selectedGrade.value = active.classRoom.grade
    selectedTerm.value = active.classRoom.term
    if (active.classRoom.startDate) {
      const s = new Date(active.classRoom.startDate)
      const startMidnight = new Date(s.getFullYear(), s.getMonth(), s.getDate())
      const now = new Date()
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const diffDays = Math.round((todayMidnight - startMidnight) / 86400000)
      currentWeek.value = Math.max(0, Math.floor(diffDays / 7) + 1)
    }
  }
}

function ensureActiveTypeHasLessons() {
  if (lessons.value.length > 0) return
  const keyLower = `${selectedGrade.value}-${selectedTerm.value}`.toLowerCase()
  const matchingKey = Object.keys(tableData.value).find(k => k.toLowerCase() === keyLower)
  const allLessons = matchingKey ? (tableData.value[matchingKey] || []) : []
  const first = courseTypes.map(t => t.value).find(t => allLessons.some(l => l.lessonType === t))
  if (first) activeType.value = first
}

// ── Navigation ─────────────────────────────────────────────────────────────────
function setActiveType(type) {
  activeType.value = type
  nextTick(() => {
    if (!gradeOptions.value.some(g => g.value === selectedGrade.value)) {
      selectedGrade.value = gradeOptions.value[0]?.value ?? ''
    }
    nextTick(() => {
      if (!termOptions.value.some(t => t.value === selectedTerm.value)) {
        selectedTerm.value = termOptions.value[0]?.value ?? ''
      }
      nextTick(() => {
        if (currentLesson.value) scrollToLeaf(currentLesson.value)
      })
    })
  })
}

function onYearConfirm({ selectedOptions }) {
  showYearPicker.value = false
  const grade = selectedOptions?.[0]?.value
  if (!grade || grade === selectedGrade.value) return
  selectedGrade.value = grade
  nextTick(() => {
    if (termOptions.value.length > 0) {
      selectedTerm.value = termOptions.value[0].value
    }
    nextTick(() => ensureActiveTypeHasLessons())
  })
}

function onTermConfirm({ selectedOptions }) {
  showTermPicker.value = false
  const term = selectedOptions?.[0]?.value
  if (!term || term === selectedTerm.value) return
  selectedTerm.value = term
  nextTick(() => ensureActiveTypeHasLessons())
}

function onTypeConfirm({ selectedOptions }) {
  showTypePicker.value = false
  const type = selectedOptions?.[0]?.value
  if (!type || type === activeType.value) return
  setActiveType(type)
}

function jumpToCurrentClassroom() {
  selectedGrade.value = currentGrade.value
  selectedTerm.value = currentTerm.value
  nextTick(() => {
    ensureActiveTypeHasLessons()
    nextTick(() => {
      if (!currentLesson.value) return
      expandedIds.value = new Set([currentLesson.value.lessonId])
      // Wait for the list re-render + the 0.32s expand animation, then bring the
      // whole resource panel into view (scrolls to bottom when it's the last leaf).
      nextTick(() => setTimeout(() => scrollExpandedIntoView(currentLesson.value, true), 360))
    })
  })
}

function scrollToLeaf(leaf) {
  if (!leaf || !treeScroll.value) return
  const el = treeScroll.value.querySelector(`[data-lid="${leaf.lessonId}"]`)
  if (!el) return
  const sr = treeScroll.value
  const top = sr.scrollTop + el.getBoundingClientRect().top - sr.getBoundingClientRect().top
    - sr.clientHeight / 2 + el.clientHeight / 2
  animateScrollTo(sr, Math.max(0, top))
}

// Smooth-scroll a container with an eased rAF loop. Native `behavior: 'smooth'`
// is unreliable inside the Capacitor WebView (esp. iOS), so we animate manually.
function animateScrollTo(el, to, duration = 440) {
  to = Math.max(0, Math.min(to, el.scrollHeight - el.clientHeight))
  const start = el.scrollTop
  const change = to - start
  if (Math.abs(change) < 2) return
  const t0 = performance.now()
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) // easeInOutQuad
  function frame(now) {
    const p = Math.min(1, (now - t0) / duration)
    el.scrollTop = start + change * ease(p)
    if (p < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

// After a leaf expands, reveal its resource panel with a downward animation:
// scroll so the NEXT leaf comes into view (whole panel shown, next leaf peeking),
// or all the way to the bottom for the last leaf.
// force = true always repositions (used by the return-to-current jump, where the
// leaf may currently be off-screen); otherwise only acts when the panel is clipped.
function scrollExpandedIntoView(lesson, force = false) {
  const sr = treeScroll.value
  if (!sr) return
  const rows = [...sr.querySelectorAll('.jt-row')]
  const row = sr.querySelector(`[data-lid="${lesson.lessonId}"]`)
  const idx = rows.indexOf(row)
  if (!row || idx < 0) return

  const srRect = sr.getBoundingClientRect()
  const rowRect = row.getBoundingClientRect()
  const gap = 16
  const isLast = idx === rows.length - 1
  const hiddenBelow = rowRect.bottom > srRect.bottom - gap
  const tooTall = row.offsetHeight + gap * 2 >= srRect.height

  // Already fully in view → leave the scroll position alone
  if (!force && !hiddenBelow && !tooTall) return

  let target
  if (isLast) {
    // Last leaf → scroll to the very bottom
    target = sr.scrollHeight - sr.clientHeight
  } else if (tooTall) {
    // Taller than the viewport → pin the head near the top so all resources are reachable
    target = sr.scrollTop + (rowRect.top - srRect.top) - gap
  } else {
    // Bring the next leaf's top just above the nav so the whole panel shows + next peeks in
    const nextRect = rows[idx + 1].getBoundingClientRect()
    target = sr.scrollTop + (nextRect.top - srRect.top) - (srRect.height - gap)
  }
  animateScrollTo(sr, target, 440)
}

// ── Purchase / unlock helpers ──────────────────────────────────────────────────
function getGenericValue(key, defaultValue = 0) {
  const kv = globalConfigKV.value.find(e => e.key === key)
  return kv ? parseFloat(kv.value) : defaultValue
}

function hasAnyPurchase(lesson) {
  return purchasedRecords.value.some(r => r.objectId === lesson.lessonId)
}

function isBasicUnlocked(lesson, itemId) {
  if (purchasedRecords.value.some(r => r.objectId === lesson.lessonId && r.itemId === itemId)) return true
  return isUnlocked(lesson)
}

function isExtraUnlocked(lesson, itemId) {
  if (purchasedRecords.value.some(r => r.objectId === lesson.lessonId && r.itemId === itemId)) return true
  return isUnlocked(lesson)
}

function calculateUnlockData(lesson, itemId, isExtra) {
  const ratio = getGenericValue('CASH_TO_POINTS_RATIO', 10)
  const durationDays = getGenericValue('LESSON_UNLOCK_DURATION_DAYS', 180)
  const expiryTime = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
  let points, discountPoints

  if (isExtra) {
    const keyMap = {
      ExtraFoundationExercise: 'POINTS_FOR_PURCHASE_FOUNDATION_EXERCISE',
      ExtraDevelopmentExercise: 'POINTS_FOR_PURCHASE_DEVELOPMENT_EXERCISE',
      ExtraEnrichmentExercise: 'POINTS_FOR_PURCHASE_ENRICHMENT_EXERCISE',
      RevisionExercise: 'POINTS_FOR_PURCHASE_REVISION_EXERCISE',
    }
    const ptsPerPage = getGenericValue(keyMap[itemId] || '', 10)
    const pages = lesson[`pagesFor${itemId}`] || 1
    points = Math.ceil(ptsPerPage * pages)
    discountPoints = 0
  } else {
    const discountKeyMap = {
      'Replay(A)': 'POINTS_CALCULATE_DISCOUNT_FOR_REPLAY_HOT',
      'Replay(B)': 'POINTS_CALCULATE_DISCOUNT_FOR_REPLAY',
      'Homework': 'POINTS_CALCULATE_DISCOUNT_FOR_HOMEWORK',
      'Answer': 'POINTS_CALCULATE_DISCOUNT_FOR_ANSWER',
    }
    const discount = getGenericValue(discountKeyMap[itemId] || '', 0.1)
    const course = courseList.value.find(c => c.courseId === lesson.courseId || c.grade === lesson.grade)
    if (!course) return { points: 0, discountPoints: 0, durationDays, expiryTime }

    let maxGrade = 0, maxTerm = 0
    if (studentInClassRooms.value.length) {
      studentInClassRooms.value.forEach(e => {
        maxGrade = Math.max(e.classRoom.gradeValue, maxGrade)
        maxTerm = Math.max(e.classRoom.termValue, maxTerm)
      })
    } else { maxGrade = 6; maxTerm = 3 }

    const step = getGenericValue('POINTS_CALCULATE_STEP_FOR_GRADE', 0.2) / 4
      * ((lesson.gradeValue - maxGrade) * 4 + (lesson.termValue - maxTerm))
    const promotion = getGenericValue(
      studentInClassRooms.value.length ? 'POINTS_CALCULATE_ACTIVE_PROMOTION' : 'POINTS_CALCULATE_INACTIVE_PROMOTION', 1
    )
    const rawPoints = course.unitPrice * course.lessonHours * discount * ratio * (1 + step)
    points = Math.ceil(rawPoints * promotion)
    discountPoints = Math.max(0, Math.ceil(rawPoints) - points)
  }

  return { points, discountPoints, durationDays, expiryTime }
}

async function handleUnlock(lesson, itemId, linkText, isExtra) {
  if (isPendingCurrentTerm(lesson)) {
    showDialog({
      title: linkText,
      message: 'Locked for now! This unlocks at midnight after your lesson. 💤',
      confirmButtonText: 'OK',
      confirmButtonColor: '#C89239',
    })
    return
  }
  const d = calculateUnlockData(lesson, itemId, isExtra)
  if (d.points === 0) return
  const discountOff = d.discountPoints > 0
    ? ` (${Math.round(100 * (1 - d.points / (d.points + d.discountPoints)))}% off)` : ''
  const expiryStr = d.expiryTime.toLocaleDateString()

  try {
    await showConfirmDialog({
      title: linkText,
      message: `Unlock for ${d.points} points${discountOff}\nValid for ${d.durationDays} days until ${expiryStr}`,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#C89239',
    })
  } catch { return }

  try {
    const res = await postData('/student/purchaseItemViaPoints', {
      objectType: 'Lesson',
      objectId: lesson.lessonId,
      itemId,
      name: lesson.name,
      description: linkText,
      points: d.points,
    }, { isShowLoading: false })

    if (res?.code === '200' && res?.result) {
      purchasedRecords.value.push(res.result)
      showToast({ message: 'Unlocked successfully', type: 'success' })
    } else if (res?.code === '414') {
      showToast({ message: 'Not enough points. Please top up.', type: 'fail' })
    } else {
      showToast({ message: res?.message || 'Purchase failed', type: 'fail' })
    }
  } catch {
    showToast({ message: 'Purchase failed', type: 'fail' })
  }
}

// ── Learning resources for a leaf (same fields/logic as before) ────────────────
function hasLink(url) { return !!(url && url.trim()) }

function leafResources(lesson) {
  const out = []
  const pending = isPendingCurrentTerm(lesson)
  const add = (link, name, subtitle, icon, itemId, isExtra) => {
    if (!hasLink(link)) return
    const unlocked = isExtra ? isExtraUnlocked(lesson, itemId) : isBasicUnlocked(lesson, itemId)
    // For a locked, purchasable resource, surface its unlock cost (was / now).
    // calculateUnlockData returns { points: discounted price, discountPoints: savings },
    // so original price = points + discountPoints (matches JETreeV2 unlockLabel).
    let priceNow = 0, priceWas = 0
    if (!unlocked && !pending) {
      const d = calculateUnlockData(lesson, itemId, isExtra)
      priceNow = d.points
      priceWas = d.points + d.discountPoints
    }
    out.push({ link, name, subtitle, icon, itemId, isExtra, unlocked, pending, priceNow, priceWas })
  }
  add(lesson.replayLinkForHot, 'Replay A', 'Watch lesson', replayAImg, 'Replay(A)', false)
  add(lesson.replayLink, 'Replay B', 'Watch lesson', replayBImg, 'Replay(B)', false)
  add(lesson.homeworkLink, 'Homework', 'View tasks', homeworkImg, 'Homework', false)
  add(lesson.answerLink, 'Homework Ans', 'View solutions', homeworkAnswersImg, 'Answer', false)
  add(lesson.linkForExtraFoundationExercise, 'Extra Foundation', 'Strengthen basics', extraFoundationImg, 'ExtraFoundationExercise', true)
  add(lesson.linkForExtraDevelopmentExercise, 'Extra Development', 'Level up skills', extraDevelopmentImg, 'ExtraDevelopmentExercise', true)
  add(lesson.linkForExtraEnrichmentExercise, 'Extra Enrichment', 'Go beyond', extraEnrichmentImg, 'ExtraEnrichmentExercise', true)
  add(lesson.linkForRevisionExercise, 'Revision Exercise', 'Test your knowledge', revisionExerciseImg, 'RevisionExercise', true)
  return out
}

function onResourceClick(lesson, r) {
  if (r.unlocked) openResource(r.link, r.name)
  else handleUnlock(lesson, r.itemId, r.name, r.isExtra)
}

// ── Leaf expand / detail dialog ────────────────────────────────────────────────
function isExpanded(lesson) { return expandedIds.value.has(lesson.lessonId) }

function toggleExpand(lesson) {
  const willExpand = !expandedIds.value.has(lesson.lessonId)
  // Accordion: only one resource panel open at a time — opening a leaf closes any other.
  expandedIds.value = willExpand ? new Set([lesson.lessonId]) : new Set()
  // Wait for the 0.32s open animation to finish, then bring the panel into view.
  if (willExpand) nextTick(() => setTimeout(() => scrollExpandedIntoView(lesson), 340))
}

function openLeaf(lesson) {
  dlgLeaf.value = lesson
  showLeafPopup.value = true
}

// ── Scope / status / formatting helpers ────────────────────────────────────────
function scopeTitle(lesson) {
  const sc = scopeConfig.value[lesson.scope]
  return (sc && sc.title) || lesson.scope || ''
}

function scopeColor(lesson) {
  const sc = scopeConfig.value[lesson.scope]
  if (!sc?.leaf_BG_Color) return '#8a8f98'
  return sc.leaf_BG_Color.replace(/[\d.]+\)$/, '0.9)')
}

function statusIcon(lesson) {
  if (isUnlocked(lesson)) return unlockIconImg
  if (hasAnyPurchase(lesson)) return halfLockIconImg
  return lockIconImg
}

function statusBg(lesson) {
  if (isUnlocked(lesson)) return unlockBgImg
  if (hasAnyPurchase(lesson)) return halfLockBgImg
  return lockBgImg
}

function openResource(url, title) {
  if (!url) return
  router.push({ name: 'resource', query: { url, title } })
}

function formatGrade(g) {
  return formatter.formatGrade2(g)
}

// Numeric Level (1..4) parsed from the formatted label, for sorting.
function levelNum(g) {
  const n = parseInt(String(formatGrade(g)).replace(/\D/g, ''))
  return Number.isNaN(n) ? 0 : n
}

function formatTerm(t) {
  return String(t).replace(/^term\s*/i, 'Term ')
}

onMounted(() => {
  loadData()
  loadPoints()
  nextTick(() => {
    const tb = document.querySelector('.app-tabbar')
    if (tb) navHeight.value = tb.offsetHeight
  })
})
</script>

<style scoped>
/* ── Page ──────────────────────────────────────────────────────────────────── */
.jetree-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #faf1e3;
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% auto;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* ── Fixed top (transparent, over the golden tree) ─────────────────────────── */
.jt-top {
  flex-shrink: 0;
  padding: 0 16px 8px;
}

.jt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: calc(env(safe-area-inset-top) + 12px);
}

.jt-brand {
  display: flex;
  align-items: center;
  gap: 9px;
}

.jt-brand-ico {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.jt-brand-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 700;
  color: #b78628;
  letter-spacing: 0.2px;
}

.jt-return-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 10px rgba(150, 120, 60, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  /* vertically center within the hero row */
  cursor: pointer;
  opacity: 0.73; /* 27% transparent */
}

.jt-return-ico {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.jt-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 0;
}

.jt-hero-left {
  min-width: 0;
}

.jt-hero-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 44px;
  font-weight: 800;
  line-height: 1.05;
  color: #b5842a;
}

.jt-hero-sub {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 16px;
  color: #c08e3a;
}

.jt-hero-sprig {
  height: 22px;
  width: auto;
  object-fit: contain;
}

.jt-points {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(150, 120, 60, 0.14);
  opacity: 0.73; /* 27% transparent */
}

.jt-points-ico {
  width: 17px;
  height: 17px;
  object-fit: contain;
}

.jt-points-val {
  font-size: 15px;
  font-weight: 800;
  color: #24221f;
}

.jt-points-unit {
  font-size: 13px;
  font-weight: 600;
  color: #a9a08e;
}

/* ── Selection row ─────────────────────────────────────────────────────────── */
.jt-filter-bar {
  display: flex;
  gap: 7px;
  margin-top: 16px;
}

.jt-filter-pill {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 8px 7px;
  border: none;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 10px rgba(150, 120, 60, 0.1);
  cursor: pointer;
  opacity: 0.73; /* 27% transparent */
}

.jt-filter-ico {
  width: 15px;
  height: 15px;
  object-fit: contain;
  flex-shrink: 0;
}

.jt-filter-txt {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 700;
  color: #3a352e;
  text-align: left;
}

/* ── Scroll list ───────────────────────────────────────────────────────────── */
.jt-loading,
.jt-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.jt-loading-txt {
  font-size: 13px;
  color: #b0a58f;
}

.jt-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #faf4ea;
  padding: 6px 16px calc(70px + env(safe-area-inset-bottom));
  opacity: 0.73; /* 27% transparent */
}

.jt-list {
  display: flex;
  flex-direction: column;
}

/* ── Row = trunk column + leaf ─────────────────────────────────────────────── */
.jt-row {
  display: flex;
  gap: 4px;
  padding-bottom: 12px;
}

.jt-trunk-col {
  position: relative;
  width: 38px;
  flex-shrink: 0;
}

.jt-trunk-line {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  bottom: -12px;
  /* bridge the row gap so the trunk reads as one continuous line */
  width: 2px;
  background: #e3bd82;
}

.jt-trunk-line--first {
  top: 28px;
}

.jt-trunk-line--last {
  bottom: auto;
  height: 28px;
}

.jt-badge {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
}

.jt-badge-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.jt-badge-ico {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 19px;
  height: 19px;
  object-fit: contain;
}

/* ── Leaf card ─────────────────────────────────────────────────────────────── */
.jt-leaf {
  flex: 1 1 auto;
  min-width: 0;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid #efe6d5;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(150, 120, 60, 0.06);
  overflow: hidden;
}

.jt-leaf--current,
.jt-leaf--expanded {
  border-color: #e6b96a;
  background: rgba(255, 253, 249, 0.96);
}

.jt-leaf-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  cursor: default;
}

.jt-week {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 800;
  color: #b5842a;
  background: #f6ecd6;
  border-radius: 8px;
  padding: 4px 8px;
  min-width: 40px;
  text-align: center;
}

.jt-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 600;
  color: #24221f;
  cursor: pointer;
}

.jt-scope {
  flex-shrink: 0;
  max-width: 34%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
}

.jt-chev {
  flex-shrink: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  cursor: pointer;
}

/* ── Animated resource panel ───────────────────────────────────────────────── */
.jt-res-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.32s ease;
}

.jt-res-wrap--open {
  grid-template-rows: 1fr;
}

.jt-res-inner {
  overflow: hidden;
  min-height: 0;
}

.jt-res-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 0 10px 12px;
}

.jt-rcard {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px;
  border: 1px solid #f0e8d8;
  border-radius: 12px;
  background: #fffdf9;
  cursor: pointer;
}

.jt-rcard--lock {
  opacity: 0.7;
}

.jt-rcard-ico {
  position: relative;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
}

.jt-rcard-ico img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.jt-rcard--lock .jt-rcard-ico img {
  filter: grayscale(0.5);
  opacity: 0.6;
}

.jt-rcard-lockbadge {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #b9a98a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jt-rcard-txt {
  min-width: 0;
}

.jt-rcard-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #24221f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jt-rcard-sub {
  font-size: 11px;
  color: #a49a86;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jt-rcard-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
}

.jt-price-was {
  font-size: 10.5px;
  color: #b8ad98;
  text-decoration: line-through;
}

.jt-price-now {
  font-size: 12.5px;
  font-weight: 800;
  color: #d9822b;
}

.jt-price-unit {
  font-size: 10px;
  font-weight: 600;
  color: #c0a86f;
}

.jt-res-empty {
  padding: 0 12px 14px;
  font-size: 13px;
  color: #bbb;
  text-align: center;
}

/* ── Lesson detail dialog ──────────────────────────────────────────────────── */
.jt-dlg {
  padding: 8px 20px 24px;
}

.jt-dlg-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #e2dccf;
  margin: 6px auto 14px;
}

.jt-dlg-hd {
  margin-bottom: 14px;
}

.jt-dlg-title {
  font-size: 20px;
  font-weight: 800;
  color: #24221f;
  line-height: 1.3;
}

.jt-dlg-sub {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 6px;
}

.jt-dlg-week {
  font-size: 13px;
  font-weight: 600;
  color: #b5842a;
}

.jt-dlg-dot {
  font-size: 6px;
  color: #d8cdb8;
}

.jt-dlg-scope {
  font-size: 13px;
  font-weight: 600;
}

.jt-dlg-scroll {
  max-height: 46vh;
  overflow-y: auto;
}

.jt-sec-hd {
  font-size: 14px;
  font-weight: 700;
  color: #24221f;
  margin-bottom: 8px;
}

.jt-desc {
  font-size: 14px;
  line-height: 1.7;
  color: #555;
}

.jt-desc :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
