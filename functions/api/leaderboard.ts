// GET /api/leaderboard?game=2048&period=alltime|daily&limit=20
import { type Env, type Period, KNOWN_GAME_IDS, getLeaderboard } from '../_shared/scores'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=10',
    },
  })

export const onRequestGet: (ctx: { request: Request; env: Env }) => Promise<Response> = async ({
  request,
  env,
}) => {
  const url = new URL(request.url)
  const game = url.searchParams.get('game') ?? ''
  const period: Period = url.searchParams.get('period') === 'daily' ? 'daily' : 'alltime'
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20))

  if (!KNOWN_GAME_IDS.includes(game)) return json({ error: 'unknown game' }, 400)

  const rows = await getLeaderboard(env.DB, game, period, limit)
  return json({ game, period, rows })
}
