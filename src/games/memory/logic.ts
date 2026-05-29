export const EMOJIS = ['🍎', '🍌', '🍇', '🍑', '🍓', '🍒', '🥝', '🍍'] as const

export const PAIRS = 8 // 8ペア = 16枚 (4x4)

export interface Card {
  pairId: number
  emoji: string
  revealed: boolean
  matched: boolean
}

export interface MemoryState {
  cards: Card[]
  firstIndex: number | null
  secondIndex: number | null
  moves: number
}

/** Fisher-Yates シャッフル (rng 注入で決定論的にテスト可)。 */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function createDeck(pairs = PAIRS, rng: () => number = Math.random): Card[] {
  const base: Card[] = []
  for (let p = 0; p < pairs; p++) {
    const emoji = EMOJIS[p % EMOJIS.length]
    base.push({ pairId: p, emoji, revealed: false, matched: false })
    base.push({ pairId: p, emoji, revealed: false, matched: false })
  }
  return shuffle(base, rng)
}

export function initialState(pairs = PAIRS, rng: () => number = Math.random): MemoryState {
  return { cards: createDeck(pairs, rng), firstIndex: null, secondIndex: null, moves: 0 }
}

/** 2枚開いている最中は無視。1枚目/2枚目をめくる。 */
export function flip(state: MemoryState, index: number): MemoryState {
  const card = state.cards[index]
  if (!card || card.matched || card.revealed) return state
  if (state.secondIndex !== null) return state // 解決待ち

  const cards = state.cards.map((c, i) => (i === index ? { ...c, revealed: true } : c))
  if (state.firstIndex === null) {
    return { ...state, cards, firstIndex: index }
  }
  return { ...state, cards, secondIndex: index, moves: state.moves + 1 }
}

/** めくった2枚を判定: 一致なら matched、不一致なら伏せ戻す。 */
export function resolve(state: MemoryState): MemoryState {
  const { firstIndex, secondIndex } = state
  if (firstIndex === null || secondIndex === null) return state
  const isMatch = state.cards[firstIndex].pairId === state.cards[secondIndex].pairId
  const cards = state.cards.map((c, i) => {
    if (i !== firstIndex && i !== secondIndex) return c
    return isMatch ? { ...c, matched: true } : { ...c, revealed: false }
  })
  return { ...state, cards, firstIndex: null, secondIndex: null }
}

export function isCleared(state: MemoryState): boolean {
  return state.cards.every((c) => c.matched)
}

export function matchedPairs(state: MemoryState): number {
  return state.cards.filter((c) => c.matched).length / 2
}
