import { describe, it, expect } from 'vitest'
import {
  createDeck,
  flip,
  resolve,
  isCleared,
  initialState,
  shuffle,
  matchedPairs,
  type MemoryState,
} from './logic'

describe('createDeck', () => {
  it('ペア数の2倍の枚数で、各 pairId がちょうど2枚', () => {
    const deck = createDeck(4, () => 0)
    expect(deck).toHaveLength(8)
    const counts = new Map<number, number>()
    deck.forEach((c) => counts.set(c.pairId, (counts.get(c.pairId) ?? 0) + 1))
    expect([...counts.values()]).toEqual([2, 2, 2, 2])
  })

  it('同じ rng なら同じ並び (決定論的)', () => {
    const seq = [0.1, 0.5, 0.9, 0.3, 0.7, 0.2, 0.8]
    let i = 0
    const rng = () => seq[i++ % seq.length]
    let j = 0
    const rng2 = () => seq[j++ % seq.length]
    expect(createDeck(4, rng)).toEqual(createDeck(4, rng2))
  })
})

describe('shuffle', () => {
  it('元の要素を保持する', () => {
    const out = shuffle([1, 2, 3, 4], () => 0)
    expect([...out].sort()).toEqual([1, 2, 3, 4])
  })
})

describe('flip & resolve', () => {
  const base = (): MemoryState => ({
    cards: [
      { pairId: 0, emoji: 'a', revealed: false, matched: false },
      { pairId: 1, emoji: 'b', revealed: false, matched: false },
      { pairId: 0, emoji: 'a', revealed: false, matched: false },
      { pairId: 1, emoji: 'b', revealed: false, matched: false },
    ],
    firstIndex: null,
    secondIndex: null,
    moves: 0,
  })

  it('1枚目をめくると firstIndex が立つ', () => {
    const s = flip(base(), 0)
    expect(s.firstIndex).toBe(0)
    expect(s.cards[0].revealed).toBe(true)
    expect(s.moves).toBe(0)
  })

  it('一致ペアは matched になる', () => {
    let s = flip(base(), 0)
    s = flip(s, 2) // 同じ pairId=0
    expect(s.moves).toBe(1)
    s = resolve(s)
    expect(s.cards[0].matched).toBe(true)
    expect(s.cards[2].matched).toBe(true)
    expect(s.firstIndex).toBeNull()
  })

  it('不一致は伏せ戻る', () => {
    let s = flip(base(), 0)
    s = flip(s, 1) // pairId 0 と 1 で不一致
    s = resolve(s)
    expect(s.cards[0].revealed).toBe(false)
    expect(s.cards[1].revealed).toBe(false)
  })

  it('解決待ち中の3枚目は無視', () => {
    let s = flip(base(), 0)
    s = flip(s, 1)
    const s3 = flip(s, 3)
    expect(s3).toBe(s)
  })

  it('全ペア一致で isCleared', () => {
    let s = initialState(2, () => 0)
    // rng=0 のデッキ並びに依存せず、総当たりで揃える
    while (!isCleared(s)) {
      const a = s.cards.findIndex((c) => !c.matched)
      const b = s.cards.findIndex((c, i) => i !== a && !c.matched && c.pairId === s.cards[a].pairId)
      s = resolve(flip(flip(s, a), b))
    }
    expect(isCleared(s)).toBe(true)
  })
})

describe('memory の端ケース', () => {
  const fixed = (): MemoryState => ({
    cards: [0, 1, 0, 1].map((pairId) => ({ pairId, emoji: 'x', revealed: false, matched: false })),
    firstIndex: null,
    secondIndex: null,
    moves: 0,
  })

  it('範囲外の index は無視', () => {
    const s = fixed()
    expect(flip(s, 99)).toBe(s)
    expect(flip(s, -1)).toBe(s)
  })

  it('同じカードを2回めくっても2枚目扱いにならない', () => {
    const s1 = flip(fixed(), 0)
    expect(flip(s1, 0)).toBe(s1)
    expect(s1.moves).toBe(0)
  })

  it('matched 済みのカードはめくれない', () => {
    const s = resolve(flip(flip(fixed(), 0), 2))
    expect(flip(s, 0)).toBe(s)
  })

  it('1枚しか開いていなければ resolve は何もしない', () => {
    const s = flip(fixed(), 0)
    expect(resolve(s)).toBe(s)
  })

  it('moves は2枚目をめくった回数 (1ペア試行 = 1手)', () => {
    let s = flip(flip(fixed(), 0), 1)
    s = resolve(s)
    s = flip(flip(s, 0), 2)
    expect(s.moves).toBe(2)
  })

  it('matchedPairs は一致したペア数', () => {
    let s = fixed()
    expect(matchedPairs(s)).toBe(0)
    s = resolve(flip(flip(s, 0), 2))
    expect(matchedPairs(s)).toBe(1)
    s = resolve(flip(flip(s, 1), 3))
    expect(matchedPairs(s)).toBe(2)
    expect(isCleared(s)).toBe(true)
  })

  it('EMOJIS より多いペア数でも各 pairId はちょうど2枚', () => {
    const deck = createDeck(10, () => 0)
    expect(deck).toHaveLength(20)
    for (let p = 0; p < 10; p++) expect(deck.filter((c) => c.pairId === p)).toHaveLength(2)
  })

  it('initialState は全カード伏せ・手数0で始まる', () => {
    const s = initialState(4, () => 0.3)
    expect(s.cards.every((c) => !c.revealed && !c.matched)).toBe(true)
    expect(s.moves).toBe(0)
  })
})
