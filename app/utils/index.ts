export function replaceText(text?: string) {
  return text?.replace('的做法', '') || '神马'
}

export function getOriginRecipeLink(name?: string) {
  if (!name)
    return ''

  return `https://howtocook.aiursoft.com/Dashboard?q=${encodeURIComponent(name)}`
}

// B 站视频做法搜索链接
export function getVideoSearchLink(name?: string) {
  if (!name)
    return ''

  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${name}的做法`)}`
}

// 是否为pc端
export function isPC() {
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
