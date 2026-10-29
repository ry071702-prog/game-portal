import { describe, it, expect } from 'vitest'
import { mulberry32 } from '../../core/lib/daily'
import {
  makeQuestion,
  correctAnswer,
  pointsFor,
  answer,
  initialState,
  COLORS,
  type Question,
} from './logic'

/** 値を順に返す rng */
const seq = (...vals: number[]) => {
  let i = 0
  return () => vals[i++ % vals.length]
}

describe('makeQuestion', () => {
  it('word / ink は有効な色番号', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 200; i++) {
      const q = makeQuestion(rng, 100)
      expect(q.word).toBeGreaterThanOrEqual(0)
      expect(q.word).toBeLessThan(COLORS.length)
      expect(q.ink).toBeGreaterThanOrEqual(0)
      expect(q.ink).toBeLessThan(COLORS.length)
    }
  })

  it('食い違わせる場合は ink が word と必ず異なる', () => {
    // word=0 (0.0), 食い違い (0.1 < 0.75), 残り3色の末尾 (0.99) → ink=3
    expect(makeQuestion(seq(0, 0.1, 0.99), 0)).toMatchObject({ word: 0, ink: 3 })
    // word=3 (0.9), 食い違い, 残り3色の先頭 (0) → (3+1)%4 = 0
    expect(makeQuestion(seq(0.9, 0.1, 0), 0)).toMatchObject({ word: 3, ink: 0 })
  })

  it('一致させる場合は ink === word', () => {
    expect(makeQuestion(seq(0.5, 0.8), 0)).toMatchObject({ word: 2, ink: 2 })
  })

  it('prev と全く同じ問題は出さない', () => {
    const prev: Question = { word: 1, ink: 2, rule: 'ink' }
    const rng = mulberry32(3)
    for (let i = 0; i < 200; i++) {
      expect(makeQuestion(rng, 0, prev)).not.toEqual(prev)
    }
    // rng が同じ問題しか作れなくても上限回数で抜けて別の問題を返す
    // (word=1 (0.25), 食い違い (0.1), 残り3色の先頭 (0) → ink=2)
    expect(makeQuestion(seq(0.25, 0.1, 0), 0, prev)).not.toEqual(prev)
  })

  it('序盤 (50点以下) はお題が「いろ」固定、以降は「いみ」も出る', () => {
    const rng = mulberry32(7)
    const early = Array.from({ length: 100 }, () => makeQuestion(rng, 50).rule)
    expect(new Set(early)).toEqual(new Set(['ink']))
    const late = Array.from({ length: 100 }, () => makeQuestion(rng, 51).rule)
    expect(new Set(late)).toEqual(new Set(['ink', 'word']))
  })
})

describe('correctAnswer', () => {
  const q: Question = { word: 0, ink: 1, rule: 'ink' }
  it('お題「いろ」は文字の色が正解', () => {
    expect(correctAnswer(q)).toBe(1)
  })
  it('お題「いみ」は書いてある言葉が正解', () => {
    expect(correctAnswer({ ...q, rule: 'word' })).toBe(0)
  })
})

describe('pointsFor', () => {
  it('1問目は 10 点、連続正解で +2 ずつ増えて 20 点で頭打ち', () => {
    expect(pointsFor(1)).toBe(10)
    expect(pointsFor(2)).toBe(12)
    expect(pointsFor(6)).toBe(20)
    expect(pointsFor(50)).toBe(20)
  })
})

describe('answer', () => {
  const q: Question = { word: 2, ink: 3, rule: 'ink' }

  it('正解で加点・連続正解が伸びる', () => {
    const a = answer(initialState, q, 3)
    expect(a.ok).toBe(true)
    expect(a.state).toEqual({ score: 10, streak: 1, correct: 1, wrong: 0 })
    const b = answer(a.state, q, 3)
    expect(b.state.score).toBe(22)
    expect(b.state.streak).toBe(2)
  })

  it('誤答はスコアを減らさず連続正解だけリセット', () => {
    const a = answer({ score: 40, streak: 3, correct: 3, wrong: 0 }, q, 2)
    expect(a.ok).toBe(false)
    expect(a.state).toEqual({ score: 40, streak: 0, correct: 3, wrong: 1 })
  })
})
