import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { mulberry32 } from '../../core/lib/daily'
import { shuffle, toScore, N, SIZE } from './logic'
import Slide15 from './Slide15'

const SEED = 99

/** shuffle と同じ rng 消費で、各手の「動く前の空きマス」を記録する */
function shuffleTrail(seed: number, steps = 140): number[] {
  const rng = mulberry32(seed)
  const adjacent = (a: number, b: number) =>
    Math.abs(Math.floor(a / N) - Math.floor(b / N)) + Math.abs((a % N) - (b % N)) === 1
  let e = SIZE - 1
  let prev = -1
  const trail: number[] = []
  for (let s = 0; s < steps; s++) {
    const nbrs = [e - 1, e + 1, e - N, e + N].filter((j) => j >= 0 && j < SIZE && adjacent(j, e))
    const choices = nbrs.filter((j) => j !== prev)
    const pick = choices[Math.floor(rng() * choices.length)]
    prev = e
    trail.push(e)
    e = pick
  }
  return trail
}

/** 盤面 index のタイル (空きならタイル無し) をクリック */
function tapIndex(container: HTMLElement, index: number) {
  fireEvent.click(container.querySelector('.grid')!.children[index])
}
const moves = () => Number(screen.getByText(/手数:/).textContent!.replace(/\D/g, ''))

describe('Slide15 (reducer)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('テストでは通信しない'))))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('隣接しないタイルを押しても手数は増えない', () => {
    const { container } = render(
      <Slide15 restartSignal={0} paused={false} onScore={vi.fn()} onGameOver={vi.fn()} seed={SEED} />,
    )
    const board = shuffle(mulberry32(SEED))
    const e = board.indexOf(0)
    const far = [...Array(SIZE).keys()].find(
      (i) => i !== e && Math.abs(Math.floor(i / N) - Math.floor(e / N)) + Math.abs((i % N) - (e % N)) > 1,
    )!
    tapIndex(container, far)
    expect(moves()).toBe(0)
    const near = [e - 1, e + 1, e - N, e + N].find(
      (j) => j >= 0 && j < SIZE && Math.abs(Math.floor(j / N) - Math.floor(e / N)) + Math.abs((j % N) - (e % N)) === 1,
    )!
    tapIndex(container, near)
    expect(moves()).toBe(1)
  })

  it('シャッフルを逆にたどると解け、手数に応じたスコアと win を通知する', () => {
    const onScore = vi.fn()
    const onGameOver = vi.fn()
    const { container } = render(
      <Slide15 restartSignal={0} paused={false} onScore={onScore} onGameOver={onGameOver} seed={SEED} />,
    )
    expect(onScore).toHaveBeenLastCalledWith(0)
    for (const e of shuffleTrail(SEED).reverse()) tapIndex(container, e)
    expect(onGameOver).toHaveBeenCalledWith('win')
    expect(onScore).toHaveBeenLastCalledWith(toScore(moves()))
    // 解けた後の操作は手数に数えない
    const done = moves()
    tapIndex(container, SIZE - 2)
    expect(moves()).toBe(done)
  })
})
