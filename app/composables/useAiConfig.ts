import { useStorage } from '@vueuse/core'

// AI 配置：页面设置面板自填，仅存本地浏览器，请求时经请求头透传给服务端
// ready 表示已通过连通性测试，AI 功能仅在其为 true 时展示
export interface AiConfig {
  baseUrl: string
  apiKey: string
  model: string
  ready?: boolean
}

// 常见 OpenAI 兼容厂商快捷方式（模型列表从厂商 /models 接口动态获取）
export interface AiProvider {
  id: string
  name: string
  baseUrl: string
}

export const aiProviders: AiProvider[] = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1' },
  { id: 'qwen', name: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { id: 'kimi', name: 'Kimi', baseUrl: 'https://api.moonshot.cn/v1' },
  { id: 'zhipu', name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4' },
]

// 按 Base URL 识别当前配置属于哪个预设厂商
export function matchAiProvider(baseUrl: string): AiProvider | undefined {
  return aiProviders.find(p => p.baseUrl === baseUrl.trim())
}

const emptyConfig: AiConfig = { baseUrl: '', apiKey: '', model: '' }

const config = useStorage<AiConfig>('ai-config', emptyConfig)

// 任一连接字段变化后，上次的连通性结果作废
watch(
  () => `${config.value.baseUrl}|${config.value.apiKey}|${config.value.model}`,
  () => {
    if (config.value.ready)
      config.value = { ...config.value, ready: false }
  },
)

export function useAiConfig() {
  const configured = computed(() => {
    const c = config.value
    return !!(c.baseUrl && c.apiKey && c.model)
  })

  const aiEnabled = computed(() => configured.value && config.value.ready === true)

  function aiHeaders(): Record<string, string> {
    const c = config.value
    return {
      'x-ai-base-url': c.baseUrl,
      'x-ai-api-key': c.apiKey,
      'x-ai-model': c.model,
    }
  }

  // 连通性测试：拉一次厂商 /models，成功即视为配置可用
  async function testConnection(): Promise<boolean> {
    try {
      await $fetch('/api/ai/models', { headers: aiHeaders() })
      config.value = { ...config.value, ready: true }
      return true
    }
    catch {
      config.value = { ...config.value, ready: false }
      return false
    }
  }

  function clearConfig() {
    config.value = { ...emptyConfig }
  }

  return { config, configured, aiEnabled, aiHeaders, testConnection, clearConfig }
}
