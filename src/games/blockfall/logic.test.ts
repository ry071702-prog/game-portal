import { describe, it, expect } from 'vitest'
import {
  COLS,
  ROWS,
  PIECE_TYPES,
  emptyBoard,
  getCells,
  canPlace,
  tryMove,
  tryRotate,
  clearLines,
  scoreFor,
  dropInterval,
  makeBag,
  initialState,
  tick,
  hardDrop,
  type Board,
  type BlockfallState,
  type Piece,
} from './logic'

/** 最下行を holes 以外すべて埋めた盤面 */
function boardWithBottomRow(holes: number[]): Board {
  const b = emptyBoard()
  for (let x = 0; x < COLS; x++) {
    if (!holes.includes(x)) b[ROWS - 1][x] = 'I'
  }
  return b
}

/** テスト用の状態。NEXT='O'、bag=['T','S'] 固定 */
function stateWith(board: Board, current: Piece): BlockfallState {
  return { board, current, next: 'O', bag: ['T', 'S'], score: 0, lines: 0, level: 1, alive: true }
}

describe('blockfall logic', () => {
  it('T ミノは回転で形が変わり、4回で元に戻る', () => {
    const board = emptyBoard()
    const p: Piece = { type: 'T', rot: 0, x: 3, y: 5 }
    const r1 = tryRotate(board, p)
    expect(r1).not.toBeNull()
    expect(r1!.rot).toBe(1)
    expect(getCells(r1!)).not.toEqual(getCells(p))
    let q: Piece = p
    for (let i = 0; i < 4; i++) q = tryRotate(board, q)!
    expect(getCells(q)).toEqual(getCells(p))
  })

  it('壁際の回転は簡易壁蹴りで補正される', () => {
    const board = emptyBoard()
    // 左端に立てた縦 I (実セルはすべて x=0)
    const vertical: Piece = { type: 'I', rot: 1, x: -2, y: 5 }
    expect(getCells(vertical).every((c) => c.x === 0)).toBe(true)
    const rotated = tryRotate(board, vertical)
    expect(rotated).not.toBeNull()
    expect(canPlace(board, rotated!)).toBe(true)
    expect(rotated!.x).toBe(0) // +2 の壁蹴りで盤内に収まる
  })

  it('壁と固定ブロックには移動できない', () => {
    const board = emptyBoard()
    const p: Piece = { type: 'O', rot: 0, x: 0, y: 0 }
    expect(tryMove(board, p, -1, 0)).toBeNull() // 左壁
    board[1][2] = 'Z' // 右移動先を塞ぐ
    expect(tryMove(board, p, 1, 0)).toBeNull()
    expect(tryMove(board, p, 0, 1)).not.toBeNull() // 下は空き
  })

  it('揃った行は消えて上の行が落ちる', () => {
    const b = emptyBoard()
    for (let x = 0; x < COLS; x++) b[ROWS - 1][x] = 'I' // 最下行が満杯
    b[ROWS - 2][0] = 'T' // その上に1個
    const { board, cleared } = clearLines(b)
    expect(cleared).toBe(1)
    expect(board[ROWS - 1][0]).toBe('T') // 1段落ちる
    expect(board[ROWS - 1].slice(1).every((c) => c === null)).toBe(true)
  })

  it('接地した tick で固定 → ライン消去 → スコア加算 → NEXT 出現', () => {
    // 最下行の穴 (x=3..6) に I 横置きをはめて完成させる
    const board = boardWithBottomRow([3, 4, 5, 6])
    const current: Piece = { type: 'I', rot: 0, x: 3, y: ROWS - 2 } // 実セルは y=ROWS-1
    const r = tick(stateWith(board, current), () => 0)
    expect(r.locked).toBe(true)
    expect(r.cleared).toBe(1)
    expect(r.state.score).toBe(100)
    expect(r.state.lines).toBe(1)
    expect(r.state.board[ROWS - 1].every((c) => c === null)).toBe(true)
    expect(r.state.current.type).toBe('O') // NEXT が操作中になる
    expect(r.state.next).toBe('T') // bag の先頭が NEXT に
  })

  it('スコアは 1/2/3/4 ライン = 100/300/500/800 ×レベル', () => {
    expect(scoreFor(1, 1)).toBe(100)
    expect(scoreFor(2, 1)).toBe(300)
    expect(scoreFor(3, 2)).toBe(1000)
    expect(scoreFor(4, 3)).toBe(2400)
    expect(scoreFor(0, 5)).toBe(0)
  })

  it('10ライン到達でレベルアップし落下間隔が短縮 (下限80ms)', () => {
    const board = boardWithBottomRow([3, 4, 5, 6])
    const current: Piece = { type: 'I', rot: 0, x: 3, y: ROWS - 2 }
    const r = tick({ ...stateWith(board, current), lines: 9 }, () => 0)
    expect(r.state.lines).toBe(10)
    expect(r.state.level).toBe(2)
    expect(dropInterval(1)).toBe(640)
    expect(dropInterval(2)).toBe(580)
    expect(dropInterval(20)).toBe(80)
  })

  it('7-bag: 1巡で7種が1回ずつ出る', () => {
    const bag = makeBag(() => 0.5)
    expect(bag).toHaveLength(7)
    expect([...bag].sort()).toEqual([...PIECE_TYPES].sort())
  })

  it('初期状態: 空盤面で current/next/bag に7種が揃う', () => {
    const s = initialState(() => 0)
    expect(s.board.every((row) => row.every((c) => c === null))).toBe(true)
    expect(s.alive).toBe(true)
    expect(s.score).toBe(0)
    expect(s.level).toBe(1)
    expect(s.bag).toHaveLength(5) // 7 - current - next
    expect(new Set([s.current.type, s.next, ...s.bag]).size).toBe(7)
  })

  it('ハードドロップは一番下まで落ちて即固定される', () => {
    const current: Piece = { type: 'O', rot: 0, x: 4, y: 0 }
    const r = hardDrop(stateWith(emptyBoard(), current), () => 0)
    expect(r.locked).toBe(true)
    expect(r.state.board[ROWS - 1][4]).toBe('O')
    expect(r.state.board[ROWS - 1][5]).toBe('O')
    expect(r.state.board[ROWS - 2][4]).toBe('O')
  })

  it('新しいミノが置けないと alive=false (ゲームオーバー)', () => {
    const board = emptyBoard()
    board[0][4] = 'I' // NEXT 'O' の出現位置 (x=4..5) を塞ぐ
    const current: Piece = { type: 'O', rot: 0, x: 0, y: ROWS - 2 } // 左下で即接地
    const r = tick(stateWith(board, current), () => 0)
    expect(r.locked).toBe(true)
    expect(r.state.alive).toBe(false)
  })
})
