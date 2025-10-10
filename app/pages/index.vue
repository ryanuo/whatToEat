<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

const online = useOnline()
</script>

<template>
  <div>
    <!-- ClientOnly 确保只在客户端渲染 -->
    <ClientOnly fallback-tag="div" fallback="">
      <Suspense>
        <!-- 默认 slot，单根节点 -->
        <template #default>
          <div>
            <Eat v-if="online" />

            <div v-else class="text-gray-80">
              You're offline
            </div>
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
