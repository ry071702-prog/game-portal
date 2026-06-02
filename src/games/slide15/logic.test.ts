import { describe, it, expect } from 'vitest'
import { solved, move, isSolved, shuffle, SIZE } from './logic'

describe('slide15', () => {
  it('solved は 1..15,0', () => {
    expect(solved()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
    expect(isSolved(solved())).toBe(true)
  })

  it('空きに隣接するタイルだけ動かせる', () => {
    const b = solved() // 空きは index15 (右下), 隣接は 14(index) と 11(index)
    expect(move(b, 14).moved).toBe(true) // index14 のタイル(15)は隣接
    expect(move(b, 0).moved).toBe(false) // 左上は非隣接
  })

  it('move は 0..15 の集合を保つ', () => {
    const { board } = move(solved(), 14)
    expect([...board].sort((a, b) => a - b)).toEqual([...Array(SIZE)].map((_, i) => i))
  })

  it('shuffle は全要素を保ち、通常は未完成', () => {
    const seq = [0.2, 0.7, 0.4, 0.9, 0.1, 0.5, 0.8, 0.3]
    let i = 0
    const b = shuffle(() => seq[i++ % seq.length], 30)
    expect([...b].sort((x, y) => x - y)).toEqual([...Array(SIZE)].map((_, i) => i))
    expect(isSolved(b)).toBe(false)
  })
})
