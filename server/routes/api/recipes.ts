import type { Recipe } from '~/types'

// 获取菜谱
async function fetchRecipes(): Promise<Recipe[]> {
  const baseURL = import.meta.dev
    ? 'http://localhost:3000'
    : 'https://eat.ryanuo.cc'

  const maxRetries = 3
  const retryDelay = 1000

  for (let i = 0; i < maxRetries; i++) {
    try {
      const recipes = await $fetch<Recipe[]>(
        `${baseURL}/recipes.json`,
        {
          timeout: 10000,
        },
      )

      if (!Array.isArray(recipes))
        throw new Error('返回的数据格式不正确')

      return recipes
    }
    catch (error) {
      console.error(
        `获取菜谱数据失败 (${i + 1}/${maxRetries})`,
        error,
      )

      if (i < maxRetries - 1)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: '上游菜谱服务不可用',
  })
}

export default defineEventHandler(async () => {
  const recipes = await fetchRecipes()

  return {
    count: recipes.length,
    categories: [
      ...new Set(
        recipes
          .map(r => r.category)
          .filter(Boolean),
      ),
    ],
    recipes,
  }
})
