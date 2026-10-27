<script setup lang="ts">
import { appName } from '~/constants'

const { skin, setSkin, skins, themeColor, setThemeColor, themeColors } = useSkin()
const { config: aiConfig, configured, aiHeaders, clearConfig, testConnection } = useAiConfig()

// 连通性测试状态（由配置派生，避免多状态同步）：empty 未填全 / unverified 未测 / testing 检测中 / ok 可用 / fail 不可用
const testing = ref(false)
const testFailed = ref(false)

watch(
  () => `${aiConfig.baseUrl}|${aiConfig.apiKey}|${aiConfig.model}`,
  () => {
    testFailed.value = false
  },
)

const testState = computed<'empty' | 'unverified' | 'testing' | 'ok' | 'fail'>(() => {
  if (!configured.value)
    return 'empty'
  if (testing.value)
    return 'testing'
  if (aiConfig.ready)
    return 'ok'
  return testFailed.value ? 'fail' : 'unverified'
})

const statusText = computed(() => {
  switch (testState.value) {
    case 'ok': return '✓ 可用'
    case 'fail': return '✗ 不可用'
    case 'testing': return '● 检测中'
    case 'unverified': return '● 未验证'
    default: return '○ 未配置'
  }
})

async function runTest() {
  if (testing.value || !configured.value)
    return

  testing.value = true
  const ok = await testConnection()
  testing.value = false
  testFailed.value = !ok
}
const isPickerOpen = ref(false)
const pickerRef = ref<HTMLElement>()

onClickOutside(pickerRef, () => {
  isPickerOpen.value = false
})

// 会话级 ready：刷新后若配置齐全则静默重测，避免 AI 面板凭空消失
onMounted(async () => {
  if (configured.value && !aiConfig.ready)
    await testConnection()
})

/* ---------------- AI 配置：厂商快捷 + 动态模型列表 ---------------- */

const providerId = ref(matchAiProvider(aiConfig.baseUrl)?.id ?? 'custom')

// 手动修改 Base URL 后自动匹配预设厂商，匹配不上回落「自定义」
watch(
  () => aiConfig.baseUrl,
  (url) => {
    providerId.value = matchAiProvider(url)?.id ?? 'custom'
  },
)

// 模型列表：从厂商 /models 接口动态拉取，按 (baseUrl, apiKey) 记忆
const modelList = ref<string[]>([])
const modelsLoading = ref(false)
const modelsCacheKey = ref('')

function selectProvider(id: string) {
  providerId.value = id

  const provider = aiProviders.find(p => p.id === id)
  if (provider) {
    aiConfig.baseUrl = provider.baseUrl
    modelsCacheKey.value = ''
    modelList.value = []
  }
}

async function ensureModels() {
  const c = aiConfig
  if (!c.baseUrl || !c.apiKey || modelsLoading.value)
    return

  const key = `${c.baseUrl}|${c.apiKey}`
  if (key === modelsCacheKey.value && modelList.value.length)
    return

  modelsLoading.value = true
  try {
    const res = await $fetch<{ models: string[] }>('/api/ai/models', { headers: aiHeaders() })
    modelList.value = res.models
    modelsCacheKey.value = key
  }
  catch {
    modelList.value = []
  }
  finally {
    modelsLoading.value = false
  }
}

// 模型输入的模糊建议
const modelFocus = ref(false)
let blurTimer: ReturnType<typeof setTimeout> | null = null

const modelSuggestions = computed(() => {
  const q = aiConfig.model.trim().toLowerCase()
  const list = q
    ? modelList.value.filter(m => m.toLowerCase().includes(q))
    : modelList.value

  return list.filter(m => m !== aiConfig.model).slice(0, 8)
})

function onModelFocus() {
  modelFocus.value = true
  ensureModels()
}

function onModelBlur() {
  if (blurTimer)
    clearTimeout(blurTimer)

  blurTimer = setTimeout(() => {
    modelFocus.value = false
  }, 150)
}

