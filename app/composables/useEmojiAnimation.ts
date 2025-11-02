import { isClient } from '@vueuse/core'

export function useEmojiAnimation() {
  const { x, y } = usePointer()
  const top = window.innerHeight
  const left = window.innerWidth / 2

  const playAnimation = (emoji: string) => {
    if (!isClient)
      return

    const emojiEl = document.createElement('span')
    emojiEl.style.position = 'fixed'
    emojiEl.style.left = `${x.value}px`
    emojiEl.style.top = `${y.value}px`
    emojiEl.style.zIndex = '10'
    emojiEl.style.transition = 'left .4s linear, top .4s cubic-bezier(0.5, -0.5, 1, 1)'
    emojiEl.textContent = emoji
    document.body.appendChild(emojiEl)

    setTimeout(() => {
      emojiEl.style.left = `${left}px`
      emojiEl.style.top = `${top}px`
    }, 1)

    emojiEl.ontransitionend = () => {
      emojiEl.remove()
    }
  }

  return {
    playAnimation,
  }
}
