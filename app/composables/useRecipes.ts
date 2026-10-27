import type { RecipeResponse } from '~/types'

// 菜谱数据获取与派生信息
export async function useRecipes() {
  const { data, error, pending, refresh } = await useFetch<RecipeResponse>(
    '/api/recipes',
    {
      retry: 3,
      retryDelay: 1000,
      timeout: 10000,
    },
  )

  const isDataReady = computed(() => {
    return (
      !pending.value
      && !error.value
      && !!data.value?.recipes?.length
    )
  })

  const recipes = computed(() => data.value?.recipes ?? [])

  const categories = computed(
    () => (data.value?.categories || []) as string[],
  )

  const total = computed(() => data.value?.count ?? recipes.value.length)

  // 每个分类的菜品数量
  const categoryCounts = computed(() => {
    const map = new Map<string, number>()

    for (const recipe of recipes.value) {
      if (recipe.category)
        map.set(recipe.category, (map.get(recipe.category) ?? 0) + 1)
    }

    return map
  })

  return { data, error, pending, refresh, recipes, categories, total, categoryCounts, isDataReady }
}
