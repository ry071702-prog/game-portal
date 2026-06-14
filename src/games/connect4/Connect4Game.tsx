import { useEffect, useRef, useState } from 'react'
import type { GameComponentProps } from '../../core/types'
import { sound } from '../../core/lib/sound'
import {
  emptyBoard,
  dropRow,
  drop,
  findWin,
  isFull,
  chooseAiMove,
  toScore,
  type Board,
  type Player,
} from './logic'

type Result = 'playing' | 'win' | 'lose' | 'draw'

interface State {
  board: Board
  /** 1 = プレイヤー (赤・先手), 2 = AI (黄・後手) */
  turn: Player
  moves: number
  result: Result
  winLine: Array<[number, number]> | null
  /** 直前に置いたマス (落下アニメーション用) */
  last: [number, number] | null
}

const initial = (): State => ({
  board: emptyBoard(),
  turn: 1,
  moves: 0,
  result: 'playing',
  winLine: null,
  last: null,
})

/** 手番の駒を col に落として勝敗まで判定した次の状態を返す。 */
function place(state: State, col: number): State {
  const row = dropRow(state.board, col)
  const board = drop(state.board, col, state.turn)
  if (row < 0 || !board) return state
  const moves = state.moves + 1
  const winLine = findWin(board, state.turn)
  const result: Result = winLine
    ? state.turn === 1
      ? 'win'
      : 'lose'
    : isFull(board)
      ? 'draw'
      : 'playing'
  return {
    board,
    turn: state.turn === 1 ? 2 : 1,
    moves,
    result,
    winLine,
    last: [row, col],
  }
}

const STATUS_LABEL: Record<Result, string> = {
  playing: '',
  win: 'あなたの勝ち!',
  lose: 'AI の勝ち…',
  draw: '引き分け',
}

export default function Connect4Game({ paused, onScore, onGameOver }: GameComponentProps) {
  const [state, setState] = useState<State>(initial)
  const firedRef = useRef(false) // 決着処理を1ゲーム1回に固定 (onGameOver の identity 変化での再発火を防ぐ)

  // AI の手番: 500ms 考えてから打つ (paused 中は打たず、再開時にこの effect が再走して打つ)
  useEffect(() => {
    if (paused || state.result !== 'playing' || state.turn !== 2) return
    const t = setTimeout(() => {
      const col = chooseAiMove(state.board)
      if (col < 0) return
      sound.click()
      setState((s) => place(s, col))
    }, 500)
    return () => clearTimeout(t)
  }, [paused, state])

  // 決着: 勝ちはスコア通知のみ。勝利ラインを見せてから結果モーダルへ。
  // firedRef で1ゲーム1回に固定。終了音・ファンファーレは GameShell に委譲 (二重再生回避)。
  useEffect(() => {
    if (state.result === 'playing' || firedRef.current) return
    firedRef.current = true
    if (state.result === 'win') onScore(toScore(state.moves))
    const t = setTimeout(() => onGameOver(state.result === 'win' ? 'win' : 'over'), 900)
    return () => clearTimeout(t)
  }, [state.result, state.moves, onScore, onGameOver])

  const playerTurn = state.turn === 1 && state.result === 'playing'
  const winSet = new Set((state.winLine ?? []).map(([r, c]) => `${r}-${c}`))

  const handleColumn = (col: number) => {
    if (paused || !playerTurn) return
    if (dropRow(state.board, col) < 0) return
    sound.move()
    setState((s) => place(s, col))
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted">
        手数: {state.moves}
        {' ・ '}
        {state.result === 'playing'
          ? playerTurn
            ? 'あなたの番 (赤)'
            : 'AI 思考中… (黄)'
          : STATUS_LABEL[state.result]}
      </p>
      <div className="grid w-full max-w-sm grid-cols-7 gap-1.5 rounded-xl bg-surface-2 p-2">
        {state.board.map((row, r) =>
          row.map((cell, c) => {
            const isWin = winSet.has(`${r}-${c}`)
            const isLast = state.last?.[0] === r && state.last?.[1] === c
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleColumn(c)}
                disabled={paused || !playerTurn}
                aria-label={`${c + 1}列目に落とす`}
                className="aspect-square rounded-full bg-bg-base/70 p-[10%]"
              >
                {cell !== 0 && (
                  <div
                    className={`h-full w-full rounded-full ${
                      cell === 1 ? 'bg-red-500' : 'bg-yellow-400'
                    } ${isWin ? 'ring-2 ring-cyan' : ''} ${isLast ? 'rise-in' : ''}`}
                  />
                )}
              </button>
            )
          }),
        )}
      </div>
      <p className="text-xs text-faint">列をタップして駒を落とし、先に4つ並べたら勝ち</p>
    </div>
  )
}
