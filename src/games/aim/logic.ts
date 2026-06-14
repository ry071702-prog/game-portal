export const DURATION = 30 // 秒
export const MISS_PENALTY = 20 // ミスクリックの減点

export interface Target {
  /** 中心位置 (プレイ領域の一辺に対する 0..1 の比率) */
  x: number
  y: number
  /** 初期半径 (プレイ領域の一辺に対する比率) */
  radius: number
  /** 出現から消滅までの ms */
  lifetimeMs: number
}

/** n 個目 (0始まり) の的の難易度。進むほど小さく・速く消え、20個目以降は下限で一定。 */
export function difficultyAt(index: number): { radius: number; lifetimeMs: number } {
  const t = Math.min(index / 20, 1)
  return {
    radius: 0.11 - 0.05 * t, // 0.11 → 0.06
    lifetimeMs: 2000 - 900 * t, // 2000ms → 1100ms
  }
}

/** 次の的を生成 (純粋・rng注入可)。初期半径ごと領域内に収まる位置に置く。 */
export function spawnTarget(index: number, rng: () => number = Math.random): Target {
  const { radius, lifetimeMs } = difficultyAt(index)
  return {
    x: radius + rng() * (1 - radius * 2),
    y: radius + rng() * (1 - radius * 2),
    radius,
    lifetimeMs,
  }
}

/** 残り半径比 (出現直後=1 → 寿命で0)。経過とともに線形に縮む。 */
export function shrinkRatio(elapsedMs: number, lifetimeMs: number): number {
  return Math.max(0, 1 - elapsedMs / lifetimeMs)
}

/** 命中時の得点。大きいうちに当てるほど高い (残り半径比 × 100 を四捨五入)。 */
export function hitScore(ratio: number): number {
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100)
}

/** ミスクリック後のスコア (0未満にはしない)。 */
export function applyMiss(score: number): number {
  return Math.max(0, score - MISS_PENALTY)
}
