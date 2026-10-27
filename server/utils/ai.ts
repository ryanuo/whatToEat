import type { H3Event } from 'h3'
import type { z } from 'zod'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText, Output } from 'ai'

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

  // 去掉结尾斜杠，避免拼出 //models 之类的地址
  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey, model }
}

export function createAiProvider(config: AiClientConfig) {
  return createOpenAICompatible({
    name: 'user-provider',
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
  })
}

// 智谱 GLM 等厂商在用 response_format=json_object 时，要求 messages 里出现 "json" 字样，
// 否则直接 400（'messages' must contain the word 'json'）。统一在 system 末尾点明 JSON 输出。
const jsonInstruction = '输出格式：只给出一个合法的 JSON 对象，不要任何解释文字或 Markdown 代码块。'

// 厂商响应可能很慢（实测 Qwen 约 20s），但必须设上限：
// 否则前端 loading 永远转下去，输入框看起来像被卡死。
const AI_TIMEOUT_MS = 30_000

interface JsonObjectOptions<S extends z.ZodType> {
  config: AiClientConfig
  schema: S
  system: string
  prompt: string
  temperature?: number
}

// 有些兼容厂商压根不支持 response_format，退回纯文本再自行解析
function shouldRetryAsText(message: string): boolean {
  return /response_format|json_object|json mode|unsupported|invalid_parameter/i.test(message)
}

// 超时要给出人话，前端直接展示，别把 AbortError 抛给用户
function toFriendlyError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error)
  if (/abort|timed? ?out/i.test(message))
    throw createError({ statusCode: 504, message: 'AI 响应超时，请稍后再试' })
  throw createError({ statusCode: 502, message: `AI 调用失败：${message.slice(0, 120)}` })
}

function parseJsonLoose(raw: string): unknown {
  const text = raw.replace(/```(?:json)?/gi, '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start)
    throw new Error('模型未返回 JSON')

  return JSON.parse(text.slice(start, end + 1))
}

// 统一的结构化生成入口：优先 JSON 模式，失败时按需回落纯文本解析
export async function generateJsonObject<S extends z.ZodType>(options: JsonObjectOptions<S>): Promise<z.infer<S>> {
  const model = createAiProvider(options.config).chatModel(options.config.model)
  const system = `${options.system}\n${jsonInstruction}`

  try {
    // AI SDK v7：generateObject 已弃用，改用 generateText + Output.object
    const { output } = await generateText({
      model,
      output: Output.object({ schema: options.schema }),
      system,
      prompt: options.prompt,
      temperature: options.temperature,
      abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
    })

    return output as z.infer<S>
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!shouldRetryAsText(message))
      toFriendlyError(error)

    const { text } = await generateText({
      model,
      system,
      prompt: options.prompt,
      temperature: options.temperature,
      abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
    })

    return options.schema.parse(parseJsonLoose(text)) as z.infer<S>
  }
}
