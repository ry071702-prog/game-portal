import { useEffect, useMemo, useReducer } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import { mulberry32 } from '../../core/lib/daily'
import { shuffle, move, isSolved, toScore, N, type Board } from './logic'

interface State {
  board: Board
  moves: number
}
type Action = { type: 'move'; index: number }

function reducer(state: State, action: Action): State {
  if (isSolved(state.board)) return state
  const { board, moved } = move(state.board, action.index)
  if (!moved) return state
  return { board, moves: state.moves + 1 }
}

export default function Slide15({ paused, onScore, onGameOver, seed }: GameComponentProps) {
  const rng = useMemo(() => (seed != null ? mulberry32(seed) : Math.random), [seed])
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    board: shuffle(rng),
    moves: 0,
  }))
  const cleared = isSolved(state.board)

  useEffect(() => {
    onScore(cleared ? toScore(state.moves) : 0)
  }, [cleared, state.moves, onScore])

  useEffect(() => {
    if (cleared) onGameOver('win')
  }, [cleared, onGameOver])

  const tap = (i: number) => {
    if (paused) return
    if (move(state.board, i).moved) sound.move()
    dispatch({ type: 'move', index: i })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted">手数: {state.moves}</p>
      <div
        className="grid w-full max-w-xs gap-2"
        style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
      >
        {state.board.map((v, i) =>
          v === 0 ? (
            <div key={i} className="aspect-square rounded-lg bg-surface" />
          ) : (
            <button
              key={i}
              onClick={() => tap(i)}
              disabled={paused}
              className="flex aspect-square items-center justify-center rounded-lg bg-violet-500/80 text-xl font-bold text-white hover:bg-violet-500"
            >
              {v}
            </button>
          ),
        )}
      </div>
      <p className="text-xs text-faint">1〜15を順番に並べよう</p>
    </div>
  )
}
