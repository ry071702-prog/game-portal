import { Link } from 'react-router-dom'
import { games } from '../core/registry'
import { Layout } from '../core/ui/Layout'
import { LeaderboardPanel } from '../core/ui/LeaderboardPanel'
import { Seo } from '../core/ui/Seo'
import { useIdentityStore } from '../core/store/identityStore'

export default function LeaderboardPage() {
  const name = useIdentityStore((s) => s.name)
  return (
    <Layout showBack>
      <Seo title="ランキング — Game Portal" description="各ゲームのトップスコアランキング。" />
      <h1 className="neon-text mb-1 text-2xl font-bold text-cyan-300">ランキング</h1>
      <p className="mb-6 text-sm text-gray-400">各ゲームの上位プレイヤー。今日 / 全期間で切替。</p>

      <div className="space-y-8">
        {games.map((game) => (
          <div key={game.id}>
            <Link
              to={`/games/${game.id}`}
              className="flex items-center gap-2 text-lg font-bold text-white hover:text-cyan-300"
            >
              <span className="text-2xl">{game.thumbnail}</span>
              {game.title}
            </Link>
            <LeaderboardPanel gameId={game.id} selfName={name || undefined} />
          </div>
        ))}
      </div>
    </Layout>
  )
}
