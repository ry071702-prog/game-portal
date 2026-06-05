import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Play, Sparkles } from 'lucide-react'
import type { GameManifest } from '../types'
import { GENRES } from '../lib/genres'

interface HeroProps {
  previewGame: GameManifest
  gameCount: number
  featuredCount: number
}

const difficultyLabel: Record<NonNullable<GameManifest['difficulty']>, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
}

export function Hero({ previewGame, gameCount, featuredCount }: HeroProps) {
  const genre = GENRES[previewGame.genre]
  const category = previewGame.category ?? genre.label

  return (
    <section className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
      <div className="rise-in">
        <p className="mb-5 inline-flex rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1.5 text-xs font-black tracking-[0.22em] text-cyan uppercase">
          FREE MINI GAME PORTAL
        </p>
        <h1 className="font-display max-w-3xl text-4xl leading-[1.08] text-fg sm:text-6xl lg:text-7xl">
          気軽に遊べる、無料ミニゲーム集。
        </h1>
        <p className="mt-6 max-w-2xl text-base font-bold leading-8 text-muted sm:text-lg">
          短時間で遊べるゲームを、ひとつの場所に。今後も新作を続々追加予定。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#games" className="btn-primary">
            <Sparkles size={18} />
            ゲームを探す
          </a>
          <a href="#new" className="btn-soft">
            新着ゲームを見る
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
          <div className="rounded-2xl border border-line bg-white/[0.035] p-4">
            <p className="font-display text-2xl text-fg">{gameCount}</p>
            <p className="mt-1 text-xs font-black tracking-wide text-faint uppercase">Games</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/[0.035] p-4">
            <p className="font-display text-2xl text-fg">{featuredCount}</p>
            <p className="mt-1 text-xs font-black tracking-wide text-faint uppercase">Featured</p>
          </div>
          <div className="rounded-2xl border border-line bg-white/[0.035] p-4">
            <p className="font-display text-2xl text-fg">Free</p>
            <p className="mt-1 text-xs font-black tracking-wide text-faint uppercase">Play</p>
          </div>
        </div>
      </div>

      <div className="rise-in relative min-h-[360px] sm:min-h-[430px] lg:min-h-[520px]">
        <div className="absolute inset-4 rounded-[2rem] border border-white/[0.06] bg-gradient-to-br from-yellow/15 via-white/[0.03] to-cyan/15 shadow-[0_32px_110px_-70px_rgba(34,211,238,0.9)]" />
        <div className="absolute top-2 right-5 left-10 h-40 rounded-full bg-cyan/15 blur-3xl" />
        <div className="absolute right-10 bottom-6 left-3 h-44 rounded-full bg-yellow/15 blur-3xl" />

        <div className="absolute top-0 right-4 left-4 rounded-[1.75rem] border border-white/10 bg-[#101827]/92 p-5 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:right-12 sm:left-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-cyan uppercase">
                Featured Preview
              </p>
              <h2 className="font-display mt-3 text-3xl text-fg">{previewGame.title}</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-muted">
              {category}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-[1fr_6rem] gap-4">
            <div className="rounded-3xl border border-line bg-[#080b14] p-4">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }, (_, index) => (
                  <span
                    key={index}
                    className="aspect-square rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.12] to-white/[0.02]"
                  />
                ))}
              </div>
            </div>
            <div
              className="flex items-center justify-center rounded-3xl border border-white/10 text-5xl"
              style={{ backgroundColor: previewGame.accentColor ?? 'rgba(139,92,246,0.16)' }}
              aria-hidden="true"
            >
              {previewGame.thumbnail}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-black">
            <span className={`rounded-full px-3 py-1 ring-1 ring-inset ${genre.badgeClass}`}>
              {genre.label}
            </span>
            {previewGame.difficulty && (
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-muted ring-1 ring-line">
                {difficultyLabel[previewGame.difficulty]}
              </span>
            )}
            {previewGame.minutes != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1 text-muted ring-1 ring-line">
                <Clock size={13} />
                {previewGame.minutes} min
              </span>
            )}
          </div>
        </div>

        <div className="absolute right-0 bottom-20 hidden w-52 rounded-[1.5rem] border border-cyan/20 bg-[#111827]/88 p-4 shadow-[0_24px_70px_-45px_rgba(34,211,238,0.8)] backdrop-blur-xl sm:right-4 sm:block">
          <p className="text-xs font-black tracking-[0.2em] text-cyan uppercase">Quick Start</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl text-fg">Ready</p>
              <p className="mt-1 text-xs font-bold text-muted">No install required</p>
            </div>
            <Link
              to={`/games/${previewGame.id}`}
              className="focus-ring flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan text-bg-base transition hover:brightness-110"
              aria-label={`${previewGame.title} をプレイ`}
            >
              <Play size={20} className="fill-current" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-2 left-0 hidden w-48 rounded-[1.5rem] border border-yellow/20 bg-[#111827]/86 p-4 shadow-[0_24px_70px_-45px_rgba(139,92,246,0.8)] backdrop-blur-xl sm:left-6 sm:block">
          <p className="text-xs font-black tracking-[0.2em] text-yellow uppercase">Library</p>
          <div className="mt-4 flex items-end gap-2">
            {[62, 88, 44, 72, 54].map((height, index) => (
              <span
                key={index}
                className="w-full rounded-full bg-gradient-to-t from-yellow/25 to-cyan/60"
                style={{ height }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
