import { useStorage } from '@vueuse/core'

// AI 配置：页面设置面板自填，仅存本地浏览器，请求时经请求头透传给服务端
export interface AiConfig {
  baseUrl: string
  apiKey: string
  model: string
}

const emptyConfig: AiConfig = { baseUrl: '', apiKey: '', model: '' }

const config = useStorage<AiConfig>('ai-config', emptyConfig)

export function useAiConfig() {
  const aiEnabled = computed(() => {
    const c = config.value
    return !!(c.baseUrl && c.apiKey && c.model)
  })

  function aiHeaders(): Record<string, string> {
    const c = config.value
    return {
      'x-ai-base-url': c.baseUrl,
      'x-ai-api-key': c.apiKey,
      'x-ai-model': c.model,
    }
  }

  function clearConfig() {
    config.value = { ...emptyConfig }
  }

  return { config, aiEnabled, aiHeaders, clearConfig }
}
