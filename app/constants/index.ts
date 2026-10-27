export const appName = '今天吃神马？'
export const appDescription = '一个帮你快速决定“今天吃什么”的有趣工具 🍱'

// 背景皮肤配置
// tileHeight 为图片一个平铺单元的高度（px），背景按此高度无缝滚动
export interface Skin {
  key: string
  name: string
  url: string
  bgColor: string
  tileHeight: number
}

export const skins: Skin[] = [
  { key: 'plain', name: '素雅', url: '/pic/bg-plain.jpg', bgColor: '#F3F2F1', tileHeight: 784 },
  { key: 'classic', name: '经典', url: '/pic/bg-classic.png', bgColor: '#E9E9E9', tileHeight: 500 },
  { key: 'steamer', name: '蒸笼', url: '/pic/bg-steamer.jpg', bgColor: '#FCF9F3', tileHeight: 784 },
  { key: 'dumpling', name: '饺子', url: '/pic/bg-dumpling.jpg', bgColor: '#E4E4E3', tileHeight: 784 },
  { key: 'cream', name: '暖米', url: '/pic/bg-cream.jpg', bgColor: '#FAF9F3', tileHeight: 784 },
]

// 主题色预设：作用于筛选弹窗选中态、按钮与悬浮点缀
export interface ThemeColor {
  key: string
  name: string
  color: string
}

export const themeColors: ThemeColor[] = [
  { key: 'matcha', name: '抹茶', color: '#7CB342' },
  { key: 'coral', name: '珊瑚', color: '#ED7D68' },
  { key: 'caramel', name: '焦糖', color: '#F59E0B' },
  { key: 'sakura', name: '樱花粉', color: '#F472B6' },
  { key: 'latte', name: '拿铁', color: '#B45309' },
]

// Emoji映射
export const emojiMap: Record<string, string> = {
  素菜: '🥬',
  荤菜: '🍖',
  水产: '🐟',
  早餐: '🍳',
  主食: '🍚',
  半成品加工: '🥟',
  汤与粥: '🍲',
  饮料: '🥤',
  酱料和其它材料: '🧂',
  甜品: '🍰',
}
