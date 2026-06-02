// POST /api/scores — スコア送信
import {
  type Env,
  KNOWN_GAME_IDS,
  sanitizeName,
  sanitizeAvatar,
  sanitizeMode,
  normalizeScore,
  todayJST,
  getRank,
  recentSubmitCount,
} from '../_shared/scores'

interface Body {
  gameId?: unknown
  name?: unknown
  avatar?: unknown
  score?: unknown
  clientId?: unknown
  mode?: unknown
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })

export const onRequestPost: (ctx: { request: Request; env: Env }) => Promise<Response> = async ({
  request,
  env,
}) => {
  let body: Body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const gameId = typeof body.gameId === 'string' ? body.gameId : ''
  const clientId = typeof body.clientId === 'string' ? body.clientId : ''

  if (!KNOWN_GAME_IDS.includes(gameId)) return json({ error: 'unknown game' }, 400)
  if (!/^[0-9a-f-]{8,40}$/i.test(clientId)) return json({ error: 'invalid client' }, 400)

  const score = normalizeScore(gameId, body.score)
  if (score === null) return json({ error: 'invalid score' }, 400)

  const name = sanitizeName(body.name)
  const avatar = sanitizeAvatar(body.avatar)
  const mode = sanitizeMode(body.mode)
  const now = Date.now()

  // レート制限: 直近10秒で3件超
  const recent = await recentSubmitCount(env.DB, clientId, 10_000, now)
  if (recent > 3) return json({ error: 'rate limited' }, 429)

  await env.DB.prepare(
    'INSERT INTO scores (game_id, name, avatar, score, client_id, created_at, day, mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(gameId, name, avatar, score, clientId, now, todayJST(new Date(now)), mode)
    .run()

  const [alltimeRank, dailyRank] = await Promise.all([
    getRank(env.DB, gameId, 'alltime', score, mode),
    getRank(env.DB, gameId, 'daily', score, mode),
  ])

  return json({ ok: true, name, score, alltimeRank, dailyRank })
}
