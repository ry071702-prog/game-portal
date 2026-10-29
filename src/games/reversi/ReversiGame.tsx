import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import {
  initialBoard,
  legalMoves,
  applyMove,
  nextTurn,
  count,
  chooseCpuMove,
  toScore,
  opponent,
  SIZE,
  type Board,
  type Player,
} from './logic'

interface State {
  board: Board
  /** null = 終局 */
  turn: Player | null
  /** 直前に置いたマス */
  last: number | null
  /** 直前にパスしたプレイヤー (表示用) */
  passed: Player | null
}

const initial = (): State => ({ board: initialBoard(), turn: 1, last: null, passed: null })

/** 手番の石を idx に置いて次の手番まで進めた状態を返す */
function place(state: State, idx: number): State {
  if (state.turn === null) return state
  const board = applyMove(state.board, idx, state.turn)
  if (!board) return state
  const turn = nextTurn(board, state.turn)
  return { board, turn, last: idx, passed: turn === state.turn ? opponent(state.turn) : null }
}

export default function ReversiGame({ paused, onScore, onGameOver }: GameComponentProps) {
  const [state, setState] = useState<State>(initial)
  const firedRef = useRef(false) // 終局処理を1ゲーム1回に固定
  const c = count(state.board)
  const playerTurn = state.turn === 1
  const hints = playerTurn ? new Set(legalMoves(state.board, 1)) : new Set<number>()

  // CPU の手番: 少し考えてから打つ (paused 中は打たず、再開時にこの effect が再走して打つ)
  useEffect(() => {
    if (paused || state.turn !== 2) return
    const t = setTimeout(() => {
      const idx = chooseCpuMove(state.board, 2)
      if (idx < 0) return
      sound.flip()
      setState((s) => place(s, idx))
    }, 550)
    return () => clearTimeout(t)
  }, [paused, state])

  // 終局: スコア通知 → 盤面を見せてから結果モーダルへ、firedRef は発火時に立てる
  // (先に立てると onGameOver の identity 変化でタイマーだけ消えて二度と通知されない)
  useEffect(() => {
    if (state.turn !== null || firedRef.current) return
    const score = toScore(state.board)
    onScore(score)
    const t = setTimeout(() => {
      firedRef.current = true
      onGameOver(score > 100 ? 'win' : 'over')
    }, 900)
    return () => clearTimeout(t)
  }, [state.turn, state.board, onScore, onGameOver])

  const tap = (idx: number) => {
    if (paused || !playerTurn || !hints.has(idx)) return
    sound.flip()
    setState((s) => place(s, idx))
  }

  const status =
    state.turn === null
      ? c[1] > c[2]
        ? 'あなたの勝ち!'
        : c[1] === c[2]
          ? '引き分け'
          : 'CPU の勝ち…'
      : playerTurn
        ? state.passed === 2
          ? 'CPU はパス。あなたの番 (黒)'
          : 'あなたの番 (黒)'
        : state.passed === 1
          ? '打てる場所がないのでパス…'
          : 'CPU 思考中… (白)'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-sm items-center justify-between text-sm text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-neutral-900 ring-1 ring-white/40" />
          <span className="font-display text-fg">{c[1]}</span>
        </span>
        <span>{status}</span>
        <span className="flex items-center gap-1">
          <span className="font-display text-fg">{c[2]}</span>
          <span className="inline-block h-3 w-3 rounded-full bg-white" />
        </span>
      </div>
      <div className="grid w-full max-w-sm grid-cols-6 gap-1 rounded-xl bg-emerald-800 p-2">
        {state.board.map((cell, i) => {
          const hint = hints.has(i)
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              disabled={paused || !hint}
              aria-label={`${Math.floor(i / SIZE) + 1}行${(i % SIZE) + 1}列${hint ? ' (置ける)' : ''}`}
              className="flex aspect-square items-center justify-center rounded-sm bg-emerald-700 p-[12%]"
            >
              {cell !== 0 ? (
                <div
                  className={`h-full w-full rounded-full shadow ${
                    cell === 1 ? 'bg-neutral-900' : 'bg-white'
                  } ${state.last === i ? 'ring-2 ring-yellow' : ''}`}
                />
              ) : hint ? (
                <div className="h-1/3 w-1/3 rounded-full bg-black/30" />
              ) : null}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-faint">相手の石を挟んで裏返そう。点のマスに置けます</p>
    </div>
  )
}
