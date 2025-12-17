import type { Recipe } from '~/types'

// 获取菜谱：可选使用环境变量 RECIPES_URL 指向本地菜单；否则使用默认公开菜单
async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const override = process.env.RECIPES_URL?.trim()

    // 默认菜单（与原项目一致）
    const baseURL = import.meta.dev ? 'http://localhost:3000' : 'https://eat.ryanuo.cc'
    const defaultUrl = `${baseURL}/recipes.json`

    const url = override
      ? (override.endsWith('.json') ? override : `${override.replace(/\/+$/, '')}/recipes.json`)
      : defaultUrl

    const recipes = await $fetch<Recipe[]>(url)
    return recipes as Recipe[]
  }
  catch (error) {
    console.error('获取菜谱数据失败:', error)
    return []
  }
}

// 获取所有分类
function getAllCategories(recipes: Recipe[]): string[] {
  const categories = new Set<string>()
  recipes?.forEach((r) => {
    if (r.category)
      categories.add(r.category)
  })
  return [...categories]
}

export default defineEventHandler(async () => {
  const recipes = await fetchRecipes()
  const categories = getAllCategories(recipes)

  return {
    count: recipes.length,
    categories,
    recipes,
  }
})
