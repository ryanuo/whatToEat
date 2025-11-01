export function replaceText(text?: string) {
  return text?.replace('的做法', '') || '神马'
}

export function getOriginRecipeLink(source_path?: string) {
  if (!source_path)
    return ''

  return `https://cook.aiursoft.com/${source_path?.replace('.md', '')}`
}

// 是否为pc端
export function isPC() {
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
