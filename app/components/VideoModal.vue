<script setup lang="ts">
import type { VideoItem, VideoSearchResponse } from '~/types'

// 视频做法弹窗：B 站搜索列表 + 内嵌官方播放器（移动端为底部抽屉）
const props = defineProps<{
  open: boolean
  name: string
  searchUrl: string
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)
const list = ref<VideoItem[]>([])
const playing = ref<VideoItem | null>(null)
const loadedFor = ref('')

async function load(name: string) {
  if (loadedFor.value === name && list.value.length)
    return

  loading.value = true
  list.value = []
  try {
    const res = await $fetch<VideoSearchResponse>('/api/video-search', { params: { name } })
    list.value = res.results
    loadedFor.value = name
  }
  catch {
    list.value = []
  }
  finally {
    loading.value = false
  }
}

watch(() => props.open, (val) => {
  if (val) {
    playing.value = null
    load(props.name)
  }
})

function close() {
  emit('close')
  playing.value = null
}

// 弹窗内嵌 B 站官方播放器
const playerSrc = computed(() => {
  const bvid = playing.value?.bvid
  return bvid
    ? `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=1&danmaku=0&high_quality=1`
    : ''
})

function formatPlay(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)} 万` : String(n)
}

useEventListener(document, 'keydown', (e) => {
  if (e.key === 'Escape' && props.open)
    close()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="video-overlay" @click.self="close">
        <div class="video-modal" role="dialog" aria-modal="true" aria-label="视频做法">
          <div class="video-head">
            <h2 class="video-title">
              {{ name }}的视频做法
            </h2>

            <div class="video-head-actions">
              <a
                v-if="searchUrl"
                :href="searchUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="video-bili-link"
              >在 B 站打开</a>

              <button type="button" class="video-close" aria-label="关闭" @click="close">
                <span class="i-carbon:close" />
              </button>
            </div>
          </div>

          <!-- 播放器 -->
          <div v-if="playing" class="video-player">
            <iframe
              :key="playing.bvid"
              :src="playerSrc"
              class="video-iframe"
              allow="fullscreen; autoplay; encrypted-media"
              scrolling="no"
              frameborder="0"
            />

            <button type="button" class="video-back" @click="playing = null">
              <span class="i-carbon:arrow-left" />
              返回列表
            </button>
          </div>

          <!-- 列表 / 加载 / 兜底 -->
          <div v-else class="video-body">
            <div v-if="loading" class="video-status">
              <Loading />
              <p>正在搜索视频做法...</p>
            </div>

            <div v-else-if="list.length" class="video-list">
              <button
                v-for="v in list"
                :key="v.bvid"
                type="button"
                class="video-item"
                @click="playing = v"
              >
                <img
                  :src="v.cover"
                  referrerpolicy="no-referrer"
                  loading="lazy"
                  alt=""
                  class="video-cover"
                >
                <span class="video-info">
                  <span class="video-item-title">{{ v.title }}</span>
                  <span class="video-item-meta">
                    {{ v.author }} · {{ v.duration }} · {{ formatPlay(v.play) }} 播放
                  </span>
                </span>
              </button>
            </div>

            <div v-else class="video-status">
              <p>😔 没有找到相关视频</p>
              <a
                :href="searchUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="video-bili-link"
              >去 B 站搜索</a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.video-overlay {
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

.video-modal {
  display: flex;
  flex-direction: column;

  width: min(92vw, 680px);
  max-height: min(86vh, 720px);

  padding: 22px 22px 18px;

  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 64px rgba(20, 29, 55, 0.16);
}

.video-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.video-title {
  overflow: hidden;

  color: #141d37;
  font-size: 17px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-head-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.video-close {
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

.video-close:hover {
  background: #f3f4f6;
  color: #141d37;
}

.video-bili-link {
  padding: 6px 12px;

  border-radius: 9999px;
  background: #fb7185;
  color: #fff;

  font-size: 12px;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;

  transition: background 160ms ease;
}

.video-bili-link:hover {
  background: #f43f5e;
}

/* 内嵌官方播放器（16:9） */
.video-player {
  margin-top: 14px;
}

.video-iframe {
  display: block;

  width: 100%;
  aspect-ratio: 16 / 9;

  border: none;
  border-radius: 12px;
  background: #000;
}

.video-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  margin-top: 10px;
  padding: 6px 12px;

  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #5c6070;

  font-size: 12px;

  cursor: pointer;
  transition: background 160ms ease;
}

.video-back:hover {
  background: #f3f4f6;
  color: #141d37;
}

/* 列表 */
.video-body {
  margin-top: 12px;
  overflow-y: auto;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-item {
  display: flex;
  gap: 12px;
  align-items: center;

  padding: 8px;

  border: none;
  border-radius: 12px;
  background: transparent;

  text-align: left;

  cursor: pointer;
  transition: background 160ms ease;
}

.video-item:hover {
  background: #f6f7f9;
}

.video-item:focus-visible {
  outline: 2px solid rgba(201, 77, 94, 0.75);
  outline-offset: -2px;
}

.video-cover {
  flex: none;

  width: 128px;
  height: 78px;

  border-radius: 8px;
  background: #eceef2;
  object-fit: cover;
}

.video-info {
  display: flex;
  flex-direction: column;
  gap: 6px;

  min-width: 0;
}

.video-item-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  color: #141d37;
  font-size: 14px;
  line-height: 1.4;
}

.video-item-meta {
  color: #9aa0ad;
  font-size: 12px;
}

/* 加载与空态 */
.video-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;

  padding: 36px 0 28px;

  color: #5c6070;
  font-size: 14px;
}

/* 弹窗过渡 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .video-modal,
.modal-leave-active .video-modal {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .video-modal,
.modal-leave-to .video-modal {
  transform: scale(0.96) translateY(8px);
}

/* 移动端：底部抽屉 */
@media (max-width: 640px) {
  .video-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .video-modal {
    width: 100%;
    max-height: 88vh;
    max-height: 88dvh;
    padding: 16px 14px calc(14px + env(safe-area-inset-bottom, 0px));

    border-radius: 20px 20px 0 0;
  }

  .video-title {
    font-size: 15px;
  }

  .video-cover {
    width: 104px;
    height: 64px;
  }

  .video-item-title {
    font-size: 13px;
  }
}
</style>
