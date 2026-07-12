<template>
  <div class="home">
    <!-- Header -->
    <div class="home-header">
      <div class="hd-left">
        <img :src="jetreeIcon" class="header-logo" alt="JE" />
      </div>
      <span class="header-title">JE Education</span>
      <div class="hd-right">
        <van-badge :content="unreadCount" :show-zero="false" color="#e55" @click="$router.push('/notifications')">
          <van-icon name="bell" size="22" color="#C89239" class="bell-icon" />
        </van-badge>
      </div>
    </div>

    <!-- Scrollable body -->
    <div class="home-body">

      <!-- Welcome -->
      <div class="welcome-section">
        <div class="welcome-title">Welcome back,</div>
        <div class="welcome-name-row">
          <span class="welcome-name">{{ studentName || 'Student' }}</span>
          <div class="welcome-points" @click="$router.push('/me')">
            <img :src="pointsIcon" class="welcome-points-icon" alt="" />
            <span class="welcome-points-value">{{ totalPoints }}</span>
          </div>
        </div>
        <div class="welcome-sub">Keep growing. You're doing great. 🌟</div>
      </div>

      <!-- Row 1: Current Lesson -->
      <div class="section-card current-lesson-card">
        <div class="section-row" style="margin-bottom: 10px;">
          <div class="section-label">
            <van-icon name="records-o" color="#C89239" size="16" />
            Current Lesson
          </div>
          <span class="view-all" @click="$router.push('/jetree')">JE Tree &rsaquo;</span>
        </div>
        <div class="cl-top">
          <div class="cl-grade-term">
            <span v-if="currentGrade">{{ formatGrade(currentGrade) }}</span>
            <span v-if="currentGrade && currentTerm" class="cl-sep">·</span>
            <span v-if="currentTerm">{{ formatTerm(currentTerm) }}</span>
            <span v-if="!currentGrade && !currentTerm" class="cl-empty-gt">Loading...</span>
          </div>
          <van-tag v-if="currentLesson" color="#C89239" text-color="#fff" size="small">
            W{{ currentLesson.weekNum }}
          </van-tag>
        </div>
        <div v-if="currentLesson" class="cl-name">{{ currentLesson.lessonName }}</div>
        <div v-else class="cl-name cl-name--empty">—</div>
        <van-progress v-if="currentLesson" :percentage="lessonProgress" stroke-width="5" color="#C89239"
          track-color="#f0e8d0" :show-pivot="false" class="cl-progress" />
        <div v-if="currentLesson" class="cl-pct">{{ lessonProgress }}% of term complete</div>
      </div>

      <!-- Row 2: Current Learning -->
      <div v-if="currentLesson" class="section-card">
        <div class="section-row">
          <div class="section-label">
            <van-icon name="play-circle-o" color="#C89239" size="16" />
            Current Learning
          </div>
          <span class="view-all" @click="$router.push('/jetree')">JE Tree &rsaquo;</span>
        </div>
        <div class="cl-lesson-detail">
          <div class="cl-meta-row">
            <span class="cl-week-lbl">Week {{ currentLesson.weekNum }}</span>
            <span class="cl-dot">●</span>
            <span class="cl-scope-lbl" :style="{ color: currentScopeColor }">{{ currentScopeTitle }}</span>
            <span class="cl-dot">●</span>
            <span class="cl-lesson-lbl">{{ currentLesson.lessonName }}</span>
          </div>
        </div>
        <div class="cl-resources">
          <div class="cl-resource-item" @click="$router.push('/jetree')">
            <img :src="replayIcon" class="cl-res-icon" alt="" />
            <div class="cl-res-body">
              <div class="cl-res-name">Replay (A)</div>
              <div class="cl-res-sub">Lesson recording</div>
            </div>
            <van-icon name="arrow" color="#ddd" size="14" />
          </div>
          <div class="cl-resource-item" @click="$router.push('/jetree')">
            <img :src="replayIcon" class="cl-res-icon cl-res-icon--b" alt="" />
            <div class="cl-res-body">
              <div class="cl-res-name">Replay (B)</div>
              <div class="cl-res-sub">Alternative recording</div>
            </div>
            <van-icon name="arrow" color="#ddd" size="14" />
          </div>
          <div class="cl-resource-item" @click="$router.push('/jetree')">
            <img :src="homeworkIcon" class="cl-res-icon" alt="" />
            <div class="cl-res-body">
              <div class="cl-res-name">Homework</div>
              <div class="cl-res-sub">Submit your work</div>
            </div>
            <van-icon name="arrow" color="#ddd" size="14" />
          </div>
          <div class="cl-resource-item cl-resource-item--last" @click="$router.push('/jetree')">
            <img :src="unlockIcon" class="cl-res-icon" alt="" />
            <div class="cl-res-body">
              <div class="cl-res-name">Answer</div>
              <div class="cl-res-sub">Review solutions</div>
            </div>
            <van-icon name="arrow" color="#ddd" size="14" />
          </div>
        </div>
      </div>

      <!-- Row 3: Weekly Quiz -->
      <div class="section-card">
        <div class="section-row">
          <div class="section-label">
            <van-icon name="chart-trending-o" color="#C89239" size="16" />
            Weekly Quiz
          </div>
          <van-tag color="#409EFF" text-color="#fff" size="small">
            W{{ weeklyStats.quiz.weekNum || '—' }}
          </van-tag>
        </div>
        <div class="hw-score-display">
          <div class="quiz-score-value">
            {{ weeklyStats.quiz.score != null ? weeklyStats.quiz.score : '—' }}
            <span v-if="weeklyStats.quiz.rawScore" class="quiz-raw-score">/{{ weeklyStats.quiz.rawScore }}</span>
          </div>
          <div class="hw-points-badge">
            <span class="hw-points-label">Points</span>
            <span class="hw-points-value quiz-points-value">+{{ weeklyStats.quiz.points || 0 }}</span>
          </div>
        </div>
        <van-progress :percentage="weeklyStats.quiz.percentage || 0" stroke-width="8" color="#409EFF"
          track-color="#e8f4ff" :show-pivot="false" />
      </div>

      <!-- Row 4: Weekly Homework -->
      <div class="section-card">
        <div class="section-row">
          <div class="section-label">
            <van-icon name="todo-list-o" color="#C89239" size="16" />
            Weekly Homework
          </div>
          <van-tag color="#67C23A" text-color="#fff" size="small">
            W{{ weeklyStats.homework.weekNum || '—' }}
          </van-tag>
        </div>
        <div class="hw-score-display">
          <div v-if="weeklyStats.homework.score" class="hw-score-value">
            {{ weeklyStats.homework.score }}
          </div>
          <span v-else class="hw-unsubmitted">
            <img :src="exclamationIcon" class="hw-unsubmitted-ico" alt="" />
            Unsubmitted
          </span>
          <div class="hw-points-badge">
            <span class="hw-points-label">Points</span>
            <span v-if="weeklyStats.homework.score" class="hw-points-value">+{{ weeklyStats.homework.points }}</span>
            <span v-else class="hw-points-value hw-points-deduct">-5</span>
          </div>
        </div>
        <van-progress :percentage="weeklyStats.homework.percentage || 0" stroke-width="8" color="#67C23A"
          track-color="#e8f7e8" :show-pivot="false" />
      </div>

      <!-- Row 5: Quiz Trendline -->
      <div class="section-card">
        <div class="section-row">
          <div class="section-label">
            <van-icon name="chart-trending-o" color="#C89239" size="16" />
            Quiz Trendline
          </div>
          <span class="trendline-sub">Weekly rank %</span>
        </div>
        <div class="trendline-chart">
          <canvas ref="quizChartRef" />
        </div>
      </div>

      <!-- Row 6: Homework Trendline -->
      <div class="section-card">
        <div class="section-row">
          <div class="section-label">
            <van-icon name="todo-list-o" color="#C89239" size="16" />
            Homework Trendline
          </div>
          <span class="trendline-sub">Weekly rank %</span>
        </div>
        <div class="trendline-chart">
          <canvas ref="homeworkChartRef" />
        </div>
      </div>

      <!-- Row 7: Lesson Progress -->
      <div class="section-card" v-if="false">
        <div class="section-row">
          <div class="section-label">
            <van-icon name="notes-o" color="#C89239" size="16" />
            Lesson Progress
          </div>
          <span class="trendline-sub">{{ lessonProgressList.length }} lessons</span>
        </div>
        <div v-if="lessonProgressList.length === 0" class="empty-updates">Loading...</div>
        <div v-for="lesson in lessonProgressList" :key="lesson.lessonId" class="lp-item"
          :class="{ 'lp-item--current': lesson.statusLabel === 'Current' }">
          <span class="lp-week">W{{ lesson.displayOrder }}</span>
          <span class="lp-name">{{ lesson.lessonName }}</span>
          <span class="lp-status" :style="{ color: getLessonStatusColor(lesson.statusLabel) }">
            {{ lesson.statusLabel }}
          </span>
        </div>
      </div>

      <!-- Notifications (preview: latest 3) -->
      <div class="section-card">
        <div class="section-row">
          <div class="section-label">
            <van-icon name="bell" color="#C89239" size="16" />
            Notifications
            <span v-if="unreadCount > 0" class="notif-unread-badge">{{ unreadCount }}</span>
          </div>
          <span class="view-all" @click="$router.push('/notifications')">View All &rsaquo;</span>
        </div>
        <div v-if="notifications.length === 0" class="empty-updates">
          No notifications.
        </div>
        <div v-for="notif in notifications.slice(0, 3)" :key="notif.notificationId" class="notif-item"
          :class="{ 'notif-item--unread': notif.status === 4 }" @click="toggleNotification(notif)">
          <div class="notif-header">
            <span class="notif-dot" :class="notif.status === 4 ? 'notif-dot--unread' : 'notif-dot--read'"></span>
            <div class="notif-subject">{{ notif.subject }}</div>
            <span class="notif-time">{{ formatTime(notif.updatedTime) }}</span>
          </div>
          <div v-if="notif._expanded" class="notif-body" v-html="notif.body"></div>
        </div>
        <div v-if="notifications.length > 3" class="notif-more" @click="$router.push('/notifications')">
          +{{ notifications.length - 3 }} more — View All
        </div>
      </div>

      <div class="bottom-spacer" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { showToast } from 'vant'
