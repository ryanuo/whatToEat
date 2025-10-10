<script setup lang="ts">
import type { CurrentFood, RecipeResponse } from '~/types'

const isPlaying = ref(false)
const currentFood = ref<CurrentFood>()
const shakeTitle = ref(false)
const { data } = await useFetch<RecipeResponse>('/api/recipes')

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
    return // ✅ 防止 SSR 阶段执行

  currentFood.value = undefined
  shakeTitle.value = true

  const loop = () => {
    const foods = data.value?.recipes || []
    if (!foods.length)
      return
    const randomFood = foods[Math.floor(Math.random() * foods.length)]
    currentFood.value = randomFood
    createFloatingText(replaceText(randomFood?.name))

    // 每100ms递归调用
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

// ✅ 组件卸载时安全清理
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

    <div class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
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
  } /* 半张图高度 */
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
