<script setup lang="ts">
// AI 点菜：自然语言描述 → 3 个候选菜 + 理由，点击直接落到大标题
const emit = defineEmits<{
  pick: [name: string]
}>()

const { aiEnabled, aiHeaders } = useAiConfig()

const message = ref('')
const loading = ref(false)
const picks = ref<{ name: string, reason: string }[]>([])
const errorText = ref('')

const { isSupported: micSupported, isListening, toggle: toggleMic } = useSpeechInput((text) => {
  message.value = text
  submit()
})

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
</script>

<template>
  <div v-if="aiEnabled" class="ai-order">
    <div class="ai-bar">
      <span class="ai-bar-icon i-carbon:sparkle" aria-hidden="true" />
      <input
        v-model="message"
        class="ai-input"
        placeholder="想吃辣的、来碗热汤、家里有土豆和牛肉…"
        enterkeyhint="send"
        @keydown.enter="submit"
      >
      <button
        v-if="micSupported"
        type="button"
        class="ai-btn"
        :class="{ 'ai-btn-listening': isListening }"
        :title="isListening ? '停止录音' : '语音输入'"
        :aria-pressed="isListening"
        @click="toggleMic"
      >
        <span class="i-carbon:microphone" />
      </button>
      <button
        type="button"
        class="ai-btn ai-btn-send"
        :disabled="loading || !message.trim()"
        title="让 AI 想想"
        @click="submit"
      >
        <span :class="loading ? 'i-carbon:renew animate-spin' : 'i-carbon:send'" />
      </button>
    </div>

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

  margin-top: 22px;
}

.ai-bar {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  max-width: 100%;

  padding: 4px 6px 4px 12px;

  border: 1px solid rgba(70, 74, 88, 0.14);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  transition: border-color 180ms ease;
}

.ai-bar:focus-within {
  border-color: color-mix(in srgb, var(--brand, #ed7d68) 55%, transparent);
}

.ai-bar-icon {
  flex: none;

  color: var(--brand, #ed7d68);
  font-size: 15px;
}

.ai-input {
  width: min(300px, 56vw);

  min-height: 30px;

  border: none;
  background: transparent;
  color: #141d37;

  font-size: 13px;

  outline: none;
}

.ai-input::placeholder {
  color: #9aa0ad;
}

.ai-btn {
  display: grid;
  place-items: center;
  flex: none;

  width: 30px;
  height: 30px;

  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #5c6070;

  font-size: 15px;

  cursor: pointer;
  transition: all 160ms ease;
}

.ai-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #141d37;
}

.ai-btn-listening {
  color: #fff;
  background: #ed7d68;
  animation: pulse 1.2s ease infinite;
}

.ai-btn-send {
  color: var(--brand, #ed7d68);
}

.ai-btn-send:disabled {
  color: #b3b7c2;
  cursor: default;
}

.ai-btn:focus-visible {
  outline: 2px solid rgba(201, 77, 94, 0.75);
  outline-offset: 1px;
}

/* 候选结果 */
.ai-picks {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;

  margin-top: 12px;
}

.ai-pick {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;

  max-width: 100%;

  padding: 8px 14px;

  border: 1px solid rgba(70, 74, 88, 0.14);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.78);

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
  border-color: color-mix(in srgb, var(--brand, #ed7d68) 55%, transparent);
  background: #fff;
  transform: translateY(-1px);
}

.ai-pick:focus-visible {
  outline: 2px solid rgba(201, 77, 94, 0.75);
  outline-offset: 2px;
}

.ai-error {
  margin-top: 10px;
  color: #9aa0ad;
  font-size: 12px;
}

.ai-pick-enter-active {
  transition: all 0.25s ease;
}

.ai-pick-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(237, 125, 104, 0.4);
  }

  50% {
    box-shadow: 0 0 0 6px rgba(237, 125, 104, 0);
  }
}
</style>
