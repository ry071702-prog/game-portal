// ランキング API クライアント + 名前サニタイズ (サーバーと同等ルール)

export type Period = 'alltime' | 'daily'

export interface LeaderboardRow {
  name: string
  avatar: string
  best: number
}

export interface SubmitResult {
  ok: true
  name: string
  score: number
  alltimeRank: number
  dailyRank: number
}

const API_BASE = '/api'

export const MAX_NAME_LEN = 12

/** 表示前のプレビュー用サニタイズ (本検証はサーバー側 functions/_shared/scores.ts)。 */
export function sanitizeName(raw: string): string {
  let s = raw.replace(/\s+/g, ' ').trim()
  const chars = [...s]
  if (chars.length > MAX_NAME_LEN) s = chars.slice(0, MAX_NAME_LEN).join('')
  return s
}

/** スコアを送信し、順位を返す。失敗時は例外。 */
export async function submitScore(params: {
  gameId: string
  name: string
  avatar: string
  score: number
  clientId: string
}): Promise<SubmitResult> {
  const res = await fetch(`${API_BASE}/scores`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error((msg as { error?: string }).error ?? `submit failed (${res.status})`)
  }
  return res.json() as Promise<SubmitResult>
}

export async function fetchLeaderboard(
  gameId: string,
  period: Period,
  limit = 20,
): Promise<LeaderboardRow[]> {
  const res = await fetch(
    `${API_BASE}/leaderboard?game=${encodeURIComponent(gameId)}&period=${period}&limit=${limit}`,
  )
  if (!res.ok) throw new Error(`leaderboard fetch failed (${res.status})`)
  const data = (await res.json()) as { rows: LeaderboardRow[] }
  return data.rows ?? []
}
