// 定义菜谱的类型接口
export interface Ingredient {
  name: string
  quantity: number | null
  unit: string | null
  text_quantity: string
  notes: string
}

export interface Step {
  step: number
  description: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  source_path: string
  image_path: string | null
  category: string
  difficulty: number
  tags: string[]
  servings: number
  ingredients: Ingredient[]
  steps: Step[]
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_time_minutes: number | null
  additional_notes: string[]
}

export interface RecipeResponse {
  recipes: Recipe[]
  total: number
  categories: string[]
  recipesNameList: string[]
}

export type CurrentFood = Pick<Recipe, 'id' | 'name' | 'image_path' | 'description' | 'source_path'>
