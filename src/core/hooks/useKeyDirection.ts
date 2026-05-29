import { useEffect, useRef } from 'react'
import type { Direction } from '../lib/direction'

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
}

/**
 * 矢印キー / WASD を Direction にマップしてコールバックする。
 * 方向キーのデフォルトスクロールは preventDefault する。
 */
export function useKeyDirection(onDirection: (dir: Direction) => void, enabled = true): void {
  const cbRef = useRef(onDirection)
  useEffect(() => {
    cbRef.current = onDirection
  })

  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key]
      if (!dir) return
      if (e.key.startsWith('Arrow')) e.preventDefault()
      cbRef.current(dir)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled])
}
