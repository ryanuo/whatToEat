// 食物数据类型
export interface FoodData {
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

// 时间段类型
export type MealTime = 'breakfast' | 'lunch' | 'dinner'

// 切换类型配置
export interface ToggleType {
  label: string
  type: 'human' | 'monster'
  color: string
  selected: boolean
}
