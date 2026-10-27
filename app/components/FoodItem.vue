<script setup lang="ts">
import type { CurrentFood } from '~/types'

const props = defineProps<{
  currentFood?: CurrentFood
}>()

const nameText = computed(() => replaceText(props.currentFood?.name))
const hasFood = computed(() => !!props.currentFood?.name && nameText.value !== '神马')
const recipeUrl = computed(() => getOriginRecipeLink(props.currentFood?.name))
</script>

<template>
  <!-- 有菜品：菜名即入口，点击新标签页打开做法 -->
  <a
    v-if="hasFood"
    :href="recipeUrl"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`${nameText}的做法，在新标签页打开`"
    class="dish-link"
  >
    <span class="dish-name">{{ nameText }}</span>
    <svg class="dish-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </a>

  <!-- 未抽取：普通占位文字，不可点击 -->
  <span v-else class="dish-static">{{ nameText }}</span>
</template>

<style scoped>
.dish-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;

  color: inherit;
  text-decoration: none;
  border-radius: 8px;
  margin-right: 8px;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.dish-name {
  font-weight: 700;

  /* 细腻的低饱和主题色虚线下划线，呼应手绘线稿 */
  text-decoration: underline dashed color-mix(in srgb, var(--brand, #ed7d68) 55%, transparent);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 8px;

  transition: color 160ms ease;
}

.dish-static {
  font-weight: 700;
  margin-right: 8px;
}

.dish-link:hover .dish-name {
  color: color-mix(in srgb, var(--brand, #ed7d68) 80%, #141d37);
}

/* 外链箭头：默认低调可见（兼顾移动端无 hover），悬停时提亮微移 */
.dish-arrow {
  flex: none;

  width: 0.45em;
  height: 0.45em;

  color: color-mix(in srgb, var(--brand, #ed7d68) 70%, #141d37);
  opacity: 0.45;

  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.dish-link:hover .dish-arrow {
  opacity: 1;
  transform: translate(1.5px, -1.5px);
}

.dish-link:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--brand, #ed7d68) 75%, transparent);
  outline-offset: 5px;
}

@media (prefers-reduced-motion: reduce) {
  .dish-name,
  .dish-arrow {
    transition: none;
  }
}
</style>
