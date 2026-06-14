import { describe, it, expect } from 'vitest'
import { makeAnswer, judge, toScore, CODE_LENGTH, MAX_TURNS } from './logic'
import { mulberry32 } from '../../core/lib/daily'

describe('hitblow', () => {
  it('makeAnswer は 0-9 から重複なしの 4 桁を返す', () => {
    const a = makeAnswer(mulberry32(1))
    expect(a).toHaveLength(CODE_LENGTH)
    expect(new Set(a).size).toBe(CODE_LENGTH)
    expect(a.every((d) => Number.isInteger(d) && d >= 0 && d <= 9)).toBe(true)
  })

  it('makeAnswer は同じ seed なら同じ答え (デイリー用)', () => {
    expect(makeAnswer(mulberry32(42))).toEqual(makeAnswer(mulberry32(42)))
    expect(makeAnswer(mulberry32(1))).not.toEqual(makeAnswer(mulberry32(2)))
  })

  it('judge: 完全一致は 4Hit 0Blow', () => {
    expect(judge([1, 2, 3, 4], [1, 2, 3, 4])).toEqual({ hit: 4, blow: 0 })
  })

  it('judge: 数字は合うが位置が全部違うと 0Hit 4Blow', () => {
    expect(judge([1, 2, 3, 4], [4, 3, 2, 1])).toEqual({ hit: 0, blow: 4 })
  })

  it('judge: Hit と Blow の混在を正しく数える', () => {
    expect(judge([1, 2, 3, 4], [1, 2, 4, 3])).toEqual({ hit: 2, blow: 2 })
    expect(judge([0, 5, 7, 9], [0, 7, 5, 1])).toEqual({ hit: 1, blow: 2 })
  })

  it('judge: 全外しは 0Hit 0Blow', () => {
    expect(judge([1, 2, 3, 4], [5, 6, 7, 8])).toEqual({ hit: 0, blow: 0 })
  })

  it('toScore は試行回数が少ないほど高い', () => {
    expect(toScore(1)).toBe(100)
    expect(toScore(MAX_TURNS)).toBe(10)
    expect(toScore(3)).toBeGreaterThan(toScore(7))
  })
})
