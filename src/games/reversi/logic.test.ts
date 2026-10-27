import { describe, it, expect } from 'vitest'
import {
  initialBoard,
  flipsFor,
  legalMoves,
  applyMove,
  nextTurn,
  count,
  chooseCpuMove,
  toScore,
  SIZE,
  type Board,
  type Cell,
} from './logic'

/** 文字列から盤面を作る ('.'=空, 'B'=プレイヤー(黒), 'W'=CPU(白))。上段から6行×6文字。 */
function boardFrom(rows: string[]): Board {
  return rows.flatMap((row) => [...row].map<Cell>((ch) => (ch === 'B' ? 1 : ch === 'W' ? 2 : 0)))
}

const at = (r: number, c: number) => r * SIZE + c

describe('initialBoard', () => {
  it('中央に白黒2個ずつ', () => {
    const b = initialBoard()
    expect(b).toHaveLength(36)
    expect(count(b)).toEqual({ 1: 2, 2: 2 })
    expect(b[at(2, 2)]).toBe(2)
    expect(b[at(2, 3)]).toBe(1)
  })

  it('先手の合法手は4つ', () => {
    expect(legalMoves(initialBoard(), 1).sort((a, b) => a - b)).toEqual([
      at(1, 2),
      at(2, 1),
      at(3, 4),
      at(4, 3),
    ])
  })
})

describe('flipsFor & applyMove', () => {
  it('挟んだ石を裏返す', () => {
    const b = applyMove(initialBoard(), at(1, 2), 1)!
    expect(b[at(1, 2)]).toBe(1)
    expect(b[at(2, 2)]).toBe(1)
    expect(count(b)).toEqual({ 1: 4, 2: 1 })
  })

  it('複数方向を同時に裏返す', () => {
    const b = boardFrom([
      'B.B...',
      'WW....',
      '.W....',
      '......',
      '......',
      '......',
    ])
    // (2,0) に置くと上 (1,0) と右上 (1,1) を挟める。右 (2,1) は先に黒が無いので挟めない
    expect(flipsFor(b, at(2, 0), 1).sort((x, y) => x - y)).toEqual([at(1, 0), at(1, 1)])
  })

  it('挟めない・埋まっているマスは置けない', () => {
    const b = initialBoard()
    expect(flipsFor(b, at(0, 0), 1)).toEqual([])
    expect(flipsFor(b, at(2, 2), 1)).toEqual([])
    expect(applyMove(b, at(0, 0), 1)).toBeNull()
  })

  it('applyMove は元の盤面を変更しない (純粋関数)', () => {
    const b = initialBoard()
    applyMove(b, at(1, 2), 1)
    expect(b).toEqual(initialBoard())
  })
})

describe('nextTurn', () => {
  it('通常は相手の番', () => {
    const b = applyMove(initialBoard(), at(1, 2), 1)!
    expect(nextTurn(b, 1)).toBe(2)
  })

  it('相手が打てなければパスで同じ人が続ける', () => {
    // 白は打てる場所がなく、黒は (0,3) に打てる
    const b = boardFrom([
      'BWW...',
      'BBBBBB',
      'BBBBBB',
      'BBBBBB',
      'BBBBBB',
      'BBBBBB',
    ])
    expect(legalMoves(b, 2)).toEqual([])
    expect(nextTurn(b, 2)).toBe(1)
    expect(nextTurn(b, 1)).toBe(1)
  })

  it('双方打てなければ終局 (null)', () => {
    const full = boardFrom(Array(6).fill('BBBWWW'))
    expect(nextTurn(full, 1)).toBeNull()
  })
})

describe('chooseCpuMove', () => {
  it('取れる角があれば角を選ぶ', () => {
    // 白は (0,0) に置けば横の黒2個を挟める。他の手より角を優先する
    const corner = boardFrom([
      '.BBW..',
      '......',
      '......',
      '..BW..',
      '..WB..',
      '......',
    ])
    expect(legalMoves(corner, 2)).toContain(at(0, 0))
    expect(chooseCpuMove(corner, 2)).toBe(at(0, 0))
  })

  it('打てる手が無ければ -1', () => {
    expect(chooseCpuMove(boardFrom(Array(6).fill('BBBBBB')), 2)).toBe(-1)
  })

  it('選んだ手は常に合法手', () => {
    let b = initialBoard()
    let turn: 1 | 2 | null = 1
    // CPU 同士で終局まで打たせても破綻しない
    for (let i = 0; i < 64 && turn; i++) {
      const mv = chooseCpuMove(b, turn)
      expect(legalMoves(b, turn)).toContain(mv)
      b = applyMove(b, mv, turn)!
      turn = nextTurn(b, turn)
    }
    expect(turn).toBeNull()
    const c = count(b)
    expect(c[1] + c[2]).toBeLessThanOrEqual(36)
  })
})

describe('toScore', () => {
  it('勝ちは 100 + 石差', () => {
    expect(toScore(boardFrom([...Array(4).fill('BBBBBB'), 'WWWWWW', '......']))).toBe(118)
  })
  it('引き分けは 50', () => {
    expect(toScore(boardFrom(Array(6).fill('BBBWWW')))).toBe(50)
  })
  it('負けは自分の石数', () => {
    expect(toScore(boardFrom(['BBB...', ...Array(5).fill('WWWWWW')]))).toBe(3)
  })
  it('全滅勝ちが最大 136 点', () => {
    expect(toScore(boardFrom(Array(6).fill('BBBBBB')))).toBe(136)
  })
})
