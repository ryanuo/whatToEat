<script setup lang="ts">
import { emojiMap } from '~/constants'

// 分类筛选弹窗：草稿选择，确定后才应用
const props = defineProps<{
  open: boolean
  categories: string[]
  selected: string[]
  counts: Map<string, number>
  total: number
}>()

const emit = defineEmits<{
  confirm: [selected: string[]]
  close: []
}>()

const draftSelected = ref<string[]>([])

watch(open, (val) => {
  if (val)
    draftSelected.value = [...props.selected]
})

const isDraftAll = computed(() => {
  return draftSelected.value.length === 0
    || draftSelected.value.length === props.categories.length
})

// 弹窗摘要：0 项或全选都视为「全部」
const draftSummary = computed(() => {
  return isDraftAll.value ? '全部' : String(draftSelected.value.length)
})

function close() {
  emit('close')
}

function toggleDraft(tag: string) {
  const draft = [...draftSelected.value]
  const index = draft.indexOf(tag)

  if (index === -1)
    draft.push(tag)
  else
    draft.splice(index, 1)

  draftSelected.value = draft
}

function toggleDraftAll() {
  draftSelected.value
    = draftSelected.value.length === props.categories.length
      ? []
      : [...props.categories]
}

function confirm() {
  emit('confirm', [...draftSelected.value])
  close()
}

