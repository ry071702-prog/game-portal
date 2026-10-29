import { describe, it, expect } from 'vitest'
import { solved, move, isSolved, shuffle, toScore, SIZE } from './logic'

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

describe('slide15 shuffle の端ケース', () => {
  it('steps=0 でも解けた盤面は返さない (1手ずらす)', () => {
    const b = shuffle(() => 0, 0)
    expect(isSolved(b)).toBe(false)
    expect([...b].sort((x, y) => x - y)).toEqual([...Array(SIZE).keys()])
  })

  it('同じ rng なら同じ盤面 (デイリーチャレンジ用)', () => {
    const seq = () => {
      let i = 0
      return () => ((i++ * 7) % 10) / 10
    }
    expect(shuffle(seq())).toEqual(shuffle(seq()))
  })

  it('行の端から次の行の先頭へは動かせない (index 3 と 4 は隣接しない)', () => {
    // 空きを index 4 (2行目先頭) に置く
    const b = solved()
    b[15] = b[4]
    b[4] = 0
    expect(move(b, 3).moved).toBe(false)
    expect(move(b, 5).moved).toBe(true)
    expect(move(b, 0).moved).toBe(true)
  })
})

describe('slide15 toScore', () => {
  it('手数が少ないほど高く、0 未満にはならない', () => {
    expect(toScore(0)).toBe(1000)
    expect(toScore(10)).toBeGreaterThan(toScore(11))
    expect(toScore(10_000)).toBe(0)
  })
})
