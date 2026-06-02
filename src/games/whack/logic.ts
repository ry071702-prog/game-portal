export const HOLES = 9
export const DURATION = 30 // 秒

/** 直前と異なる穴をランダムに選ぶ (純粋・rng注入可)。 */
export function randomHole(rng: () => number = Math.random, exclude = -1): number {
  const h = Math.floor(rng() * HOLES)
  return h === exclude ? (h + 1) % HOLES : h
}
