import type { Direction } from '../../core/lib/direction'
import { DELTA, OPPOSITE } from '../../core/lib/direction'

export const GRID = 17

export interface Cell {
  x: number
  y: number
}

export interface SnakeState {
  /** 先頭が [0] */
  snake: Cell[]
  food: Cell
  dir: Direction
  alive: boolean
  score: number
}

function eq(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y
}

/** 空きマスから1つ食べ物を置く。rng はテスト用に注入可。 */
function placeFood(snake: Cell[], rng: () => number): Cell {
  const occupied = new Set(snake.map((c) => `${c.x},${c.y}`))
  const empties: Cell[] = []
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!occupied.has(`${x},${y}`)) empties.push({ x, y })
    }
  }
  if (empties.length === 0) return snake[0]
  return empties[Math.floor(rng() * empties.length)]
}

export function initialState(rng: () => number = Math.random): SnakeState {
  const mid = Math.floor(GRID / 2)
  const snake: Cell[] = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ]
  return { snake, food: placeFood(snake, rng), dir: 'right', alive: true, score: 0 }
}

/**
 * 1ステップ進める純粋関数。inputDir で進行方向を変える (逆走は無視)。
 * 壁/自分への衝突で alive=false。食べたら成長して食べ物を再配置。
 */
export function step(
  state: SnakeState,
  inputDir: Direction,
  rng: () => number = Math.random,
): SnakeState {
  if (!state.alive) return state
  // 逆走は禁止 (長さ2以上のとき)
  const dir =
    state.snake.length > 1 && inputDir === OPPOSITE[state.dir] ? state.dir : inputDir

  const d = DELTA[dir]
  const head: Cell = { x: state.snake[0].x + d.x, y: state.snake[0].y + d.y }

  // 壁衝突
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
    return { ...state, dir, alive: false }
  }

  const willEat = eq(head, state.food)
  // 食べないときは尾が動くので、尾を衝突判定から除外する
  const body = willEat ? state.snake : state.snake.slice(0, -1)
  if (body.some((c) => eq(c, head))) {
    return { ...state, dir, alive: false }
  }

  if (willEat) {
    const snake = [head, ...state.snake]
    return { snake, food: placeFood(snake, rng), dir, alive: true, score: state.score + 1 }
  }
  const snake = [head, ...state.snake.slice(0, -1)]
  return { ...state, snake, dir, alive: true }
}
