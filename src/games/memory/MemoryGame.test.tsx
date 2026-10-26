import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import { mulberry32 } from '../../core/lib/daily'
import { initialState, PAIRS } from './logic'
import MemoryGame from './MemoryGame'

const SEED = 7

/** コンポーネントと同じ seed で山札を作り、pairId → カード位置を引けるようにする */
function layout() {
  const { cards } = initialState(PAIRS, mulberry32(SEED))
  const byPair = new Map<number, number[]>()
  cards.forEach((c, i) => byPair.set(c.pairId, [...(byPair.get(c.pairId) ?? []), i]))
  return { cards, byPair }
}

function setup() {
  const onScore = vi.fn()
  const onGameOver = vi.fn()
  render(<MemoryGame restartSignal={0} paused={false} onScore={onScore} onGameOver={onGameOver} seed={SEED} />)
  const buttons = () => screen.getAllByRole('button')
  const flipPair = (a: number, b: number) => {
    fireEvent.click(buttons()[a])
    fireEvent.click(buttons()[b])
    act(() => void vi.advanceTimersByTime(750)) // 判定待ち
  }
  return { onScore, onGameOver, flipPair, buttons }
}

describe('MemoryGame (toScore)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('テストでは通信しない'))))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('スコア = 一致ペア数×100 − 手数×5', () => {
    const { byPair, cards } = layout()
    const { onScore, flipPair } = setup()
    const [a, b] = byPair.get(0)!
    flipPair(a, b) // 一致: 1ペア / 1手
    expect(onScore).toHaveBeenLastCalledWith(100 - 5)

    // 不一致: pairId の違う2枚
    const x = byPair.get(1)![0]
    const y = byPair.get(2)![0]
    expect(cards[x].pairId).not.toBe(cards[y].pairId)
    flipPair(x, y)
    expect(onScore).toHaveBeenLastCalledWith(100 - 10)
  })

  it('全ペア一致で win を通知し、最短手数なら 800 − 40', () => {
    const { byPair } = layout()
    const { onScore, onGameOver, flipPair } = setup()
    for (const [a, b] of byPair.values()) flipPair(a, b)
    expect(onGameOver).toHaveBeenCalledWith('win')
    expect(onScore).toHaveBeenLastCalledWith(PAIRS * 100 - PAIRS * 5)
  })

  it('手数が多くてもスコアは 0 未満にならない', () => {
    const { byPair } = layout()
    const { onScore, flipPair } = setup()
    const x = byPair.get(0)![0]
    const y = byPair.get(1)![0]
    for (let i = 0; i < 30; i++) flipPair(x, y) // 不一致を30回
    expect(onScore).toHaveBeenLastCalledWith(0)
  })

  it('2枚めくった判定待ちの間は3枚目をめくれない', () => {
    const { byPair } = layout()
    const { buttons } = setup()
    const x = byPair.get(0)![0]
    const y = byPair.get(1)![0]
    const z = byPair.get(2)![0]
    fireEvent.click(buttons()[x])
    fireEvent.click(buttons()[y])
    fireEvent.click(buttons()[z])
    expect(buttons()[z].getAttribute('aria-label')).toBe('カード')
  })
})
