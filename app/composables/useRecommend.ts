// 简易算法推荐 目前暂未使用

import type { Recipe } from '~/types'

const ruleMap = {
  time: {
    morning: {
      label: '早',
      keywords: ['粥', '蛋', '包', '豆浆', '面包', '早餐'],
    },
    noon: {
      label: '午',
      keywords: ['饭', '面', '炒', '鸡', '鱼'],
    },
    night: {
      label: '晚',
      keywords: ['火锅', '汤', '面', '烧', '炒'],
    },
  },
  weather: {
    hot: {
      label: '热',
      keywords: ['凉', '冰', '沙拉', '瓜'],
    },
    cold: {
      label: '冷',
      keywords: ['汤', '火锅', '炖', '煲'],
    },
  },
  category: {
    sichuan: {
      label: '川菜',
      keywords: ['辣', '麻', '火锅', '水煮'],
    },
    cantonese: {
      label: '粤菜',
      keywords: ['蒸', '煲', '虾', '烧腊'],
    },
    home: {
      label: '家常',
      keywords: ['炒', '蛋', '豆腐', '茄子'],
    },
  },
} as const

type CategoryKey = keyof typeof ruleMap.category
type WeatherKey = keyof typeof ruleMap.weather
type TimeKey = keyof typeof ruleMap.time

export function useRecommend() {
  const now = new Date()
  const hour = now.getHours()

  const getTimePeriod = (): TimeKey => {
    if (hour < 10)
      return 'morning'
    if (hour < 16)
      return 'noon'
    return 'night'
  }

  const getWeather = (): WeatherKey | undefined => {
    const list: WeatherKey[] = ['hot', 'cold']
    return list[Math.floor(Math.random() * list.length)]
  }

  const recommend = (recipes: Recipe[], preferCategory?: CategoryKey) => {
    const time = getTimePeriod()
    const weather = getWeather()

    const filtered = recipes.filter((r) => {
      const name = r.name || ''

      const matchTime = ruleMap.time[time].keywords.some(k => name.includes(k))
      const matchWeather = !weather || ruleMap.weather[weather].keywords.some(k => name.includes(k))
      const matchCategory
        = preferCategory
          ? ruleMap.category[preferCategory].keywords.some(k => name.includes(k))
          : false

      return matchTime || matchWeather || matchCategory
    })

    const list = filtered.length ? filtered : recipes
    return list[Math.floor(Math.random() * list.length)]
  }

  return { recommend }
}
