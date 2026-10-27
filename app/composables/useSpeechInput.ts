// Web Speech API 语音输入：先特性检测，支持才暴露麦克风入口
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

export function useSpeechInput(onResult: (text: string) => void) {
  const isSupported = ref(false)
  const isListening = ref(false)
  let recognition: SpeechRecognitionLike | null = null

  onMounted(() => {
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!Ctor)
      return

    isSupported.value = true
    recognition = new Ctor()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript ?? ''
      if (text)
        onResult(text)
    }
    recognition.onend = () => {
      isListening.value = false
    }
    recognition.onerror = () => {
      isListening.value = false
    }
  })

  function toggle() {
    if (!recognition)
      return

    if (isListening.value) {
      recognition.stop()
      isListening.value = false
    }
    else {
      try {
        recognition.start()
        isListening.value = true
      }
      catch {
        isListening.value = false
      }
    }
  }

  return { isSupported, isListening, toggle }
}
