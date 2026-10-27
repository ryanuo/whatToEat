<script setup lang="ts">
import { appName } from '~/constants'

const { skin, setSkin, skins, themeColor, setThemeColor, themeColors } = useSkin()
const isPickerOpen = ref(false)
const pickerRef = ref<HTMLElement>()

onClickOutside(pickerRef, () => {
  isPickerOpen.value = false
})
</script>

<template>
  <header class="site-header">
    <!-- 品牌区：应用名 + Logo -->
    <a href="/" class="brand" aria-label="whatToEat 首页">
      <img src="/logo.png" alt="" aria-hidden="true" class="brand-logo">
      <span class="brand-name">{{ appName }}</span>
    </a>

    <!-- 工具区：背景与主题色 + GitHub -->
    <div class="tools">
      <div ref="pickerRef" class="skin-picker">
        <button
          type="button"
          class="tool-btn"
          title="背景与主题色"
          :aria-expanded="isPickerOpen"
          @click="isPickerOpen = !isPickerOpen"
        >
          <span i-carbon:color-palette />
        </button>

        <Transition name="drop">
          <div v-if="isPickerOpen" class="skin-panel">
            <div class="panel-section">
              <p class="panel-label">
                背景
              </p>
              <div class="panel-row">
                <button
                  v-for="s in skins"
                  :key="s.key"
                  type="button"
                  :title="s.name"
                  class="skin-thumb"
                  :class="{ 'skin-thumb-active': s.key === skin.key }"
                  :style="{ backgroundImage: `url(${s.url})`, backgroundColor: s.bgColor }"
                  @click="setSkin(s.key)"
                >
                  <span class="skin-name">{{ s.name }}</span>
                </button>
              </div>
            </div>

            <div class="panel-section">
              <p class="panel-label">
                主题色
              </p>
              <div class="panel-row">
                <button
                  v-for="t in themeColors"
                  :key="t.key"
                  type="button"
                  :title="t.name"
                  class="color-dot"
                  :class="{ 'color-dot-active': t.key === themeColor.key }"
                  :style="{ backgroundColor: t.color }"
                  @click="setThemeColor(t.key)"
                >
                  <span v-if="t.key === themeColor.key" class="i-carbon:checkmark" />
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <a
        href="https://github.com/ryanuo/whatToEat"
        target="_blank"
        rel="noopener noreferrer"
        class="tool-btn"
        title="GitHub 仓库"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59c.4.07.55-.17.55-.38c0-.19-.01-.82-.01-1.49c-2.01.37-2.53-.49-2.69-.94c-.09-.23-.48-.94-.82-1.13c-.28-.15-.68-.52-.01-.53c.63-.01 1.08.58 1.23.82c.72 1.21 1.87.87 2.33.66c.07-.52.28-.87.51-1.07c-1.78-.2-3.64-.89-3.64-3.95c0-.87.31-1.59.82-2.15c-.08-.2-.36-1.02.08-2.12c0 0 .67-.21 2.2.82c.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82c.44 1.1.16 1.92.08 2.12c.51.56.82 1.27.82 2.15c0 3.07-1.87 3.75-3.65 3.95c.29.25.54.73.54 1.48c0 1.07-.01 1.93-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" /></svg>
      </a>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 40;

  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 56px;
  padding: 0 16px;

  background: rgba(255, 255, 255, 0.38);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

@media (min-width: 640px) {
  .site-header {
    padding: 0 32px;
  }
}

/* 品牌区 */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;

  text-decoration: none;
}

.brand-logo {
  display: block;

  width: 30px;
  height: 30px;

  border-radius: 9px;
}

.brand-name {
  color: #141d37;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* 工具区 */
.tools {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-btn {
  display: grid;
  place-items: center;

  width: 36px;
  height: 36px;

  border-radius: 9999px;
  color: #5c6070;

  font-size: 18px;

  cursor: pointer;
  transition: all 180ms ease;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.85);
  color: #141d37;
}

.tool-btn:focus-visible {
  outline: 2px solid rgba(201, 77, 94, 0.75);
  outline-offset: 2px;
}

/* 背景与主题色面板 */
.skin-picker {
  position: relative;
}

.skin-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;

  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 14px;

  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 28px rgba(20, 29, 55, 0.14);
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-label {
  color: #9aa0ad;
  font-size: 11px;
  line-height: 1;
  padding-left: 2px;
}

.panel-row {
  display: flex;
  gap: 8px;
}

.skin-thumb {
  position: relative;
  overflow: hidden;

  width: 56px;
  height: 56px;

  border: 2px solid transparent;
  border-radius: 10px;

  background-size: cover;
  background-position: center;

  cursor: pointer;
  transition: all 180ms ease;
}

.skin-thumb:hover {
  transform: scale(1.06);
}

.skin-thumb-active {
  border-color: var(--brand, #ed7d68);
  transform: scale(1.06);
}

.skin-name {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);

  padding: 2px 5px;

  border-radius: 6px;
  background: rgba(255, 255, 255, 0.88);
  color: #5c6070;

  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
}

/* 主题色圆点 */
.color-dot {
  display: grid;
  place-items: center;

  width: 26px;
  height: 26px;

  border: none;
  border-radius: 9999px;
  color: #fff;

  font-size: 13px;

  cursor: pointer;
  transition: all 160ms ease;
}

.color-dot:hover {
  transform: scale(1.12);
}

.color-dot-active {
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.96),
    0 0 0 4px var(--brand, #ed7d68);
}

.drop-enter-active,
.drop-leave-active {
  transition: all 0.18s ease;
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
