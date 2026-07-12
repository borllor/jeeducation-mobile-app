<template>
  <div class="jetree-page">

    <!-- Header -->
    <div class="jt-header">
      <div class="jt-hd-left">
        <img :src="jetreeIconImg" class="jt-brand-ico" alt="" />
      </div>
      <div class="jt-hd-center">JE Tree</div>
      <div class="jt-hd-right">
        <button
          v-if="currentGrade"
          class="jt-cur-btn"
          @click="jumpToCurrentClassroom"
        >Current Lesson</button>
      </div>
    </div>

    <!-- Filter bar: Lesson Type · Year · Term -->
    <div class="jt-filter-bar">
      <button class="jt-filter-pill" @click="showTypePicker = true">
        <van-icon name="label-o" size="13" color="#C89239" />
        {{ activeTypeLabel }}
        <van-icon name="arrow-down" size="11" color="#888" />
      </button>
      <div class="jt-filter-divider"></div>
      <button class="jt-filter-pill" @click="showYearPicker = true">
        <van-icon name="calendar-o" size="13" color="#C89239" />
        {{ formatGrade(selectedGrade) || 'Year' }}
        <van-icon name="arrow-down" size="11" color="#888" />
      </button>
      <div class="jt-filter-divider"></div>
      <button class="jt-filter-pill" @click="showTermPicker = true">
        <van-icon name="notes-o" size="13" color="#C89239" />
        {{ formatTerm(selectedTerm) || 'Term' }}
        <van-icon name="arrow-down" size="11" color="#888" />
      </button>
    </div>

    <!-- Year picker popup -->
    <van-popup v-model:show="showYearPicker" position="bottom" round>
      <van-picker
        :columns="gradeOptions"
        :default-index="gradeOptions.findIndex(g => g.value === selectedGrade)"
        @confirm="onYearConfirm"
        @cancel="showYearPicker = false"
        title="Select Year"
        confirm-button-text="Confirm"
        cancel-button-text="Cancel"
      />
    </van-popup>

    <!-- Term picker popup -->
    <van-popup v-model:show="showTermPicker" position="bottom" round>
      <van-picker
        :columns="termOptions"
        :default-index="termOptions.findIndex(t => t.value === selectedTerm)"
        @confirm="onTermConfirm"
        @cancel="showTermPicker = false"
        title="Select Term"
        confirm-button-text="Confirm"
        cancel-button-text="Cancel"
      />
    </van-popup>

    <!-- Lesson Type picker popup -->
    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <van-picker
        :columns="courseTypeOptions"
        :default-index="courseTypeOptions.findIndex(t => t.value === activeType)"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
        title="Lesson Type"
        confirm-button-text="Confirm"
        cancel-button-text="Cancel"
      />
    </van-popup>

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
        <div
          v-for="(lesson, idx) in lessons"
          :key="lesson.lessonId"
          class="jt-row"
          :data-lid="lesson.lessonId"
          @click="openLeaf(lesson)"
        >
          <!-- Trunk line segment -->
          <div class="jt-trunk-col">
            <div class="jt-trunk-line jt-trunk-line--top" :class="{ 'jt-trunk-line--first': idx === 0 }"></div>
            <div class="jt-node" :class="nodeClass(lesson)">
              <img v-if="isUnlocked(lesson)" :src="unlockImg" class="jt-node-img" alt="" />
              <img v-else-if="hasAnyPurchase(lesson)" :src="halfLockImg" class="jt-node-img" alt="" />
              <van-icon v-else name="lock" size="14" color="#fff" />
            </div>
            <div class="jt-trunk-line jt-trunk-line--bot" :class="{ 'jt-trunk-line--last': idx === lessons.length - 1 }"></div>
          </div>

          <!-- Lesson card -->
          <div class="jt-card" :class="cardClass(lesson)" :style="leafBorderStyle(lesson)">
            <div class="jt-card-top">
              <span class="jt-week-badge" :class="weekBadgeClass(lesson)">W{{ lesson.displayOrder }}</span>
              <span v-if="lesson.lessonId === currentLesson?.lessonId" class="jt-cur-badge">Current</span>
              <span v-if="scopeTitle(lesson)" class="jt-scope-badge" :style="{ color: scopeColor(lesson) }">{{ scopeTitle(lesson) }}</span>
            </div>
            <div class="jt-card-name">{{ lesson.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leaf detail bottom sheet -->
    <van-popup
      v-model:show="showLeafPopup"
      position="bottom"
      round
      :style="{ height: '88%' }"
      safe-area-inset-bottom
    >
      <div class="jt-dlg" v-if="dlgLeaf">

        <!-- Drag handle -->
        <div class="jt-dlg-handle"></div>

        <!-- Lesson header -->
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

        <!-- Single panel: Lesson Details above Learning Resources -->
        <div class="jt-dlg-scroll">
          <div class="jt-tab-body">

            <!-- Description & Objectives -->
            <div class="jt-sec-hd">
              <img :src="descriptionImg" class="jt-sec-ico" alt="" />
              <span>Description & Objectives</span>
            </div>
            <div v-if="dlgLeaf.description" class="jt-desc" v-html="dlgLeaf.description"></div>
            <van-empty v-else description="No description available" />

            <!-- Learning Resources -->
            <div class="jt-sec-hd jt-sec-hd--res">
              <img :src="learningResourcesImg" class="jt-sec-ico" alt="" />
              <span>Learning Resources</span>
            </div>

              <!-- Basic Services -->
              <template v-if="hasAnyBasic(dlgLeaf)">
                <div class="jt-grp-lbl">Basic Services</div>
                <div class="jt-res-grid">

                  <div v-if="hasLink(dlgLeaf.replayLinkForHot)" class="jt-rcard">
                    <div class="jt-rico-wrap" :class="isBasicUnlocked(dlgLeaf, 'Replay(A)') ? 'jt-rico--open' : 'jt-rico--lock'">
                      <img :src="isBasicUnlocked(dlgLeaf, 'Replay(A)') ? replayImg : lockImg" class="jt-rico" />
                    </div>
                    <div class="jt-rnm">Replay (A)</div>
                    <button
                      class="jt-rbtn"
                      :class="isBasicUnlocked(dlgLeaf, 'Replay(A)') ? 'jt-rbtn--watch' : 'jt-rbtn--price'"
                      @click="isBasicUnlocked(dlgLeaf, 'Replay(A)') ? openResource(dlgLeaf.replayLinkForHot, 'Replay (A)') : handleUnlock(dlgLeaf, 'Replay(A)', 'Replay (A)', false)"
                      v-html="isBasicUnlocked(dlgLeaf, 'Replay(A)') ? 'Watch' : unlockLabel(dlgLeaf, 'Replay(A)', false)"
                    ></button>
                  </div>

                  <div v-if="hasLink(dlgLeaf.replayLink)" class="jt-rcard">
                    <div class="jt-rico-wrap" :class="isBasicUnlocked(dlgLeaf, 'Replay(B)') ? 'jt-rico--open' : 'jt-rico--lock'">
                      <img :src="isBasicUnlocked(dlgLeaf, 'Replay(B)') ? replayImg : lockImg" class="jt-rico" />
                    </div>
                    <div class="jt-rnm">Replay (B)</div>
                    <button
                      class="jt-rbtn"
                      :class="isBasicUnlocked(dlgLeaf, 'Replay(B)') ? 'jt-rbtn--watch' : 'jt-rbtn--price'"
                      @click="isBasicUnlocked(dlgLeaf, 'Replay(B)') ? openResource(dlgLeaf.replayLink, 'Replay (B)') : handleUnlock(dlgLeaf, 'Replay(B)', 'Replay (B)', false)"
                      v-html="isBasicUnlocked(dlgLeaf, 'Replay(B)') ? 'Watch' : unlockLabel(dlgLeaf, 'Replay(B)', false)"
                    ></button>
                  </div>

                  <div v-if="hasLink(dlgLeaf.homeworkLink)" class="jt-rcard">
                    <div class="jt-rico-wrap" :class="isBasicUnlocked(dlgLeaf, 'Homework') ? 'jt-rico--open' : 'jt-rico--lock'">
                      <img :src="isBasicUnlocked(dlgLeaf, 'Homework') ? homeworkImg : lockImg" class="jt-rico" />
                    </div>
                    <div class="jt-rnm">Homework</div>
                    <button
                      class="jt-rbtn"
                      :class="isBasicUnlocked(dlgLeaf, 'Homework') ? 'jt-rbtn--start' : 'jt-rbtn--price'"
                      @click="isBasicUnlocked(dlgLeaf, 'Homework') ? openResource(dlgLeaf.homeworkLink, 'Homework') : handleUnlock(dlgLeaf, 'Homework', 'Homework', false)"
                      v-html="isBasicUnlocked(dlgLeaf, 'Homework') ? 'Start' : unlockLabel(dlgLeaf, 'Homework', false)"
                    ></button>
                  </div>

                  <div v-if="hasLink(dlgLeaf.answerLink)" class="jt-rcard">
                    <div class="jt-rico-wrap" :class="isBasicUnlocked(dlgLeaf, 'Answer') ? 'jt-rico--open' : 'jt-rico--lock'">
                      <img :src="isBasicUnlocked(dlgLeaf, 'Answer') ? fullSolutionImg : lockImg" class="jt-rico" />
                    </div>
                    <div class="jt-rnm">Full Solution</div>
                    <button
                      class="jt-rbtn"
                      :class="isBasicUnlocked(dlgLeaf, 'Answer') ? 'jt-rbtn--download' : 'jt-rbtn--price'"
                      @click="isBasicUnlocked(dlgLeaf, 'Answer') ? openResource(dlgLeaf.answerLink, 'Full Solution') : handleUnlock(dlgLeaf, 'Answer', 'Full Solution', false)"
                      v-html="isBasicUnlocked(dlgLeaf, 'Answer') ? 'Download' : unlockLabel(dlgLeaf, 'Answer', false)"
                    ></button>
                  </div>

                </div>
              </template>

              <!-- Extra Services -->
              <template v-if="hasAnyExtra(dlgLeaf)">
                <div class="jt-grp-lbl jt-grp-lbl--extra">Extra Services</div>
                <div class="jt-res-grid">

                  <div v-if="hasLink(dlgLeaf.linkForExtraFoundationExercise)" class="jt-rcard">
                    <div class="jt-rico-wrap" :class="isExtraUnlocked(dlgLeaf, 'ExtraFoundationExercise') ? 'jt-rico--open' : 'jt-rico--lock'">
                      <img :src="isExtraUnlocked(dlgLeaf, 'ExtraFoundationExercise') ? extraFoundationImg : lockImg" class="jt-rico" />
                    </div>
                    <div class="jt-rnm">Extra<br>Foundation</div>
                    <button
                      class="jt-rbtn"
                      :class="isExtraUnlocked(dlgLeaf, 'ExtraFoundationExercise') ? 'jt-rbtn--access' : 'jt-rbtn--price'"
                      @click="isExtraUnlocked(dlgLeaf, 'ExtraFoundationExercise') ? openResource(dlgLeaf.linkForExtraFoundationExercise, 'Extra Foundation') : handleUnlock(dlgLeaf, 'ExtraFoundationExercise', 'Extra Foundation', true)"
                      v-html="isExtraUnlocked(dlgLeaf, 'ExtraFoundationExercise') ? 'Access' : unlockLabel(dlgLeaf, 'ExtraFoundationExercise', true)"
                    ></button>
                  </div>

                  <div v-if="hasLink(dlgLeaf.linkForExtraDevelopmentExercise)" class="jt-rcard">
                    <div class="jt-rico-wrap" :class="isExtraUnlocked(dlgLeaf, 'ExtraDevelopmentExercise') ? 'jt-rico--open' : 'jt-rico--lock'">
                      <img :src="isExtraUnlocked(dlgLeaf, 'ExtraDevelopmentExercise') ? extraDevelopmentImg : lockImg" class="jt-rico" />
                    </div>
                    <div class="jt-rnm">Extra<br>Development</div>
                    <button
                      class="jt-rbtn"
                      :class="isExtraUnlocked(dlgLeaf, 'ExtraDevelopmentExercise') ? 'jt-rbtn--access' : 'jt-rbtn--price'"
                      @click="isExtraUnlocked(dlgLeaf, 'ExtraDevelopmentExercise') ? openResource(dlgLeaf.linkForExtraDevelopmentExercise, 'Extra Development') : handleUnlock(dlgLeaf, 'ExtraDevelopmentExercise', 'Extra Development', true)"
                      v-html="isExtraUnlocked(dlgLeaf, 'ExtraDevelopmentExercise') ? 'Access' : unlockLabel(dlgLeaf, 'ExtraDevelopmentExercise', true)"
                    ></button>
                  </div>

                  <div v-if="hasLink(dlgLeaf.linkForExtraEnrichmentExercise)" class="jt-rcard">
                    <div class="jt-rico-wrap" :class="isExtraUnlocked(dlgLeaf, 'ExtraEnrichmentExercise') ? 'jt-rico--open' : 'jt-rico--lock'">
                      <img :src="isExtraUnlocked(dlgLeaf, 'ExtraEnrichmentExercise') ? extraEnrichmentImg : lockImg" class="jt-rico" />
                    </div>
                    <div class="jt-rnm">Extra<br>Enrichment</div>
                    <button
                      class="jt-rbtn"
                      :class="isExtraUnlocked(dlgLeaf, 'ExtraEnrichmentExercise') ? 'jt-rbtn--access' : 'jt-rbtn--price'"
                      @click="isExtraUnlocked(dlgLeaf, 'ExtraEnrichmentExercise') ? openResource(dlgLeaf.linkForExtraEnrichmentExercise, 'Extra Enrichment') : handleUnlock(dlgLeaf, 'ExtraEnrichmentExercise', 'Extra Enrichment', true)"
                      v-html="isExtraUnlocked(dlgLeaf, 'ExtraEnrichmentExercise') ? 'Access' : unlockLabel(dlgLeaf, 'ExtraEnrichmentExercise', true)"
                    ></button>
                  </div>

                  <div v-if="hasLink(dlgLeaf.linkForRevisionExercise)" class="jt-rcard">
                    <div class="jt-rico-wrap" :class="isExtraUnlocked(dlgLeaf, 'RevisionExercise') ? 'jt-rico--open' : 'jt-rico--lock'">
                      <img :src="isExtraUnlocked(dlgLeaf, 'RevisionExercise') ? revisionExerciseImg : lockImg" class="jt-rico" />
                    </div>
                    <div class="jt-rnm">Revision<br>Exercise</div>
                    <button
                      class="jt-rbtn"
                      :class="isExtraUnlocked(dlgLeaf, 'RevisionExercise') ? 'jt-rbtn--access' : 'jt-rbtn--price'"
                      @click="isExtraUnlocked(dlgLeaf, 'RevisionExercise') ? openResource(dlgLeaf.linkForRevisionExercise, 'Revision Exercise') : handleUnlock(dlgLeaf, 'RevisionExercise', 'Revision Exercise', true)"
                      v-html="isExtraUnlocked(dlgLeaf, 'RevisionExercise') ? 'Access' : unlockLabel(dlgLeaf, 'RevisionExercise', true)"
                    ></button>
                  </div>

                </div>
              </template>

              <van-empty v-if="!hasAnyBasic(dlgLeaf) && !hasAnyExtra(dlgLeaf)" description="No resources available" />

          </div>
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getData, postData } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import jetreeIconImg from '@/assets/img/jetree-icon.png'
import replayImg from '@/assets/img/replay.png'
import homeworkImg from '@/assets/img/homework.png'
import unlockImg from '@/assets/img/unlock2.png'
import halfLockImg from '@/assets/img/half-lock.png'
import extraFoundationImg from '@/assets/img/extra-fundation.png'
import extraDevelopmentImg from '@/assets/img/extra-development.png'
import extraEnrichmentImg from '@/assets/img/extra-enrichment.png'
import revisionExerciseImg from '@/assets/img/revision-excercise.png'
import fullSolutionImg from '@/assets/img/full-solution.png'
import lockImg from '@/assets/img/lock.png'
import descriptionImg from '@/assets/img/description.png'
import learningResourcesImg from '@/assets/img/learning-resources.png'
import { showConfirmDialog, showToast, showDialog } from 'vant'

const auth = useAuthStore()
const router = useRouter()

// ── State ──────────────────────────────────────────────────────────────────────
const loading = ref(true)
const tableData = ref({})
const studentInClassRooms = ref([])
const scopeConfig = ref({})   // { [scopeName]: { leaf_BG_Color, ... } }
const purchasedRecords = ref([])
const courseList = ref([])
const globalConfigKV = ref([])
const activeType = ref('HSC_Course_Advanced')
const treeScroll = ref(null)

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

// Leaf popup
const showLeafPopup = ref(false)
const dlgLeaf = ref(null)

// ── Course types ───────────────────────────────────────────────────────────────
const courseTypes = [
  { value: 'Junior_Course',           label: 'Junior' },
  { value: 'HSC_Course_Advanced',     label: 'Advanced' },
  { value: 'HSC_Course_Extension_1',  label: 'Extension 1' },
  { value: 'HSC_Course_Extension_2',  label: 'Extension 2' },
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
// Only show grades that have at least one lesson of the selected activeType
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
    .sort((a, b) => a[1] - b[1])
    .map(([g]) => ({ text: formatGrade(g), value: g }))
})

