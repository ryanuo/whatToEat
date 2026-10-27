<script setup lang="ts">
const { error, pending, refresh, recipes, categories, categoryCounts, isDataReady } = await useRecipes()

const { selectedCategories, selectedCount } = useCategoryFilter(categories)

const { isPlaying, currentFood, shakeTitle, togglePlay } = useRandomFood(recipes, selectedCategories)

const { skin: bgSkin, themeColor } = useSkin()

// 主题色注入 :root，保证 Teleport 到 body 的弹窗也能取到 var(--brand)
watchEffect(() => {
  if (import.meta.client)
    document.documentElement.style.setProperty('--brand', themeColor.value.color)
})

// 当前菜品是否有可跳转的做法
const hasFood = computed(() => {
  return !!currentFood.value?.name && replaceText(currentFood.value.name) !== '神马'
})

// B 站视频做法搜索链接（提示行入口）
const videoUrl = computed(() => getVideoSearchLink(currentFood.value?.name))

/* ---------------- 弹窗状态 ---------------- */

const isFilterOpen = ref(false)
const isVideoOpen = ref(false)

function onConfirmFilter(selected: string[]) {
  selectedCategories.value = selected
}
</script>

<template>
  <div class="food-page min-h-screen relative overflow-hidden" :style="{ backgroundColor: bgSkin.bgColor }">
    <FluidCursor v-if="isPC()" class="absolute z-11!" />

    <Header />

    <!-- 动态背景 -->
    <div
      :key="bgSkin.key" class="food-background inset-0 absolute z-0 bg-center bg-repeat"
      :class="{ 'animate-paused': isPlaying }" :style="{
        'backgroundColor': bgSkin.bgColor,
        'backgroundImage': `url(${bgSkin.url})`,
        'animation': `flow ${(bgSkin.tileHeight / 31.25).toFixed(1)}s linear infinite`,
        '--bg-tile-h': `${bgSkin.tileHeight}px`,
      }"
    />

    <!-- 抽取动画文字 -->
    <div id="temp_container" class="pointer-events-none inset-0 absolute z-12 overflow-hidden" />

    <!-- 加载状态 -->
    <div v-if="pending" class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
      <div class="text-center">
        <Loading />
        <p class="text-gray-600 mt-4 animate-pulse">
          正在加载菜单数据...
        </p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
      <div class="text-center">
        <p class="text-red-600 mb-4">
          😞 菜单数据加载失败
        </p>

        <p class="text-sm text-gray-600 mb-4">
          {{ error.message }}
        </p>

        <button
          type="button" class="text-white px-4 py-2 rounded-lg bg-blue-500 transition-colors hover:bg-blue-600"
          @click="() => refresh()"
        >
          重新加载
        </button>
      </div>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="!isDataReady" class="px-4 flex flex-col min-h-screen items-center justify-center relative z-20">
      <div class="text-center">
        <p class="text-gray-600 mb-4">
          📭 暂无菜单数据
        </p>

        <button
          type="button" class="text-white px-4 py-2 rounded-lg bg-blue-500 transition-colors hover:bg-blue-600"
          @click="() => refresh()"
        >
          重新加载
        </button>
      </div>
    </div>

    <!-- 正常首页 -->
    <main v-else class="px-4 pb-12 pt-24 flex flex-col min-h-screen items-center justify-center relative z-20 sm:pt-28">
      <!-- 筛选入口：水印级轻量按钮 -->
      <button type="button" class="filter-entry" @click="isFilterOpen = true">
        <span class="i-carbon:filter" />
        <span>{{ selectedCount > 0 ? `已选 ${selectedCount} 个分类` : '筛选分类' }}</span>
      </button>

      <!-- 中央主视觉 -->
      <section class="hero-content text-center w-full">
        <p class="hero-subtitle">
          发现美味灵感，开启今日好胃口
        </p>

        <h1 class="hero-title text-[#141D37] leading-tight font-semibold mb-5" :class="{ 'animate-shake': shakeTitle }">
          <span class="today">今天</span>
          <span class="eat">吃</span>
          <FoodItem :current-food="currentFood" />
          <span class="punctuation">？</span>
        </h1>

        <!-- 菜做法提示行：B 站视频入口（页面内弹窗播放） -->
        <a
          v-if="hasFood"
          :href="videoUrl"
          rel="noopener noreferrer"
          class="recipe-hint"
          :aria-label="`在 B 站查看${replaceText(currentFood?.name)}的视频做法`"
          @click.prevent="isVideoOpen = true"
        >
          <svg
            class="recipe-hint__icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
            stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none" />
          </svg>
          <span>查看这道菜的做法</span>
        </a>

        <div class="hero-action">
          <button
            id="start" type="button" class="start-button outline-none"
            :aria-label="isPlaying ? '停止随机抽取' : '开始随机抽取'" @click="togglePlay"
          >
            <FancyButton :text="isPlaying ? '停止' : '开始'" />
          </button>
        </div>
      </section>
    </main>

    <!-- 分类筛选弹窗 -->
    <FilterModal
      :open="isFilterOpen"
      :categories="categories"
      :selected="selectedCategories"
      :counts="categoryCounts"
      @close="isFilterOpen = false"
      @confirm="onConfirmFilter"
    />

    <!-- 视频做法弹窗 -->
    <VideoModal
      :open="isVideoOpen"
      :name="replaceText(currentFood?.name)"
      :search-url="videoUrl"
      @close="isVideoOpen = false"
    />
  </div>
