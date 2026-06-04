import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { games } from '../core/registry'
import { GENRES, GENRE_ORDER } from '../core/lib/genres'
import { GameCard } from '../core/ui/GameCard'
import { Layout } from '../core/ui/Layout'
import { Seo } from '../core/ui/Seo'

export default function PortalPage() {
  return (
    <Layout>
      <Seo
        title="Game Portal — 無料ミニゲーム集"
        description="登録不要・無料で遊べるミニゲーム集。2048・スネーク・神経衰弱など。"
      />
      <div className="glass rise-in mb-8 overflow-hidden rounded-3xl border-[#ffe000]/40">
        <div className="zzz-stripe h-2.5" />
        <div className="px-6 py-16 text-center sm:py-20">
          <p className="font-display mb-3 text-xs tracking-[0.3em] text-accent uppercase">
            Free Mini Games
          </p>
          <h1 className="font-display mb-4 text-5xl leading-none text-fg sm:text-8xl">
            GAME{' '}
            <span className="inline-block -skew-x-6 bg-[#ffe000] px-3 text-black shadow-[6px_6px_0_0_rgba(0,0,0,0.18)]">
              PORTAL
            </span>
          </h1>
          <p className="text-sm font-bold text-muted sm:text-base">
            登録不要・無料のミニゲーム集。スコアでみんなと競おう。
          </p>
        </div>
      </div>

      <Link
        to="/daily"
        className="glass-card rise-in mb-10 flex items-center gap-3 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe000]"
      >
        <CalendarDays className="shrink-0 text-accent" />
        <div className="flex-1">
          <p className="font-bold text-fg">今日のチャレンジ</p>
          <p className="text-xs text-muted">全員が同じお題に挑戦。専用ランキングで競おう</p>
        </div>
        <span className="font-display text-xs text-accent">▶</span>
      </Link>

      {GENRE_ORDER.map((genre) => {
        const list = games.filter((g) => g.genre === genre)
        if (list.length === 0) return null
        return (
          <section key={genre} className="mb-8">
            <h2 className="mb-3 font-display text-xs tracking-wide text-muted uppercase">
              {GENRES[genre].label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {list.map((game, i) => (
                <div
                  key={game.id}
                  className="rise-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </Layout>
  )
}
