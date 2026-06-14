export type Mark = 'O' | 'X'
export type Cell = Mark | null
export type Board = Cell[] // 長さ9 (3x3 を行優先で並べる)

export const PLAYER: Mark = 'O' // プレイヤーは先手 ○
export const AI: Mark = 'X' // AI は後手 ×

export const WIN_POINTS = 100 // 1ラウンド勝利の得点
export const DRAW_POINTS = 20 // 引き分けの得点

export function emptyBoard(): Board {
  return Array<Cell>(9).fill(null)
}

/** 縦・横・斜めの勝利ライン (インデックス3つ組) */
export const LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

/** 揃っているラインがあれば { mark, line } を返す (ハイライト表示用)。なければ null。 */
export function winningLine(board: Board): { mark: Mark; line: readonly number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line
    if (board[a] !== null && board[a] === board[b] && board[b] === board[c]) {
      return { mark: board[a], line }
    }
  }
  return null
}

export function isFull(board: Board): boolean {
  return board.every((cell) => cell !== null)
}

export function legalMoves(board: Board): number[] {
  const moves: number[] = []
  board.forEach((cell, i) => {
    if (cell === null) moves.push(i)
  })
  return moves
}

function other(mark: Mark): Mark {
  return mark === 'O' ? 'X' : 'O'
}

/** me 視点の評価値。早い勝ちほど高く、粘った負けほどマシ (depth で調整)。決着前は null。 */
function evaluate(board: Board, me: Mark, depth: number): number | null {
  const win = winningLine(board)
  if (win) return win.mark === me ? 10 - depth : depth - 10
  if (isFull(board)) return 0
  return null
}

function minimax(board: Board, turn: Mark, me: Mark, depth: number): number {
  const score = evaluate(board, me, depth)
  if (score !== null) return score
  let best = turn === me ? -Infinity : Infinity
  for (const i of legalMoves(board)) {
    const next = [...board]
    next[i] = turn
    const s = minimax(next, other(turn), me, depth + 1)
    best = turn === me ? Math.max(best, s) : Math.min(best, s)
  }
  return best
}

/** minimax による mark の最適手。合法手がなければ -1。 */
export function bestMove(board: Board, mark: Mark): number {
  let best = -Infinity
  let move = -1
  for (const i of legalMoves(board)) {
    const next = [...board]
    next[i] = mark
    const s = minimax(next, other(mark), mark, 1)
    if (s > best) {
      best = s
      move = i
    }
  }
  return move
}

/** 確率 p で最適手、外れたらランダム合法手 (rng 注入で決定論的にテスト可)。 */
export function chooseAiMove(
  board: Board,
  mark: Mark,
  p: number,
  rng: () => number = Math.random,
): number {
  const moves = legalMoves(board)
  if (moves.length === 0) return -1
  if (rng() < p) return bestMove(board, mark)
  return moves[Math.floor(rng() * moves.length)]
}

/** ラウンドが進むほど最適手率が上がる。完全 AI だと勝てないので 0.95 で頭打ち。 */
export function optimalProbability(round: number): number {
  return Math.min(0.95, 0.55 + 0.1 * round)
}
