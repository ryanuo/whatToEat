// server/api/recipes.ts
import type { Recipe } from '~/types'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const LOCAL_RECIPES_PATH = join(process.cwd(), 'public/recipes.json')

// 获取远程菜谱
async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const data = await readFile(LOCAL_RECIPES_PATH, 'utf-8')
    return JSON.parse(data) as Recipe[]
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