</template>

<style>
/* 页面层 */
.food-page {
  isolation: isolate;
}

.food-background {
  pointer-events: none;
  background-size: auto;
}

/* 筛选入口：右上角水印级按钮 */
.filter-entry {
  position: absolute;
  top: 72px;
  right: 16px;
  z-index: 30;

  display: inline-flex;
  align-items: center;
  gap: 5px;

  min-height: 32px;
  padding: 5px 12px;

  border: 1px solid rgba(70, 74, 88, 0.14);
  border-radius: 9999px;
  background: transparent;
  color: #5c6070;

  font-size: 12px;
  line-height: 1;
  white-space: nowrap;

  cursor: pointer;
  transition: all 180ms ease;
}

@media (min-width: 640px) {
  .filter-entry {
    right: 32px;
  }
}

.filter-entry:hover {
  background: rgba(255, 255, 255, 0.65);
  border-color: color-mix(in srgb, var(--brand, #ed7d68) 40%, transparent);
  color: var(--brand, #ed7d68);
}

.filter-entry:focus-visible {
  outline: 2px solid rgba(201, 77, 94, 0.75);
  outline-offset: 2px;
}

/* ---------------- 中央主视觉 ---------------- */
.hero-content {
  position: relative;
  z-index: 1;
  max-width: 760px;
}

.hero-title {
  font-size: clamp(2rem, 4vw, 2.8rem);
  letter-spacing: -0.035em;
}

/* 局部强调：仅「吃」用低饱和主题色，呼应背景线稿点缀 */
.eat {
  color: color-mix(in srgb, var(--brand, #ed7d68) 72%, #707486);
}

.hero-subtitle {
  color: #707486;
  font-size: 15px;
  line-height: 1.8;
  letter-spacing: 0.015em;
}

.hero-action {
  display: flex;
  justify-content: center;
  margin-top: 34px;
}

.start-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.start-button:focus-visible {
  outline: 2px solid #202d67;
  outline-offset: 5px;
  border-radius: 9999px;
}

/* 菜做法提示行：标题正下方的轻量文字入口 */
.recipe-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  /* 上移贴近标题（h1 自带 mb-5），与下方开始按钮保持呼吸感 */
  margin: -10px 0 22px;
  padding: 6px 10px;

  color: #928d82;
  font-size: 13px;
  line-height: 1;
  text-decoration: none;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 160ms ease;
}

.recipe-hint:hover {
  color: #6e6960;
}

.recipe-hint__icon {
  flex: none;

  width: 17px;
  height: 17px;

  color: #a5a096;
  transition: color 160ms ease;
}

.recipe-hint:hover .recipe-hint__icon {
  color: color-mix(in srgb, var(--brand, #ed7d68) 85%, #6e6960);
}

.recipe-hint:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--brand, #ed7d68) 75%, transparent);
  outline-offset: 3px;
  border-radius: 6px;
}

/* 标题抽取动画 */
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

.animate-shake {
  animation: shake 0.4s;
}

/* 背景循环 */
@keyframes flow {
  0% {
    background-position: 50% 0;
  }

  100% {
    background-position: 50% calc(0px - var(--bg-tile-h, 500px));
  }
}

/* 浮动文字（原生 DOM 节点使用，需保持全局） */
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

.animate-paused {
  animation-play-state: paused;
}

/* 手机端 */
@media (max-width: 640px) {
  .hero-title {
    margin-bottom: 16px;
    font-size: clamp(1.8rem, 8vw, 2.3rem);
  }

  /* 移动端扩大提示行触摸区域 */
  .recipe-hint {
    margin: -8px 0 18px;
    padding: 9px 12px;
  }

  .hero-subtitle {
    font-size: 13px;
  }

  .hero-action {
    margin-top: 28px;
  }
}

/* 减少动态效果偏好 */
@media (prefers-reduced-motion: reduce) {
  .filter-entry,
  .recipe-hint,
  .recipe-hint__icon {
    transition: none;
  }

  .animate-shake,
  .animate-float-up {
    animation: none;
  }
}
</style>