import { getData, postData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

import jetreeIcon from '@/assets/img/jetree-icon.png'
import homeworkIcon from '@/assets/img/homework.png'
import unlockIcon from '@/assets/img/unlock2.png'
import pointsIcon from '@/assets/img/points.png'
import replayIcon from '@/assets/img/replay.png'
import exclamationIcon from '@/assets/img/exclamation-mark.png'

const auth = useAuthStore()
const studentName = ref('')
const totalPoints = ref(0)
const weeklyReport = ref({})
const weeklyStats = ref({
  quiz: { weekNum: null, score: null, rawScore: null, percentage: 0, points: 0 },
  homework: { weekNum: null, score: null, percentage: 0, points: 0 },
})
const currentLesson = ref(null)
const currentGrade = ref('')
const currentTerm = ref('')
const lessonProgress = ref(0)
const weeklyProgress = ref([])
const lessonProgressList = ref([])
const notifications = ref([])
const scopeConfig = ref({})

const quizChartRef = ref(null)
const homeworkChartRef = ref(null)
let quizChart = null
let homeworkChart = null
const unreadCount = computed(() => notifications.value.filter(n => n.status === 4).length)

const currentScopeTitle = computed(() => {
  const key = currentLesson.value?.lessonScope
  if (!key) return ''
  const sc = scopeConfig.value[key]
  return (sc && sc.title) || key
})

const currentScopeColor = computed(() => {
  const key = currentLesson.value?.lessonScope
  if (!key) return '#888'
  const sc = scopeConfig.value[key]
  if (!sc?.leaf_BG_Color) return '#888'
  return sc.leaf_BG_Color.replace(/[\d.]+\)$/, '0.7)')
})

