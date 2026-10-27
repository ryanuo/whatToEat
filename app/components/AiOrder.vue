<script setup lang="ts">
import { speechLanguages } from '~/composables/useSpeechInput'
import { useStorage } from '@vueuse/core'

// 智能点餐输入栏：textarea + 麦克风/语言/发送，AI 点菜结果点击落到大标题
const emit = defineEmits<{
  pick: [name: string]
}>()

const { aiEnabled, aiHeaders } = useAiConfig()

const message = ref('')
const loading = ref(false)
const picks = ref<{ name: string, reason: string }[]>([])
const errorText = ref('')
const textareaEl = ref<HTMLTextAreaElement>()

// 语音语言：默认中文普通话，本地记忆
const langCode = useStorage('ai-speech-lang', 'zh-CN')
const currentLang = computed(() => speechLanguages.find(l => l.code === langCode.value) ?? speechLanguages[0]!)

const { isSupported: micSupported, isListening, toggle: toggleMic } = useSpeechInput((text) => {
  message.value = text
  submit()
}, langCode)

const canSend = computed(() => !!message.value.trim() && !loading.value)

function autoResize() {
  const el = textareaEl.value
  if (!el)
    return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

// 回车发送，Shift+回车换行；输入法组词中的回车不触发
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing)
    return
  e.preventDefault()
  submit()
}

async function submit() {
  const msg = message.value.trim()
  if (!msg || loading.value)
    return

  loading.value = true
  errorText.value = ''
  picks.value = []

  try {
    const res = await $fetch<{ picks: { name: string, reason: string }[] }>(
      '/api/ai/recommend',
      { method: 'POST', headers: aiHeaders(), body: { message: msg } },
    )
    picks.value = res.picks

    if (res.picks.length === 0)
      errorText.value = 'AI 没找到合适的菜，换个说法试试？'
  }
  catch (err) {
    errorText.value = 'AI 出走了，稍后再试'
    console.error('AI 点菜失败', err)
  }
  finally {
    loading.value = false
  }
}

function onPick(name: string) {
  emit('pick', name)
  picks.value = []
}

/* ---------------- 语言选择 ---------------- */

const langOpen = ref(false)
const langRef = ref<HTMLElement>()

onClickOutside(langRef, () => {
  langOpen.value = false
})

function pickLang(code: string) {
  langCode.value = code
  langOpen.value = false
}
</script>

<template>
  <div v-if="aiEnabled" class="ai-order">
    <!-- 输入面板：暖白轻拟物 -->
    <div class="ai-panel">
      <textarea
        ref="textareaEl"
        v-model="message"
        rows="1"
        class="ai-textarea"
        placeholder="今天想吃点什么？例如：清淡一点、想吃辣的、家里有鸡蛋……"
        @input="autoResize"
        @keydown="onKeydown"
      />

      <div class="ai-toolbar">
        <!-- 左：语音输入 -->
        <div class="ai-mic-group">
          <button
            v-if="micSupported"
            type="button"
            class="ai-mic"
            :class="{ 'ai-mic-recording': isListening }"
            :title="isListening ? '停止录音' : '语音输入'"
            :aria-pressed="isListening"
            @click="toggleMic"
          >
            <span class="i-carbon:microphone" />
          </button>
          <span v-if="isListening" class="ai-mic-hint">正在聆听…</span>
        </div>

        <!-- 右：语言选择 + 发送 -->
        <div class="ai-toolbar-right">
          <div v-if="micSupported" ref="langRef" class="ai-lang">
            <button
              type="button"
              class="ai-lang-btn"
              :aria-expanded="langOpen"
              @click="langOpen = !langOpen"
            >
              <span class="i-carbon:language" aria-hidden="true" />
              <span class="ai-lang-name">{{ currentLang.name }}</span>
              <span class="i-carbon:chevron-down" :class="{ 'ai-lang-arrow-open': langOpen }" aria-hidden="true" />
            </button>

            <Transition name="ai-drop">
              <div v-if="langOpen" class="ai-lang-menu" role="menu">
                <button
                  v-for="l in speechLanguages"
                  :key="l.code"
                  type="button"
                  role="menuitem"
                  class="ai-lang-option"
                  :class="{ 'ai-lang-option-active': l.code === langCode }"
                  @click="pickLang(l.code)"
                >
                  {{ l.name }}
                  <span v-if="l.code === langCode" class="i-carbon:checkmark" aria-hidden="true" />
                </button>
              </div>
            </Transition>
          </div>

          <button
            type="button"
            class="ai-send"
            :disabled="!canSend"
            :title="loading ? 'AI 正在想…' : '发送（回车）'"
            aria-label="发送"
            @click="submit"
          >
            <span v-if="loading" class="i-carbon:circle-dash ai-anim-spin" />
            <span v-else class="i-carbon:arrow-up" />
          </button>
        </div>
      </div>
    </div>

    <!-- 候选结果 -->
    <TransitionGroup v-if="picks.length" name="ai-pick" tag="div" class="ai-picks">
      <button
        v-for="p in picks"
        :key="p.name"
        type="button"
        class="ai-pick"
        @click="onPick(p.name)"
      >
        <b>{{ p.name }}</b>
        <span>{{ p.reason }}</span>
      </button>
    </TransitionGroup>

    <p v-if="errorText" class="ai-error">
      {{ errorText }}
    </p>
  </div>
</template>

<style scoped>
.ai-order {
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 24px;
}

