<script setup lang="ts">
definePageMeta({
  layout: 'home',
})
</script>

<template>
  <div>
    <!-- ClientOnly 确保只在客户端渲染；
         不再用 v-if="online" 控制挂载：网络事件抖动会导致组件卸载重建，
         出现二次 loading 并重复请求，离线场景交给 Eat 的错误分支处理 -->
    <ClientOnly fallback-tag="div" fallback="">
      <Suspense>
        <!-- 默认 slot，单根节点 -->
        <template #default>
          <div>
            <Eat />
          </div>
        </template>

        <!-- fallback slot -->
        <template #fallback>
          <div class="grid h-screen italic place-items-center">
            <span class="animate-pulse"><Loading /></span>
          </div>
        </template>
      </Suspense>
    </ClientOnly>
  </div>
</template>
