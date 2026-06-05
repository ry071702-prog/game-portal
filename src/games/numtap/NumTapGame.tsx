import { useEffect, useMemo, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import { mulberry32 } from '../../core/lib/daily'
import { now } from '../../core/lib/time'
import { makeBoard, toScore, COUNT } from './logic'

export default function NumTapGame({ paused, onScore, onGameOver, seed }: GameComponentProps) {
  const rng = useMemo(() => (seed != null ? mulberry32(seed) : Math.random), [seed])
  const board = useMemo(() => makeBoard(rng), [rng])
  const [next, setNext] = useState(1)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(0)
  const done = next > COUNT

  // 経過時間表示の更新
  useEffect(() => {
    if (!running || paused) return
    const id = setInterval(() => setElapsed(now() - startRef.current), 100)
    return () => clearInterval(id)
  }, [running, paused])

  const tap = (n: number) => {
    if (paused || done) return
    if (n !== next) {
      sound.wrong()
      return
    }
    sound.click()
    if (n === 1) {
      startRef.current = now()
      setRunning(true)
    }
    if (n === COUNT) {
      const ms = now() - startRef.current
      setElapsed(ms)
      setRunning(false)
      setNext(COUNT + 1)
      onScore(toScore(ms))
      onGameOver('win')
    } else {
      setNext(n + 1)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-xs justify-between text-sm text-muted">
        <span>
          次は <span className="font-display text-yellow">{done ? '✓' : next}</span>
        </span>
        <span>
          <span className="font-display text-fg">{(elapsed / 1000).toFixed(1)}</span> 秒
        </span>
      </div>
      <div className="grid w-full max-w-xs grid-cols-5 gap-2">
        {board.map((n, i) => {
          const tapped = n < next
          return (
            <button
              key={i}
              onClick={() => tap(n)}
              disabled={paused || tapped}
              className={`flex aspect-square items-center justify-center rounded-lg text-lg font-bold transition ${
                tapped
                  ? 'bg-surface text-faint'
                  : 'bg-yellow text-bg-base hover:brightness-105'
              }`}
            >
              {n}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-faint">1から25まで順番にタップ！タイムを競おう</p>
    </div>
  )
}