/* 输入面板：暖白轻拟物 */
.ai-panel {
  width: min(560px, 100%);
  box-sizing: border-box;

  padding: 12px 14px 10px;

  border: 1px solid rgba(210, 202, 188, 0.85);
  border-radius: 20px;
  background: rgba(255, 253, 248, 0.94);
  box-shadow: 0 4px 16px rgba(93, 79, 58, 0.07);

  text-align: left;

  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.ai-panel:focus-within {
  border-color: rgba(124, 179, 66, 0.55);
  box-shadow: 0 6px 20px rgba(93, 79, 58, 0.1);
}

.ai-textarea {
  display: block;

  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  max-height: 120px;

  padding: 6px 2px;

  border: none;
  background: transparent;
  color: #141d37;

  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;

  outline: none;
  resize: none;
  overflow-y: auto;
}

.ai-textarea::placeholder {
  color: #b3ab9c;
}

/* 底部工具条 */
.ai-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 6px;
}

.ai-mic-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-mic {
  display: grid;
  place-items: center;

  width: 32px;
  height: 32px;

  border: 1px solid rgba(210, 202, 188, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.85);
  color: #8b8577;

  font-size: 15px;

  cursor: pointer;
  transition: all 160ms ease;
}

.ai-mic:hover {
  color: #141d37;
  border-color: rgba(160, 152, 136, 0.9);
}

.ai-mic:focus-visible {
  outline: 2px solid rgba(124, 179, 66, 0.7);
  outline-offset: 2px;
}

.ai-mic-recording {
  border-color: transparent;
  background: #e05252;
  color: #fff;

  animation: ai-pulse 1.2s ease infinite;
}

.ai-mic-hint {
  color: #e05252;
  font-size: 11px;
}

.ai-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 语言选择器 */
.ai-lang {
  position: relative;
}

.ai-lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  min-height: 32px;
  padding: 4px 10px;

  border: 1px solid rgba(210, 202, 188, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.85);
  color: #5c6070;

  font-size: 11px;

  cursor: pointer;
  transition: all 160ms ease;
}

.ai-lang-btn:hover {
  color: #141d37;
}

.ai-lang-btn:focus-visible {
  outline: 2px solid rgba(124, 179, 66, 0.7);
  outline-offset: 2px;
}

.ai-lang-name {
  max-width: 88px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-lang-arrow-open {
  transform: rotate(180deg);
}

.ai-lang [class*='i-carbon'] {
  font-size: 13px;
}

.ai-lang-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 6px);

  display: flex;
  flex-direction: column;

  min-width: 132px;
  padding: 4px;

  border: 1px solid rgba(210, 202, 188, 0.85);
  border-radius: 12px;
  background: rgba(255, 253, 248, 0.98);
  box-shadow: 0 10px 28px rgba(93, 79, 58, 0.14);

  overflow-y: auto;
}

.ai-lang-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  padding: 8px 10px;

  border: none;
  border-radius: 8px;
  background: transparent;
  color: #5c6070;

  font-size: 12px;
  text-align: left;
  white-space: nowrap;

  cursor: pointer;
  transition: all 140ms ease;
}

.ai-lang-option:hover {
  background: rgba(124, 179, 66, 0.1);
  color: #141d37;
}

.ai-lang-option-active {
  color: #5a8f2e;
  font-weight: 500;
}

/* 发送按钮：深蓝实心 */
.ai-send {
  display: grid;
  place-items: center;

  width: 34px;
  height: 34px;

  border: none;
  border-radius: 11px;
  background: #202d67;
  color: #fff;

  font-size: 16px;

  cursor: pointer;
  transition: all 160ms ease;
}

.ai-send:hover:not(:disabled) {
  background: #2a3a7d;
}

.ai-send:disabled {
  background: #dcd7cb;
  cursor: default;
}

.ai-send:focus-visible {
  outline: 2px solid rgba(32, 45, 103, 0.55);
  outline-offset: 2px;
}

.ai-anim-spin {
  animation: ai-spin 1s linear infinite;
}

/* 候选结果 */
.ai-picks {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;

  width: min(560px, 100%);

  margin-top: 12px;
}

.ai-pick {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;

  max-width: 100%;

  padding: 8px 14px;

  border: 1px solid rgba(210, 202, 188, 0.85);
  border-radius: 9999px;
  background: rgba(255, 253, 248, 0.92);

  cursor: pointer;
  transition: all 160ms ease;
}

.ai-pick b {
  color: #141d37;
  font-size: 13px;
}

.ai-pick span {
  color: #9aa0ad;
  font-size: 11px;
}

.ai-pick:hover {
  border-color: rgba(124, 179, 66, 0.6);
  background: #fffdf8;
  transform: translateY(-1px);
}

.ai-pick:focus-visible {
  outline: 2px solid rgba(124, 179, 66, 0.7);
  outline-offset: 2px;
}

.ai-error {
  margin-top: 10px;
  color: #9aa0ad;
  font-size: 12px;
}

/* 过渡动画 */
.ai-pick-enter-active {
  transition: all 0.25s ease;
}

.ai-pick-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.ai-drop-enter-active,
.ai-drop-leave-active {
  transition: all 0.16s ease;
}

.ai-drop-enter-from,
.ai-drop-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@keyframes ai-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(224, 82, 82, 0.4);
  }

  50% {
    box-shadow: 0 0 0 6px rgba(224, 82, 82, 0);
  }
}

@keyframes ai-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
