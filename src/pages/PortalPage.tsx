import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Sparkles, Trophy } from 'lucide-react'
import { gameById, games } from '../core/registry'
import { GENRES, GENRE_ORDER } from '../core/lib/genres'
import { dailyGameId, todayJST } from '../core/lib/daily'
import { GameCard } from '../core/ui/GameCard'
import { Layout } from '../core/ui/Layout'
import { Seo } from '../core/ui/Seo'

export default function PortalPage() {
  const today = todayJST()
  const featuredGame = gameById.get(dailyGameId(today)) ?? games[0]
  const featuredGenre = GENRES[featuredGame.genre]

  return (
    <Layout size="wide">
      <Seo
        title="Game Portal — 無料ミニゲーム集"
        description="登録不要・無料で遊べるミニゲーム集。2048・スネーク・神経衰弱など。"
      />
      <section className="premium-panel rise-in mb-8 rounded-[2rem] border-accent/35">
        <div className="ornate-divider" />
        <div className="grid overflow-hidden lg:grid-cols-[1.18fr_0.82fr]">
          <div className="px-6 py-10 sm:px-8 sm:py-14 lg:py-16">
            <p className="eyebrow mb-5">
              <Sparkles size={14} />
              Free Mini Games
            </p>
            <h1 className="font-display text-6xl leading-[0.9] text-fg sm:text-8xl lg:text-9xl">
              GAME
              <span className="block text-accent drop-shadow-[0_0_24px_rgba(232,200,122,0.18)]">
                PORTAL
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base font-bold leading-7 text-muted sm:text-lg">
              短時間で集中して遊べるミニゲームを集めました。今日のチャレンジでスコアを更新しよう。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/daily" className="btn-primary">
                今日のチャレンジ
                <ArrowRight size={18} />
              </Link>
              <Link to="/leaderboard" className="btn-soft">
                <Trophy size={18} />
                ランキング
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <div className="border-t border-accent/25 pt-3">
                <p className="font-display text-2xl text-fg">{games.length}</p>
                <p className="text-xs font-bold text-faint">Games</p>
              </div>
              <div className="border-t border-accent/25 pt-3">
                <p className="font-display text-2xl text-fg">Daily</p>
                <p className="text-xs font-bold text-faint">Challenge</p>
              </div>
              <div className="border-t border-accent/25 pt-3">
                <p className="font-display text-2xl text-fg">Score</p>
                <p className="text-xs font-bold text-faint">Ranking</p>
              </div>
            </div>
          </div>

          <Link
            to="/daily"
            className="group relative flex min-h-[22rem] flex-col justify-between border-t border-accent/20 p-6 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan lg:border-t-0 lg:border-l dark:hover:bg-white/5"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">
                <CalendarDays size={14} />
                Today&apos;s Drop
              </p>
              <span className="rounded-full border border-accent/40 bg-accent-bg px-3 py-1 text-xs font-black text-accent">
                {today}
              </span>
            </div>
            <div className="relative mx-auto my-7 flex h-44 w-44 items-center justify-center rounded-[2rem] text-7xl shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_24px_60px_-32px_rgba(0,0,0,0.62),0_0_38px_-24px_rgba(90,209,230,0.9)] ring-1 ring-accent/25 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03]">
              <div
                className="absolute inset-0 rounded-[2rem] opacity-90"
                style={{ background: featuredGame.accentColor ?? featuredGenre.orb }}
              />
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.34),transparent_34%),linear-gradient(160deg,rgba(90,209,230,0.12),rgba(0,0,0,0.3))]" />
              <span className="relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]">
                {featuredGame.thumbnail}
              </span>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-display text-3xl text-fg">{featuredGame.title}</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${featuredGenre.badgeClass}`}
                >
                  {featuredGenre.label}
                </span>
              </div>
              <p className="text-sm font-bold leading-6 text-muted">{featuredGame.description}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-black text-accent">
                挑戦する
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Library</p>
          <h2 className="font-display text-3xl text-fg sm:text-4xl">ゲームライブラリ</h2>
        </div>
        <p className="text-sm font-bold text-muted">ジャンルごとに選んでプレイ</p>
      </div>

      {GENRE_ORDER.map((genre) => {
        const list = games.filter((g) => g.genre === genre)
        if (list.length === 0) return null
        return (
          <section key={genre} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rotate-45 border border-accent bg-accent-bg shadow-[0_0_18px_rgba(232,200,122,0.28)]" />
              <h3 className="font-display text-xl tracking-wide text-fg uppercase">
                {GENRES[genre].label}
              </h3>
              <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-black text-faint">
                {list.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((game, i) => (
                <div
                  key={game.id}
                  className="rise-in"
                  style={{ animationDelay: `${(i + 1) * 45}ms` }}
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
