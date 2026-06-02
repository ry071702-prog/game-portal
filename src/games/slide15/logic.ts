export const N = 4
export const SIZE = N * N
export type Board = number[] // 0 = 空き

export function solved(): Board {
  const b: Board = []
  for (let i = 1; i < SIZE; i++) b.push(i)
  b.push(0)
  return b
}

function emptyIndex(b: Board): number {
  return b.indexOf(0)
}

function adjacent(a: number, b: number): boolean {
  const ar = Math.floor(a / N)
  const ac = a % N
  const br = Math.floor(b / N)
  const bc = b % N
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1
}

/** index のタイルを空きへスライド (隣接時のみ)。純粋関数。 */
export function move(b: Board, index: number): { board: Board; moved: boolean } {
  const e = emptyIndex(b)
  if (!adjacent(index, e)) return { board: b, moved: false }
  const nb = [...b]
  nb[e] = b[index]
  nb[index] = 0
  return { board: nb, moved: true }
}

export function isSolved(b: Board): boolean {
  for (let i = 0; i < SIZE - 1; i++) if (b[i] !== i + 1) return false
  return b[SIZE - 1] === 0
}

/** 解けた状態からランダムな合法手を適用するので必ず解ける。seed で全員同一。 */
export function shuffle(rng: () => number = Math.random, steps = 140): Board {
  let b = solved()
  let prevEmpty = -1
  for (let s = 0; s < steps; s++) {
    const e = emptyIndex(b)
    const nbrs = [e - 1, e + 1, e - N, e + N].filter((j) => j >= 0 && j < SIZE && adjacent(j, e))
    const choices = nbrs.filter((j) => j !== prevEmpty)
    const pick = choices[Math.floor(rng() * choices.length)]
    prevEmpty = e
    b = move(b, pick).board
  }
  if (isSolved(b)) {
    const e = emptyIndex(b)
    const j = [e - 1, e + 1, e - N, e + N].find((x) => x >= 0 && x < SIZE && adjacent(x, e))!
    b = move(b, j).board
  }
  return b
}

/** 少ない手数ほど高スコア。 */
export function toScore(moves: number): number {
  return Math.max(0, 1000 - moves * 3)
}
