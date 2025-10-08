// server/api/recipes.ts
import type { Recipe } from '~/types'

const RECIPES_URL = 'https://gh-proxy.com/https://gist.githubusercontent.com/ryanuo7/f64ca9dcd3996ce4bee44a2841a155b9/raw/ed144efedf89b36938f84a1d56d1ae4fca616167/food.json'

// 获取远程菜谱
async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const response = await $fetch<Recipe[]>(RECIPES_URL, {
      timeout: 150000,
    })

    if (typeof response === 'string')
      return JSON.parse(response) as Recipe[]
    return response
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