const HOMEWORK_PTS_PER_SCORE = 1
const QUIZ_PTS_PER_SCORE = 1
const WEEKS = Array.from({ length: 10 }, (_, i) => i + 1)

function formatGrade(grade) {
  const g = String(grade).replace(/\D/g, '')
  return g ? `Year ${g}` : grade
}

function formatTerm(term) {
  return String(term).replace(/^term\s*/i, 'Term ')
}

function getPoints(type, score) {
  if (!score) return 0
  const rate = type === 'Quiz' ? QUIZ_PTS_PER_SCORE : HOMEWORK_PTS_PER_SCORE
  return Math.round(score * rate)
}

function findLastWeekNum(hwRecords, quizRecords) {
  let lastHw = -1, lastQuiz = -1
  for (let w = 10; w >= 1; w--) {
    if (hwRecords[`w${w}`] && lastHw === -1) lastHw = w
    if (quizRecords[`w${w}`] && lastQuiz === -1) lastQuiz = w
  }
  return Math.max(lastHw, lastQuiz, 1)
}

async function loadStudentProfile() {
  console.log("HomeView.vue", "loadStudentProfile");
  try {
    const res = await getData(`/student/${auth.username}`, null, { isShowLoading: false })
    console.log("loadStudentProfile", res);
    if (res?.code === '200' && res?.result) {
      studentName.value = res.result.firstName || ''
    }
  } catch { /* silent */ }
}

