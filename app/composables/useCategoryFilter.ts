import type { Ref } from 'vue'
import { useStorage } from '@vueuse/core'

// 分类筛选选择：空选 = 全部，弹窗确定后才写入
export function useCategoryFilter(categories: Ref<string[]>) {
  const selectedCategories = useStorage<string[]>('selected-categories', [])

  // 分类数据到达/刷新后，剔除本地选择中已失效的分类（空选仍表示全部）
  watch(
    categories,
    (newVal) => {
      if (newVal.length === 0)
        return

      selectedCategories.value
        = selectedCategories.value.filter(c => newVal.includes(c))
    },
    { immediate: true },
  )

  const selectedCount = computed(() => selectedCategories.value.length)

  return { selectedCategories, selectedCount }
}
