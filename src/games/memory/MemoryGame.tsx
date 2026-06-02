import { useEffect, useReducer } from 'react'
import type { GameComponentProps } from '../../core/types'
import {
  initialState,
  flip,
  resolve,
  isCleared,
  matchedPairs,
  type MemoryState,
} from './logic'

type Action = { type: 'flip'; index: number } | { type: 'resolve' }

function reducer(state: MemoryState, action: Action): MemoryState {
  switch (action.type) {
    case 'flip':
      return flip(state, action.index)
    case 'resolve':
      return resolve(state)
  }
}

/** 少ない手数ほど高スコアになるよう変換 (max ベースのベスト保存と整合) */
function toScore(state: MemoryState): number {
  return Math.max(0, matchedPairs(state) * 100 - state.moves * 5)
}

export default function MemoryGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState())

  // 2枚めくったら一定時間後に判定
  useEffect(() => {
    if (state.secondIndex === null) return
    const t = setTimeout(() => dispatch({ type: 'resolve' }), 750)
    return () => clearTimeout(t)
  }, [state.secondIndex])

  // スコア通知
  useEffect(() => {
    onScore(toScore(state))
  }, [state, onScore])

  // クリア判定
  useEffect(() => {
    if (isCleared(state)) onGameOver('win')
  }, [state, onGameOver])

  const busy = state.secondIndex !== null
  const handleClick = (index: number) => {
    if (paused || busy) return
    dispatch({ type: 'flip', index })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted">手数: {state.moves}</p>
      <div className="grid w-full max-w-sm grid-cols-4 gap-2">
        {state.cards.map((card, i) => {
          const shown = card.revealed || card.matched
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={shown || paused || busy}
              className="relative aspect-square [perspective:600px]"
              aria-label={shown ? card.emoji : 'カード'}
            >
              <div className={`flip-card relative h-full w-full ${shown ? 'is-flipped' : ''}`}>
                {/* 裏面 */}
                <div className="flip-face absolute inset-0 flex items-center justify-center rounded-lg bg-amber-500/20 ring-1 ring-amber-500/30">
                  <span className="text-2xl text-amber-700/70 dark:text-amber-300/60">?</span>
                </div>
                {/* 表面 */}
                <div
                  className={`flip-face flip-back absolute inset-0 flex items-center justify-center rounded-lg text-3xl ${
                    card.matched ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40' : 'bg-surface-2'
                  }`}
                >
                  {card.emoji}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
