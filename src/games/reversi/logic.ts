// 6×6 ミニリバーシ。8×8 より短く、1局 2〜3 分で終わるサイズ。
// 盤面は長さ SIZE*SIZE の 1 次元配列 (index = row * SIZE + col)。

export const SIZE = 6
export type Cell = 0 | 1 | 2
/** 1 = プレイヤー (黒・先手), 2 = CPU (白・後手) */
export type Player = 1 | 2
export type Board = Cell[]

const DIRS: Array<[number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

export const opponent = (p: Player): Player => (p === 1 ? 2 : 1)

export function initialBoard(): Board {
  const b: Board = Array(SIZE * SIZE).fill(0)
  const m = SIZE / 2
  b[(m - 1) * SIZE + (m - 1)] = 2
  b[(m - 1) * SIZE + m] = 1
  b[m * SIZE + (m - 1)] = 1
  b[m * SIZE + m] = 2
  return b
}

/** idx に player が置いたときに裏返る石の index 一覧 (置けないなら空)。 */
export function flipsFor(board: Board, idx: number, player: Player): number[] {
  if (board[idx] !== 0) return []
  const r0 = Math.floor(idx / SIZE)
  const c0 = idx % SIZE
  const opp = opponent(player)
  const result: number[] = []
  for (const [dr, dc] of DIRS) {
    const line: number[] = []
    let r = r0 + dr
    let c = c0 + dc
    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r * SIZE + c] === opp) {
      line.push(r * SIZE + c)
      r += dr
      c += dc
    }
    if (line.length > 0 && r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r * SIZE + c] === player) {
      result.push(...line)
    }
  }
  return result
}

export function legalMoves(board: Board, player: Player): number[] {
  const moves: number[] = []
  for (let i = 0; i < board.length; i++) {
    if (flipsFor(board, i, player).length > 0) moves.push(i)
  }
  return moves
}

/** 石を置いて挟んだ石を裏返した新しい盤面。置けない手なら null。 */
export function applyMove(board: Board, idx: number, player: Player): Board | null {
  const flips = flipsFor(board, idx, player)
  if (flips.length === 0) return null
  const next = board.slice()
  next[idx] = player
  for (const f of flips) next[f] = player
  return next
}

/**
 * 直前に mover が打った後の手番。相手が打てなければパスで mover が続行、
 * 双方打てなければ null (終局)。
 */
export function nextTurn(board: Board, mover: Player): Player | null {
  const opp = opponent(mover)
  if (legalMoves(board, opp).length > 0) return opp
  if (legalMoves(board, mover).length > 0) return mover
  return null
}

export function count(board: Board): { 1: number; 2: number } {
  let a = 0
  let b = 0
  for (const c of board) {
    if (c === 1) a++
    else if (c === 2) b++
  }
  return { 1: a, 2: b }
}

/**
 * 6×6 用の位置評価。角が最優先、角の隣 (X/C 打ち) は相手に角を渡しやすいので減点。
 */
const WEIGHTS: number[] = [
  100, -20, 10, 10, -20, 100,
  -20, -40, -2, -2, -40, -20,
  10,  -2,  1,  1,  -2,  10,
  10,  -2,  1,  1,  -2,  10,
  -20, -40, -2, -2, -40, -20,
  100, -20, 10, 10, -20, 100,
]

/**
 * CPU の手: 位置評価 + 裏返す枚数 - 相手に与える合法手の数 の最大を選ぶ (同点は小さい index)。
 * 打てる手がなければ -1。
 */
export function chooseCpuMove(board: Board, player: Player = 2): number {
  let best = -1
  let bestScore = -Infinity
  for (const idx of legalMoves(board, player)) {
    const next = applyMove(board, idx, player)!
    const score =
      WEIGHTS[idx] * 3 + flipsFor(board, idx, player).length - legalMoves(next, opponent(player)).length * 2
    if (score > bestScore) {
      bestScore = score
      best = idx
    }
  }
  return best
}

/** 終局時のスコア: 勝ち = 100 + 石差、引き分け = 50、負け = 自分の石数。 */
export function toScore(board: Board): number {
  const c = count(board)
  if (c[1] > c[2]) return 100 + (c[1] - c[2])
  if (c[1] === c[2]) return 50
  return c[1]
}
