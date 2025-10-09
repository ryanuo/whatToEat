<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

const online = useOnline()
</script>

<template>
  <div>
    <ClientOnly>
      <Suspense>
        <Eat v-if="online" />
        <div v-else text-gray:80>
          You're offline
        </div>
        <template #fallback>
          <div class="grid h-screen italic place-items-center">
            <span class="animate-pulse"><Loading /></span>
          </div>
        </template>
      </Suspense>
      <template #fallback>
        <div class="grid h-screen italic place-items-center">
          <span class="animate-pulse"><Loading /></span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
