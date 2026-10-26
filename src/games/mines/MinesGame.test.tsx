import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { mulberry32 } from '../../core/lib/daily'
import { generateBoard, SIZE, MINES, WIN_BONUS } from './logic'
import MinesGame from './MinesGame'

const SEED = 3
const cell = (r: number, c: number) => screen.getByRole('button', { name: `マス ${r}-${c}` })

function setup() {
  const onScore = vi.fn()
  const onGameOver = vi.fn()
  render(<MinesGame restartSignal={0} paused={false} onScore={onScore} onGameOver={onGameOver} seed={SEED} />)
  return { onScore, onGameOver, board: generateBoard(mulberry32(SEED)) }
}

describe('MinesGame', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('テストでは通信しない'))))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('安全セルをすべて開くと 開放数 + WIN_BONUS のスコアで win', () => {
    const { onScore, onGameOver, board } = setup()
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) if (!board[r][c].mine) fireEvent.click(cell(r, c))
    }
    expect(onGameOver).toHaveBeenCalledTimes(1)
    expect(onGameOver).toHaveBeenCalledWith('win')
    expect(onScore).toHaveBeenLastCalledWith(SIZE * SIZE - MINES + WIN_BONUS)
  })

  it('地雷を開くとゲームオーバーになり、以降の操作は無視される', () => {
    const { onScore, onGameOver, board } = setup()
    const mines: Array<[number, number]> = []
    const safes: Array<[number, number]> = []
    board.forEach((row, r) => row.forEach((x, c) => (x.mine ? mines : safes).push([r, c])))
    fireEvent.click(cell(...mines[0]))
    expect(onGameOver).toHaveBeenCalledTimes(1)
    expect(onGameOver).toHaveBeenCalledWith()
    fireEvent.click(cell(...safes[0]))
    expect(onScore).not.toHaveBeenCalled()
    expect(onGameOver).toHaveBeenCalledTimes(1)
  })

  it('右クリック / 旗モードで旗を立てると残り数が減り、旗のマスは開かない', () => {
    const { onScore, board } = setup()
    const safe = board.flatMap((row, r) => row.map((x, c) => [r, c, x.mine] as const)).find((x) => !x[2])!
    const remaining = () => screen.getByText(/残り/).textContent!.replace(/\D/g, '')

    fireEvent.contextMenu(cell(safe[0], safe[1]))
    expect(remaining()).toBe(String(MINES - 1))
    fireEvent.click(cell(safe[0], safe[1])) // 旗付きは開かない
    expect(onScore).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { pressed: false, name: /旗モード/ }))
    fireEvent.click(cell(safe[0], safe[1])) // 旗モードのタップで旗を外す
    expect(remaining()).toBe(String(MINES))
  })
})
