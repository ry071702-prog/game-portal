import { useEffect, useReducer, useRef } from 'react'
import type { GameComponentProps } from '../../core/types'
import type { Direction } from '../../core/lib/direction'
import { useKeyDirection } from '../../core/hooks/useKeyDirection'
import { useSwipe } from '../../core/hooks/useSwipe'
import { initialBoard, move, spawn, isGameOver, type Board } from './logic'

interface State {
  board: Board
  score: number
}

type Action = { type: 'move'; dir: Direction }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'move': {
      const { board, gained, moved } = move(state.board, action.dir)
      if (!moved) return state
      return { board: spawn(board), score: state.score + gained }
    }
  }
}

const TILE_BG: Record<number, string> = {
  0: 'bg-surface-2',
  2: 'bg-violet-200 text-violet-900',
  4: 'bg-violet-300 text-violet-900',
  8: 'bg-violet-400 text-white',
  16: 'bg-violet-500 text-white',
  32: 'bg-fuchsia-500 text-white',
  64: 'bg-fuchsia-600 text-white',
  128: 'bg-amber-400 text-amber-950',
  256: 'bg-amber-500 text-amber-950',
  512: 'bg-amber-600 text-white',
  1024: 'bg-rose-500 text-white',
  2048: 'bg-rose-600 text-white',
}

export default function Game2048({ paused, onScore, onGameOver }: GameComponentProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    board: initialBoard(),
    score: 0,
  }))
  const surfaceRef = useRef<HTMLDivElement>(null)

  // スコア通知
  useEffect(() => {
    onScore(state.score)
  }, [state.score, onScore])

  // ゲームオーバー判定
  useEffect(() => {
    if (isGameOver(state.board)) onGameOver()
  }, [state.board, onGameOver])

  const handleDir = (dir: Direction) => {
    if (!paused) dispatch({ type: 'move', dir })
  }
  useKeyDirection(handleDir, !paused)
  useSwipe(surfaceRef, handleDir, !paused)

  return (
    <div className="flex justify-center">
      <div
        ref={surfaceRef}
        className="game-surface grid aspect-square w-full max-w-sm grid-cols-4 gap-2 rounded-xl bg-surface p-2"
      >
        {state.board.flat().map((value, i) => (
          <div
            key={i}
            className={`flex items-center justify-center rounded-lg text-2xl font-bold transition-colors ${
              TILE_BG[value] ?? 'bg-rose-700 text-white'
            }`}
          >
            {value > 0 ? value : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
