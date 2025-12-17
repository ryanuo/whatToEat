import type { Recipe } from '~/types'

// 获取菜谱：统一使用默认公开菜单
async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const recipes = await $fetch<Recipe[]>('https://eat.ryanuo.cc/recipes.json')
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
