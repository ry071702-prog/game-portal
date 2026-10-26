import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import Game2048 from './Game2048'

function setup() {
  const onScore = vi.fn()
  const onGameOver = vi.fn()
  const utils = render(<Game2048 restartSignal={0} paused={false} onScore={onScore} onGameOver={onGameOver} />)
  const tiles = () => [...utils.container.querySelectorAll('.grid > div')].map((d) => d.textContent)
  const press = (key: string) => act(() => void fireEvent.keyDown(window, { key }))
  return { ...utils, onScore, onGameOver, tiles, press }
}

describe('Game2048 (reducer)', () => {
  beforeEach(() => {
    // rng=0 → spawn は常に先頭の空きマスに 2 を置く
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('テストでは通信しない'))))
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('合体した点数がスコアに積算され、動いたら1枚 spawn する', () => {
    const { tiles, press, onScore } = setup()
    expect(tiles().slice(0, 4)).toEqual(['2', '2', '', ''])
    press('ArrowLeft')
    expect(tiles().slice(0, 4)).toEqual(['4', '2', '', ''])
    expect(onScore).toHaveBeenLastCalledWith(4)
    press('ArrowRight') // [4,2,0,0] → [0,0,4,2] + spawn
    expect(tiles().slice(0, 4)).toEqual(['2', '', '4', '2'])
    expect(onScore).toHaveBeenLastCalledWith(4)
  })

  it('動かない方向の入力ではタイルが増えない', () => {
    const { tiles, press } = setup()
    press('ArrowLeft')
    const before = tiles()
    press('ArrowUp') // 1行目だけにタイルがあるので上には動かない
    expect(tiles()).toEqual(before)
  })

  it('paused 中はキー入力を無視する', () => {
    const onScore = vi.fn()
    const { container } = render(<Game2048 restartSignal={0} paused onScore={onScore} onGameOver={vi.fn()} />)
    act(() => void fireEvent.keyDown(window, { key: 'ArrowLeft' }))
    expect(container.querySelectorAll('.grid > div')[0].textContent).toBe('2')
    expect(onScore).not.toHaveBeenCalledWith(4)
  })
})
