import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateObject } from 'ai'
import { z } from 'zod'

// 自然语言点菜：从现有菜单中挑 3 道最符合用户描述的菜
// 接口: POST /api/ai/recommend { message }，配置经请求头透传

const schema = z.object({
  picks: z.array(
    z.object({
      name: z.string(),
      reason: z.string().max(50),
    }),
  ).min(1).max(3),
})

export default defineEventHandler(async (event) => {
  const config = readAiConfig(event)
  if (!config)
    throw createError({ statusCode: 400, statusMessage: '未配置 AI' })

  const body = await readBody(event).catch(() => undefined)
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message)
    throw createError({ statusCode: 400, statusMessage: '请描述你想吃什么' })

  const recipes = await loadRecipes(event)
  if (recipes.length === 0)
    throw createError({ statusCode: 502, statusMessage: '菜谱数据不可用' })

  const menu = recipes.map(r => `${r.name}｜${r.category}`).join('\n')
  const validNames = new Set(recipes.map(r => r.name))

  const provider = createOpenAICompatible({
    name: 'user-provider',
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
  })

  const { object } = await generateObject({
    model: provider.chatModel(config.model),
    schema,
    temperature: 0.3,
    system: [
      '你是「今天吃神马」的点菜助手，根据用户需求从给定菜单中挑选最合适的 3 道菜。',
      '严格规则：只能从菜单中选，菜名必须与菜单完全一致；每道菜给一句不超过 20 字的推荐理由。',
    ].join('\n'),
    prompt: `菜单（名称｜分类）：\n${menu}\n\n用户需求：${message}`,
  })

  // 防幻觉：菜名白名单过滤
  const picks = object.picks.filter(p => validNames.has(p.name))

  return { picks }
})
