import { pwa } from './app/config/pwa'
import { appDescription, appName } from './app/constants/index'

// 结构化数据：帮助搜索引擎理解站点
const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': appName,
  'alternateName': ['whatToEat', '今天吃什么'],
  'url': 'https://eat.ryanuo.cc/',
  'description': appDescription,
  'applicationCategory': 'LifestyleApplication',
  'operatingSystem': 'Any',
  'inLanguage': 'zh-CN',
  'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'CNY' },
  'featureList': ['随机抽菜', '分类筛选', '图文菜谱', '视频做法'],
})

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
  ],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '今天吃什么？随机菜谱推荐',
      titleTemplate: '%s · 今天吃神马？',
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'canonical', href: 'https://eat.ryanuo.cc/' },
      ],
      meta: [
        { name: 'description', content: appDescription },
        { name: 'author', content: 'Ryanuo' },
        { name: 'keywords', content: '今天吃什么, 吃什么, 随机抽菜, 菜谱推荐, 家常菜做法, 视频菜谱, 晚餐推荐, 午餐吃什么, 选择困难症, whatToEat' },
        { name: 'robots', content: 'index, follow' },
        // 颜色与 PWA 支持
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#F6F6F7' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#222222' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: appName },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:title', content: `${appName} — 今天吃什么？随机菜谱推荐` },
        { property: 'og:description', content: appDescription },
        { property: 'og:image', content: 'https://eat.ryanuo.cc/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '590' },
        { property: 'og:image:alt', content: `${appName} — 帮你决定今天吃什么` },
        { property: 'og:url', content: 'https://eat.ryanuo.cc/' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${appName} — 今天吃什么？随机菜谱推荐` },
        { name: 'twitter:description', content: appDescription },
        { name: 'twitter:image', content: 'https://eat.ryanuo.cc/og-image.png' },
      ],
      script: [
        { type: 'application/ld+json', innerHTML: jsonLd },
      ],
    },
  },

  colorMode: {
    classSuffix: '',
  },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  compatibilityDate: '2024-08-14',

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: false,
    },
  },

  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

  pwa,
})
