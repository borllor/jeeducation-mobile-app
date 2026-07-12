<template>
  <div class="sub-page">

    <!-- Header -->
    <div class="sub-header">
      <div class="sub-hd-left" @click="$router.back()">
        <van-icon name="arrow-left" size="20" color="#24221F" />
      </div>
      <div class="sub-hd-center">Help &amp; Support</div>
      <div class="sub-hd-right"></div>
    </div>

    <!-- Body -->
    <div class="hs-scroll">

      <div class="hs-intro">
        Call or message us to discuss the best program for your child.
      </div>

      <!-- Call Us -->
      <div class="hs-card" @click="callUs">
        <div class="hs-ico-wrap" style="background: #e8f7e8;">
          <van-icon name="phone-o" size="22" color="#67C23A" />
        </div>
        <div class="hs-card-body">
          <div class="hs-card-title">Call Us</div>
          <div class="hs-card-val">0422 777 073</div>
          <div class="hs-card-sub">Tap to call</div>
        </div>
        <van-icon name="arrow" color="#ccc" size="14" />
      </div>

      <!-- WeChat -->
      <div class="hs-card hs-card--wechat">
        <div class="hs-wechat-hd">
          <div class="hs-ico-wrap" style="background: #e8f8ef;">
            <van-icon name="chat-o" size="22" color="#09BB07" />
          </div>
          <div class="hs-card-body">
            <div class="hs-card-title">WeChat</div>
            <div class="hs-card-val">JE MATHS</div>
            <div class="hs-card-sub">Mr Hu · Sydney, Australia</div>
          </div>
        </div>
        <div class="hs-qr-wrap">
          <img :src="wechatQr" class="hs-qr-img" alt="WeChat QR code" />
          <div class="hs-qr-tip">Scan to add on WeChat</div>
        </div>
      </div>

      <!-- Visit Our Office -->
      <div class="hs-card" @click="openMap">
        <div class="hs-ico-wrap" style="background: #fef3e2;">
          <van-icon name="location-o" size="22" color="#C89239" />
        </div>
        <div class="hs-card-body">
          <div class="hs-card-title">Visit Our Office</div>
          <div class="hs-card-val">25/1 Railway Pde, Burwood NSW</div>
          <div class="hs-card-sub">Tap for directions</div>
        </div>
        <van-icon name="arrow" color="#ccc" size="14" />
      </div>

      <div class="list-spacer" />
    </div>

  </div>
</template>

<script setup>
import wechatQr from '@/assets/img/wechat-qr.jpg'

const PHONE = '0422777073'
const ADDRESS = '25/1 Railway Pde, Burwood NSW'

function callUs() {
  window.location.href = `tel:${PHONE}`
}

function openMap() {
  window.open(`https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`, '_blank')
}
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

/* ── Scroll ── */
.hs-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
}

.hs-intro {
  font-size: 14px;
  color: #888;
  line-height: 1.5;
  text-align: center;
  margin: 4px 8px 16px;
}

/* ── Contact cards ── */
.hs-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.hs-card:active {
  background: #fafaf9;
}

.hs-card--wechat {
  flex-direction: column;
  align-items: stretch;
  cursor: default;
}

.hs-card--wechat:active {
  background: #fff;
}

.hs-wechat-hd {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hs-ico-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hs-card-body {
  flex: 1;
  min-width: 0;
}

.hs-card-title {
  font-size: 13px;
  color: #aaa;
  font-weight: 600;
}

.hs-card-val {
  font-size: 16px;
  font-weight: 700;
  color: #24221F;
  margin-top: 2px;
  line-height: 1.3;
}

.hs-card-sub {
  font-size: 12px;
  color: #bbb;
  margin-top: 2px;
}

/* ── WeChat QR ── */
.hs-qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f5f3ef;
}

.hs-qr-img {
  width: 200px;
  max-width: 70%;
  height: auto;
  border-radius: 10px;
}

.hs-qr-tip {
  font-size: 12px;
  color: #aaa;
}

.list-spacer {
  height: calc(16px + env(safe-area-inset-bottom));
}
</style>