function chooseModel(model: string) {
  aiConfig.model = model
  modelFocus.value = false
}
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

            <!-- AI 助手：厂商快捷 + 动态模型列表 + 自填 Key，仅存本地浏览器 -->
            <div class="panel-section">
              <p class="panel-label">
                AI 助手（Key 仅存本地浏览器）
              </p>
              <div class="panel-row panel-providers">
                <button
                  v-for="p in aiProviders"
                  :key="p.id"
                  type="button"
                  class="provider-chip"
                  :class="{ 'provider-chip-active': providerId === p.id }"
                  @click="selectProvider(p.id)"
                >
                  {{ p.name }}
                </button>
                <button
                  type="button"
                  class="provider-chip"
                  :class="{ 'provider-chip-active': providerId === 'custom' }"
                  @click="selectProvider('custom')"
                >
                  自定义
                </button>
              </div>
              <div class="panel-model-box">
                <p class="ai-label">
                  模型
                </p>
                <div class="panel-model-input">
                  <input
                    v-model="aiConfig.model"
                    class="ai-field"
                    placeholder="聚焦自动获取，可输入筛选"
                    spellcheck="false"
                    @focus="onModelFocus"
                    @blur="onModelBlur"
                  >
                  <span v-if="modelsLoading" class="search-spin i-carbon:renew" aria-hidden="true" />
                  <div v-if="modelFocus && modelSuggestions.length" class="model-results">
                    <button
                      v-for="m in modelSuggestions"
                      :key="m"
                      type="button"
                      class="model-item"
                      @mousedown.prevent="chooseModel(m)"
                    >
                      <span class="model-id">{{ m }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="panel-model-box">
                <p class="ai-label">
                  接口地址
                </p>
                <input
                  v-model="aiConfig.baseUrl"
                  class="ai-field"
                  placeholder="如 https://api.deepseek.com/v1"
                  spellcheck="false"
                >
              </div>
              <div class="panel-model-box">
                <p class="ai-label">
                  API Key
                </p>
                <input
                  v-model="aiConfig.apiKey"
                  type="password"
                  class="ai-field"
                  placeholder="仅在本地浏览器保存"
                  spellcheck="false"
                >
              </div>
              <div class="panel-row panel-ai-actions">
                <span class="ai-status" :class="`ai-status-${testState}`">
                  {{ statusText }}
                </span>
                <div class="panel-row panel-ai-buttons">
                  <button
                    v-if="configured"
                    type="button"
                    class="ai-test"
                    :disabled="testState === 'testing'"
                    @click="runTest"
                  >
                    {{ testState === 'testing' ? '检测中…' : '测试连接' }}
                  </button>
                  <button type="button" class="ai-clear" @click="clearConfig">
                    清除
                  </button>
                </div>
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

/* AI 配置 */
.panel-providers {
  flex-wrap: wrap;
}

.provider-chip {
  min-height: 26px;
  padding: 4px 10px;

  border: 1px solid rgba(70, 74, 88, 0.16);
  border-radius: 9999px;
  background: transparent;
  color: #5c6070;

  font-size: 11px;

  cursor: pointer;
  transition: all 160ms ease;
}

.provider-chip:hover {
  border-color: color-mix(in srgb, var(--brand, #ed7d68) 50%, transparent);
  color: var(--brand, #ed7d68);
}

.provider-chip-active {
  border-color: var(--brand, #ed7d68);
  background: color-mix(in srgb, var(--brand, #ed7d68) 10%, transparent);
  color: var(--brand, #ed7d68);
}

.panel-model-box {
  display: flex;
  align-items: center;
  gap: 6px;

  width: 282px;
}

.panel-model-input {
  position: relative;

  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.panel-model-box .ai-field {
  flex: 1;
  width: auto;
  min-width: 0;
}

.panel-model-input .ai-field {
  padding-right: 30px;
}

.panel-model-input .search-spin {
  position: absolute;
  right: 10px;
}

.search-spin {
  flex: none;

  color: #9aa0ad;
  font-size: 14px;

  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.model-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 10;

  display: flex;
  flex-direction: column;
  gap: 2px;

  max-height: 180px;
  box-sizing: border-box;

  padding: 4px;

  border: 1px solid rgba(70, 74, 88, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 20px rgba(20, 29, 55, 0.12);

  overflow-y: auto;
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  padding: 6px 8px;

  border: none;
  border-radius: 6px;
  background: transparent;

  cursor: pointer;
  text-align: left;

  transition: background 120ms ease;
}

.model-item:hover {
  background: #f3f4f6;
}

.model-item b {
  overflow: hidden;
  flex: none;

  max-width: 96px;

  color: #141d37;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-id {
  overflow: hidden;

  color: #9aa0ad;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-field {
  display: block;
  width: 230px;
  box-sizing: border-box;

  min-height: 32px;
  padding: 6px 10px;

  border: 1px solid rgba(70, 74, 88, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #141d37;

  font-size: 12px;

  outline: none;
  transition: border-color 160ms ease;
}

.ai-field:focus {
  border-color: var(--brand, #ed7d68);
}

.ai-field::placeholder {
  color: #b3b7c2;
}

/* 字段标签 */
.ai-label {
  flex: none;

  width: 44px;

  color: #9aa0ad;
  font-size: 11px;
}

/* 连通性状态 */
.panel-ai-actions {
  justify-content: space-between;
  align-items: center;
}

.ai-status {
  color: #9aa0ad;
  font-size: 11px;
}

.ai-status-ok {
  color: #7cb342;
}

.ai-status-fail {
  color: #e05252;
}

.panel-ai-buttons {
  gap: 6px;
}

.ai-test {
  min-height: 24px;
  padding: 3px 10px;

  border: 1px solid color-mix(in srgb, var(--brand, #ed7d68) 55%, transparent);
  border-radius: 9999px;
  background: transparent;
  color: var(--brand, #ed7d68);

  font-size: 11px;

  cursor: pointer;
  transition: all 160ms ease;
}

.ai-test:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand, #ed7d68) 10%, transparent);
}

.ai-test:disabled {
  opacity: 0.5;
  cursor: default;
}

.ai-clear {
  min-height: 24px;
  padding: 3px 9px;

  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #9aa0ad;

  font-size: 11px;

  cursor: pointer;
  transition: all 160ms ease;
}

.ai-clear:hover {
  background: #f3f4f6;
  color: #141d37;
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
