import type { Ref } from 'vue'
import type { CurrentFood, Recipe } from '~/types'

const SPIN_INTERVAL = 100

// 随机抽取：高速轮换 + 最终落点 + 浮动菜名文字
export function useRandomFood(
  recipes: Ref<Recipe[]>,
  selectedCategories: Ref<string[]>,
) {
  const isPlaying = ref(false)
  const currentFood = ref<CurrentFood>()
  const shakeTitle = ref(false)

  let randomTimer: ReturnType<typeof setTimeout> | null = null

  function togglePlay() {
    if (isPlaying.value) {
      stopRandom()
      isPlaying.value = false
      return
    }

    // 先启动，启动成功后再更新按钮状态
    if (startRandom())
      isPlaying.value = true
  }

  function startRandom(): boolean {
    if (!import.meta.client)
      return false

    const allFoods = recipes.value

    if (allFoods.length === 0) {
      console.warn('菜单数据未加载，无法开始随机')
      return false
    }

    // 防止重复启动产生多个定时器
    stopRandom()

    currentFood.value = undefined
    shakeTitle.value = true

    const loop = () => {
      const foods = selectedCategories.value.length > 0
        ? allFoods.filter(recipe =>
            selectedCategories.value.includes(recipe.category),
          )
        : allFoods

      const list = foods.length > 0 ? foods : allFoods
      const randomFood = list[
        Math.floor(Math.random() * list.length)
      ]

      if (randomFood) {
        currentFood.value = randomFood
        createFloatingText(replaceText(randomFood.name))
      }

      randomTimer = setTimeout(loop, SPIN_INTERVAL)
    }

    loop()
    return true
  }

  function stopRandom() {
    shakeTitle.value = false

    if (randomTimer) {
      clearTimeout(randomTimer)
      randomTimer = null
    }
  }

  function createFloatingText(text = '') {
    const container = document.getElementById('temp_container')

    if (!container)
      return

    const temp = document.createElement('div')

    const colors = [
      'rgba(156, 163, 175, 0.8)',
      'rgba(209, 213, 219, 0.8)',
      'rgba(243, 244, 246, 0.9)',
      'rgba(200, 200, 200, 0.7)',
    ]

    const sizes = ['0.8rem', '1rem', '1.2rem']
    const rotate = (Math.random() - 0.5) * 20

    temp.textContent = text
    temp.className
      = 'absolute font-medium animate-float-up select-none whitespace-nowrap'

    temp.style.color
      = colors[Math.floor(Math.random() * colors.length)]!

    temp.style.fontSize
      = sizes[Math.floor(Math.random() * sizes.length)]!

    temp.style.left = `${Math.random() * 80 + 10}%`
    temp.style.top = `${Math.random() * 80 + 10}%`
    temp.style.transform = `rotate(${rotate}deg)`
    temp.style.filter = 'blur(0.5px)'
    temp.style.textShadow = '0 0 4px rgba(255,255,255,0.4)'

    container.appendChild(temp)

    setTimeout(() => temp.remove(), 1600)
  }

  onUnmounted(() => {
    stopRandom()
  })

  return { isPlaying, currentFood, shakeTitle, togglePlay }
}
