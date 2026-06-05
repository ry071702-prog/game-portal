import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Tags } from 'lucide-react'
import type { GameManifest } from '../types'
import { GENRES } from '../lib/genres'
import { GameCard } from './GameCard'

interface HeroProps {
  previewGame: GameManifest
  gameCount: number
  featuredCount: number
}

export function Hero({ previewGame, gameCount, featuredCount }: HeroProps) {
  const genre = GENRES[previewGame.genre]

  return (
    <section className="grid gap-8 py-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <p className="mb-4 inline-flex rounded-full bg-yellow px-3 py-1 text-xs font-black text-bg-base">
          Free Browser Games
        </p>
        <h1 className="font-display max-w-3xl text-4xl leading-tight text-fg sm:text-6xl">
          今すぐ遊べる、無料ミニゲーム集
        </h1>
        <p className="mt-5 max-w-2xl text-base font-bold leading-8 text-muted sm:text-lg">
          ログイン不要。ダウンロード不要。スキマ時間にすぐ遊べるブラウザゲームを集めました。
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#popular" className="btn-primary">
            <Flame size={18} />
            人気ゲームを見る
          </a>
          <a href="#genres" className="btn-soft">
            <Tags size={18} />
            ジャンルから探す
          </a>
        </div>
        <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
          <div className="rounded-2xl border border-line bg-bg-panel p-4">
            <p className="font-display text-2xl text-fg">{gameCount}</p>
            <p className="mt-1 text-xs font-black text-muted">Games</p>
          </div>
          <div className="rounded-2xl border border-line bg-bg-panel p-4">
            <p className="font-display text-2xl text-fg">{featuredCount}</p>
            <p className="mt-1 text-xs font-black text-muted">Popular</p>
          </div>
          <div className="rounded-2xl border border-line bg-bg-panel p-4">
            <p className="font-display text-2xl text-fg">Daily</p>
            <p className="mt-1 text-xs font-black text-muted">Challenge</p>
          </div>
        </div>
      </div>

      <div className="lg:pl-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-wide text-yellow uppercase">Featured Preview</p>
            <h2 className="font-display mt-1 text-2xl text-fg">{previewGame.title}</h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ring-1 ring-inset ${genre.badgeClass}`}
          >
            {genre.label}
          </span>
        </div>
        <GameCard game={previewGame} variant="featured" />
        <Link
          to={`/games/${previewGame.id}`}
          className="focus-ring mt-3 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-black text-cyan hover:text-fg"
        >
          すぐ遊ぶ
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}
