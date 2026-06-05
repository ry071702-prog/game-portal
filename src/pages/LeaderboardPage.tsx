import { Link } from 'react-router-dom'
import { ArrowRight, Trophy } from 'lucide-react'
import { games } from '../core/registry'
import { GENRES } from '../core/lib/genres'
import { Layout } from '../core/ui/Layout'
import { LeaderboardPanel } from '../core/ui/LeaderboardPanel'
import { Seo } from '../core/ui/Seo'
import { useIdentityStore } from '../core/store/identityStore'

export default function LeaderboardPage() {
  const name = useIdentityStore((s) => s.name)
  return (
    <Layout showBack size="wide">
      <Seo title="ランキング — Game Portal" description="各ゲームのトップスコアランキング。" />
      <div className="premium-panel rise-in mb-8 rounded-[1.35rem] border-accent/30 p-6 sm:p-8">
        <p className="eyebrow mb-3">
          <Trophy size={14} />
          Leaderboard
        </p>
        <h1 className="font-display text-4xl text-fg sm:text-5xl">ランキング</h1>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-muted">
          各ゲームの上位スコア。今日 / 全期間で切り替えできます。
        </p>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        {games.map((game) => (
          <section key={game.id} className="rise-in">
            <Link
              to={`/games/${game.id}`}
              className="focus-ring group mb-3 flex items-center gap-3 rounded-2xl px-1 py-1 text-fg"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_24px_-18px_rgba(90,209,230,0.9)] ring-1 ring-accent/20"
                style={{ background: game.accentColor ?? GENRES[game.genre].orb }}
              >
                {game.thumbnail}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block truncate text-2xl">{game.title}</span>
                <span className="text-xs font-bold text-muted">{GENRES[game.genre].label}</span>
              </span>
              <ArrowRight
                size={18}
                className="text-accent transition group-hover:translate-x-1"
              />
            </Link>
            <LeaderboardPanel gameId={game.id} selfName={name || undefined} />
          </section>
        ))}
      </div>
    </Layout>
  )
}
