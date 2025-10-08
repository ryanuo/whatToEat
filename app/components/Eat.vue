<script setup lang="ts">
import type { CurrentFood, RecipeResponse } from '~/types'

// 状态管理
const isPlaying = ref<boolean>(false)
const currentFood = ref<CurrentFood>()
const shakeTitle = ref<boolean>(false)
const { data } = await useFetch<RecipeResponse>('/api/recipes')
const nameText = computed(() => replaceText(currentFood.value?.name))

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
  currentFood.value = undefined
  shakeTitle.value = true

  // 清除之前的定时器
  if (window.randomInterval) {
    clearInterval(window.randomInterval)
  }

  // 设置新的定时器
  window.randomInterval = setInterval(() => {
    const foods = data.value?.recipes || []
    const randomFood = foods[Math.floor(Math.random() * foods.length)]
    currentFood.value = randomFood
    createFloatingText(replaceText(randomFood?.name))
  }, 100) as unknown as number
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
</script>

<template>
  <div class="bg-[#E9E9E9] min-h-screen relative overflow-hidden">
    <Header />
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
      <div class="text-center w-full -mt-20">
        <h1
          class="text-[clamp(2rem,5vw,3rem)] text-gray-800 font-normal mb-6 whitespace-nowrap text-ellipsis overflow-hidden"
          :class="{ 'animate-shake': shakeTitle }"
        >
          <span class="today">今天</span>
          <span class="eat">吃</span>
          <a
            :href="getOriginRecipeLink(currentFood?.source_path)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block cursor-pointer"
          >
            <b
              class="text-gray-900 font-bold underline-black underline-offset-10 underline-dashed transition-all hover:underline-cyan"
              :class="{ underline: nameText !== '神马' }"
            >
              {{ nameText }}
            </b>
          </a>
          <span class="punctuation">？</span>
        </h1>

        <button
          id="start"
          class="outline-none cursor-pointer"
          @click="togglePlay"
        >
          <FancyButton
            :text="isPlaying ? '停止' : '开始'"
          />
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
