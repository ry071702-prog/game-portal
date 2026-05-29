import { useEffect, useRef } from 'react'

/**
 * requestAnimationFrame ベースのゲームループ。
 * running=false の間は停止し、コールバックには前フレームからの経過ms (dt) を渡す。
 * cb は最新のものが ref 経由で常に呼ばれるため、依存配列を気にせず使える。
 */
export function useGameLoop(cb: (dtMs: number) => void, running: boolean): void {
  const cbRef = useRef(cb)
  useEffect(() => {
    cbRef.current = cb
  })

  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last
      last = now
      cbRef.current(dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])
}
