import { describe, it, expect } from 'vitest'
import {
  emptyBoard,
  dropRow,
  drop,
  availableColumns,
  findWin,
  isFull,
  chooseAiMove,
  toScore,
  ROWS,
  COLS,
  type Board,
  type Cell,
} from './logic'

/** 文字列から盤面を作る ('.'=空, 'R'=プレイヤー, 'Y'=AI)。上段から6行×7文字。 */
function boardFrom(rows: string[]): Board {
  return rows.map((row) =>
    [...row].map<Cell>((ch) => (ch === 'R' ? 1 : ch === 'Y' ? 2 : 0)),
  )
}

describe('dropRow & drop', () => {
  it('空の盤面では一番下 (row 5) に落ちる', () => {
    expect(dropRow(emptyBoard(), 3)).toBe(ROWS - 1)
  })

  it('積み上がると1段ずつ上に落ちる', () => {
    let b = emptyBoard()
    b = drop(b, 2, 1)!
    expect(b[5][2]).toBe(1)
    expect(dropRow(b, 2)).toBe(4)
    b = drop(b, 2, 2)!
    expect(b[4][2]).toBe(2)
  })

  it('満杯の列は dropRow が -1、drop が null', () => {
    let b = emptyBoard()
    for (let i = 0; i < ROWS; i++) b = drop(b, 0, i % 2 === 0 ? 1 : 2)!
    expect(dropRow(b, 0)).toBe(-1)
    expect(drop(b, 0, 1)).toBeNull()
    expect(availableColumns(b)).not.toContain(0)
  })

  it('drop は元の盤面を変更しない (純粋関数)', () => {
    const b = emptyBoard()
    drop(b, 3, 1)
    expect(b[5][3]).toBe(0)
  })
})

describe('findWin', () => {
  it('横の4連を検出する', () => {
    const b = boardFrom([
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.RRRR..',
    ])
    expect(findWin(b, 1)).toEqual([
      [5, 1],
      [5, 2],
      [5, 3],
      [5, 4],
    ])
    expect(findWin(b, 2)).toBeNull()
  })

  it('縦の4連を検出する', () => {
    const b = boardFrom([
      '.......',
      '.......',
      '..Y....',
      '..Y....',
      '..Y....',
      '..Y....',
    ])
    expect(findWin(b, 2)).toEqual([
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
    ])
  })

  it('右下がり斜めの4連を検出する', () => {
    const b = boardFrom([
      '.......',
      '.......',
      'R......',
      'YR.....',
      'YYR....',
      'YYYR...',
    ])
    expect(findWin(b, 1)).toEqual([
      [2, 0],
      [3, 1],
      [4, 2],
      [5, 3],
    ])
  })

  it('左下がり斜めの4連を検出する', () => {
    const b = boardFrom([
      '.......',
      '.......',
      '...Y...',
      '..YR...',
      '.YRR...',
      'YRRR...',
    ])
    expect(findWin(b, 2)).toEqual([
      [2, 3],
      [3, 2],
      [4, 1],
      [5, 0],
    ])
  })

  it('3連までは null', () => {
    const b = boardFrom([
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.RRR...',
    ])
    expect(findWin(b, 1)).toBeNull()
  })
})

describe('chooseAiMove', () => {
  it('自分 (AI) が即勝てる列を打つ', () => {
    const b = boardFrom([
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      'YYY....',
    ])
    expect(chooseAiMove(b, () => 0)).toBe(3)
  })

  it('相手 (プレイヤー) の即勝ちを止める', () => {
    const b = boardFrom([
      '.......',
      '.......',
      '.......',
      '....R..',
      '....R..',
      '....R..',
    ])
    expect(chooseAiMove(b, () => 0)).toBe(4)
  })

  it('自分の即勝ちと相手の阻止が両方あれば自分の勝ちを優先する', () => {
    const b = boardFrom([
      '.......',
      '.......',
      '.......',
      'Y......',
      'Y......',
      'Y.RRR..',
    ])
    // R は col 1 / col 5 で即勝ちだが、col 0 で AI 自身が縦4連 (即勝ち) を優先
    expect(chooseAiMove(b, () => 0)).toBe(0)
  })

  it('相手に即勝ちを許す列 (打つと真上で相手が勝つ) は避ける', () => {
    const b = boardFrom([
      '.......',
      '.......',
      '.......',
      '.......',
      'RRR....',
      'YRY....',
    ])
    // col 3 に打つと R が col 3 で横4連を完成できるので避ける
    expect(chooseAiMove(b, () => 0)).not.toBe(3)
  })

  it('満杯の盤面では -1', () => {
    let b = emptyBoard()
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) b = drop(b, c, ((r + c) % 2 === 0 ? 1 : 2))!
    }
    expect(isFull(b)).toBe(true)
    expect(chooseAiMove(b, () => 0)).toBe(-1)
  })
})

describe('toScore', () => {
  it('手数が少ないほど高スコア', () => {
    expect(toScore(7)).toBeGreaterThan(toScore(21))
    expect(toScore(7)).toBe(100 + 42 - 7)
  })
})
