<script setup lang="ts">
import type { CurrentFood, RecipeResponse } from '~/types'
import { useStorage } from '@vueuse/core'
import { emojiMap } from '~/constants'

const isPlaying = ref(false)
const currentFood = ref<CurrentFood>()
const shakeTitle = ref(false)
const { data, error, pending, refresh } = await useFetch<RecipeResponse>('/api/recipes', {
  retry: 3,
  retryDelay: 1000,
  timeout: 10000,
})

// 检查数据是否成功加载
const isDataReady = computed(() => {
  return !pending.value && !error.value && data.value && data.value.recipes && data.value.recipes.length > 0
})

const categories = computed(() => (data.value?.categories || []) as string[])
const selectedCategories = useStorage<string[]>('selected-categories', [...categories.value])
const isAllSelected = computed(() => selectedCategories.value.length === categories.value.length)
const { playAnimation } = useEmojiAnimation()

// 首次加载 categories 时默认选中全部具体分类
const stopWatchCategories = watch(categories, (newVal) => {
  if (newVal && newVal.length) {
    // 默认选中所有具体分类
    selectedCategories.value = [...newVal]
    // 初始化完成后停止监听
    stopWatchCategories()
  }
})

// 颜色配置数组
const colorClasses = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400', active: 'bg-blue-400', activeText: 'text-white', activeBorder: 'border-blue-500' },
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', active: 'bg-red-400', activeText: 'text-white', activeBorder: 'border-red-500' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400', active: 'bg-green-400', activeText: 'text-white', activeBorder: 'border-green-500' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', active: 'bg-yellow-400', activeText: 'text-white', activeBorder: 'border-yellow-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-400', active: 'bg-indigo-400', activeText: 'text-white', activeBorder: 'border-indigo-500' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-400', active: 'bg-purple-400', activeText: 'text-white', activeBorder: 'border-purple-500' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-400', active: 'bg-pink-400', activeText: 'text-white', activeBorder: 'border-pink-500' },
  { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500', active: 'bg-gray-500', activeText: 'text-white', activeBorder: 'border-gray-600' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400', active: 'bg-orange-400', activeText: 'text-white', activeBorder: 'border-orange-500' },
]

// 获取标签的emoji
function getEmoji(tag: string) {
  return emojiMap[tag] || ''
}

// const randomIndex = computed(() => {
//   return Math.floor(Math.random() * colorClasses.length)
// })

// 获取标签的颜色类
function getTagColorClasses(index: number, isActive: boolean) {
  // const colorConfig
  //   = index === -1
  //     ? colorClasses[colorClasses.length - 2]!
  //     : colorClasses[randomIndex.value]!
  const colorConfig = colorClasses[colorClasses.length - 2]!

  const { bg, text, border, active, activeText, activeBorder } = colorConfig

  return isActive
    ? `${active} ${activeText} ${activeBorder}`
    : `${bg} ${text} ${border}`
}

let randomTimer: ReturnType<typeof setTimeout> | null = null

function togglePlay() {
  if (isPlaying.value)
    stopRandom()
  else
    startRandom()
  isPlaying.value = !isPlaying.value
}

// ✅ 改用递归随机器
function startRandom() {
  if (!import.meta.client)
    return

  // 确保数据已加载
  if (!data.value?.recipes || data.value.recipes.length === 0) {
    console.warn('菜单数据未加载，无法开始随机')
    return
  }

  currentFood.value = undefined
  shakeTitle.value = true

  const loop = () => {
    const allFoods = data.value?.recipes || []
    const foods = selectedCategories.value.length > 0
      ? allFoods.filter(r => selectedCategories.value.includes(r.category))
      : allFoods
    const list = foods.length ? foods : allFoods
    const randomFood = list[Math.floor(Math.random() * list.length)]
    currentFood.value = randomFood
    createFloatingText(replaceText(randomFood?.name))

    randomTimer = setTimeout(loop, 100)
  }

  loop()
}

function stopRandom() {
  shakeTitle.value = false
  if (randomTimer)
    clearTimeout(randomTimer)
  randomTimer = null
}

function toggleTag(tag: string) {
  if (tag === 'all') {
    if (!isAllSelected.value)
      selectedCategories.value = [...categories.value]
    else
      selectedCategories.value = [categories.value[1]!]
    return
  }

  const set = selectedCategories.value
  const idx = set.indexOf(tag)

  if (idx === -1) {
    playAnimation(getEmoji(tag))
    set.push(tag)
  }
  else {
    set.splice(idx, 1)
  }

  // 如果空选，则默认选中第一个（一般是 'all'）
  if (set.length === 0 && categories.value.length)
    selectedCategories.value = [categories.value[1]!]
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
  temp.className = 'absolute font-medium animate-float-up select-none whitespace-nowrap'
  temp.style.color = colors[Math.floor(Math.random() * colors.length)]!
  temp.style.fontSize = sizes[Math.floor(Math.random() * sizes.length)]!
  temp.style.left = `${Math.random() * 80 + 10}%`
  temp.style.top = `${Math.random() * 80 + 10}%`
  temp.style.transform = `rotate(${rotate}deg)`
  temp.style.filter = 'blur(0.5px)'
  temp.style.textShadow = '0 0 4px rgba(255,255,255,0.4)'

  container.appendChild(temp)
  setTimeout(() => temp.remove(), 1600)
}

