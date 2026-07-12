<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">My Progress</div>
      <div class="sub-hd-right"></div>
    </div>

    <!-- Body -->
    <div class="sub-body">
      <div v-if="gradeLabel" class="prog-grade-lbl">{{ gradeLabel }}</div>

      <div class="prog-list">

        <!-- Lessons Finished -->
        <div class="prog-item">
          <div class="prog-item-ico" style="background: #fef3e2;">
            <van-icon name="records-o" size="20" color="#C89239" />
          </div>
          <div class="prog-item-body">
            <div class="prog-item-lbl">Lessons Finished</div>
            <van-progress
              :percentage="totalLessons ? Math.round((unlockedLessons / totalLessons) * 100) : 0"
              stroke-width="5"
              color="#C89239"
              track-color="#f0e8d0"
              :show-pivot="false"
              class="prog-bar"
            />
          </div>
          <div class="prog-item-val">
            {{ unlockedLessons }}<span class="prog-total">/{{ totalLessons }}</span>
          </div>
        </div>
        <div class="prog-divider"></div>

        <!-- Homework Completed -->
        <div class="prog-item">
          <div class="prog-item-ico" style="background: #e8f7e8;">
            <van-icon name="todo-list-o" size="20" color="#67C23A" />
          </div>
          <div class="prog-item-body">
            <div class="prog-item-lbl">Homework Completed</div>
            <van-progress
              :percentage="hwTotal ? Math.round((hwSubmitted / hwTotal) * 100) : 0"
              stroke-width="5"
              color="#67C23A"
              track-color="#e8f7e8"
              :show-pivot="false"
              class="prog-bar"
            />
          </div>
          <div class="prog-item-val">
            {{ hwSubmitted }}<span class="prog-total">/{{ hwTotal }}</span>
          </div>
        </div>
        <div class="prog-divider"></div>

        <!-- Quiz Average -->
        <div class="prog-item">
          <div class="prog-item-ico" style="background: #e8f4ff;">
            <van-icon name="chart-trending-o" size="20" color="#448BE9" />
          </div>
          <div class="prog-item-body">
            <div class="prog-item-lbl">Quiz Average</div>
            <van-progress
              :percentage="quizAvg"
              stroke-width="5"
              color="#448BE9"
              track-color="#e8f4ff"
              :show-pivot="false"
              class="prog-bar"
            />
          </div>
          <div class="prog-item-val">
            {{ quizAvg }}<span class="prog-pct">%</span>
          </div>
        </div>
        <div class="prog-divider"></div>

        <!-- Total Points -->
        <div class="prog-item">
          <div class="prog-item-ico" style="background: #fff8e6;">
            <van-icon name="gold-coin-o" size="20" color="#E6A23C" />
          </div>
          <div class="prog-item-body">
            <div class="prog-item-lbl">Total Points</div>
          </div>
          <div class="prog-item-val prog-item-val--pts">{{ totalPoints.toLocaleString() }}</div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '@/services/api'

const gradeLabel = ref('')
const unlockedLessons = ref(0)
const totalLessons = ref(0)
const hwSubmitted = ref(0)
const hwTotal = ref(10)
const quizAvg = ref(0)
const totalPoints = ref(0)

function formatGrade(g) {
  const n = String(g || '').replace(/\D/g, '')
  return n ? `Year ${n}` : g
}
function formatTerm(t) {
  return String(t || '').replace(/^term\s*/i, 'Term ')
}

onMounted(async () => {
  try {
    const [reportRes, purchaseRes] = await Promise.all([
      getData('weeklyReport/getCurrentWeeklyReportAndRecordsForCurrentStudent', null, { isShowLoading: false }),
      getData('student/getAllPurchaseRecords', null, { isShowLoading: false }),
    ])

    if (reportRes?.code === '200' && reportRes?.result) {
      const report = reportRes.result
      gradeLabel.value = [formatGrade(report.grade), formatTerm(report.term)].filter(Boolean).join(' · ')

      const hwRecords = report.records?.homework?.[0] || {}
      const quizRecords = report.records?.quiz?.[0] || {}
      const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

      // Homework submitted = weeks with a non-null score
      hwSubmitted.value = WEEKS.filter(w => hwRecords[`w${w}`] != null && hwRecords[`w${w}`] !== '').length

      // Quiz average as percentage of raw score
      const quizPcts = WEEKS
        .filter(w => quizRecords[`w${w}`] != null)
        .map(w => {
          const raw = report[`quizW${w}RawScore`] || 100
          return (quizRecords[`w${w}`] / raw) * 100
        })
      quizAvg.value = quizPcts.length
        ? Math.round(quizPcts.reduce((a, b) => a + b, 0) / quizPcts.length)
        : 0

      // Total points = sum of all quiz + homework scores for this grade-term
      const hwSum = WEEKS.reduce((s, w) => s + (Number(hwRecords[`w${w}`]) || 0), 0)
      const quizSum = WEEKS.reduce((s, w) => s + (Number(quizRecords[`w${w}`]) || 0), 0)
      totalPoints.value = hwSum + quizSum

      if (report.roomId) {
        const lessonsRes = await getData(
          `classroom/getAllLessonsInClassRoom/${report.roomId}`,
          null,
          { isShowLoading: false }
        )
        if (lessonsRes?.code === '200' && lessonsRes?.result?.list) {
          const lessons = lessonsRes.result.list
          totalLessons.value = lessons.length
          hwTotal.value = lessons.length

          const purchased = Array.isArray(purchaseRes?.result) ? purchaseRes.result : []
          unlockedLessons.value = lessons.filter(
            l => l.isUnlocked || purchased.some(p => p.objectId === l.lessonId)
          ).length
        }
      }
    }
  } catch { /* silent */ }
})
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
  overflow-y: auto;
  padding: 20px 16px calc(24px + env(safe-area-inset-bottom));
  -webkit-overflow-scrolling: touch;
}

.prog-grade-lbl {
  font-size: 13px;
  font-weight: 600;
  color: #aaa;
  text-align: center;
  margin-bottom: 18px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.prog-list {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.prog-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
}

.prog-divider {
  height: 1px;
  background: #f5f3ef;
  margin-left: 70px;
}

.prog-item-ico {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prog-item-body {
  flex: 1;
  min-width: 0;
}

.prog-item-lbl {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
  margin-bottom: 6px;
}

.prog-bar {
  width: 100%;
}

.prog-item-val {
  font-size: 18px;
  font-weight: 800;
  color: #24221F;
  flex-shrink: 0;
  text-align: right;
}

.prog-item-val--pts {
  color: #E6A23C;
}

.prog-total {
  font-size: 13px;
  font-weight: 500;
  color: #ccc;
}

.prog-pct {
  font-size: 13px;
  font-weight: 600;
  color: #aaa;
}
</style>
