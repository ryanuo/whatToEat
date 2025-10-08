<script setup lang="ts">
import type { FoodData, MealTime, ToggleType } from '~/types'
import humanData from '~/constants/foodData/human.json'
import monsterData from '~/constants/foodData/monster.json'

// 状态管理
const isPlaying = ref<boolean>(false)
const currentFood = ref<string>('')
const currentTime = ref<string>('午饭')
const currentTimeKey = ref<MealTime>('lunch')
const currentType = ref<'human' | 'monster' | 'oasis'>('human')
const currentColor = ref<string>('#00BDD6')
const currentTypeIndex = ref<number>(0)
const shakeTitle = ref<boolean>(false)

// 切换类型配置
const toggleTypes = reactive<ToggleType[]>([
  { label: '正常人类', type: 'human', color: '#00BDD6', selected: true },
  { label: '非正常人类', type: 'monster', color: '#E80773', selected: false },
])

// 获取当前数据
const foodData = computed<FoodData>(() => {
  switch (currentType.value) {
    case 'human': return humanData as FoodData
    case 'monster': return monsterData as FoodData
    default: return humanData as FoodData
  }
})

// 切换时间段
function toggleTime() {
  if (isPlaying.value)
    return

  const times: { name: string, key: MealTime }[] = [
    { name: '早饭', key: 'breakfast' },
    { name: '午饭', key: 'lunch' },
    { name: '晚饭', key: 'dinner' },
  ]

  const currentIndex = times.findIndex(t => t.key === currentTimeKey.value)
  const nextIndex = (currentIndex + 1) % times.length

  currentTime.value = times[nextIndex]?.name || '午饭'
  currentTimeKey.value = times[nextIndex]?.key || 'lunch'
}

// 切换类型
function changeType(type: 'human' | 'monster' | 'oasis', color: string) {
  currentType.value = type
  currentColor.value = color

  // 更新选中状态
  toggleTypes.forEach((item, index) => {
    item.selected = item.type === type
    if (item.selected) {
      currentTypeIndex.value = index
    }
  })
}

// 开始/停止随机选择
function togglePlay() {
  if (isPlaying.value) {
    stopRandom()
  }
  else {
    startRandom()
  }
  isPlaying.value = !isPlaying.value
}

// 开始随机
function startRandom() {
  currentFood.value = ''
  shakeTitle.value = true

  // 清除之前的定时器
  if (window.randomInterval) {
    clearInterval(window.randomInterval)
  }

  // 设置新的定时器
  window.randomInterval = setInterval(() => {
    const foods = foodData.value[currentTimeKey.value]
    const randomFood = foods[Math.floor(Math.random() * foods.length)]
    currentFood.value = randomFood as string
    createFloatingText(randomFood)
  }, 100)
}

// 停止随机
function stopRandom() {
  clearInterval(window.randomInterval)
  shakeTitle.value = false
}

// 创建浮动文字
function createFloatingText(text?: string) {
  const container = document.getElementById('temp_container')
  if (!container)
    return

  const temp = document.createElement('div')
  temp.className = 'temp absolute text-gray-500 animate-flash whitespace-nowrap'
  temp.textContent = text || ''

  // 随机位置
  const left = Math.random() * 100
  const top = Math.random() * 100

  temp.style.left = `${left}%`
  temp.style.top = `${top}%`

  container.appendChild(temp)

  // 动画结束后移除
  setTimeout(() => {
    temp.remove()
  }, 1600)
}

// 扩展Window类型以支持自定义属性
declare global {
  interface Window {
    randomInterval: number | undefined
  }
}

onMounted(() => {
  // 初始化逻辑
})
</script>

<template>
  <div class="bg-[#E9E9E9] min-h-screen relative overflow-hidden">
    <!-- 背景 -->
    <div
      class="bg-[#E9E9E9] bg-[url('/pic/bg.png')] transition-all inset-0 absolute z-0 bg-center"
      :class="{ 'animate-paused': isPlaying }"
      :style="{ animation: `flow 16s linear infinite` }"
    />

    <!-- 浮动文字容器 -->
    <div id="temp_container" class="inset-0 absolute z-10 overflow-hidden" />

    <!-- 主要内容 -->
    <div class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
      <div class="text-center max-w-xl w-full -mt-20">
        <h1
          class="text-[clamp(2rem,5vw,3rem)] text-gray-800 font-normal mb-6 cursor-pointer whitespace-nowrap text-ellipsis overflow-hidden"
          :class="{ 'animate-shake': shakeTitle }"
        >
          <span class="today">今天</span>
          <span class="time" @click="toggleTime">{{ currentTime }}</span>
          <span class="eat">吃</span>
          <b class="what text-gray-900 font-bold">{{ currentFood || '神马' }}</b>
          <span class="punctuation">？</span>
        </h1>

        <button
          id="start"
          class="cursor-pointer"
          @click="togglePlay"
        >
          <FancyButton
            :text="isPlaying ? '停止' : '开始'"
          />
        </button>

        <p class="os text-gray-600 mt-4" />
        <span class="tip animate-dinnerTip text-sm text-white px-4 py-1.5 rounded-full bg-black/60 left-1/2 top-[-50px] absolute -translate-x-1/2">
          点击可以切换饭点~
        </span>
      </div>

      <!-- 切换类型 -->
      <div
        id="toggle"
        class="text-sm p-1 rounded-full bg-white/60 gap-[5px] grid grid-cols-2 max-w-[260px] w-[90%] transition-all duration-300 bottom-[60px] left-1/2 absolute z-20 -translate-x-1/2"
        :class="{ 'translate-y-[200%] opacity-0': isPlaying }"
      >
        <span
          v-for="(item, index) in toggleTypes"
          :key="index"
          class="toggle-item text-center relative z-10"
          :class="{ 'text-white': item.selected }"
          :data-type="item.type"
          @click="changeType(item.type, item.color)"
        >
          {{ item.label }}
        </span>
        <div
          id="colorBlock"
          class="rounded-full h-[calc(100%-4px)] transition-all duration-300 top-[2px] absolute z-0"
          :style="{
            width: `calc(50% - 4px)`,
            left: `${currentTypeIndex * (100 / 2)}%`,
            backgroundColor: currentColor,
          }"
        />
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
    background-position: 50% -250px;
  }
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
