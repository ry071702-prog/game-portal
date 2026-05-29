import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { Direction } from '../lib/direction'

const THRESHOLD = 24 // px。これ未満はタップ扱いで無視

/**
 * 対象要素上のスワイプを Direction にマップする。
 * 縦横で移動量が大きい方を採用する。touchmove はスクロール抑止のため preventDefault。
 */
export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (dir: Direction) => void,
  enabled = true,
): void {
  const cbRef = useRef(onSwipe)
  useEffect(() => {
    cbRef.current = onSwipe
  })

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    let startX = 0
    let startY = 0

    const onStart = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      startX = t.clientX
      startY = t.clientY
    }
    const onMove = (e: TouchEvent) => {
      // 要素内でのスワイプ中はページスクロールを抑制
      if (e.cancelable) e.preventDefault()
    }
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY
      if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return
      if (Math.abs(dx) > Math.abs(dy)) {
        cbRef.current(dx > 0 ? 'right' : 'left')
      } else {
        cbRef.current(dy > 0 ? 'down' : 'up')
      }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [ref, enabled])
}
