export const WIDTH = 360
export const HEIGHT = 440
export const COLS = 7
export const ROWS = 5

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Brick extends Rect {
  alive: boolean
  color: string
}

const ROW_COLORS = ['#f43f5e', '#fb923c', '#fde047', '#22d3ee', '#a78bfa']

/** ブロックの初期配置を生成する (純粋関数)。 */
export function makeBricks(): Brick[] {
  const pad = 8
  const top = 48
  const bw = (WIDTH - pad * (COLS + 1)) / COLS
  const bh = 18
  const bricks: Brick[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: pad + c * (bw + pad),
        y: top + r * (bh + pad),
        w: bw,
        h: bh,
        alive: true,
        color: ROW_COLORS[r % ROW_COLORS.length],
      })
    }
  }
  return bricks
}

/** 矩形どうしの交差判定 (AABB)。 */
export function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

/** ボール(中心x,y・半径r)の境界ボックス。 */
export function ballRect(x: number, y: number, r: number): Rect {
  return { x: x - r, y: y - r, w: r * 2, h: r * 2 }
}
