// Cloudflare Pages Functions 共有ロジック (D1 アクセス・検証・ランキング)
// 注意: gameId 一覧と CAP はクライアントの registry と手動同期する。

// ── 最小限の D1 型 (workers-types に依存しない) ──
export interface D1PreparedStatement {
  bind(...vals: unknown[]): D1PreparedStatement
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  first<T = unknown>(col?: string): Promise<T | null>
  run(): Promise<unknown>
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement
}
export interface Env {
  DB: D1Database
}

export type Period = 'alltime' | 'daily'

/** スコア上限 (緩い不正対策のサニティチェック)。gameId は registry と同期。 */
export const SCORE_CAP: Record<string, number> = {
  '2048': 200000,
  snake: 290,
  memory: 800,
  lightsout: 1000,
  breakout: 1000000,
  simon: 200,
}

export const KNOWN_GAME_IDS = Object.keys(SCORE_CAP)

export const MAX_NAME_LEN = 12

// 選択可能なユーザーアイコン。クライアント src/core/lib/avatars.ts と同期。
const AVATARS = [
  '🎮', '👾', '🤖', '👽', '🐱', '🐶', '🦊', '🐼', '🐸',
  '🦄', '🐲', '🦖', '⭐', '🔥', '🌈', '💀', '🎧', '🍩',
]
export const DEFAULT_AVATAR = '🎮'

/** 未知のアイコンは既定にフォールバック (緩い検証)。 */
export function sanitizeAvatar(raw: unknown): string {
  return typeof raw === 'string' && AVATARS.includes(raw) ? raw : DEFAULT_AVATAR
}

const NG_WORDS = ['死ね', 'fuck', 'shit', 'ちんこ', 'まんこ']

/** 名前を安全化: 制御文字除去・空白圧縮・最大12文字・NG語伏字・空ならゲスト。 */
export function sanitizeName(raw: unknown): string {
  let s = typeof raw === 'string' ? raw : ''
  // 連続空白を1つに
  s = s.replace(/\s+/g, ' ').trim()
  // コードポイント単位で切り詰め
  const chars = [...s]
  if (chars.length > MAX_NAME_LEN) s = chars.slice(0, MAX_NAME_LEN).join('')
  // 簡易NG語の伏字
  for (const w of NG_WORDS) {
    if (s.toLowerCase().includes(w.toLowerCase())) {
      s = s.replace(new RegExp(w, 'gi'), '*'.repeat(w.length))
    }
  }
  s = s.trim()
  return s.length > 0 ? s : 'ゲスト'
}

/** Asia/Tokyo の YYYY-MM-DD */
export function todayJST(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
}

/** score を整数に正規化し、範囲外なら null (=不正)。 */
export function normalizeScore(gameId: string, raw: unknown): number | null {
  const cap = SCORE_CAP[gameId]
  if (cap === undefined) return null
  const n = Math.floor(Number(raw))
  if (!Number.isFinite(n) || n < 0 || n > cap) return null
  return n
}

export interface LeaderboardRow {
  name: string
  avatar: string
  best: number
}

/** 上位 N (client_id ごとの最高点)。period=daily は当日のみ。 */
export async function getLeaderboard(
  db: D1Database,
  gameId: string,
  period: Period,
  limit: number,
): Promise<LeaderboardRow[]> {
  const where = period === 'daily' ? 'WHERE game_id = ? AND day = ?' : 'WHERE game_id = ?'
  // MAX(score) と同じ行の name/avatar が返る (SQLite の bare column ルール)
  const sql = `SELECT name, avatar, MAX(score) AS best FROM scores ${where} GROUP BY client_id ORDER BY best DESC, MIN(created_at) ASC LIMIT ?`
  const stmt =
    period === 'daily'
      ? db.prepare(sql).bind(gameId, todayJST(), limit)
      : db.prepare(sql).bind(gameId, limit)
  const { results } = await stmt.all<LeaderboardRow>()
  return results
}

/** score の順位 (自分より高い best を持つユーザー数 + 1)。 */
export async function getRank(
  db: D1Database,
  gameId: string,
  period: Period,
  score: number,
): Promise<number> {
  const inner =
    period === 'daily'
      ? 'SELECT MAX(score) b FROM scores WHERE game_id = ? AND day = ? GROUP BY client_id'
      : 'SELECT MAX(score) b FROM scores WHERE game_id = ? GROUP BY client_id'
  const sql = `SELECT COUNT(*) AS c FROM (${inner}) WHERE b > ?`
  const stmt =
    period === 'daily'
      ? db.prepare(sql).bind(gameId, todayJST(), score)
      : db.prepare(sql).bind(gameId, score)
  const row = await stmt.first<{ c: number }>()
  return (row?.c ?? 0) + 1
}

/** レート制限: 直近 windowMs 内の同 client_id の件数。 */
export async function recentSubmitCount(
  db: D1Database,
  clientId: string,
  windowMs: number,
  now: number,
): Promise<number> {
  const row = await db
    .prepare('SELECT COUNT(*) AS c FROM scores WHERE client_id = ? AND created_at > ?')
    .bind(clientId, now - windowMs)
    .first<{ c: number }>()
  return row?.c ?? 0
}
