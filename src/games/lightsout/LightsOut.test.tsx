import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { mulberry32 } from '../../core/lib/daily'
import { SIZE, toScore } from './logic'
import LightsOut from './LightsOut'

/** scramble と同じ rng 消費で押されたマスを再現する (同じマスを押し直せば解ける) */
function scrambleClicks(seed: number, clicks = 8): Array<[number, number]> {
  const rng = mulberry32(seed)
  const out: Array<[number, number]> = []
  for (let i = 0; i < clicks; i++) out.push([Math.floor(rng() * SIZE), Math.floor(rng() * SIZE)])
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
    for (const [r, c] of clicks) fireEvent.click(light(r, c))
    // 偶然そろった場合の (0,0) 補正があるとクリアにならないので、その場合はもう1回
    if (!onGameOver.mock.calls.length) fireEvent.click(light(0, 0))

    const moves = Number(movesText()!.replace(/\D/g, ''))
    expect(onGameOver).toHaveBeenCalledWith('win')
    expect(onScore).toHaveBeenLastCalledWith(toScore(moves))
  })

  it('クリア後のクリックは手数に数えない', () => {
    const seed = 20260601
    const onGameOver = vi.fn()
    render(<LightsOut restartSignal={0} paused={false} onScore={vi.fn()} onGameOver={onGameOver} seed={seed} />)
    for (const [r, c] of scrambleClicks(seed)) fireEvent.click(light(r, c))
    if (!onGameOver.mock.calls.length) fireEvent.click(light(0, 0))
    const before = movesText()
    fireEvent.click(light(2, 2))
    expect(movesText()).toBe(before)
  })
})
