import type { Skin, ThemeColor } from '~/constants'
import { useStorage } from '@vueuse/core'
import { skins, themeColors } from '~/constants'

// 模块级共享状态，保证背景/主题色与设置面板始终同步
const defaultSkin = skins[0]!
const defaultTheme = themeColors[0]!
const selectedSkinKey = useStorage<Skin['key']>('bg-skin', defaultSkin.key)
const selectedThemeKey = useStorage<ThemeColor['key']>('theme-color', defaultTheme.key)

export function useSkin() {
  const skin = computed<Skin>(() => {
    return skins.find(s => s.key === selectedSkinKey.value) ?? defaultSkin
  })

  const themeColor = computed<ThemeColor>(() => {
    return themeColors.find(t => t.key === selectedThemeKey.value) ?? defaultTheme
  })

  function setSkin(key: Skin['key']) {
    selectedSkinKey.value = key
  }

  function setThemeColor(key: ThemeColor['key']) {
    selectedThemeKey.value = key
  }

  return { skin, setSkin, skins, themeColor, setThemeColor, themeColors }
}
