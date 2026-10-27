// 定义菜谱的类型接口
// 与 scripts/crawl.py 生成的 public/recipes.json 字段保持一致
export interface Recipe {
  name: string
  category: string
  link: string
  source_path: string
}

export interface RecipeResponse {
  count: number
  categories: string[]
  recipes: Recipe[]
}

export type CurrentFood = Pick<Recipe, 'name'>

// B 站视频做法搜索结果
export interface VideoItem {
  bvid: string
  title: string
  author: string
  duration: string
  cover: string
  play: number
}

export interface VideoSearchResponse {
  results: VideoItem[]
}
