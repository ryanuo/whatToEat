// 模型列表：代理用户所配置厂商的 GET {baseUrl}/models 接口
// 接口: GET /api/ai/models（配置经请求头透传）
// 兼作连通性测试：200 = 鉴权与网络可用，502 = 不可达/鉴权失败

export default defineEventHandler(async (event) => {
  const config = readAiConfig(event)
  if (!config)
    throw createError({ statusCode: 400, message: '未配置 AI' })

  const url = `${config.baseUrl.replace(/\/+$/, '')}/models`

  try {
    const res = await $fetch<{ data?: Array<{ id?: string }> }>(url, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      timeout: 8000,
    })

    const models = (res.data ?? [])
      .map(m => String(m.id ?? ''))
      .filter(Boolean)
      .sort()
      .slice(0, 200)

    return { models }
  }
  catch (error) {
    console.error(`获取模型列表失败 ${url}`, error)
    throw createError({ statusCode: 502, message: '模型接口不可用，请检查地址与 Key' })
  }
})
