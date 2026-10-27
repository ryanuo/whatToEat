import type { H3Event } from 'h3'
import type { Recipe } from '~/types'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const maxRetries = 3
const retryDelay = 1000
const requestTimeout = 10_000

// 已加载的菜谱数据（dev 下不缓存，数据更新后无需重启）
let cachedRecipes: Recipe[] | null = null

// RECIPES_URL 指向自定义菜谱源，支持 base URL 或完整 recipes.json URL
function getCustomRecipesURL(): string | undefined {
  const base = process.env.RECIPES_URL?.trim()
  if (!base)
    return undefined

  return base.endsWith('.json')
    ? base
    : `${base.replace(/\/+$/, '')}/recipes.json`
}

async function fetchJSON(url: string): Promise<unknown> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await $fetch<unknown>(url, { timeout: requestTimeout })
    }
    catch (error) {
      console.error(`获取菜谱数据失败 (${attempt}/${maxRetries}) ${url}`, error)

      if (attempt < maxRetries)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: `菜谱数据源不可用: ${url}`,
  })
}

// 读取本地 public/recipes.json
// 覆盖两类启动方式：开发环境/仓库根目录启动（public/）、Docker 内启动（.output/public/）
async function readLocalRecipes(): Promise<unknown> {
  const candidates = [
    join(process.cwd(), 'public', 'recipes.json'),
    join(process.cwd(), '.output', 'public', 'recipes.json'),
  ]

  for (const path of candidates) {
    try {
      return JSON.parse(await readFile(path, 'utf-8'))
    }
    catch {
      // 尝试下一个候选路径
    }
  }

  return undefined
}

// 兜底：从当前部署站点自身拉取静态资源 /recipes.json
// Serverless 环境（Netlify/Vercel）函数内没有 public 目录，但站点托管了该文件
async function fetchSelfRecipes(event: H3Event): Promise<unknown> {
  const { origin } = getRequestURL(event)
  return await fetchJSON(`${origin}/recipes.json`)
}

function normalizeRecipes(raw: unknown): Recipe[] {
  if (!Array.isArray(raw))
    throw createError({ statusCode: 502, statusMessage: '菜谱数据格式不正确' })

  return raw
    .filter((item): item is Record<string, unknown> => {
      return !!item && typeof item === 'object' && typeof item.name === 'string'
    })
    .map(item => ({
      name: item.name as string,
      category: typeof item.category === 'string' ? item.category : '其他',
      link: typeof item.link === 'string' ? item.link : '',
      source_path: typeof item.source_path === 'string' ? item.source_path : '',
    }))
}

export async function loadRecipes(event: H3Event): Promise<Recipe[]> {
  const recipes = cachedRecipes ?? await loadRecipesUncached(event)

  if (!import.meta.dev)
    cachedRecipes = recipes

  return recipes
}

async function loadRecipesUncached(event: H3Event): Promise<Recipe[]> {
  const customURL = getCustomRecipesURL()

  const raw = customURL
    ? await fetchJSON(customURL)
    : (await readLocalRecipes()) ?? (await fetchSelfRecipes(event))

  return normalizeRecipes(raw)
}
