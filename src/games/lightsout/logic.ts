export const SIZE = 5
export type Grid = boolean[][] // true = 点灯

export function solved(): Grid {
  return Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false))
}

const NEIGHBORS = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/** (r,c) と上下左右を反転した新しい盤面を返す (純粋関数)。 */
export function toggle(grid: Grid, r: number, c: number): Grid {
  const next = grid.map((row) => [...row])
  for (const [dr, dc] of NEIGHBORS) {
    const rr = r + dr
    const cc = c + dc
    if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) next[rr][cc] = !next[rr][cc]
  }
  return next
}

export function isCleared(grid: Grid): boolean {
  return grid.every((row) => row.every((cell) => !cell))
}

/** 解けた状態からランダムに toggle を適用するので、必ず解ける盤面になる。 */
export function scramble(rng: () => number = Math.random, clicks = 8): Grid {
  let grid = solved()
  for (let i = 0; i < clicks; i++) {
    grid = toggle(grid, Math.floor(rng() * SIZE), Math.floor(rng() * SIZE))
  }
  // 偶然そろっている場合は1手ずらす
  if (isCleared(grid)) grid = toggle(grid, 0, 0)
  return grid
}

/** 少ない手数ほど高スコア (max ベースのベスト保存と整合)。 */
export function toScore(moves: number): number {
  return Math.max(0, 1000 - moves * 20)
}
