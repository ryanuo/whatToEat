// server/api/recipes.ts
import type { Recipe } from '~/types'

// 获取远程菜谱
async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const baseURL = import.meta.dev ? 'http://localhost:3000' : 'https://eat.ryanuo.cc'
    const recipes = await $fetch<Recipe[]>(`${baseURL}/recipes.json`)
    return recipes as Recipe[]
  }
  catch (error) {
    console.error('获取远程菜谱数据失败:', error)
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
