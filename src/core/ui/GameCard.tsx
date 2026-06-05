import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Gauge, Heart, Play, Trophy } from 'lucide-react'
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
  easy: { label: 'Easy', className: 'bg-emerald-400/10 text-emerald-300 ring-emerald-300/25' },
  normal: { label: 'Normal', className: 'bg-cyan/10 text-cyan ring-cyan/30' },
  hard: { label: 'Hard', className: 'bg-rose-400/10 text-rose-300 ring-rose-300/30' },
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
  const [iconFailed, setIconFailed] = useState(false)
  const featured = variant === 'featured'
  const compact = variant === 'compact'
  const difficulty = game.difficulty ? DIFFICULTY_META[game.difficulty] : null
  const category = game.category ?? genre.label

  return (
    <article
      className={cn(
        'group relative flex min-h-full overflow-hidden rounded-[1.5rem] border border-line bg-white/[0.04] shadow-[0_24px_70px_-55px_rgba(0,0,0,0.95)] transition duration-200 hover:-translate-y-1 hover:border-cyan/40 hover:bg-white/[0.055] hover:shadow-[0_30px_90px_-60px_rgba(34,211,238,0.75)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        compact ? 'rounded-2xl' : 'rounded-[1.5rem]',
      )}
    >
      <Link
        to={`/games/${game.id}`}
        className="focus-ring absolute inset-0 z-10 rounded-[inherit]"
        aria-label={`${game.title} を開く`}
      />

      <div className="pointer-events-none relative z-20 flex w-full flex-col">
        <div
          className={cn(
            'relative flex items-center justify-center overflow-hidden border-b border-line',
            featured ? 'h-52 sm:h-60' : compact ? 'h-32' : 'h-44',
          )}
          style={{
            background:
              game.accentColor ??
              'radial-gradient(circle at 50% 30%, rgba(139,92,246,0.22), rgba(17,24,39,0.7))',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.18),transparent_36%),linear-gradient(135deg,rgba(139,92,246,0.18),rgba(34,211,238,0.12))]" />
          <div className="absolute inset-x-8 top-8 h-24 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex aspect-square w-24 items-center justify-center rounded-[1.75rem] border border-white/10 bg-[#080b14]/60 text-6xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:w-28">
            {iconFailed ? (
              <span className={cn(featured ? 'text-7xl' : 'text-6xl')}>{game.thumbnail}</span>
            ) : (
              <img
                src={`/icons/${game.id}.png`}
                alt=""
                loading="lazy"
                className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                onError={() => setIconFailed(true)}
              />
            )}
          </div>

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {game.isNew && (
              <span className="rounded-full border border-cyan/30 bg-cyan/15 px-3 py-1 text-xs font-black text-cyan">
                NEW
              </span>
            )}
            {game.featured && (
              <span className="rounded-full border border-yellow/30 bg-yellow/15 px-3 py-1 text-xs font-black text-yellow">
                FEATURED
              </span>
            )}
          </div>
        </div>

        <div className={cn('flex flex-1 flex-col gap-4', compact ? 'p-4' : 'p-5')}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={cn(
                  'font-display truncate leading-tight text-fg',
                  featured ? 'text-2xl' : 'text-xl',
                )}
              >
                {game.title}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-xs font-black text-cyan">
                  {category}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset',
                    genre.badgeClass,
                  )}
                >
                  {genre.label}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleFavorite(game.id)}
              className={cn(
                'focus-ring pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-[#0b1020]/80 text-muted transition hover:border-rose-300/45 hover:bg-rose-400/10 hover:text-rose-300',
                favorite && 'border-rose-300/45 bg-rose-400/10 text-rose-300',
              )}
              aria-label={favorite ? `${game.title}をお気に入りから外す` : `${game.title}をお気に入りに追加`}
              aria-pressed={favorite}
            >
              <Heart size={18} className={cn(favorite && 'fill-current')} />
            </button>
          </div>

          <p className={cn('text-sm font-medium leading-6 text-muted', compact ? 'line-clamp-2' : 'min-h-12')}>
            {game.description}
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-black">
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
            {game.minutes != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.055] px-2.5 py-1 text-muted ring-1 ring-line">
                <Clock size={13} className="text-cyan" />
                {game.minutes} min
              </span>
            )}
            {best > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow/10 px-2.5 py-1 text-yellow ring-1 ring-yellow/25">
                <Trophy size={13} />
                Best {best}
              </span>
            )}
          </div>

          <Link
            to={`/games/${game.id}`}
            className="btn-primary pointer-events-auto mt-auto w-full"
          >
            <Play size={18} className="fill-current" />
            Play
          </Link>
        </div>
      </div>
    </article>
  )
}
