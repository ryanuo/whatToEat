import type { Recipe } from '~/types'

// 获取菜谱：统一使用默认公开菜单
async function fetchRecipes(): Promise<Recipe[]> {
  const maxRetries = 3
  const retryDelay = 1000

  for (let i = 0; i < maxRetries; i++) {
    try {
      const recipes = await $fetch<Recipe[]>('https://eat.ryanuo.cc/recipes.json', {
        timeout: 10000, // 10秒超时
      })
      
      if (!recipes || !Array.isArray(recipes)) {
        throw new Error('返回的数据格式不正确')
      }
      
      console.log(`成功获取 ${recipes.length} 条菜谱数据`)
      return recipes as Recipe[]
    }
    catch (error) {
      console.error(`获取菜谱数据失败 (尝试 ${i + 1}/${maxRetries}):`, error)
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  
  console.error('所有重试都失败，返回空数组')
  return []
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