async function loadPoints() {
  console.log("HomeView.vue", "loadPoints");
  try {
    const res = await getData(`points/student/${auth.username}`, null, { isShowLoading: false })
    if (res?.code === '200' && res?.result) {
      totalPoints.value = res.result.points || 0
    }
  } catch { /* silent */ }
}

async function loadGlobalConfig() {
  try {
    const res = await getData('common/GetGlobalConfig', null, { isShowLoading: false })
    if (res?.code === '200' && res?.result?.scopeList) {
      const map = {}
      for (const s of res.result.scopeList) map[s.name] = s
      scopeConfig.value = map
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
      currentGrade.value = report.grade || ''
      currentTerm.value = report.term || ''
      const records = report.records || {}
      const hwRecords = records.homework?.[0] || {}
      const quizRecords = records.quiz?.[0] || {}

      const lastWeek = findLastWeekNum(hwRecords, quizRecords)
      const quizWeek = lastWeek
      const hwWeek = lastWeek > 1 ? lastWeek - 1 : lastWeek

      weeklyStats.value = {
        quiz: {
          weekNum: quizWeek,
          score: quizRecords[`w${quizWeek}`] ?? null,
          rawScore: report[`quizW${quizWeek}RawScore`] || null,
          percentage: Math.round((lastWeek / 10) * 100),
          points: getPoints('Quiz', quizRecords[`w${quizWeek}`]),
        },
        homework: {
          weekNum: hwWeek,
          score: hwRecords[`w${hwWeek}`] ?? null,
          percentage: Math.round((hwWeek / 10) * 100),
          points: getPoints('Homework', hwRecords[`w${hwWeek}`]),
        },
      }

      weeklyReport.value = report

      // Build per-week rank data for trendline charts
      weeklyProgress.value = WEEKS.map(w => ({
        week: `W${w}`,
        rank: quizRecords[`w${w}Rank`] ?? null,
        homeworkRank: hwRecords[`w${w}Rank`] ?? null,
      }))

      await nextTick()
      drawQuizTrendline()
      drawHomeworkTrendline()

      if (report.roomId) {
        await loadLessonList(report.roomId, lastWeek)
      }

    }
  } catch { /* silent */ }
}

async function loadLessonList(roomId, lastWeek) {
  try {
    const [crRes, dictRes] = await Promise.all([
      getData(`classroom/getAllLessonsInClassRoom/${roomId}`, null, { isShowLoading: false }),
      getData('lesson/getAllLessonsInGradeAndTermDictionary', null, { isShowLoading: false }),
    ])
    if (crRes?.code === '200' && crRes?.result?.list) {
      const lessons = crRes.result.list
      const current = lessons.find(l => l.displayOrder === lastWeek) || lessons[0]
      if (current) {
        // Look up scope from lesson dictionary (LessonInClassRoomDto has no Scope field)
        let lessonScope = ''
        if (dictRes?.result) {
          const keyLower = `${currentGrade.value}-${currentTerm.value}`.toLowerCase()
          const matchKey = Object.keys(dictRes.result).find(k => k.toLowerCase() === keyLower)
          if (matchKey) {
            const dictLesson = (dictRes.result[matchKey] || []).find(
              l => l.displayOrder === current.displayOrder
            )
            lessonScope = dictLesson?.scope || ''
          }
        }
        currentLesson.value = {
          lessonName: current.lessonName,
          lessonScope,
          weekNum: current.displayOrder,
        }
        lessonProgress.value = Math.round((lastWeek / lessons.length) * 100)
      }
      // Build lesson progress list sorted newest → oldest
      lessonProgressList.value = lessons
        .map(l => {
          let statusLabel = 'Not Started'
          if (l.displayOrder < lastWeek) statusLabel = 'Past'
          else if (l.displayOrder === lastWeek) statusLabel = 'Current'
          return { ...l, statusLabel }
        })
        .sort((a, b) => b.displayOrder - a.displayOrder)
    }
  } catch { /* silent */ }
}

