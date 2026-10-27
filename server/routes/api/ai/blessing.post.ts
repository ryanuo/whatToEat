import { z } from 'zod'

// 劝吃文案：抽中菜品后生成一句俏皮的推荐语
// 接口: POST /api/ai/blessing { dish }，配置经请求头透传（见 server/utils/ai.ts）

const cache = new Map<string, { text: string, at: number }>()
const TTL = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const config = readAiConfig(event)
  if (!config)
    throw createError({ statusCode: 400, message: '未配置 AI' })

  const body = await readBody(event).catch(() => undefined)
  const dish = typeof body?.dish === 'string' ? body.dish.trim() : ''
  if (!dish)
    throw createError({ statusCode: 400, message: '缺少菜名' })

  const cacheKey = `${config.model}:${dish}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < TTL)
    return { text: hit.text }

  const result = await generateJsonObject({
    config,
    schema: z.object({ text: z.string().min(4).max(60) }),
    temperature: 0.9,
    system: [
      '你是「今天吃神马」的美食文案师，为抽中的菜品写一句劝吃文案。',
      '要求：口语化、俏皮有梗、贴合菜品特点、不超过 30 字、最多 1 个 emoji、不要引号和书名号、不要「今日宜」开头重复模板。',
      '示例：周二的疲惫，只有一碗热汤面能治愈。',
      '以 JSON 格式返回：{"text":"文案"}',
    ].join('\n'),
    prompt: `菜品：${dish}`,
  })

  const text = result?.text
  if (!text)
    throw createError({ statusCode: 502, message: 'AI 返回了无法解析的内容，建议重试或更换模型' })

  cache.set(cacheKey, { text, at: Date.now() })
  return { text }
})
