import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Play } from 'lucide-react'
import type { GameManifest } from '../types'
import { GENRES } from '../lib/genres'
import { useScoreStore } from '../store/scoreStore'

export function GameCard({ game }: { game: GameManifest }) {
  const best = useScoreStore((s) => s.best[game.id] ?? 0)
  const genre = GENRES[game.genre]
  // 生成済みアイコン (public/icons/<id>.png) があれば画像、無ければ絵文字にフォールバック
  const [iconFailed, setIconFailed] = useState(false)

  return (
    <Link
      to={`/games/${game.id}`}
      className="glass-card focus-ring group flex min-h-full flex-col gap-4 rounded-[1.35rem] p-4 active:scale-[0.99] sm:p-5"
    >
      <div
        className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl text-5xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-24px_44px_rgba(0,0,0,0.16),0_0_30px_-22px_rgba(90,209,230,0.9)] ring-1 ring-inset ring-accent/20"
        style={{ background: game.accentColor ?? 'rgba(255,255,255,0.05)' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_32%_20%,rgba(255,255,255,0.32),transparent_32%),radial-gradient(circle_at_80%_78%,rgba(90,209,230,0.14),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.1),rgba(0,0,0,0.2))]" />
        <div className="transition duration-300 group-hover:-translate-y-1 group-hover:scale-110">
          {iconFailed ? (
            game.thumbnail
          ) : (
            <img
              src={`/icons/${game.id}.png`}
              alt=""
              loading="lazy"
              className="h-20 w-20 object-contain"
              onError={() => setIconFailed(true)}
            />
          )}
        </div>
        <span className="font-display absolute right-2 bottom-2 flex items-center gap-1 rounded-full border border-accent/50 bg-[linear-gradient(135deg,#f7e3a4,#c99b48)] px-2.5 py-1 text-xs text-[#151018] shadow transition duration-300 group-hover:-translate-y-0.5">
          <Play size={12} className="fill-[#151018]" />
          あそぶ
        </span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl text-fg">{game.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${genre.badgeClass}`}
        >
          {genre.label}
        </span>
      </div>
      <p className="min-h-11 text-sm leading-6 text-muted">{game.description}</p>
      <div className="mt-auto flex items-center justify-between border-t border-line/70 pt-3">
        {best > 0 ? (
          <p className="flex items-center gap-1.5 text-xs font-bold text-faint">
            <Trophy size={13} className="text-gold" />
            ベスト <span className="font-display text-gold">{best}</span>
          </p>
        ) : (
          <p className="text-xs font-bold text-faint">未プレイ</p>
        )}
        <span className="h-px w-10 bg-[linear-gradient(90deg,var(--accent),var(--cyan))]" />
      </div>
    </Link>
  )
}