function drawQuizTrendline() {
  if (!quizChartRef.value) return
  if (quizChart) { quizChart.destroy(); quizChart = null }
  const labels = weeklyProgress.value.map(w => w.week)
  const data = weeklyProgress.value.map(w => w.rank)
  quizChart = new Chart(quizChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#409EFF',
        backgroundColor: 'rgba(64, 158, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#409EFF',
        spanGaps: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y ?? '—'}%` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: v => `${v}%`, font: { size: 10 }, maxTicksLimit: 5 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false }
        }
      }
    }
  })
}

function drawHomeworkTrendline() {
  if (!homeworkChartRef.value) return
  if (homeworkChart) { homeworkChart.destroy(); homeworkChart = null }
  const labels = weeklyProgress.value.map(w => w.week)
  const data = weeklyProgress.value.map(w => w.homeworkRank)
  homeworkChart = new Chart(homeworkChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#67C23A',
        backgroundColor: 'rgba(103, 194, 58, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#67C23A',
        spanGaps: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y ?? '—'}%` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: v => `${v}%`, font: { size: 10 }, maxTicksLimit: 5 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false }
        }
      }
    }
  })
}

async function loadNotifications() {
  try {
    const res = await getData(
      `notification/getNotificationsFor/${auth.username}`,
      null,
      { isShowLoading: false }
    )
    if (res?.code === '200' && Array.isArray(res?.result)) {
      notifications.value = res.result.map(n => ({ ...n, _expanded: false }))
    }
  } catch { /* silent */ }
}

async function toggleNotification(notif) {
  notif._expanded = !notif._expanded
  if (notif._expanded && notif.status === 4) {
    notif.status = 64
    try {
      await postData('notification/mark', {
        recordList: [{
          notificationId: notif.notificationId,
          receiverId: auth.username,
          receiverName: auth.username,
          status: 64,
        }]
      }, { isShowLoading: false })
    } catch { /* silent */ }
  }
}

