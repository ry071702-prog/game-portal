import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { mulberry32 } from '../../core/lib/daily'
import { SIZE, solved, toggle, isCleared, toScore } from './logic'
import LightsOut from './LightsOut'

/**
 * scramble と同じ rng 消費で押されたマスを再現する (同じマスを押し直せば解ける)
 * 偶然そろって (0,0) の補正が入る seed では、その1手も含める
 */
function scrambleClicks(seed: number, clicks = 8): Array<[number, number]> {
  const rng = mulberry32(seed)
  const out: Array<[number, number]> = []
  for (let i = 0; i < clicks; i++) out.push([Math.floor(rng() * SIZE), Math.floor(rng() * SIZE)])
  const grid = out.reduce((g, [r, c]) => toggle(g, r, c), solved())
  if (isCleared(grid)) out.push([0, 0])
  return out
}

const light = (r: number, c: number) => screen.getByRole('button', { name: `ライト ${r}-${c}` })
const movesText = () => screen.getByText(/手数:/).textContent

describe('LightsOut (reducer)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('テストでは通信しない'))))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('押すたびに手数が増え、クリアで手数に応じたスコアと win を通知する', () => {
    const seed = 20260601
    const onScore = vi.fn()
    const onGameOver = vi.fn()
    render(<LightsOut restartSignal={0} paused={false} onScore={onScore} onGameOver={onGameOver} seed={seed} />)
    expect(onScore).toHaveBeenLastCalledWith(0)

    const clicks = scrambleClicks(seed)
    clicks.forEach(([r, c], i) => {
      expect(onGameOver).not.toHaveBeenCalled()
      fireEvent.click(light(r, c))
      expect(movesText()).toBe(`手数: ${i + 1}`)
    })

    expect(onGameOver).toHaveBeenCalledWith('win')
    expect(onScore).toHaveBeenLastCalledWith(toScore(clicks.length))
  })

  it('クリア後のクリックは手数に数えない', () => {
    const seed = 20260601
    const onGameOver = vi.fn()
    render(<LightsOut restartSignal={0} paused={false} onScore={vi.fn()} onGameOver={onGameOver} seed={seed} />)
    for (const [r, c] of scrambleClicks(seed)) fireEvent.click(light(r, c))
    expect(onGameOver).toHaveBeenCalledWith('win')
    const before = movesText()
    fireEvent.click(light(2, 2))
    expect(movesText()).toBe(before)
  })
})