// Only show terms for the selected grade that have lessons of the selected activeType
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

// currentLesson: lesson matching the student's actual active week, only when viewing active grade/term
const currentLesson = computed(() => {
  const isViewingActiveGT =
    selectedGrade.value.toLowerCase() === currentGrade.value.toLowerCase() &&
    selectedTerm.value.toLowerCase() === currentTerm.value.toLowerCase()
  if (!isViewingActiveGT) return null
  const week = currentAccessibleWeek.value
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

    // Auto-select course type that has lessons for current grade/term
    await nextTick()
    ensureActiveTypeHasLessons()
  } catch (e) {
    console.error('JETree load error:', e)
  } finally {
    loading.value = false
    await nextTick()
    if (currentLesson.value) {
      setTimeout(() => scrollToLeaf(currentLesson.value), 400)
    }
  }
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
    // Filter defaults to the student's active classroom
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
  // Called after grade/term changes. If the current type has no lessons for
  // the selected grade/term, fall back to the first type that does.
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
    // If current selectedGrade has no lessons for the new type, reset to first valid grade
    if (!gradeOptions.value.some(g => g.value === selectedGrade.value)) {
      selectedGrade.value = gradeOptions.value[0]?.value ?? ''
    }
    nextTick(() => {
      // If current selectedTerm has no lessons for new type+grade, reset to first valid term
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
  // Reset term to first available for this grade
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
  // Switch filter back to student's active classroom and scroll to current lesson
  selectedGrade.value = currentGrade.value
  selectedTerm.value = currentTerm.value
  nextTick(() => {
    ensureActiveTypeHasLessons()
    nextTick(() => {
      if (currentLesson.value) scrollToLeaf(currentLesson.value)
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
  sr.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
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

function hasAnyBasic(lesson) {
  return hasLink(lesson.replayLinkForHot) || hasLink(lesson.replayLink) ||
    hasLink(lesson.homeworkLink) || hasLink(lesson.answerLink)
}

function hasAnyExtra(lesson) {
  return hasLink(lesson.linkForExtraFoundationExercise) ||
    hasLink(lesson.linkForExtraDevelopmentExercise) ||
    hasLink(lesson.linkForExtraEnrichmentExercise) ||
    hasLink(lesson.linkForRevisionExercise)
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

function unlockLabel(lesson, itemId, isExtra) {
  if (isPendingCurrentTerm(lesson)) return `<span style="font-size:12px">Unlocks after lesson</span>`
  const d = calculateUnlockData(lesson, itemId, isExtra)
  if (d.discountPoints > 0) {
    const original = d.points + d.discountPoints
    return `<span style="color:#B5B5B5;font-size:12px;">Was <s>${original}</s></span><br>${d.points} pts`
  }
  return `${d.points} pts`
}

async function handleUnlock(lesson, itemId, linkText, isExtra) {
  if (isPendingCurrentTerm(lesson)) {
    showDialog({
      title: linkText,
      message: 'This resource is included in your current course.\nIt will unlock automatically after the lesson has been taught.',
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

// ── Leaf popup ─────────────────────────────────────────────────────────────────
function openLeaf(lesson) {
  dlgLeaf.value = lesson
  showLeafPopup.value = true
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function leafBorderStyle(lesson) {
  const sc = scopeConfig.value[lesson.scope]
  if (!sc?.leaf_BG_Color) return {}
  return { borderColor: sc.leaf_BG_Color.replace(/[\d.]+\)$/, '0.7)') }
}

function scopeTitle(lesson) {
  const sc = scopeConfig.value[lesson.scope]
  return (sc && sc.title) || lesson.scope || ''
}

function scopeColor(lesson) {
  const sc = scopeConfig.value[lesson.scope]
  if (!sc?.leaf_BG_Color) return '#aaa'
  return sc.leaf_BG_Color.replace(/[\d.]+\)$/, '0.7)')
}

function hasLink(url) { return !!(url && url.trim()) }

function openResource(url, title) {
  if (!url) return
  router.push({ name: 'resource', query: { url, title } })
}

function formatGrade(g) {
  const n = String(g).replace(/\D/g, '')
  return n ? `Year ${n}` : g
}

function formatTerm(t) {
  return String(t).replace(/^term\s*/i, 'Term ')
}

function nodeClass(lesson) {
  if (lesson.lessonId === currentLesson.value?.lessonId) return 'jt-node--current'
  if (isUnlocked(lesson)) return 'jt-node--open'
  if (hasAnyPurchase(lesson)) return 'jt-node--half'
  return 'jt-node--lock'
}

function cardClass(lesson) {
  if (lesson.lessonId === currentLesson.value?.lessonId) return 'jt-card--current'
  return 'jt-card--open'
}

function weekBadgeClass(lesson) {
  if (lesson.lessonId === currentLesson.value?.lessonId) return 'jt-week-badge--current'
  return 'jt-week-badge--open'
}

onMounted(loadData)
</script>

<style scoped>
/* ── Page layout ─────────────────────────────────────────────────────────── */
.jetree-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f5f0;
  overflow: hidden;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.jt-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 11px 16px;
  padding-top: calc(11px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.jt-hd-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
}

.jt-brand-ico {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.jt-hd-center {
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

.jt-hd-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
}

.jt-cur-btn {
  background: #C89239;
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

/* ── Filter bar ────────────────────────────────────────────────────────────── */
.jt-filter-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 8px 14px;
  background: #fff;
  border-bottom: 1px solid #f0ede6;
  overflow-x: auto;
  flex-shrink: 0;
  -webkit-overflow-scrolling: touch;
}
.jt-filter-bar::-webkit-scrollbar { display: none; }

.jt-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #faf8f4;
  border: 1px solid #e8dfc5;
  border-radius: 18px;
  padding: 6px 12px;
  font-size: 15px;
  font-weight: 600;
  color: #24221F;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.jt-filter-divider {
  width: 1px;
  height: 20px;
  background: #e8e0d0;
  margin: 0 10px;
  flex-shrink: 0;
}

/* ── Loading / Empty ──────────────────────────────────────────────────────── */
.jt-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
}

.jt-loading-txt {
  font-size: 15px;
  color: #bbb;
}

.jt-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Scroll area ──────────────────────────────────────────────────────────── */
.jt-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.jt-list {
  padding: 12px 16px calc(48px + env(safe-area-inset-bottom));
}

/* ── Trunk caps (top/bottom connectors) ───────────────────────────────────── */
.jt-trunk-cap {
  display: flex;
  justify-content: flex-start;
  padding-left: calc(36px / 2 - 1.5px);
}

.jt-trunk-cap--top { height: 16px; }
.jt-trunk-cap--bot { height: 24px; }

.jt-trunk-cap::before {
  content: '';
  width: 3px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, #d4c9b0);
  border-radius: 2px;
}

.jt-trunk-cap--bot::before {
  background: linear-gradient(to bottom, #d4c9b0, transparent);
}

/* ── Lesson row ───────────────────────────────────────────────────────────── */
.jt-row {
  display: flex;
  align-items: stretch;
  gap: 14px;
  cursor: pointer;
}

/* ── Trunk column ─────────────────────────────────────────────────────────── */
.jt-trunk-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 36px;
}

.jt-trunk-line {
  width: 3px;
  flex: 1;
  background: #d4c9b0;
  min-height: 10px;
}

.jt-trunk-line--first { background: linear-gradient(to bottom, transparent, #d4c9b0); }
.jt-trunk-line--last  { background: linear-gradient(to bottom, #d4c9b0, transparent); }

/* ── Trunk node (circle) — mirrors jt2-lico from management portal ────────── */
.jt-node {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2.5px solid #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.14);
}

.jt-node--open    { background: #2AA540; }          /* green — unlocked */
.jt-node--lock    { background: #B5B5B5; }          /* grey  — locked   */
.jt-node--half    { background: #F59E0B; }          /* amber — purchased but locked (future) */
.jt-node--current { background: #C89239; }          /* gold  — student's current week */

.jt-node-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* ── Lesson card ──────────────────────────────────────────────────────────── */
.jt-card {
  flex: 1;
  min-width: 0;
  border-radius: 14px;
  padding: 13px 14px;
  margin: 5px 0;
  transition: box-shadow 0.15s;
  border: 1.5px solid transparent;
}

.jt-card:active { opacity: 0.85; }

.jt-card--current {
  background: linear-gradient(135deg, #fffbf0, #fff6e0);
  border-color: #C89239;
  box-shadow: 0 2px 14px rgba(200,146,57,0.15);
}

.jt-card--open {
  background: #fff;
  border-color: #ede8dc;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}

/* ── Card top row ─────────────────────────────────────────────────────────── */
.jt-card-top {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
}

.jt-week-badge {
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  padding: 2px 8px;
}

.jt-week-badge--current {
  background: #C89239;
  color: #fff;
}

.jt-week-badge--open {
  background: rgba(200,146,57,0.12);
  color: #C89239;
}


.jt-cur-badge {
  font-size: 12px;
  font-weight: 700;
  color: #C89239;
  background: rgba(200,146,57,0.1);
  border: 1px solid rgba(200,146,57,0.3);
  border-radius: 8px;
  padding: 1px 7px;
}


.jt-scope-badge {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.jt-lock-badge {
  font-size: 12px;
  color: #bbb;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* ── Card body ────────────────────────────────────────────────────────────── */
.jt-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #24221F;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.jt-card-scope {
  font-size: 13px;
  color: #aaa;
  margin-top: 3px;
  line-height: 1.3;
}


/* ── Bottom sheet dialog ─────────────────────────────────────────────────── */
.jt-dlg {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.jt-dlg-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #e0dbd0;
  margin: 10px auto 0;
  flex-shrink: 0;
}

.jt-dlg-hd {
  padding: 14px 20px 16px;
  border-bottom: 1px solid #f0ede6;
  flex-shrink: 0;
}

.jt-dlg-title {
  font-size: 20px;
  font-weight: 700;
  color: #24221F;
  line-height: 1.3;
}

/* Week ● Scope meta row — mirrors cl-meta-row on HomeView */
.jt-dlg-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 6px;
}

.jt-dlg-week {
  color: #448BE9;
  font-size: 15px;
  font-weight: 600;
}

.jt-dlg-dot {
  color: #C0C0C0;
  font-size: 8px;
  margin: 0 4px;
  flex-shrink: 0;
}

.jt-dlg-scope {
  font-size: 15px;
  font-weight: 600;
}

/* ── Dialog scroll panel ─────────────────────────────────────────────────── */
.jt-dlg-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Section headers (Description & Objectives / Learning Resources) — mirrors jt2-dlg-sec-hd */
.jt-sec-hd {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 17px;
  font-weight: 700;
  color: #24221F;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0ede6;
  margin-bottom: 12px;
}

.jt-sec-ico {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}

.jt-sec-hd--res {
  margin-top: 26px;
}

/* ── Tab body ─────────────────────────────────────────────────────────────── */
.jt-tab-body {
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

/* Description HTML */
.jt-desc {
  font-size: 16px;
  color: #444;
  line-height: 1.75;
}

:deep(.jt-desc p)  { margin: 0 0 12px; }
:deep(.jt-desc ul) { padding-left: 20px; margin: 0 0 12px; }
:deep(.jt-desc li) { margin-bottom: 5px; }
:deep(.jt-desc h3) { font-size: 17px; color: #24221F; margin: 14px 0 6px; }

.jt-no-content {
  padding: 20px 0;
}

/* ── Resource grid (Basic/Extra Services) ─────────────────────────────────── */
.jt-grp-lbl {
  font-size: 15px;
  font-weight: 700;
  color: #24221F;
  margin: 16px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0ede6;
}

.jt-grp-lbl--extra {
  margin-top: 20px;
}

.jt-res-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.jt-rcard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

/* Resource icons — mirrors jt2-rico-wrap from JETreeV2 */
.jt-rico-wrap {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.jt-rico--open { background: transparent; }

.jt-rico--lock {
  background: #B5B5B5;
  border-radius: 10px;
}

.jt-rico {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.jt-rnm {
  font-size: 13px;
  color: #555;
  line-height: 1.3;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jt-rbtn {
  width: 100%;
  padding: 6px 2px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  line-height: 1.3;
  background: #e8e8e8;
  color: #888;
}

.jt-rbtn--watch    { background: #448BE9; color: #fff; }
.jt-rbtn--start    { background: #22C55E; color: #fff; }
.jt-rbtn--download { background: #334155; color: #fff; }
.jt-rbtn--access   { background: #0891B2; color: #fff; }
.jt-rbtn--price    { background: #f5f0e8; color: #C89239; font-size: 12px; }
</style>
