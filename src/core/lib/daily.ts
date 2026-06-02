// デイリーチャレンジ: 全員が同じ盤面で競えるよう、日付から決定論的に
// 出題ゲームと seed を導出する。対象は seed で盤面が完全に一致するゲームのみ。

/** seed 付き擬似乱数 (mulberry32)。同じ seed なら全員同じ列を生成。 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Asia/Tokyo の YYYY-MM-DD (サーバーの day と揃える) */
export function todayJST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
}

/** デイリー対象ゲーム (seed で盤面が完全一致するもの)。日替わりでこの中から選ぶ。 */
export const DAILY_POOL = ['lightsout', 'memory', 'simon'] as const

/** その日の出題ゲームID。 */
export function dailyGameId(dateStr: string = todayJST()): string {
  return DAILY_POOL[hash(dateStr) % DAILY_POOL.length]
}

/** その日・そのゲームの seed。 */
export function dailySeed(dateStr: string, gameId: string): number {
  return hash(`${dateStr}:${gameId}`)
}
