export const W = 320
export const H = 460
export const BIRD_X = 72
export const BIRD_R = 12
export const GAP = 140
export const PIPE_W = 54

export interface Pipe {
  x: number
  gapY: number // 隙間の上端
  passed: boolean
}

/** x 位置のパイプを生成 (隙間位置はランダム)。 */
export function makePipe(x: number, rng: () => number = Math.random): Pipe {
  const margin = 50
  const gapY = margin + rng() * (H - GAP - margin * 2)
  return { x, gapY, passed: false }
}

/** 鳥(円)がパイプに衝突しているか。 */
export function hitsPipe(birdY: number, p: Pipe): boolean {
  const withinX = BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W
  if (!withinX) return false
  return birdY - BIRD_R < p.gapY || birdY + BIRD_R > p.gapY + GAP
}
