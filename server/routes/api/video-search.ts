import type { VideoItem } from '~/types'

// B 站视频搜索代理：按菜名搜索「XX的做法」视频
// 接口: GET /api/video-search?name=菜名

const CACHE_TTL = 10 * 60 * 1000
const cache = new Map<string, { at: number, data: VideoItem[] }>()

function cleanTitle(title: string) {
  return title.replace(/<[^>]+>/g, '')
}

function pickVideos(raw: unknown): VideoItem[] {
  if (!raw || typeof raw !== 'object')
    return []

  // search/all/v2 返回按 result_type 分组的结构，视频在 type=video 组的 data 里
  const groups = (raw as { result?: Array<{ result_type?: string, data?: unknown[] }> }).result
  if (!Array.isArray(groups))
    return []

  const items = groups
    .filter(g => g.result_type === 'video')
    .flatMap(g => (Array.isArray(g.data) ? g.data : []))

  return items
    .slice(0, 6)
    .map((item) => {
      const v = item as Record<string, unknown>
      return {
        bvid: String(v.bvid ?? ''),
        title: cleanTitle(String(v.title ?? '')),
        author: String(v.author ?? ''),
        duration: String(v.duration ?? ''),
        cover: String(v.pic ?? ''),
        play: Number(v.play ?? 0),
      }
    })
    .filter(v => v.bvid)
}

export default defineEventHandler(async (event) => {
  const name = getQuery(event).name
  if (typeof name !== 'string' || !name.trim()) {
    throw createError({ statusCode: 400, statusMessage: '缺少菜名参数' })
  }

  const key = name.trim()
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL)
    return { results: hit.data }

  const keyword = encodeURIComponent(`${key}的做法`)
  const url = `https://api.bilibili.com/x/web-interface/search/all/v2?keyword=${keyword}`

  try {
    const res = await $fetch<{ code: number, data?: unknown }>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
      },
      timeout: 8000,
    })

    const videos = res.code === 0 ? pickVideos(res.data) : []
    cache.set(key, { at: Date.now(), data: videos })
    return { results: videos }
  }
  catch (error) {
    console.error(`B 站视频搜索失败: ${key}`, error)
    return { results: [] }
  }
})
