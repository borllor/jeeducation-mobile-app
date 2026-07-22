<template>
  <div class="home" :style="{ backgroundImage: `url(${bgLight})` }">

    <!-- Hero: logo header + welcome, over the golden background -->
    <div class="home-hero">
      <div class="home-header">
        <div class="hd-brand">
          <img :src="brandLogo" class="brand-logo" alt="JE" />
          <span class="brand-title">JE Education</span>
        </div>
        <div class="hd-bell" @click="$router.push('/notifications')">
          <van-badge :content="unreadCount" :show-zero="false" color="#e85c4a" :offset="[-2, 2]">
            <span class="bell-circle">
              <van-icon name="bell" size="20" color="#C89239" />
            </span>
          </van-badge>
        </div>
      </div>

      <div class="welcome-section">
        <div class="welcome-title">Welcome back,</div>
        <div class="welcome-name-row">
          <span class="welcome-name">{{ studentName || 'Student' }}</span>
          <img :src="welcomeNameIcon" class="welcome-sprig" alt="" />
        </div>
        <div class="welcome-sub">Keep growing. You're doing great. <img :src="welcomeGreatIcon" class="welcome-heart"
            alt="" /></div>
      </div>
    </div>

    <!-- Content -->
    <div class="home-body">

      <!-- Current Lesson -->
      <div class="section-card">
        <div class="section-head">
          <div class="section-label">
            <img :src="clIcon" class="section-ico" alt="" />
            <span>Current Lesson</span>
          </div>
          <img :src="gotoJetreeBtn" class="goto-btn" alt="JE Tree" @click="$router.push('/jetree')" />
        </div>
        <div class="cl-info-item cl-info-item--course">
          <img :src="clCourseIcon" class="cl-info-ico" alt="" />
          <span>{{ currentRoomName || '—' }}</span>
        </div>
        <div class="cl-info">
          <div class="cl-info-item">
            <img :src="clYearIcon" class="cl-info-ico" alt="" />
            <span>{{ currentGrade ? formatGrade(currentGrade) : '—' }}</span>
          </div>
          <span class="cl-info-dot">·</span>
          <div class="cl-info-item">
            <img :src="clTermIcon" class="cl-info-ico" alt="" />
            <span>{{ currentTerm ? formatTerm(currentTerm) : '—' }}</span>
          </div>
          <span class="cl-info-dot">·</span>
          <div class="cl-info-item">
            <img :src="clWeekIcon" class="cl-info-ico" alt="" />
            <span>{{ currentLesson ? 'Week ' + currentLesson.weekNum : '—' }}</span>
          </div>
        </div>
        <div class="cl-info-item cl-info-item--name">
          <img :src="clNameIcon" class="cl-info-ico" alt="" />
          <span>{{ currentLesson ? currentLesson.lessonName : '—' }}</span>
        </div>
      </div>

      <!-- Current Learning — tiles for this lesson's available resources only -->
      <div v-if="visibleTiles.length" class="section-card">
        <div class="section-head">
          <div class="section-label">
            <img :src="learningIcon" class="section-ico" alt="" />
            <span>Current Learning</span>
          </div>
        </div>
        <div class="cl-grid">
          <div v-for="tile in visibleTiles" :key="tile.key" class="cl-tile"
            :class="{ 'cl-tile--locked': !tile.unlocked }" :style="{ background: tile.bg }" @click="openTile(tile)">
            <span v-if="!tile.unlocked" class="cl-tile-lock">
              <van-icon name="lock" size="11" color="#fff" />
            </span>
            <img :src="tile.icon" class="cl-tile-ico" alt="" />
            <span class="cl-tile-label">
              <span v-for="(word, i) in tile.label.split(' ')" :key="i" class="cl-tile-word">{{ word }}</span>
            </span>
            <span v-if="!tile.unlocked && tile.pending" class="cl-tile-price cl-tile-price--pending">Soon</span>
            <span v-else-if="!tile.unlocked && tile.priceNow > 0" class="cl-tile-price">
              <span v-if="tile.priceWas > tile.priceNow" class="cl-tile-was">{{ tile.priceWas }}</span>
              <span class="cl-tile-now">{{ tile.priceNow }}</span>
              <span class="cl-tile-unit">pts</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Weekly Report -->
      <div class="section-card">
        <div class="section-head">
          <div class="section-label">
            <img :src="weeklyReportIcon" class="section-ico" alt="" />
            <span>Weekly Report</span>
          </div>
        </div>
        <div class="wr-row">
          <!-- Revision (quiz) -->
          <div class="wr-mini">
            <div class="wr-mini-top">
              <img :src="revisionIcon" v-if="false" class="wr-mini-ico" alt="" />
              <span class="wr-mini-title">Quiz</span>
              <span class="wr-badge wr-badge--blue">W{{ weeklyStats.quiz.weekNum || '—' }}</span>
            </div>
            <div class="wr-mini-mid">
              <div class="wr-score">
                <span class="wr-score-val wr-score-val--blue">{{ nn(weeklyStats.quiz.score) }}</span>
                <span v-if="weeklyStats.quiz.rawScore" class="wr-score-raw">/{{ weeklyStats.quiz.rawScore }}</span>
              </div>
              <div class="wr-points">
                <span class="wr-points-lbl">Points</span>
                <span class="wr-points-val">+{{ weeklyStats.quiz.points || 0 }}</span>
              </div>
            </div>
            <van-progress :percentage="weeklyStats.quiz.percentage || 0" stroke-width="6" color="#4a95e8"
              track-color="#e7f0fb" :show-pivot="false" />
          </div>

          <!-- Weekly Homework -->
          <div class="wr-mini">
            <div class="wr-mini-top">
              <img :src="weeklyHomeworkIcon" v-if="false" class="wr-mini-ico" alt="" />
              <span class="wr-mini-title">Homework</span>
              <span class="wr-badge wr-badge--green">W{{ weeklyStats.homework.weekNum || '—' }}</span>
            </div>
            <div class="wr-mini-mid">
              <div class="wr-score">
                <span class="wr-score-val wr-score-val--green">{{ nn(weeklyStats.homework.score) }}</span>
                <span v-if="weeklyStats.homework.rawScore" class="wr-score-raw">/{{ weeklyStats.homework.rawScore
                }}</span>
              </div>
              <div class="wr-points">
                <span class="wr-points-lbl">Points</span>
                <span class="wr-points-val">+{{ weeklyStats.homework.points || 0 }}</span>
              </div>
            </div>
            <van-progress :percentage="weeklyStats.homework.percentage || 0" stroke-width="6" color="#5cba46"
              track-color="#e8f5e4" :show-pivot="false" />
          </div>
        </div>
      </div>

      <div class="bottom-spacer" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showDialog } from 'vant'
