import { describe, it, expect } from 'vitest'
import {
  createDeck,
  flip,
  resolve,
  isCleared,
  initialState,
  shuffle,
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
