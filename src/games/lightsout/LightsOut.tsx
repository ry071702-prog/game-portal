import { useEffect, useReducer } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import { scramble, toggle, isCleared, toScore, type Grid } from './logic'

interface State {
  grid: Grid
  moves: number
}
type Action = { type: 'toggle'; r: number; c: number }

function reducer(state: State, action: Action): State {
  if (isCleared(state.grid)) return state
  return { grid: toggle(state.grid, action.r, action.c), moves: state.moves + 1 }
}

export default function LightsOut({ paused, onScore, onGameOver }: GameComponentProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ grid: scramble(), moves: 0 }))
  const cleared = isCleared(state.grid)

  useEffect(() => {
    onScore(cleared ? toScore(state.moves) : 0)
  }, [cleared, state.moves, onScore])

  useEffect(() => {
    if (cleared) onGameOver('win')
  }, [cleared, onGameOver])

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted">手数: {state.moves}</p>
      <div className="grid w-full max-w-xs grid-cols-5 gap-2">
        {state.grid.map((row, r) =>
          row.map((on, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => {
                if (paused) return
                sound.toggle()
                dispatch({ type: 'toggle', r, c })
              }}
              disabled={paused}
              aria-label={`ライト ${r}-${c}`}
              className={`aspect-square rounded-lg transition-colors ${
                on
                  ? 'bg-yellow-300 shadow-[0_0_16px_-2px_rgba(253,224,71,0.8)]'
                  : 'bg-surface-2 hover:bg-surface'
              }`}
            />
          )),
        )}
      </div>
      <p className="text-xs text-faint">すべて消せばクリア</p>
    </div>
  )
}