import { getData, postData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

import bgLight from '@/assets/img/new/home-backgroud-light-bg.png'
import brandLogo from '@/assets/img/new/jeeducation-icon.png'
import welcomeNameIcon from '@/assets/img/new/home-welcome-name-icon.png'
import welcomeGreatIcon from '@/assets/img/new/home-welcome-great-icon.png'
import gotoJetreeBtn from '@/assets/img/new/goto-jetree-button.png'
import clIcon from '@/assets/img/new/home-current-lesson-icon.png'
import clCourseIcon from '@/assets/img/new/home-current-lesson-course-icon.png'
import clYearIcon from '@/assets/img/new/home-current-lesson-year-icon.png'
import clWeekIcon from '@/assets/img/new/home-current-lesson-week-icon.png'
import clTermIcon from '@/assets/img/new/home-current-lesson-term-icon.png'
import clNameIcon from '@/assets/img/new/home-current-lesson-name-icon.png'
import learningIcon from '@/assets/img/new/home-current-learning-icon.png'
import replayAImg from '@/assets/img/new/replay-a-icon.png'
import replayBImg from '@/assets/img/new/replay-b-icon.png'
import homeworkImg from '@/assets/img/new/homework-icon.png'
import homeworkAnswersImg from '@/assets/img/new/homework-anwers-icon.png'
import extraFoundationImg from '@/assets/img/new/extra-foundation-icon.png'
import extraDevelopmentImg from '@/assets/img/new/extra-development-icon.png'
import extraEnrichmentImg from '@/assets/img/new/extra-enrichment-icon.png'
import revisionExerciseImg from '@/assets/img/new/revision-exercise-icon.png'
import weeklyReportIcon from '@/assets/img/new/home-weekly-report-icon.png'
import revisionIcon from '@/assets/img/new/home-weekly-report-revision-icon.png'
import weeklyHomeworkIcon from '@/assets/img/new/home-weekly-homework-icon.png'

const auth = useAuthStore()
const router = useRouter()
const studentName = ref('')
const currentLesson = ref(null)
const currentGrade = ref('')
const currentTerm = ref('')
const currentRoomName = ref('')
// Full lesson object backing the Current Learning tiles (carries link fields,
// grade/term/values, courseId, pagesFor* — needed by the JETree unlock logic).
const currentLessonObj = ref(null)
// Unlock/purchase state — ported verbatim from JETreeView so Home's Current
// Learning tiles click/view identically to JETree's current-lesson resources.
const currentWeek = ref(0)
const studentInClassRooms = ref([]) // ACTIVE-only subset (matches what JETree loads)
const purchasedRecords = ref([])
const courseList = ref([])
const globalConfigKV = ref([])
const notifications = ref([])
const weeklyStats = ref({
  quiz: { weekNum: null, score: null, rawScore: null, percentage: 0, points: 0 },
  homework: { weekNum: null, score: null, rawScore: null, percentage: 0, points: 0 },
})

const unreadCount = computed(() => notifications.value.filter(n => n.status === 4).length)

// Each tile ↔ its lesson link field + purchase itemId + basic/extra flag — the
// same fields/ids JETreeView keys its resource cards off. Tile shows only when
// its link is non-empty.
const learningTiles = [
  { key: 'replayA', label: 'Replay A', icon: replayAImg, bg: '#e9f1fb', field: 'replayLinkForHot', itemId: 'Replay(A)', isExtra: false },
  { key: 'replayB', label: 'Replay B', icon: replayBImg, bg: '#fdf1e4', field: 'replayLink', itemId: 'Replay(B)', isExtra: false },
  { key: 'homework', label: 'Homework', icon: homeworkImg, bg: '#ecf5e9', field: 'homeworkLink', itemId: 'Homework', isExtra: false },
  { key: 'homeworkAnswers', label: 'Homework Answers', icon: homeworkAnswersImg, bg: '#f1ebfa', field: 'answerLink', itemId: 'Answer', isExtra: false },
  { key: 'extraFoundation', label: 'Extra Foundation', icon: extraFoundationImg, bg: '#e7f4f1', field: 'linkForExtraFoundationExercise', itemId: 'ExtraFoundationExercise', isExtra: true },
  { key: 'extraDevelopment', label: 'Extra Development', icon: extraDevelopmentImg, bg: '#fdf1e4', field: 'linkForExtraDevelopmentExercise', itemId: 'ExtraDevelopmentExercise', isExtra: true },
  { key: 'extraEnrichment', label: 'Extra Enrichment', icon: extraEnrichmentImg, bg: '#fdecec', field: 'linkForExtraEnrichmentExercise', itemId: 'ExtraEnrichmentExercise', isExtra: true },
  { key: 'revisionExercise', label: 'Revision Exercise', icon: revisionExerciseImg, bg: '#e7f4f1', field: 'linkForRevisionExercise', itemId: 'RevisionExercise', isExtra: true },
]

const WEEKS_MAX = 10
const clamp = v => Math.max(0, Math.min(100, v))
const nn = v => (v != null ? v : '—')
const hasLink = u => !!(u && String(u).trim())

// ── Unlock logic (ported verbatim from JETreeView) ─────────────────────────────
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

function isUnlocked(lesson) {
  if (!lesson?.grade || !lesson?.term) return false
  const gt = `${lesson.grade.toLowerCase()}-${lesson.term.toLowerCase()}`
  if (gt === latestActiveGT.value) {
    if (lesson.displayOrder < currentWeek.value) return true
    if (lesson.displayOrder === currentWeek.value && isNextLessonPreviewDay.value) return true
    return false
  }
  if (activeGTs.value.has(gt)) return true
  return false
}

// Locked lesson in the student's current grade-term: not purchasable, unlocks
// automatically after the lesson is taught.
function isPendingCurrentTerm(lesson) {
  if (!lesson?.grade || !lesson?.term) return false
  const gt = `${lesson.grade.toLowerCase()}-${lesson.term.toLowerCase()}`
  return gt === latestActiveGT.value && !isUnlocked(lesson)
}

function getGenericValue(key, defaultValue = 0) {
  const kv = globalConfigKV.value.find(e => e.key === key)
  return kv ? parseFloat(kv.value) : defaultValue
}

function isItemUnlocked(lesson, itemId) {
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

// Current Learning tiles for the current lesson — mirrors JETreeView.leafResources:
// each visible tile carries unlocked / pending / price(was,now) so it renders and
// clicks exactly like a JETree resource card.
const visibleTiles = computed(() => {
  const lesson = currentLessonObj.value
  if (!lesson) return []
  const pending = isPendingCurrentTerm(lesson)
  const out = []
  for (const t of learningTiles) {
    const link = lesson[t.field]
    if (!hasLink(link)) continue
    const unlocked = isItemUnlocked(lesson, t.itemId)
    let priceNow = 0, priceWas = 0
    if (!unlocked && !pending) {
      const d = calculateUnlockData(lesson, t.itemId, t.isExtra)
      priceNow = d.points
      priceWas = d.points + d.discountPoints
    }
    out.push({ ...t, link: String(link).trim(), unlocked, pending, priceNow, priceWas })
  }
  return out
})

// Click / view action — identical to JETreeView.onResourceClick + handleUnlock.
function openTile(tile) {
  if (tile.unlocked) {
    router.push({ name: 'resource', query: { url: tile.link, title: tile.label } })
    return
  }
  handleUnlock(currentLessonObj.value, tile.itemId, tile.label, tile.isExtra)
}

async function handleUnlock(lesson, itemId, linkText, isExtra) {
  if (!lesson) return
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

function formatGrade(grade) {
  const g = String(grade).replace(/\D/g, '')
  return g ? `Year ${g}` : grade
}

function formatTerm(term) {
  const t = String(term).replace(/\D/g, '')
  return t ? `Term ${t}` : term
}

function findLastWeekNum(hwRecords, quizRecords) {
  let lastHw = -1, lastQuiz = -1
  for (let w = WEEKS_MAX; w >= 1; w--) {
    if (hwRecords[`w${w}`] && lastHw === -1) lastHw = w
    if (quizRecords[`w${w}`] && lastQuiz === -1) lastQuiz = w
  }
  return Math.max(lastHw, lastQuiz, 1)
}

async function loadStudentProfile() {
  try {
    const res = await getData(`/student/${auth.username}`, null, { isShowLoading: false })
    if (res?.code === '200' && res?.result) {
      studentName.value = res.result.firstName || ''
    }
  } catch { /* silent */ }
}

async function loadNotifications() {
  try {
    const res = await getData(
      `notification/getNotificationsFor/${auth.username}`,
      null,
      { isShowLoading: false }
    )
    if (res?.code === '200' && Array.isArray(res?.result)) {
      notifications.value = res.result
    }
  } catch { /* silent */ }
}

async function loadWeeklyReport() {
  try {
    const res = await getData(
      'weeklyReport/getCurrentWeeklyReportAndRecordsForCurrentStudent',
      null,
      { isShowLoading: false }
    )
    if (res?.code === '200' && res?.result) {
      const report = res.result
      // Grade/term fallback only — the active classroom (loadCurrentLesson) is
      // authoritative; the report row can lag a term behind
      if (!currentGrade.value) currentGrade.value = report.grade || ''
      if (!currentTerm.value) currentTerm.value = report.term || ''
      const records = report.records || {}
      const hwRecords = records.homework?.[0] || {}
      const quizRecords = records.quiz?.[0] || {}

      const lastWeek = findLastWeekNum(hwRecords, quizRecords)
      const quizWeek = lastWeek
      const hwWeek = lastWeek > 1 ? lastWeek - 1 : lastWeek

      const quizScore = quizRecords[`w${quizWeek}`] ?? null
      const quizRaw = report[`quizW${quizWeek}RawScore`] || null
      const hwScore = hwRecords[`w${hwWeek}`] ?? null
      // Homework has no per-week raw-score column in the report schema
      const hwRaw = report[`homeworkW${hwWeek}RawScore`] || null

      weeklyStats.value = {
        quiz: {
          weekNum: quizWeek,
          score: quizScore,
          rawScore: quizRaw,
          percentage: quizRaw ? clamp(Math.round((quizScore / quizRaw) * 100)) : 0,
          points: quizScore ? Math.round(quizScore) : 0,
        },
        homework: {
          weekNum: hwWeek,
          score: hwScore,
          rawScore: hwRaw,
          percentage: hwRaw ? clamp(Math.round((hwScore / hwRaw) * 100)) : (hwScore ? 100 : 0),
          points: hwScore ? Math.round(hwScore) : 0,
        },
      }
    }
  } catch { /* silent */ }
}

// Current lesson comes from the classroom start date (same rule as JETreeV2 /
// JETreeView) — NOT from weekly-report scores: score records lag behind the
// teaching schedule and the report schema only goes to w10, so an 11-week term
// could never show week 11.
async function loadCurrentLesson() {
  try {
    const res = await getData(
      `classRoom/getAllActiveAndUnstartedClassRooms/${auth.username}`,
      null,
      { isShowLoading: false }
    )
    if (res?.code !== '200' || !res?.result) return
    const rooms = Array.isArray(res.result) ? res.result : (res.result.list || [])
    if (!rooms.length) return
    // Prefer an Active (2048) classroom; only if none exists fall back to an
    // Unstarted (1024) one. Within the chosen group, take the highest grade/term.
    const actives = rooms.filter(cr => cr.classRoom.activeStatus === 2048)
    const unstarted = rooms.filter(cr => cr.classRoom.activeStatus === 1024)
    const pool = actives.length ? actives : unstarted
    if (!pool.length) return
    // Unlock/pricing must match JETree, which only loads ACTIVE classrooms —
    // feed the active-only subset to the ported unlock logic.
    studentInClassRooms.value = actives
    const active = [...pool].sort((a, b) =>
      (b.classRoom.gradeValue * 10 + b.classRoom.termValue) -
      (a.classRoom.gradeValue * 10 + a.classRoom.termValue)
    )[0].classRoom
    currentGrade.value = active.grade || currentGrade.value
    currentTerm.value = active.term || currentTerm.value
    currentRoomName.value = active.name || currentRoomName.value
    let accessibleWeek = 0
    if (active.startDate) {
      const s = new Date(active.startDate)
      const startMidnight = new Date(s.getFullYear(), s.getMonth(), s.getDate())
      const now = new Date()
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const diffDays = Math.round((todayMidnight - startMidnight) / 86400000)
      const week = Math.max(0, Math.floor(diffDays / 7) + 1)
      currentWeek.value = week // raw week — the ported isUnlocked() keys off this
      // On lesson day itself this week's lesson hasn't been taught yet
      const unlockDay = (startMidnight.getDay() + 1) % 7
      const isPreviewDay = (todayMidnight.getDay() - unlockDay + 7) % 7 < 6
      accessibleWeek = isPreviewDay ? week : Math.max(0, week - 1)
    }
    await loadLessonList(active.roomId, accessibleWeek)
  } catch { /* silent */ }
}

async function loadLessonList(roomId, accessibleWeek) {
  try {
    const [crRes, dictRes] = await Promise.all([
      getData(`classroom/getAllLessonsInClassRoom/${roomId}`, null, { isShowLoading: false }),
      getData('lesson/getAllLessonsInGradeAndTermDictionary', null, { isShowLoading: false }),
    ])
    if (crRes?.code === '200' && crRes?.result?.list) {
      const lessons = [...crRes.result.list].sort((a, b) => a.displayOrder - b.displayOrder)
      // Clamp: before the term starts → week 1; past the last lesson → last lesson
      const maxWeek = lessons.length ? lessons[lessons.length - 1].displayOrder : 0
      const weekNum = Math.min(Math.max(accessibleWeek, 1), maxWeek)
      const current = lessons.find(l => l.displayOrder === weekNum) || lessons[0]
      if (current) {
        // Learning-resource availability = same rule as JETreeView (link non-empty).
        // Prefer the grade/term dictionary entry — it carries replayLinkForHot for
        // Replay A, which the classroom-lessons projection omits; fall back to the
        // classroom-lessons row for the other 7 when no dictionary match is found.
        let resSource = current
        if (dictRes?.result) {
          const keyLower = `${currentGrade.value}-${currentTerm.value}`.toLowerCase()
          const matchKey = Object.keys(dictRes.result).find(k => k.toLowerCase() === keyLower)
          const dictLesson = matchKey
            ? (dictRes.result[matchKey] || []).find(l => l.displayOrder === current.displayOrder)
            : null
          if (dictLesson) resSource = dictLesson
        }
        currentLessonObj.value = resSource // full object → drives visibleTiles unlock logic
        currentLesson.value = {
          lessonName: current.lessonName,
          weekNum: current.displayOrder,
        }
      }
    }
  } catch { /* silent */ }
}

// Pricing/purchase config — same sources JETreeView loads, so unlock costs and
// purchased-state match exactly.
async function loadUnlockData() {
  try {
    const studentId = auth.username
    const [configRes, courseRes, prRes] = await Promise.all([
      getData('common/GetGlobalConfig', null, { isShowLoading: false }),
      getData('course', { pageIndex: 1, pageSize: 9999999, orderBy: 'CreatedTime', orderDirection: 'ASC' }, { isShowLoading: false }),
      studentId ? getData('/student/getAllPurchaseRecords', { studentId, objectType: 'Lesson', startExpiryTime: new Date() }, { isShowLoading: false }) : Promise.resolve(null),
    ])
    if (configRes?.code === '200' && configRes?.result) {
      globalConfigKV.value = configRes.result.keyValues?.items || []
    }
    if (courseRes?.code === '200' && courseRes?.result) courseList.value = courseRes.result.list || []
    if (prRes?.code === '200' && Array.isArray(prRes?.result)) purchasedRecords.value = prRes.result
  } catch { /* silent */ }
}

onMounted(async () => {
  await Promise.all([
    loadStudentProfile(),
    loadWeeklyReport(),
    loadCurrentLesson(),
    loadNotifications(),
    loadUnlockData(),
  ])
})
</script>

<style scoped>
.home {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #f9f3ed;
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% auto;
  background-attachment: local;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* ── Hero (transparent, over the golden background) ── */
.home-hero {
  min-height: 88vw;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: calc(env(safe-area-inset-top) + 14px);
}

.hd-brand {
  display: flex;
  align-items: center;
  gap: 9px;
}

.brand-logo {
  height: 34px;
  width: auto;
  object-fit: contain;
}

.brand-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 700;
  color: #b78628;
  letter-spacing: 0.2px;
}

.hd-bell {
  cursor: pointer;
}

.bell-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: 0.73;
  /* 27% transparent */
}

/* Welcome sits at the bottom of the hero, just above the first card */
.welcome-section {
  margin-top: auto;
  margin-bottom: auto;
}

.welcome-title {
  font-size: 26px;
  font-weight: 500;
  color: #624A28;
  line-height: 1.2;
}

.welcome-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.welcome-name {
  font-size: 46px;
  font-weight: 800;
  color: #624A28;
  line-height: 1.2;
  /* Trim a long name with an ellipsis so the row never exceeds the panel */
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.welcome-sprig {
  height: 52px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.welcome-sub {
  font-size: 15px;
  color: #624A28;
  margin-top: 12px;
}

.welcome-heart {
  height: 18px;
  width: auto;
  object-fit: contain;
  vertical-align: -3px;
}

/* ── Body ── */
.home-body {
  padding: 0 16px calc(64px + env(safe-area-inset-bottom));
}

/* ── Section card ── */
.section-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 4px 18px rgba(120, 100, 60, 0.08);
  backdrop-filter: blur(4px);
  opacity: 0.73;
  /* 27% transparent */
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 17px;
  font-weight: 700;
  color: #24221f;
}

.section-ico {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex-shrink: 0;
}

.goto-btn {
  height: 36px;
  width: auto;
  object-fit: contain;
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Current Lesson ── */
/* Course (classroom name) sits on its own first row */
.cl-info-item--course {
  min-width: 0;
  margin-top: 14px;
}

.cl-info-item--course span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cl-info {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-top: 10px;
}

.cl-info-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 15px;
  color: #4a453d;
  font-weight: 500;
  flex-shrink: 0;
  /* Year & Week keep their full width */
}

/* Lesson name takes the remaining space and truncates to keep the row on one line */
/* Lesson name sits on its own second row */
.cl-info-item--name {
  min-width: 0;
  margin-top: 10px;
}

.cl-info-item--name span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cl-info-ico {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}

.cl-info-dot {
  color: #c9c2b4;
  margin: 0 10px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── Current Learning grid ── */
.cl-grid {
  display: grid;
  /* minmax(0, 1fr) lets tiles shrink to fit the panel instead of overflowing it */
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.cl-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 106px;
  border-radius: 15px;
  padding: 12px 6px;
  cursor: pointer;
}

/* Locked resource (not yet taught / purchasable) — dim icon+label + lock badge */
.cl-tile--locked .cl-tile-ico,
.cl-tile--locked .cl-tile-label {
  opacity: 0.45;
  filter: grayscale(0.4);
}

.cl-tile-lock {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #b0a48c;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
}

/* Unlock price (was / now / pts) — mirrors JETree's locked-card price row */
.cl-tile-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 3px;
  margin-top: 6px;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.cl-tile-price--pending {
  font-size: 10.5px;
  font-weight: 700;
  color: #b0a48c;
}

.cl-tile-was {
  font-size: 9.5px;
  color: #b8ad98;
  text-decoration: line-through;
}

.cl-tile-now {
  font-size: 12px;
  font-weight: 800;
  color: #d9822b;
}

.cl-tile-unit {
  font-size: 9px;
  font-weight: 600;
  color: #c0a86f;
}

.cl-tile-ico {
  width: 44px;
  height: 44px;
  max-width: 100%;
  object-fit: contain;
}

.cl-tile-label {
  margin-top: 9px;
  width: 100%;
  font-size: 12.5px;
  line-height: 1.25;
  font-weight: 600;
  text-align: center;
  color: #3a352e;
}

/* Each word on its own line; trim only that word with an ellipsis if it's too
   long for the tile (no word-break) */
.cl-tile-word {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Weekly Report ── */
.wr-row {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}

.wr-mini {
  flex: 1 1 0;
  min-width: 0;
  background: #fbfaf7;
  border: 1px solid #efeadf;
  border-radius: 14px;
  padding: 12px;
}

.wr-mini-top {
  display: flex;
  align-items: center;
  gap: 7px;
}

.wr-mini-ico {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.wr-mini-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: #24221f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wr-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  border-radius: 7px;
  padding: 2px 7px;
  line-height: 1.3;
}

.wr-badge--blue {
  background: #4a95e8;
}

.wr-badge--green {
  background: #5cba46;
}

.wr-mini-mid {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 12px 0 10px;
}

.wr-score {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.wr-score-val {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.wr-score-val--blue {
  color: #4a95e8;
}

.wr-score-val--green {
  color: #5cba46;
}

.wr-score-raw {
  font-size: 15px;
  color: #b3aca0;
  font-weight: 500;
}

.wr-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.wr-points-lbl {
  font-size: 10px;
  color: #a49c8e;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 700;
}

.wr-points-val {
  font-size: 20px;
  font-weight: 800;
  color: #C89239;
  line-height: 1;
}

.bottom-spacer {
  height: 4px;
}
</style>
