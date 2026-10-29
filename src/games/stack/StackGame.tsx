import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { useGameLoop } from '../../core/hooks/useGameLoop'
import { sound } from '../../core/lib/sound'
import { createGame, step, drop, floors, W, type Block } from './logic'

/** 画面に見える段数、これより高くなると下の段は画面外へスクロールする */
const VISIBLE = 12
/** 現在のブロックの上に空けておく段数 */
const HEADROOM = 3

const HUES = [190, 210, 250, 280, 320, 350, 20, 45, 80, 140]
const colorFor = (floor: number) => `hsl(${HUES[floor % HUES.length]} 85% 60%)`

export default function StackGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const [state, setState] = useState(createGame)
  const [flash, setFlash] = useState<string | null>(null)
  const overFired = useRef(false)
  const score = floors(state)

  useEffect(() => onScore(score), [score, onScore])

  // 崩れた様子を少し見せてから終了通知、fired は発火時に立てる
  // (先に立てると onGameOver の identity 変化でタイマーだけ消えて二度と通知されない)
  useEffect(() => {
    if (!state.over || overFired.current) return
    const t = setTimeout(() => {
      overFired.current = true
      onGameOver()
    }, 600)
    return () => clearTimeout(t)
  }, [state.over, onGameOver])

  useGameLoop((dt) => setState((s) => step(s, dt)), !paused && !state.over)

  const tap = useCallback(() => {
    if (paused || state.over) return
    const { state: next, result } = drop(state)
    if (result === 'miss') {
      sound.wrong()
      setFlash(null)
    } else if (result === 'perfect') {
      sound.match()
      setFlash(next.combo > 1 ? `PERFECT ×${next.combo}` : 'PERFECT')
    } else {
      sound.brick()
      setFlash(null)
    }
    setState(next)
  }, [paused, state])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 停止中・終了後は素通しする (終了後のニックネーム入力で Space / Enter を潰さないため)
      if (e.repeat || paused || state.over) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        tap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tap, paused, state.over])

  // 上に積むほど視点を持ち上げる
  const currentFloor = state.tower.length
  const offset = Math.max(0, currentFloor + HEADROOM - VISIBLE)
  const rowH = 100 / VISIBLE

  const blockStyle = (b: Block, floor: number) => ({
    left: `${(b.x / W) * 100}%`,
    width: `${(b.width / W) * 100}%`,
    bottom: `${(floor - offset) * rowH}%`,
    height: `${rowH}%`,
    background: colorFor(floor),
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-xs justify-between text-sm text-muted">
        <span>
          高さ <span className="font-display text-fg">{score}</span> 段
        </span>
        <span className="font-display text-yellow">{flash ?? ''}</span>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label="ブロックを落とす"
        onPointerDown={(e) => {
          e.preventDefault()
          tap()
        }}
        className="relative aspect-[3/4] w-full max-w-xs touch-none overflow-hidden rounded-xl bg-surface-2 ring-1 ring-line select-none"
      >
        {state.tower.map((b, i) =>
          i >= offset ? (
            <div key={i} className="absolute rounded-sm border border-black/20" style={blockStyle(b, i)} />
          ) : null,
        )}
        {!state.over && (
          <div
            className="absolute rounded-sm border border-white/40"
            style={blockStyle(state.current, currentFloor)}
          />
        )}
      </div>
      <p className="text-xs text-faint">タップ / スペースでブロックを落とす。はみ出た分は削れます</p>
    </div>
  )
}
