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
      className="glass-card group flex flex-col gap-3 rounded-2xl p-5 transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe000]"
    >
      <div
        className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl text-5xl shadow-inner ring-1 ring-inset ring-white/10"
        style={{ background: game.accentColor ?? 'rgba(255,255,255,0.05)' }}
      >
        {/* 上からの光沢 + 下の影で立体感 */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-black/10" />
        <div className="transition duration-300 group-hover:scale-110">
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
        {/* ホバーで現れる「あそぶ」 */}
        <span className="font-display absolute right-2 bottom-2 flex translate-y-2 items-center gap-1 rounded-full bg-[#ffe000] px-2.5 py-1 text-xs text-black opacity-0 shadow transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Play size={12} className="fill-black" /> あそぶ
        </span>
      </div>

      <div className="flex items-center gap-2">
        <h3 className="font-display text-lg text-fg">{game.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${genre.badgeClass}`}
        >
          {genre.label}
        </span>
      </div>
      <p className="text-sm text-muted">{game.description}</p>
      {best > 0 && (
        <p className="flex items-center gap-1 text-xs text-faint">
          <Trophy size={13} className="text-gold" />
          ベスト <span className="font-display text-gold">{best}</span>
        </p>
      )}
    </Link>
  )
}