useEventListener(document, 'keydown', (e) => {
  if (e.key === 'Escape' && props.open)
    close()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="filter-overlay" @click.self="close">
        <div class="filter-modal" role="dialog" aria-modal="true" aria-label="选择分类">
          <div class="filter-head">
            <div>
              <h2 class="filter-title">
                选择分类
              </h2>
              <p class="filter-meta">
                共 {{ categories.length }} 项 · 已选 {{ draftSummary }}
              </p>
            </div>

            <button type="button" class="filter-close" aria-label="关闭" @click="close">
              <span class="i-carbon:close" />
            </button>
          </div>

          <div class="filter-circles">
            <!-- 全部 -->
            <button
              type="button" class="circle-item"
              :class="{ 'circle-item-active': isDraftAll }"
              :aria-pressed="isDraftAll"
              @click="toggleDraftAll"
            >
              <span class="circle" :class="{ 'circle-active': isDraftAll }">
                <span class="circle-emoji">🍽️</span>
                <span v-if="isDraftAll" class="circle-check">
                  <span class="i-carbon:checkmark" />
                </span>
              </span>
              <span class="circle-name">全部</span>
              <span class="circle-count">{{ total }} 道</span>
            </button>

            <!-- 具体分类 -->
            <button
              v-for="category in categories" :key="category" type="button" class="circle-item"
              :class="{ 'circle-item-active': draftSelected.includes(category) }"
              :aria-pressed="draftSelected.includes(category)" @click="toggleDraft(category)"
            >
              <span class="circle" :class="{ 'circle-active': draftSelected.includes(category) }">
                <span class="circle-emoji">{{ emojiMap[category] || '🍽️' }}</span>
                <span v-if="draftSelected.includes(category)" class="circle-check">
                  <span class="i-carbon:checkmark" />
                </span>
              </span>
              <span class="circle-name">{{ category }}</span>
              <span class="circle-count">{{ counts.get(category) ?? 0 }} 道</span>
            </button>
          </div>

          <div class="filter-foot">
            <button type="button" class="filter-btn filter-btn-ghost" @click="close">
              取消
            </button>

            <button type="button" class="filter-btn filter-btn-solid" @click="confirm">
              确定筛选 ({{ draftSummary }})
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.filter-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  background: rgba(246, 246, 247, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.filter-modal {
  display: flex;
  flex-direction: column;

  width: min(92vw, 560px);
  max-height: min(80vh, 640px);

  padding: 26px 26px 20px;

  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 64px rgba(20, 29, 55, 0.16);
}

.filter-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.filter-title {
  color: #141d37;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.filter-meta {
  margin-top: 4px;
  color: #9aa0ad;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.filter-close {
  display: grid;
  place-items: center;

  width: 32px;
  height: 32px;

  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #9aa0ad;
  font-size: 16px;

  cursor: pointer;
  transition: all 160ms ease;
}

.filter-close:hover {
  background: #f3f4f6;
  color: #141d37;
}

/* 圆形气泡分类：错落排布 */
.filter-circles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 6px;

  padding: 22px 6px 10px;
  overflow-y: auto;
}

.circle-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 76px;
  padding: 6px 2px;

  cursor: pointer;
  background: transparent;
  border: none;
}

/* nth-child 错落：制造气泡感而不破坏换行 */
.filter-circles .circle-item:nth-child(3n + 1) {
  margin-top: 12px;
}

.filter-circles .circle-item:nth-child(3n) {
  margin-top: -4px;
}

.circle {
  position: relative;
  box-sizing: border-box;

  display: grid;
  place-items: center;

  width: 58px;
  height: 58px;

  border: 3px solid transparent;
  border-radius: 9999px;
  background: #f3f4f6;

  transition: all 180ms ease;
}

.circle-emoji {
  font-size: 24px;
  line-height: 1;
}

.circle-item:hover .circle {
  transform: scale(1.08);
}

/* 选中：极浅主题色底 + 主题色粗边框 */
.circle-active {
  background: color-mix(in srgb, var(--brand, #ed7d68) 12%, #fff);
  border-color: var(--brand, #ed7d68);
}

/* 右上角打勾徽章：白色光环与圆环边框视觉分离 */
.circle-check {
  position: absolute;
  top: -6px;
  right: -6px;

  display: grid;
  place-items: center;

  width: 18px;
  height: 18px;

  border-radius: 9999px;
  background: var(--brand, #ed7d68);
  box-shadow: 0 0 0 2.5px #fff;
  color: #fff;

  font-size: 10px;
}

.circle-name {
  margin-top: 7px;
  color: #5c6070;
  font-size: 11px;
  line-height: 1.3;
  text-align: center;
  transition: color 180ms ease;
}

.circle-item-active .circle-name {
  color: var(--brand, #ed7d68);
  font-weight: 500;
}

/* 分类菜品数：弱化的辅助信息 */
.circle-count {
  margin-top: 2px;
  color: #b3b7c2;
  font-size: 10px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.circle-item:focus-visible {
  outline: 2px solid rgba(201, 77, 94, 0.75);
  outline-offset: 2px;
  border-radius: 12px;
}

/* 底部操作区 */
.filter-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding-top: 16px;
}

.filter-btn {
  min-height: 36px;
  padding: 8px 18px;

  border-radius: 9999px;
  font-size: 13px;
  line-height: 1;

  cursor: pointer;
  transition: all 180ms ease;
}

.filter-btn-ghost {
  border: 1px solid rgba(70, 74, 88, 0.16);
  background: transparent;
  color: #5c6070;
}

.filter-btn-ghost:hover {
  background: #f3f4f6;
}

.filter-btn-solid {
  border: 1px solid transparent;
  background: var(--brand, #ed7d68);
  color: #fff;
  font-weight: 500;
}

.filter-btn-solid:hover {
  filter: brightness(0.94);
}

.filter-btn:focus-visible {
  outline: 2px solid rgba(201, 77, 94, 0.75);
  outline-offset: 2px;
}

/* 弹窗过渡 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .filter-modal,
.modal-leave-active .filter-modal {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .filter-modal,
.modal-leave-to .filter-modal {
  transform: scale(0.96) translateY(8px);
}

@media (max-width: 640px) {
  .filter-modal {
    padding: 20px 16px 16px;
  }

  .circle-item {
    width: 68px;
  }

  .circle {
    width: 52px;
    height: 52px;
  }

  .circle-emoji {
    font-size: 22px;
  }
}
</style>
