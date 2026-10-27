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

// 只持久化连接字段。ready 是「本次会话测通过」的状态，不入 localStorage：
// 1) 避免存储写入与失效重置互相抢跑（useStorage 的写 watcher 会 pause/resume，
//    重置值可能只改内存不落盘，导致内存与存储不一致）；
// 2) 刷新后不该凭旧的 ready 复活，字段变了就得重新测。
const stored = useStorage<Omit<AiConfig, 'ready'>>('ai-config', emptyConfig)

// 连通性测试结果：会话内有效
const ready = ref(false)

// 任一连接字段变化后，上次的连通性结果作废
watch(
  () => `${stored.value.baseUrl}|${stored.value.apiKey}|${stored.value.model}`,
  () => {
    ready.value = false
  },
)

export function useAiConfig() {
  // 对外的 config：字段直接可写（v-model 绑到 stored），ready 从会话状态带出
  const config = reactive({
    get baseUrl() {
      return stored.value.baseUrl
    },
    set baseUrl(v: string) {
      stored.value = { ...stored.value, baseUrl: v }
    },
    get apiKey() {
      return stored.value.apiKey
    },
    set apiKey(v: string) {
      stored.value = { ...stored.value, apiKey: v }
    },
    get model() {
      return stored.value.model
    },
    set model(v: string) {
      stored.value = { ...stored.value, model: v }
    },
    get ready() {
      return ready.value
    },
    set ready(v: boolean | undefined) {
      ready.value = v === true
    },
  }) as AiConfig

  const configured = computed(() => {
    const c = stored.value
    return !!(c.baseUrl && c.apiKey && c.model)
  })

  const aiEnabled = computed(() => configured.value && ready.value)

  function aiHeaders(): Record<string, string> {
    const c = stored.value
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
      ready.value = true
      return true
    }
    catch {
      ready.value = false
      return false
    }
  }

  function clearConfig() {
    stored.value = { ...emptyConfig }
    ready.value = false
  }

  return { config, configured, aiEnabled, aiHeaders, testConnection, clearConfig }
}
