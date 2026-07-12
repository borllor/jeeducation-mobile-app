<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">About JE Education</div>
      <div class="sub-hd-right"></div>
    </div>

    <!-- Body -->
    <div class="sub-body">

      <!-- Hero -->
      <div class="about-hero">
        <img :src="jetreeIcon" class="about-logo" alt="JE Education" />
        <div class="about-tagline">"Founder-led. Precision-built.<br />Designed for academic growth."</div>
      </div>

      <!-- Our Story -->
      <div class="about-section">
        <div class="about-section-title">Our Story</div>
        <div class="about-section-card">
          <p class="about-text">
            JE Education was established to deliver mathematics instruction that emphasises structure,
            clarity, and attentiveness. Rather than functioning as a conventional tutoring facility,
            JE operates as a specialised studio where founders personally instruct every student.
          </p>
          <p class="about-text">
            Our approach emphasises enduring comprehension, rigorous practice, and observable
            improvement — built on a foundation that goes beyond exam preparation to cultivate
            analytical, self-directed scholars.
          </p>
        </div>
      </div>

      <!-- Meet the Team -->
      <div class="about-section">
        <div class="about-section-title">Meet the Team</div>

        <div class="about-team-card">
          <div class="about-team-avatar" style="background: linear-gradient(135deg, #C89239, #b8860b);">
            <span>Mr</span>
          </div>
          <div class="about-team-info">
            <div class="about-team-name">Mr Hu</div>
            <div class="about-team-role">Junior &amp; Middle Years Specialist</div>
            <div class="about-team-grade">
              <van-icon name="label-o" size="12" color="#C89239" />
              Years 6–10 · Pre-Calculus
            </div>
            <div class="about-team-quote">"Clarity, foundations, disciplined thinking."</div>
          </div>
        </div>

        <div class="about-team-card">
          <div class="about-team-avatar" style="background: linear-gradient(135deg, #448BE9, #2d6dcc);">
            <span>Mrs</span>
          </div>
          <div class="about-team-info">
            <div class="about-team-name">Mrs Ni</div>
            <div class="about-team-role">Senior &amp; Extension Specialist</div>
            <div class="about-team-grade">
              <van-icon name="label-o" size="12" color="#448BE9" />
              Years 10–12 · Advanced, Ext 1 &amp; 2
            </div>
            <div class="about-team-quote">"Precision, depth, exam mastery."</div>
          </div>
        </div>
      </div>

      <!-- Our Philosophy -->
      <div class="about-section">
        <div class="about-section-title">Our Philosophy</div>
        <div class="about-section-card">
          <div class="about-value-row">
            <div class="about-value-ico" style="background: #fef3e2;">
              <van-icon name="records-o" size="18" color="#C89239" />
            </div>
            <div class="about-value-body">
              <div class="about-value-title">Structure, Not Shortcuts</div>
              <div class="about-value-desc">Every lesson follows a deliberate framework with measurable outcomes.</div>
            </div>
          </div>
          <div class="about-value-divider"></div>
          <div class="about-value-row">
            <div class="about-value-ico" style="background: #e8f4ff;">
              <van-icon name="user-o" size="18" color="#448BE9" />
            </div>
            <div class="about-value-body">
              <div class="about-value-title">Individualised Responses</div>
              <div class="about-value-desc">Development is tracked and feedback is tailored to each student.</div>
            </div>
          </div>
          <div class="about-value-divider"></div>
          <div class="about-value-row">
            <div class="about-value-ico" style="background: #e8f7e8;">
              <van-icon name="gold-coin-o" size="18" color="#67C23A" />
            </div>
            <div class="about-value-body">
              <div class="about-value-title">Merit-Based Recognition</div>
              <div class="about-value-desc">Achievement is cultivated and rewarded through our JE Points system.</div>
            </div>
          </div>
          <div class="about-value-divider"></div>
          <div class="about-value-row">
            <div class="about-value-ico" style="background: #fff8e6;">
              <van-icon name="chart-trending-o" size="18" color="#E6A23C" />
            </div>
            <div class="about-value-body">
              <div class="about-value-title">Beyond Exam Preparation</div>
              <div class="about-value-desc">We cultivate analytical, self-directed scholars for life.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="about-footer">
        <img :src="jetreeIcon" class="about-footer-logo" alt="" />
        <div class="about-footer-name">JE Education</div>
        <div class="about-footer-url">www.jeeducation.com.au</div>
      </div>

      <div class="bottom-spacer" />
    </div>

  </div>
</template>

<script setup>
import jetreeIcon from '@/assets/img/jetree-icon.png'
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
  padding: 20px 16px 0;
  -webkit-overflow-scrolling: touch;
}

/* ── Hero ── */
.about-hero {
  background: #fff;
  border-radius: 16px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
}

.about-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 14px;
}

.about-tagline {
  font-family: Georgia, serif;
  font-size: 15px;
  font-weight: 700;
  color: #24221F;
  line-height: 1.6;
  background: linear-gradient(135deg, #C89239, #b8860b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Sections ── */
.about-section {
  margin-bottom: 16px;
}

.about-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 0 4px 8px;
}

.about-section-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
}

.about-text {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 12px;
}

.about-text:last-child {
  margin-bottom: 0;
}

/* ── Team Cards ── */
.about-team-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
}

.about-team-avatar {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}

.about-team-info {
  flex: 1;
  min-width: 0;
}

.about-team-name {
  font-size: 16px;
  font-weight: 700;
  color: #24221F;
  margin-bottom: 2px;
}

.about-team-role {
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
}

.about-team-grade {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
}

.about-team-quote {
  font-size: 13px;
  font-style: italic;
  color: #C89239;
  line-height: 1.4;
}

/* ── Values ── */
.about-value-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 4px 0;
}

.about-value-divider {
  height: 1px;
  background: #f5f3ef;
  margin: 12px 0;
}

.about-value-ico {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.about-value-body {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.about-value-title {
  font-size: 14px;
  font-weight: 600;
  color: #24221F;
  margin-bottom: 3px;
}

.about-value-desc {
  font-size: 12px;
  color: #aaa;
  line-height: 1.5;
}

/* ── Footer ── */
.about-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 8px;
  gap: 6px;
}

.about-footer-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  opacity: 0.5;
}

.about-footer-name {
  font-size: 13px;
  font-weight: 600;
  color: #bbb;
}

.about-footer-url {
  font-size: 11px;
  color: #ccc;
}

.bottom-spacer {
  height: calc(24px + env(safe-area-inset-bottom));
}
</style>
