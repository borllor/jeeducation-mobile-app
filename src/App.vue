<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  background: #f5f5f5;
}

:root {
  --je-gold: #C89239;
  --je-gold-dark: #b8860b;
  --je-gold-light: #d4af5a;
  --je-black: #24221F;
  --je-card-radius: 16px;
}
</style>
