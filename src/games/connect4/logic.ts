// 四目並べの純粋ロジック。盤面は board[row][col] で row 0 が最上段。
export const COLS = 7
export const ROWS = 6

/** 0 = 空, 1 = プレイヤー (赤・先手), 2 = AI (黄・後手) */
export type Cell = 0 | 1 | 2
export type Player = 1 | 2
export type Board = Cell[][]

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0))
}

/** col に駒を落としたとき止まる行。列が満杯なら -1。 */
export function dropRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r
  }
  return -1
}

/** col に player の駒を落とした新しい盤面を返す (純粋関数)。満杯なら null。 */
export function drop(board: Board, col: number, player: Player): Board | null {
  const r = dropRow(board, col)
  if (r < 0) return null
  const next = board.map((row) => [...row])
  next[r][col] = player
  return next
}

/** まだ駒を落とせる列の一覧。 */
export function availableColumns(board: Board): number[] {
  const cols: number[] = []
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) cols.push(c)
  }
  return cols
}

export function isFull(board: Board): boolean {
  return availableColumns(board).length === 0
}

const DIRECTIONS = [
  [0, 1], // 横
  [1, 0], // 縦
  [1, 1], // 右下がり斜め
  [1, -1], // 左下がり斜め
] as const

/** player の4連があればその4マスの座標を返す。なければ null。 */
export function findWin(board: Board, player: Player): Array<[number, number]> | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue
      for (const [dr, dc] of DIRECTIONS) {
        const line: Array<[number, number]> = [[r, c]]
        for (let i = 1; i < 4; i++) {
          const rr = r + dr * i
          const cc = c + dc * i
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc] !== player) break
          line.push([rr, cc])
        }
        if (line.length === 4) return line
      }
    }
  }
  return null
}

/** player が1手で勝てる列の一覧。 */
function winningColumns(board: Board, player: Player): number[] {
  return availableColumns(board).filter((c) => {
    const next = drop(board, c, player)
    return next !== null && findWin(next, player) !== null
  })
}

/** 4マス窓のうち player が3つ + 空き1つ (リーチ) の数。簡易評価に使う。 */
function countThreats(board: Board, player: Player): number {
  let count = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of DIRECTIONS) {
        const er = r + dr * 3
        const ec = c + dc * 3
        if (er < 0 || er >= ROWS || ec < 0 || ec >= COLS) continue
        let mine = 0
        let empty = 0
        for (let i = 0; i < 4; i++) {
          const cell = board[r + dr * i][c + dc * i]
          if (cell === player) mine++
          else if (cell === 0) empty++
        }
        if (mine === 3 && empty === 1) count++
      }
    }
  }
  return count
}

const AI: Player = 2
const HUMAN: Player = 1

/** 同点候補から rng で1つ選ぶ (タイブレーク)。 */
function pick(cols: number[], rng: () => number): number {
  return cols[Math.floor(rng() * cols.length)]
}

/**
 * AI の手を選ぶ。①自分の即勝ち → ②相手の即勝ち阻止 → ③簡易評価
 * (中央寄り重み + 自分のリーチを作る列を加点、相手に即勝ちを許す列は大減点)。
 */
export function chooseAiMove(board: Board, rng: () => number = Math.random): number {
  const cols = availableColumns(board)
  if (cols.length === 0) return -1

  const wins = winningColumns(board, AI)
  if (wins.length > 0) return pick(wins, rng)

  const blocks = winningColumns(board, HUMAN)
  if (blocks.length > 0) return pick(blocks, rng)

  const baseThreats = countThreats(board, AI)
  let bestScore = -Infinity
  let best: number[] = []
  for (const c of cols) {
    const next = drop(board, c, AI)
    if (!next) continue
    let score = 3 - Math.abs(c - 3) // 中央寄りほど高い
    if (countThreats(next, AI) > baseThreats) score += 6 // 自分の3連 (リーチ) を作る
    if (winningColumns(next, HUMAN).length > 0) score -= 100 // 相手に即勝ちを許す列は避ける
    if (score > bestScore) {
      bestScore = score
      best = [c]
    } else if (score === bestScore) {
      best.push(c)
    }
  }
  return pick(best, rng)
}

/** 少ない手数で勝つほど高スコア (max ベースのベスト保存と整合)。 */
export function toScore(moves: number): number {
  return 100 + (ROWS * COLS - moves)
}
