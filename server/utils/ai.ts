import type { H3Event } from 'h3'

// 从请求头读取用户自填的 AI 配置（页面设置面板存 localStorage，请求时透传）
export interface AiClientConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export function readAiConfig(event: H3Event): AiClientConfig | undefined {
  const baseUrl = getHeader(event, 'x-ai-base-url')?.trim()
  const apiKey = getHeader(event, 'x-ai-api-key')?.trim()
  const model = getHeader(event, 'x-ai-model')?.trim()

  if (!baseUrl || !apiKey || !model)
    return undefined

  return { baseUrl, apiKey, model }
}
