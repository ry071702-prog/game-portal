export const COUNT = 25 // 5x5

/** 1..COUNT をシャッフル (純粋・rng注入可)。 */
export function makeBoard(rng: () => number = Math.random): number[] {
  const a = Array.from({ length: COUNT }, (_, i) => i + 1)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 速いほど高スコア (30秒=0点、瞬殺で最大)。 */
export function toScore(elapsedMs: number): number {
  return Math.max(0, 30000 - Math.round(elapsedMs))
}
