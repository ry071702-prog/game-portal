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
      <div className="mb-6 overflow-hidden rounded-2xl border-2 border-[#ffe000] bg-gradient-to-b from-[#ffe000]/15 to-transparent">
        <div className="zzz-stripe h-2" />
        <div className="p-6 text-center">
          <h1 className="font-display mb-2 text-4xl text-fg sm:text-5xl">
            GAME <span className="bg-[#ffe000] px-2 text-black">PORTAL</span>
          </h1>
          <p className="text-sm font-bold text-muted">
            登録不要・無料のミニゲーム集。スコアでみんなと競おう。
          </p>
        </div>
      </div>

      <Link
        to="/daily"
        className="mb-8 flex items-center gap-3 rounded-2xl border border-[#ffe000]/30 bg-[#ffe000]/10 p-4 transition hover:bg-[#ffe000]/15"
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
              {list.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )
      })}
    </Layout>
  )
}
