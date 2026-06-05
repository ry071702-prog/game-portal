import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Gauge, Heart, Play, Smartphone, Trophy } from 'lucide-react'
import type { GameManifest } from '../types'
import { GENRES } from '../lib/genres'
import { useScoreStore } from '../store/scoreStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { cn } from '../lib/cn'

export type GameCardVariant = 'default' | 'featured' | 'compact'

const DIFFICULTY_META: Record<
  NonNullable<GameManifest['difficulty']>,
  { label: string; className: string }
> = {
  easy: { label: 'かんたん', className: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30' },
  normal: { label: 'ふつう', className: 'bg-cyan/15 text-cyan ring-cyan/30' },
  hard: { label: 'むずかしい', className: 'bg-pink/15 text-pink ring-pink/30' },
}

interface GameCardProps {
  game: GameManifest
  variant?: GameCardVariant
}

export function GameCard({ game, variant = 'default' }: GameCardProps) {
  const best = useScoreStore((s) => s.best[game.id] ?? 0)
  const favorite = useFavoritesStore((s) => s.ids.includes(game.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)
  const genre = GENRES[game.genre]
  // 生成済みアイコン (public/icons/<id>.png) があれば画像、無ければ絵文字にフォールバック
  const [iconFailed, setIconFailed] = useState(false)
  const featured = variant === 'featured'
  const compact = variant === 'compact'
  const difficulty = game.difficulty ? DIFFICULTY_META[game.difficulty] : null

  return (
    <article
      className={cn(
        'group flex min-h-full flex-col overflow-hidden rounded-3xl border border-line bg-bg-panel transition duration-200 hover:-translate-y-1 hover:border-cyan/50 hover:shadow-[0_20px_46px_-32px_rgba(0,0,0,0.85)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        compact ? 'rounded-2xl' : 'rounded-3xl',
      )}
    >
      <Link
        to={`/games/${game.id}`}
        className={cn(
          'focus-ring relative flex items-center justify-center overflow-hidden text-6xl transition duration-200 group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
          featured ? 'h-56 sm:h-60' : compact ? 'h-32' : 'h-40',
        )}
        style={{ backgroundColor: genre.color }}
        aria-label={`${game.title} を開く`}
      >
        {iconFailed ? (
          <span className={cn(featured ? 'text-8xl' : 'text-6xl')}>{game.thumbnail}</span>
        ) : (
          <img
            src={`/icons/${game.id}.png`}
            alt=""
            loading="lazy"
            className={cn('object-contain', featured ? 'h-32 w-32' : 'h-24 w-24')}
            onError={() => setIconFailed(true)}
          />
        )}
        {game.isNew && (
          <span className="absolute top-3 left-3 rounded-full bg-pink px-3 py-1 text-xs font-black text-white">
            NEW
          </span>
        )}
      </Link>

      <div className={cn('flex flex-1 flex-col gap-3', compact ? 'p-4' : 'p-5')}>
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/games/${game.id}`}
            className="focus-ring min-w-0 rounded-lg text-fg hover:text-yellow"
          >
            <h3 className={cn('font-display leading-tight', featured ? 'text-2xl' : 'text-xl')}>
              {game.title}
            </h3>
          </Link>
          <button
            type="button"
            onClick={() => toggleFavorite(game.id)}
            className={cn(
              'focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-muted transition hover:border-pink/60 hover:text-pink',
              favorite && 'border-pink/60 bg-pink/15 text-pink',
            )}
            aria-label={favorite ? `${game.title}をお気に入りから外す` : `${game.title}をお気に入りに追加`}
            aria-pressed={favorite}
          >
            <Heart size={18} className={cn(favorite && 'fill-current')} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset',
              genre.badgeClass,
            )}
          >
            {genre.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-black text-muted ring-1 ring-line">
            <Smartphone size={12} />
            スマホ対応
          </span>
        </div>

        <p className={cn('text-sm leading-6 text-muted', compact ? 'line-clamp-2' : 'min-h-12')}>
          {game.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs font-black">
          {game.minutes != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-fg ring-1 ring-line">
              <Clock size={13} className="text-yellow" />
              {game.minutes}分
            </span>
          )}
          {difficulty && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ring-inset',
                difficulty.className,
              )}
            >
              <Gauge size={13} />
              {difficulty.label}
            </span>
          )}
          {best > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow/15 px-2.5 py-1 text-yellow ring-1 ring-yellow/30">
              <Trophy size={13} />
              ベスト {best}
            </span>
          )}
        </div>

        <Link
          to={`/games/${game.id}`}
          className="btn-primary mt-auto w-full"
        >
          <Play size={18} className="fill-current" />
          プレイ
        </Link>
      </div>
    </article>
  )
}
