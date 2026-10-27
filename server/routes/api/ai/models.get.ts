// 模型搜索：代理 models.dev 数据集（约 6MB），服务端缓存并按关键词检索
// 接口: GET /api/ai/models?q=deepseek

interface ModelItem {
  providerId: string
  providerName: string
  baseUrl: string
  modelId: string
}

const DATASET_TTL = 24 * 60 * 60 * 1000
let dataset: { at: number, items: ModelItem[] } | null = null

// models.dev 的 api 字段是根地址，OpenAI 兼容调用通常需要补 /v1
function normalizeBaseUrl(api: string): string {
  const trimmed = api.replace(/\/+$/, '')
  return /\/v\d+$/.test(trimmed) ? trimmed : `${trimmed}/v1`
}

// 部分官方厂商在 models.dev 未填 api 字段，这里补已知默认值
const knownBaseUrls: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
}

async function loadDataset(): Promise<ModelItem[]> {
  if (dataset && Date.now() - dataset.at < DATASET_TTL)
    return dataset.items

  const raw = await $fetch<Record<string, {
    id?: string
    name?: string
    api?: string
    models?: Record<string, unknown>
  }>>('https://models.dev/api.json', { timeout: 30_000 })

  const items: ModelItem[] = []
  for (const provider of Object.values(raw)) {
    const api = provider.api?.trim() || knownBaseUrls[provider.id ?? '']
    if (!api || !provider.models)
      continue

    const baseUrl = normalizeBaseUrl(api)
    for (const modelId of Object.keys(provider.models)) {
      items.push({
        providerId: provider.id ?? '',
        providerName: provider.name ?? provider.id ?? '',
        baseUrl,
        modelId,
      })
    }
  }

  dataset = { at: Date.now(), items }
  return items
}

// 优先级：官方厂商精确命中 > 模型精确命中 > 厂商前缀 > 模型前缀 > 厂商名前缀 > 普通包含
function score(item: ModelItem, q: string) {
  const providerId = item.providerId.toLowerCase()
  const providerName = item.providerName.toLowerCase()
  const modelId = item.modelId.toLowerCase()

  if (providerId === q)
    return 6
  if (modelId === q)
    return 5
  if (providerId.startsWith(q))
    return 4
  if (modelId.startsWith(q))
    return 3
  if (providerName.startsWith(q))
    return 2
  return 1
}

export default defineEventHandler(async (event) => {
  const q = (getQuery(event).q ?? '').toString().trim().toLowerCase()
  if (!q)
    return { items: [] }

  let items: ModelItem[]
  try {
    items = await loadDataset()
  }
  catch (error) {
    console.error('拉取 models.dev 数据集失败', error)
    return { items: [] }
  }

  const matched = items
    .filter(item =>
      item.providerId.toLowerCase().includes(q)
      || item.providerName.toLowerCase().includes(q)
      || item.modelId.toLowerCase().includes(q),
    )
    .sort((a, b) =>
      score(b, q) - score(a, q)
      || a.modelId.length - b.modelId.length
      || a.providerName.length - b.providerName.length,
    )
    .slice(0, 20)

  return { items: matched }
})
