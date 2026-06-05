import { Link } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import { cn } from '../lib/cn'

interface FooterProps {
  size?: 'narrow' | 'wide'
}

export function Footer({ size = 'narrow' }: FooterProps) {
  const contentWidth = size === 'wide' ? 'max-w-7xl' : 'max-w-4xl'

  return (
    <footer className="relative z-10 border-t border-line bg-bg-panel">
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-5 px-4 py-7 sm:flex-row sm:items-center sm:justify-between',
          contentWidth,
        )}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow text-bg-base">
            <Gamepad2 size={20} />
          </span>
          <div>
            <p className="font-display text-lg text-fg">Game Portal</p>
            <p className="mt-1 text-sm text-muted">
              ログイン不要で遊べる無料ミニゲーム集。
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm font-bold text-muted">
          <Link className="focus-ring rounded-lg px-2 py-1 hover:text-fg" to="#">
            利用規約
          </Link>
          <Link className="focus-ring rounded-lg px-2 py-1 hover:text-fg" to="#">
            お問い合わせ
          </Link>
          <Link className="focus-ring rounded-lg px-2 py-1 hover:text-fg" to="/leaderboard">
            ランキング
          </Link>
        </nav>
      </div>
    </footer>
  )
}