function getLessonStatusColor(status) {
  if (status === 'Past') return '#67C23A'
  if (status === 'Current') return '#E6A23C'
  return '#C0C4CC'
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

onMounted(async () => {
  await Promise.all([loadStudentProfile(), loadPoints(), loadWeeklyReport(), loadNotifications(), loadGlobalConfig()])
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f6f3;
}

/* ── Header ── */
.home-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.hd-left {
  width: 36px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.header-title {
  flex: 1;
  text-align: center;
  font-family: Georgia, serif;
  font-size: 17px;
  font-weight: 800;
  background: linear-gradient(135deg, #C89239, #b8860b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hd-right {
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.bell-icon {
  cursor: pointer;
}

/* ── Body ── */
.home-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px calc(48px + env(safe-area-inset-bottom));
  -webkit-overflow-scrolling: touch;
}

/* ── Welcome ── */
.welcome-section {
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: #888;
  line-height: 1.2;
}

.welcome-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}

.welcome-name {
  font-size: 52px;
  font-weight: 800;
  color: #C89239;
  line-height: 1.2;
}

.welcome-points {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(200, 146, 57, 0.1);
  border: 1px solid rgba(200, 146, 57, 0.25);
}

.welcome-points-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.welcome-points-value {
  font-size: 16px;
  font-weight: 800;
  color: #C89239;
  line-height: 1;
}

.welcome-sub {
  font-size: 13px;
  color: #888;
  margin-top: 5px;
}

/* ── Section Card ── */
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  color: #24221F;
}

.view-all {
  font-size: 13px;
  color: #C89239;
  cursor: pointer;
}

/* ── Current Lesson (Row 1) ── */
.current-lesson-card {
  background: linear-gradient(135deg, #fffbf0, #fff8e6);
  border: 1px solid #ede0b8;
}

.cl-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.cl-grade-term {
  font-size: 13px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 5px;
}

.cl-sep {
  color: #ccc;
}

.cl-empty-gt {
  color: #ccc;
  font-style: italic;
}

.cl-name {
  font-size: 18px;
  font-weight: 700;
  color: #24221F;
  line-height: 1.3;
  margin-bottom: 10px;
}

.cl-name--empty {
  color: #ccc;
  font-size: 16px;
}

.cl-progress {
  margin-bottom: 5px;
}

.cl-pct {
  font-size: 11px;
  color: #C89239;
  font-weight: 600;
}

/* ── Current Learning (Row 2) ── */
.cl-lesson-detail {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f3ef;
}

.cl-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

.cl-week-lbl {
  color: #448BE9;
  font-size: 13px;
  font-weight: 600;
}

.cl-dot {
  color: #C0C0C0;
  font-size: 7px;
  margin: 0 4px;
  flex-shrink: 0;
}

.cl-scope-lbl {
  font-size: 13px;
  font-weight: 600;
}

.cl-lesson-lbl {
  color: #222;
  font-size: 13px;
  font-weight: 600;
}

.cl-resources {
  display: flex;
  flex-direction: column;
}

.cl-resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f3ef;
  cursor: pointer;
}

.cl-resource-item--last {
  border-bottom: none;
  padding-bottom: 0;
}

.cl-res-icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
  border-radius: 8px;
  background: #f9f5ec;
  padding: 6px;
  flex-shrink: 0;
}

.cl-res-icon--b {
  filter: hue-rotate(200deg) saturate(0.7);
}

.cl-res-body {
  flex: 1;
  min-width: 0;
}

.cl-res-name {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
}

.cl-res-sub {
  font-size: 11px;
  color: #999;
  margin-top: 1px;
}

/* ── Weekly Quiz / Homework rows ── */
.quiz-score-value {
  font-size: 32px;
  font-weight: 800;
  color: #409EFF;
  line-height: 1;
}

.quiz-raw-score {
  font-size: 18px;
  color: #999;
  font-weight: 400;
}

.quiz-points-value {
  color: #409EFF;
}

/* score-display row: left=score/unsubmitted, right=points badge */
.hw-score-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.hw-score-value {
  font-size: 32px;
  font-weight: 800;
  color: #67C23A;
  line-height: 1;
}

.hw-unsubmitted {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #E6A23C;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.hw-unsubmitted-ico {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.hw-points-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.hw-points-label {
  font-size: 11px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.hw-points-value {
  font-size: 28px;
  font-weight: 800;
  color: #E6A23C;
  line-height: 1;
}

.hw-points-deduct {
  color: #F56C6C;
}

/* ── Trendline charts ── */
.trendline-chart {
  height: 160px;
  position: relative;
}

.trendline-sub {
  font-size: 11px;
  color: #aaa;
}

/* ── Lesson Progress ── */
.lp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f3ef;
}

.lp-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.lp-item--current {
  background: rgba(200, 146, 57, 0.04);
  margin: 0 -16px;
  padding: 10px 16px;
}

.lp-week {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: #C89239;
  background: rgba(200, 146, 57, 0.12);
  border-radius: 6px;
  padding: 2px 7px;
  min-width: 30px;
  text-align: center;
}

.lp-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #24221F;
  line-height: 1.3;
}

.lp-status {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
}

/* ── Notifications ── */
.empty-updates {
  font-size: 13px;
  color: #bbb;
  text-align: center;
  padding: 12px 0;
}

.notif-unread-badge {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #e55;
  border-radius: 10px;
  padding: 1px 6px;
  margin-left: 4px;
  vertical-align: middle;
}

.notif-more {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f3ef;
  font-size: 13px;
  color: #C89239;
  text-align: center;
  cursor: pointer;
  font-weight: 600;
}

.notif-item {
  padding: 12px 0;
  border-bottom: 1px solid #f5f3ef;
  cursor: pointer;
  transition: background 0.1s;
}

.notif-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.notif-item--unread {
  background: rgba(200, 146, 57, 0.05);
  margin: 0 -16px;
  padding: 12px 16px;
}

.notif-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

.notif-dot--unread {
  background: #C89239;
}

.notif-dot--read {
  background: #ddd;
}

.notif-subject {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
  line-height: 1.4;
}

.notif-item--unread .notif-subject {
  color: #24221F;
}

.notif-time {
  font-size: 11px;
  color: #999;
  flex-shrink: 0;
  margin-top: 3px;
}

.notif-body {
  margin-top: 8px;
  padding-left: 16px;
  font-size: 13px;
  color: #555;
  line-height: 1.6;
}

.bottom-spacer {
  height: 0;
}
</style>