onUnmounted(() => {
  if (randomTimer)
    clearTimeout(randomTimer)
})
</script>

<template>
  <FluidCursor v-if="isPC()" />
  <div class="bg-[#E9E9E9] min-h-screen relative overflow-hidden">
    <Header />
    <div
      class="bg-[#E9E9E9] bg-[url('/pic/bg2.png')] transition-all inset-0 absolute z-0 bg-center"
      :class="{ 'animate-paused': isPlaying }" :style="{ animation: `flow 16s linear infinite` }"
    />

    <div id="temp_container" class="inset-0 absolute z-10 overflow-hidden" />

    <!-- 加载状态 -->
    <div v-if="pending" class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
      <div class="text-center">
        <Loading />
        <p class="text-gray-600 mt-4 animate-pulse">正在加载菜单数据...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
      <div class="text-center">
        <p class="text-red-600 mb-4">😞 菜单数据加载失败</p>
        <p class="text-gray-600 text-sm mb-4">{{ error.message }}</p>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          @click="refresh"
        >
          重新加载
        </button>
      </div>
    </div>

    <!-- 数据为空状态 -->
    <div v-else-if="!isDataReady" class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
      <div class="text-center">
        <p class="text-gray-600 mb-4">📭 暂无菜单数据</p>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          @click="refresh"
        >
          重新加载
        </button>
      </div>
    </div>

    <!-- 正常内容显示 -->
    <div v-else class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
      <div class="mb-4 flex flex-wrap gap-3 items-center top-15 justify-center absolute">
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            key="all"
            type="button"
            class="text-xs font-medium px-2.5 py-0.5 border rounded-sm inline-flex gap-1 cursor-pointer select-none transition-all items-center"
            :class="getTagColorClasses(-1, isAllSelected)" @click="toggleTag('all')"
          >
            <span>全部</span>
          </button>
          <button
            v-for="(c, index) in categories" :key="c" type="button"
            class="text-xs font-medium px-2.5 py-0.5 border rounded-sm inline-flex gap-1 cursor-pointer select-none transition-all items-center"
            :class="getTagColorClasses(index, selectedCategories.includes(c))" @click="toggleTag(c)"
          >
            <span v-if="getEmoji(c)">{{ getEmoji(c) }}</span>
            {{ c }}
          </button>
        </div>
      </div>
      <div class="text-center w-full -mt-20">
        <h1
          class="text-[clamp(2rem,5vw,3rem)] text-gray-800 font-normal mb-6 whitespace-nowrap text-ellipsis overflow-hidden"
          :class="{ 'animate-shake': shakeTitle }"
        >
          <span class="today">今天</span>
          <span class="eat">吃</span>
          <FoodItem :current-food="currentFood" />
          <span class="punctuation">？</span>
        </h1>

        <button id="start" class="outline-none cursor-pointer" @click="togglePlay">
          <FancyButton :text="isPlaying ? '停止' : '开始'" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* 动画定义 */
@keyframes shake {
  0% {
    transform: translateX(5px);
  }

  20% {
    transform: translateX(-10px);
  }

  40% {
    transform: translateX(15px);
  }

  60% {
    transform: translateX(-20px);
  }

  80% {
    transform: translateX(15px);
  }

  100% {
    transform: translateX(-10px);
  }
}

@keyframes flow {
  0% {
    background-position: 50% 0;
  }

  100% {
    background-position: 50% -500px;
  }

  /* 半张图高度 */
}

@keyframes flash {
  0% {
    opacity: 0;
    transform: scale(1.5);
    color: transparent;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}

@keyframes dinnerTip {
  0%,
  100% {
    opacity: 0;
    transform: perspective(600px) translate3d(-50%, 7px, 0) scale(0.7) rotateY(180deg);
  }

  20%,
  80% {
    opacity: 1;
    transform: perspective(600px) translate3d(-50%, 0, 0) rotateY(0deg);
  }
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }

  20% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  80% {
    opacity: 1;
    transform: translateY(-10px) scale(1.02);
  }

  100% {
    opacity: 0;
    transform: translateY(-30px) scale(1.1);
  }
}

.animate-float-up {
  animation: floatUp 1.6s ease-out forwards;
  will-change: transform, opacity;
}

.text-glow {
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
}

.animate-shake {
  animation: shake 0.4s;
}

.animate-flow {
  animation: flow 16s linear infinite;
}

.animate-flash {
  animation: flash 1.6s ease-out both;
}

.animate-dinnerTip {
  animation: dinnerTip 3s 1s linear both;
}

.animate-paused {
  animation-play-state: paused;
}
</style>
